import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/payment-security';
import { supabase } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required Razorpay payment credentials.' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or forged payment signature detected. Transaction rejected.' },
        { status: 400 }
      );
    }

    // Cryptographic payment signature is valid! If internal order_id is provided, update DB status to Confirmed
    if (order_id) {
      const cleanOrderId = sanitizeString(order_id);
      await supabase
        .from('inveins_orders')
        .update({
          status: 'Confirmed',
          payment_id: sanitizeString(razorpay_payment_id),
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanOrderId);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cryptographically verified and order confirmed.',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment signature.' },
      { status: 500 }
    );
  }
}
