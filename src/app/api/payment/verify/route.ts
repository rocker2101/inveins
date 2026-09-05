import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/payment-security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

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

    return NextResponse.json({
      success: true,
      message: 'Payment cryptographically verified.',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment signature.' },
      { status: 500 }
    );
  }
}
