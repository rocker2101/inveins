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

      // Currency validation
      const rawCurrency = String(orderData.order_currency || paymentData.payment_currency || 'INR').trim().toUpperCase();
      if (rawCurrency !== 'INR') {
        logSecurityEvent({
          event: 'WEBHOOK_CURRENCY_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/cashfree-webhook',
          metadata: { orderId, expected: 'INR', received: rawCurrency },
        });
        return NextResponse.json({ success: false, message: 'Invalid currency. Only INR is supported.' }, { status: 400 });
      }

      // If order was deferred until payment, retrieve from pending cache OR draft table
      let pending: any = null;
      if (!existingOrder) {
        pending = getPendingOrder(orderId);
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
      }

      // Exact paise amount validation if amount is present in webhook payload
      const webhookAmount = Number(orderData.order_amount ?? paymentData.payment_amount);
      const targetAmount = existingOrder ? Number(existingOrder.grand_total) : (pending ? Number(pending.grand_total) : null);
      if (Number.isFinite(webhookAmount) && webhookAmount > 0 && targetAmount !== null && Number.isFinite(targetAmount)) {
        const expectedPaise = Math.round(targetAmount * 100);
        const paidPaise = Math.round(webhookAmount * 100);
        if (expectedPaise !== paidPaise) {
          logSecurityEvent({
            event: 'WEBHOOK_AMOUNT_MISMATCH',
            severity: 'CRITICAL',
            ip,
            endpoint: '/api/payment/cashfree-webhook',
            metadata: { orderId, expectedPaise, receivedPaise: paidPaise },
          });
          return NextResponse.json({ success: false, message: 'Amount mismatch' }, { status: 400 });
        }
      }

      let shouldDecrementStock = false;
      const alreadyDecremented = existingOrder?.customer?.inventory_decremented === true;

      if (existingOrder) {
        const updatedCustomer = {
          ...(typeof existingOrder.customer === 'object' && existingOrder.customer !== null ? existingOrder.customer : {}),
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
          payment_status: 'SUCCESS',
          inventory_decremented: true,
        };

        // Atomic conditional update: ONLY transitions if not already in POST_PAYMENT_STATES
        const { data: updatedRows } = await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            payment_method: 'cashfree_upi',
            customer: updatedCustomer,
          })
          .eq('id', orderId)
          .not('status', 'in', '("Confirmed","Processing","Dispatched","Shipped","Delivered")')
          .select('id');

        shouldDecrementStock = Boolean(updatedRows && updatedRows.length > 0) && !alreadyDecremented;
      } else if (pending) {
        const updatedCustomer = {
          ...(typeof pending.customer === 'object' && pending.customer !== null ? pending.customer : {}),
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
          payment_status: 'SUCCESS',
          cashfree_order_id: orderId,
          inventory_decremented: true,
        };

        const { error: insertErr } = await supabaseAdmin
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

        if (insertErr) {
          // If another concurrent thread inserted it first (duplicate key 23505), do not decrement stock again
          shouldDecrementStock = false;
        } else {
          shouldDecrementStock = !alreadyDecremented;
        }

        // Clean up draft from inveins_checkout_drafts now that it's confirmed in inveins_orders
        try {
          await supabaseAdmin.from('inveins_checkout_drafts').delete().eq('id', orderId);
        } catch {}
      }

      if (shouldDecrementStock) {
        const itemsToDecrement = existingOrder?.items || pending?.items;
        if (Array.isArray(itemsToDecrement) && itemsToDecrement.length > 0) {
          await decrementOrderStock(itemsToDecrement);
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
