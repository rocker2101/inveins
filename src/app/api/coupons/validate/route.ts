import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

/**
 * POST /api/coupons/validate: Customer-facing coupon validation endpoint
 * Validates promo code and returns server-calculated discount without exposing internal data
 */
export async function POST(req: NextRequest) {
  try {
    // Anti-Brute-Force Rate Limiting: Max 30 attempts per minute per IP
    const rateCheck = checkRateLimit(req, 'coupon_validate', { windowMs: 60 * 1000, max: 30 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many coupon attempts. Please try again in ${rateCheck.resetSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { code, subtotal, phone } = body || {};

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter a promo code.' },
        { status: 400 }
      );
    }

    const numSubtotal = Number(subtotal);
    if (isNaN(numSubtotal) || numSubtotal < 0) {
      return NextResponse.json(
        { success: false, message: 'Subtotal must be a valid positive number.' },
        { status: 400 }
      );
    }

    const result = await validateCoupon(code, numSubtotal, typeof phone === 'string' ? phone : undefined);

    if (!result.valid || !result.coupon) {
      return NextResponse.json(
        { success: false, message: result.message || 'Invalid or ineligible promo code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: result.coupon,
    });
  } catch (err: any) {
    console.error('Error in /api/coupons/validate:', err);
    return NextResponse.json(
      { success: false, message: 'Unable to validate promo code at this moment.' },
      { status: 500 }
    );
  }
}
