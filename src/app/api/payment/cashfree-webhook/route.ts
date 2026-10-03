import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature, isCashfreeConfigured } from '@/lib/cashfree';
import { decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';
import { getPendingOrder } from '@/lib/pending-orders';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // 1. Signature Verification (Fail-Closed)
    if (!isCashfreeConfigured()) {
      logSecurityEvent({
        event: 'WEBHOOK_GATEWAY_CONFIG_MISSING',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/cashfree-webhook',
      });
      return NextResponse.json(
        { success: false, message: 'Payment gateway configuration missing' },
        { status: 503 }
      );
    }

    const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      logSecurityEvent({
        event: 'FORGED_CASHFREE_WEBHOOK_SIGNATURE',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/cashfree-webhook',
        metadata: { timestamp, signature },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid Cashfree webhook signature' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};
    const orderId = sanitizeString(orderData.order_id || payload.orderId || '');

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'No order ID in webhook payload' });
    }

    // Process PAYMENT_SUCCESS_WEBHOOK or ORDER_PAID
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'ORDER_PAID' || paymentData.payment_status === 'SUCCESS') {
      let { data: existingOrder } = await supabaseAdmin
        .from('inveins_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      // If not immediately found in read replica, wait 600ms and re-query to catch recent pre-save
      if (!existingOrder) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const { data: retriedOrder } = await supabaseAdmin
          .from('inveins_orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        existingOrder = retriedOrder;
      }

      const paymentId = String(paymentData.cf_payment_id || `cf_${orderId}`);

      const POST_PAYMENT_STATES = ['Confirmed', 'Processing', 'Dispatched', 'Shipped', 'Delivered'];

      if (existingOrder && POST_PAYMENT_STATES.includes(existingOrder.status)) {
        return NextResponse.json({
          success: true,
          message: `Order ${orderId} is already in state "${existingOrder.status}". Webhook acknowledged idempotently.`,
        });
      }

      if (existingOrder) {
        const updatedCustomer = {
          ...(typeof existingOrder.customer === 'object' && existingOrder.customer !== null ? existingOrder.customer : {}),
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
          payment_status: 'SUCCESS',
        };

        await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            payment_method: 'cashfree_upi',
            customer: updatedCustomer,
          })
          .eq('id', orderId);

        if (Array.isArray(existingOrder.items) && existingOrder.items.length > 0) {
          await decrementOrderStock(existingOrder.items);
        }
      } else if (!existingOrder) {
        // If order was deferred until payment, retrieve from pending cache OR draft table
        let pending = getPendingOrder(orderId);
        if (!pending) {
          const { data: draft } = await supabaseAdmin
            .from('inveins_checkout_drafts')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();
          if (draft) {
            pending = draft as any;
          }
        }
        if (pending) {
          const updatedCustomer = {
            ...(typeof pending.customer === 'object' && pending.customer !== null ? pending.customer : {}),
            payment_id: paymentId,
            paid_at: new Date().toISOString(),
            payment_status: 'SUCCESS',
            cashfree_order_id: orderId,
          };

          await supabaseAdmin
            .from('inveins_orders')
            .insert({
              id: orderId,
              customer: updatedCustomer,
              items: pending.items,
              subtotal: pending.subtotal,
              discount: pending.discount,
              shipping_fee: pending.shipping_fee,
              grand_total: pending.grand_total,
              payment_method: 'cashfree_upi',
              status: 'Confirmed',
              tracking_number: pending.tracking_number,
              verification_token: pending.verification_token,
              created_at: pending.created_at || new Date().toISOString(),
            });

          await decrementOrderStock(pending.items);

          // Clean up draft from inveins_checkout_drafts now that it's confirmed in inveins_orders
          try {
            await supabaseAdmin.from('inveins_checkout_drafts').delete().eq('id', orderId);
          } catch {}
        } else {
          // Absolute Safety Fallback: Fetch order metadata directly from Cashfree so money is never unrecorded
          try {
            const { fetchCashfreeOrder } = await import('@/lib/cashfree');
            const cfOrder = await fetchCashfreeOrder(orderId);
            if (cfOrder && cfOrder.order_status === 'PAID') {
              await supabaseAdmin.from('inveins_orders').upsert({
                id: orderId,
                customer: {
                  name: cfOrder.customer_details?.customer_name || 'Customer',
                  phone: cfOrder.customer_details?.customer_phone || '',
                  email: cfOrder.customer_details?.customer_email || '',
                  payment_id: paymentId,
                  paid_at: new Date().toISOString(),
                  payment_status: 'SUCCESS',
                  cashfree_order_id: orderId,
                },
                items: [],
                subtotal: Number(cfOrder.order_amount) || 0,
                discount: 0,
                shipping_fee: 0,
                grand_total: Number(cfOrder.order_amount) || 0,
                payment_method: 'cashfree_upi',
                status: 'Confirmed',
                tracking_number: `TRK-${orderId.replace('INV-', '')}`,
                verification_token: `cf_${paymentId}`,
                created_at: new Date().toISOString(),
              });
            }
          } catch (fallbackErr) {
            console.error('[CASHFREE WEBHOOK] Fallback reconstruction failed:', fallbackErr);
          }
        }
      }

      logSecurityEvent({
        event: 'CASHFREE_WEBHOOK_PAYMENT_CONFIRMED',
        severity: 'INFO',
        ip,
        endpoint: '/api/payment/cashfree-webhook',
        metadata: { orderId, paymentId },
      });
    }

    return NextResponse.json({ success: true, message: 'Cashfree webhook acknowledged' });
  } catch (err: any) {
    console.error('[CASHFREE] Webhook error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error processing webhook' }, { status: 500 });
  }
}
