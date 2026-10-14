import { NextRequest, NextResponse } from 'next/server';
import { fetchCashfreeOrder, isCashfreeConfigured } from '@/lib/cashfree';
import { decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';
import { getPendingOrder, verifyOrderToken, PendingOrderPayload } from '@/lib/pending-orders';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const { order_id, order_token } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required for Cashfree verification.' },
        { status: 400 }
      );
    }

    const cleanOrderId = sanitizeString(order_id);

    // 1. Check if order is already recorded in Supabase (Idempotency)
    const { data: existingOrder } = await supabaseAdmin
      .from('inveins_orders')
      .select('*')
      .eq('id', cleanOrderId)
      .maybeSingle();

    const CONFIRMED_STATES = ['Confirmed', 'Processing', 'Dispatched', 'Shipped', 'Delivered'];
    if (existingOrder && CONFIRMED_STATES.includes(existingOrder.status)) {
      return NextResponse.json({
        success: true,
        message: 'Order has already been confirmed.',
        orderId: cleanOrderId,
        paymentId: existingOrder.customer?.payment_id || `cf_${cleanOrderId}`,
        order: existingOrder,
      });
    }

    // 2. Authoritative Verification with Cashfree PG
    if (isCashfreeConfigured()) {
      let cfOrder = await fetchCashfreeOrder(cleanOrderId);

      // If pending/active, brief retry (1.2s) in case webhook/bank settlement is completing
      if (cfOrder && cfOrder.order_status !== 'PAID') {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        cfOrder = await fetchCashfreeOrder(cleanOrderId);
      }

      if (!cfOrder) {
        return NextResponse.json(
          { success: false, message: 'Could not fetch order status from Cashfree.' },
          { status: 502 }
        );
      }

      if (cfOrder.order_status !== 'PAID') {
        return NextResponse.json(
          { 
            success: false, 
            message: `Payment is not completed yet (Status: ${cfOrder.order_status}). Please complete payment or retry.`,
            orderStatus: cfOrder.order_status,
          },
          { status: 400 }
        );
      }

      // 3. Resolve the authoritative order payload
      let orderToCommit: PendingOrderPayload | null = null;
      if (order_token) {
        const parsedToken = verifyOrderToken(order_token);
        if (parsedToken) {
          if (parsedToken.id !== cleanOrderId) {
            logSecurityEvent({
              event: 'ORDER_TOKEN_ID_MISMATCH',
              severity: 'CRITICAL',
              ip,
              endpoint: '/api/payment/cashfree-verify',
              metadata: { expectedId: cleanOrderId, receivedId: parsedToken.id },
            });
            return NextResponse.json(
              { success: false, message: 'Invalid order token for the requested order ID.' },
              { status: 400 }
            );
          }
          orderToCommit = parsedToken;
        }
      }
      if (!orderToCommit) {
        orderToCommit = getPendingOrder(cleanOrderId);
      }
      if (!orderToCommit) {
        const { data: draft } = await supabaseAdmin
          .from('inveins_checkout_drafts')
          .select('*')
          .eq('id', cleanOrderId)
          .maybeSingle();
        if (draft) {
          orderToCommit = draft as any;
        }
      }
      if (!orderToCommit && existingOrder) {
        orderToCommit = existingOrder as any;
      }

      if (!orderToCommit) {
        orderToCommit = {
          id: cleanOrderId,
          customer: {
            name: cfOrder.customer_details?.customer_name || 'Customer',
            phone: cfOrder.customer_details?.customer_phone || '',
            email: cfOrder.customer_details?.customer_email || '',
            cashfree_order_id: cleanOrderId,
          },
          items: [],
          subtotal: Number(cfOrder.order_amount) || 0,
          discount: 0,
          shipping_fee: 0,
          grand_total: Number(cfOrder.order_amount) || 0,
          payment_method: 'cashfree_upi',
          status: 'Confirmed',
          tracking_number: `TRK-${cleanOrderId.replace('INV-', '')}`,
          verification_token: `cf_${cleanOrderId}`,
          created_at: new Date().toISOString(),
        };
      }

      // 4. Verify currency and exact amount matches Cashfree paid amount (Zero Tolerance)
      const paidCurrency = String(cfOrder.order_currency || '').trim().toUpperCase();
      if (paidCurrency !== 'INR') {
        logSecurityEvent({
          event: 'PAYMENT_CURRENCY_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/cashfree-verify',
          metadata: { orderId: cleanOrderId, expected: 'INR', received: paidCurrency },
        });

        return NextResponse.json(
          { success: false, message: 'Invalid payment currency. Only INR transactions are accepted.' },
          { status: 400 }
        );
      }

      const expectedPaise = Math.round(Number(orderToCommit.grand_total) * 100);
      const paidPaise = Math.round(Number(cfOrder.order_amount) * 100);

      if (!Number.isFinite(expectedPaise) || !Number.isFinite(paidPaise) || paidPaise <= 0 || expectedPaise !== paidPaise) {
        logSecurityEvent({
          event: 'PAYMENT_AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/cashfree-verify',
          metadata: { orderId: cleanOrderId, expectedPaise, receivedPaise: paidPaise },
        });

        return NextResponse.json(
          { success: false, message: 'Payment amount mismatch detected. Transaction flagged for manual review.' },
          { status: 400 }
        );
      }

      // 5. Insert or Update order into Supabase with race-safe atomic idempotency
      const paymentId = `cf_${cleanOrderId}_${Date.now()}`;
      const alreadyDecremented = existingOrder?.customer?.inventory_decremented === true;

      const updatedCustomer = {
        ...(typeof orderToCommit.customer === 'object' && orderToCommit.customer !== null ? orderToCommit.customer : {}),
        payment_id: paymentId,
        paid_at: new Date().toISOString(),
        payment_status: 'SUCCESS',
        cashfree_order_id: cleanOrderId,
        inventory_decremented: true,
      };

      const finalOrderPayload = {
        id: cleanOrderId,
        customer: updatedCustomer,
        items: orderToCommit.items,
        subtotal: orderToCommit.subtotal,
        discount: orderToCommit.discount,
        shipping_fee: orderToCommit.shipping_fee,
        grand_total: orderToCommit.grand_total,
        payment_method: 'cashfree_upi',
        status: 'Confirmed',
        tracking_number: orderToCommit.tracking_number,
        verification_token: orderToCommit.verification_token,
        created_at: orderToCommit.created_at || new Date().toISOString(),
      };

      let shouldDecrementStock = false;

      if (existingOrder) {
        // Atomic conditional update: ONLY transitions if not already in CONFIRMED_STATES
        const { data: updatedRows, error: updateErr } = await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            payment_method: 'cashfree_upi',
            customer: updatedCustomer,
          })
          .eq('id', cleanOrderId)
          .not('status', 'in', '("Confirmed","Processing","Dispatched","Shipped","Delivered")')
          .select('id');

        if (updateErr) {
          console.error('[CASHFREE] Error updating order status:', updateErr);
          return NextResponse.json(
            { success: false, message: 'Database error updating order status: ' + updateErr.message },
            { status: 500 }
          );
        }

        // Only decrement stock if THIS atomic update made the transition and stock was not previously decremented
        shouldDecrementStock = Boolean(updatedRows && updatedRows.length > 0) && !alreadyDecremented;
      } else {
        const { error: insertErr } = await supabaseAdmin
          .from('inveins_orders')
          .insert(finalOrderPayload);

        if (insertErr) {
          if (insertErr.code === '23505') {
            // Concurrently created by webhook thread; duplicate stock decrement prevented
            shouldDecrementStock = false;
          } else {
            console.error('[CASHFREE] Error recording confirmed order into Supabase:', insertErr);
            return NextResponse.json(
              { success: false, message: 'Database error recording confirmed order: ' + insertErr.message },
              { status: 500 }
            );
          }
        } else {
          shouldDecrementStock = !alreadyDecremented;
        }
      }

      // 6. Atomically Decrement Product Inventory only if this execution won the confirmation race
      if (shouldDecrementStock && Array.isArray(orderToCommit.items) && orderToCommit.items.length > 0) {
        decrementOrderStock(orderToCommit.items).catch((stockErr) => console.warn('[STOCK DECREMENT BG]', stockErr));
      }

      // 7. Clean up draft from inveins_checkout_drafts now that it is confirmed in inveins_orders
      try {
        await supabaseAdmin.from('inveins_checkout_drafts').delete().eq('id', cleanOrderId);
      } catch {}

      logSecurityEvent({
        event: 'CASHFREE_PAYMENT_VERIFIED',
        severity: 'INFO',
        ip,
        endpoint: '/api/payment/cashfree-verify',
        metadata: { orderId: cleanOrderId, paymentId },
      });

      return NextResponse.json({
        success: true,
        message: 'Cashfree payment authoritatively verified and order confirmed.',
        orderId: cleanOrderId,
        paymentId,
        order: {
          ...finalOrderPayload,
          status: 'Confirmed',
          paymentId,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Payment gateway configuration missing.' },
      { status: 500 }
    );
  } catch (err: any) {
    console.error('[CASHFREE] Verification exception:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error verifying Cashfree transaction.' },
      { status: 500 }
    );
  }
}
