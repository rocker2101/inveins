import { NextRequest, NextResponse } from 'next/server';
import { fetchCashfreeOrder, isCashfreeConfigured } from '@/lib/cashfree';
import { decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required for Cashfree verification.' },
        { status: 400 }
      );
    }

    const cleanOrderId = sanitizeString(order_id);

    // 1. Fetch current order from Supabase
    const { data: existingOrder, error: fetchErr } = await supabaseAdmin
      .from('inveins_orders')
      .select('*')
      .eq('id', cleanOrderId)
      .maybeSingle();

    if (fetchErr || !existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found in database.' },
        { status: 404 }
      );
    }

    // Idempotency: If already confirmed, return success immediately
    if (existingOrder.status === 'Confirmed' || existingOrder.status === 'Processing' || existingOrder.status === 'Shipped') {
      return NextResponse.json({
        success: true,
        message: 'Order has already been confirmed.',
        orderId: cleanOrderId,
        paymentId: existingOrder.payment_id || `cf_${cleanOrderId}`,
      });
    }

    // 2. Authoritative Verification with Cashfree PG
    if (isCashfreeConfigured()) {
      const cfOrder = await fetchCashfreeOrder(cleanOrderId);

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

      // Check amount match
      const expectedAmount = Number(existingOrder.grand_total);
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
    }

    // 3. Mark Order as Confirmed in Supabase
    const paymentId = `cf_${cleanOrderId}_${Date.now()}`;
    const { error: updateErr } = await supabaseAdmin
      .from('inveins_orders')
      .update({
        status: 'Confirmed',
        payment_id: paymentId,
        payment_method: 'cashfree_upi',
        updated_at: new Date().toISOString(),
      })
      .eq('id', cleanOrderId);

    if (updateErr) {
      console.error('[CASHFREE] Error updating order status:', updateErr);
      return NextResponse.json(
        { success: false, message: 'Database error updating order status.' },
        { status: 500 }
      );
    }

    // 4. Atomically Decrement Product Inventory
    await decrementOrderStock(existingOrder.items);

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
    });
  } catch (err: any) {
    console.error('[CASHFREE] Verification exception:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error verifying Cashfree transaction.' },
      { status: 500 }
    );
  }
}
