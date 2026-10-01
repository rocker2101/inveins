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

    if (existingOrder && (existingOrder.status === 'Confirmed' || existingOrder.status === 'Processing' || existingOrder.status === 'Shipped')) {
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
        orderToCommit = verifyOrderToken(order_token);
      }
      if (!orderToCommit) {
        orderToCommit = getPendingOrder(cleanOrderId);
      }
      if (!orderToCommit && existingOrder) {
        orderToCommit = existingOrder as any;
      }

      if (!orderToCommit) {
        return NextResponse.json(
          { success: false, message: 'Order session expired or invalid. Please contact support.' },
          { status: 400 }
        );
      }

      // 4. Verify amount matches Cashfree paid amount
      const expectedAmount = Number(orderToCommit.grand_total);
      const paidAmount = Number(cfOrder.order_amount);
      if (Math.abs(expectedAmount - paidAmount) > 1) {
        logSecurityEvent({
          event: 'PAYMENT_AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/cashfree-verify',
          metadata: { orderId: cleanOrderId, expected: expectedAmount, received: paidAmount },
        });

        return NextResponse.json(
          { success: false, message: 'Payment amount mismatch detected. Transaction flagged for manual review.' },
          { status: 400 }
        );
      }

      // 5. Insert order into Supabase ONLY NOW (Real paid order)
      const paymentId = `cf_${cleanOrderId}_${Date.now()}`;
      const updatedCustomer = {
        ...(typeof orderToCommit.customer === 'object' && orderToCommit.customer !== null ? orderToCommit.customer : {}),
        payment_id: paymentId,
        paid_at: new Date().toISOString(),
        payment_status: 'SUCCESS',
        cashfree_order_id: cleanOrderId,
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

      if (existingOrder) {
        const { error: updateErr } = await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            payment_method: 'cashfree_upi',
            customer: updatedCustomer,
          })
          .eq('id', cleanOrderId);

        if (updateErr) {
          console.error('[CASHFREE] Error updating order status:', updateErr);
          return NextResponse.json(
            { success: false, message: 'Database error updating order status: ' + updateErr.message },
            { status: 500 }
          );
        }
      } else {
        const { error: insertErr } = await supabaseAdmin
          .from('inveins_orders')
          .insert(finalOrderPayload);

        if (insertErr) {
          console.error('[CASHFREE] Error recording confirmed order into Supabase:', insertErr);
          return NextResponse.json(
            { success: false, message: 'Database error recording confirmed order: ' + insertErr.message },
            { status: 500 }
          );
        }
      }

      // 6. Atomically Decrement Product Inventory
      await decrementOrderStock(orderToCommit.items);

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
