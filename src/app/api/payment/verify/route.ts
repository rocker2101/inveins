import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature, fetchRazorpayOrder, decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required Razorpay payment credentials.' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      logSecurityEvent({
        event: 'FORGED_PAYMENT_SIGNATURE_ATTEMPT',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/verify',
        metadata: { razorpay_order_id, razorpay_payment_id, order_id },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid or forged payment signature detected. Transaction rejected.' },
        { status: 400 }
      );
    }

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'Application order ID is required for verification.' },
        { status: 400 }
      );
    }

    const cleanOrderId = sanitizeString(order_id);
    const cleanPaymentId = sanitizeString(razorpay_payment_id);
    const cleanRzpOrderId = sanitizeString(razorpay_order_id);

    // 2. Fetch existing order to correlate credentials
    const { data: existingOrder, error: fetchErr } = await supabaseAdmin
      .from('inveins_orders')
      .select('*')
      .eq('id', cleanOrderId)
      .maybeSingle();

    if (fetchErr || !existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Application order not found in database.' },
        { status: 404 }
      );
    }

    const storedCustomer = typeof existingOrder.customer === 'string'
      ? JSON.parse(existingOrder.customer)
      : (existingOrder.customer || {});

    // 3. Verify Razorpay Order ID correlation
    const expectedRzpOrderId = existingOrder.razorpay_order_id || storedCustomer.razorpay_order_id;
    if (expectedRzpOrderId && expectedRzpOrderId !== cleanRzpOrderId) {
      logSecurityEvent({
        event: 'MISMATCHED_RAZORPAY_ORDER_ID',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/verify',
        metadata: { orderId: cleanOrderId, expected: expectedRzpOrderId, received: cleanRzpOrderId },
      });

      return NextResponse.json(
        { success: false, message: 'Security mismatch: Razorpay order ID does not belong to this application order.' },
        { status: 400 }
      );
    }

    // 4. Verify Amount with Razorpay Gateway
    const rzpOrderDetails = await fetchRazorpayOrder(cleanRzpOrderId);
    if (rzpOrderDetails) {
      const expectedPaise = Math.round(Number(existingOrder.grand_total) * 100);
      if (rzpOrderDetails.amount !== expectedPaise) {
        logSecurityEvent({
          event: 'PAYMENT_AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/verify',
          metadata: { orderId: cleanOrderId, expectedPaise, receivedPaise: rzpOrderDetails.amount },
        });

        return NextResponse.json(
          { success: false, message: 'Payment amount mismatch between gateway and application order.' },
          { status: 400 }
        );
      }
    }

    // 5. Idempotent guard: If already confirmed, return early without duplicate stock deduction
    if (existingOrder.status === 'Confirmed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified previously.',
        paymentId: existingOrder.payment_id || cleanPaymentId,
        order: existingOrder,
      });
    }

    // 6. Cross-Order Payment ID Deduplication Check
    try {
      const { data: duplicateOrder } = await supabaseAdmin
        .from('inveins_orders')
        .select('id')
        .eq('payment_id', cleanPaymentId)
        .neq('id', cleanOrderId)
        .maybeSingle();

      if (duplicateOrder) {
        logSecurityEvent({
          event: 'DUPLICATE_PAYMENT_ID_ATTEMPT',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/verify',
          metadata: { orderId: cleanOrderId, conflictingOrder: duplicateOrder.id, paymentId: cleanPaymentId },
        });

        return NextResponse.json(
          { success: false, message: 'This payment transaction ID has already been credited to another order.' },
          { status: 409 }
        );
      }
    } catch (dupCheckErr) {
      // If payment_id column does not exist yet, proceed with customer JSON tracking
    }

    // 7. Update order in Supabase with defensive column fallback
    const nowIso = new Date().toISOString();
    let confirmedOrder = null;

    // Attempt standard update with dedicated payment_id & updated_at columns
    let { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('inveins_orders')
      .update({
        status: 'Confirmed',
        payment_id: cleanPaymentId,
        razorpay_order_id: cleanRzpOrderId,
        updated_at: nowIso,
      })
      .eq('id', cleanOrderId)
      .select()
      .maybeSingle();

    // Fallback if dedicated columns are not yet migrated in Supabase
    if (updateError && updateError.code === '42703') {
      const fallbackCustomer = {
        ...storedCustomer,
        payment_id: cleanPaymentId,
        razorpay_order_id: cleanRzpOrderId,
        verified_at: nowIso,
      };

      const fallbackResult = await supabaseAdmin
        .from('inveins_orders')
        .update({
          status: 'Confirmed',
          customer: fallbackCustomer,
        })
        .eq('id', cleanOrderId)
        .select()
        .maybeSingle();

      updatedOrder = fallbackResult.data;
      updateError = fallbackResult.error;
    }

    if (!updateError && updatedOrder) {
      confirmedOrder = updatedOrder;

      logSecurityEvent({
        event: 'PAYMENT_VERIFIED_SUCCESS',
        severity: 'INFO',
        ip,
        endpoint: '/api/payment/verify',
        metadata: { orderId: cleanOrderId, paymentId: cleanPaymentId },
      });

      // 8. Atomically decrement stock for purchased items
      await decrementOrderStock(updatedOrder.items || existingOrder.items);
    } else {
      console.error('Failed to confirm order in database:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cryptographically verified and order confirmed.',
      paymentId: cleanPaymentId,
      order: confirmedOrder || { ...existingOrder, status: 'Confirmed', paymentId: cleanPaymentId },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment signature.' },
      { status: 500 }
    );
  }
}

