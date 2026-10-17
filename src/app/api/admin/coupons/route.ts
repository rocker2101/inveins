import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCouponCode } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/coupons: Lists all promo codes for authenticated administrators
 */
export async function GET(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from('inveins_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ADMIN COUPONS] Table query error:', error.message);
      return NextResponse.json({ success: true, coupons: [] });
    }

    return NextResponse.json({ success: true, coupons: data || [] });
  } catch (err: any) {
    console.error('Error fetching admin coupons:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error fetching coupons: ' + (err?.message || '') },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons: Creates a new promo code
 */
export async function POST(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { code, discountType, discountValue, minOrderValue, isActive } = body || {};

    const cleanCode = normalizeCouponCode(code);
    if (!cleanCode || cleanCode.length < 2 || cleanCode.length > 30) {
      return NextResponse.json(
        { success: false, message: 'Promo code must be between 2 and 30 characters.' },
        { status: 400 }
      );
    }

    // Alphanumeric + dashes/underscores only
    if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, message: 'Promo code can only contain letters, numbers, hyphens, and underscores.' },
        { status: 400 }
      );
    }

    if (discountType !== 'flat' && discountType !== 'percent') {
      return NextResponse.json(
        { success: false, message: 'Discount type must be either "flat" (₹) or "percent" (%).' },
        { status: 400 }
      );
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json(
        { success: false, message: 'Discount value must be a positive number greater than 0.' },
        { status: 400 }
      );
    }

    if (discountType === 'percent' && numValue > 100) {
      return NextResponse.json(
        { success: false, message: 'Percentage discount cannot exceed 100%.' },
        { status: 400 }
      );
    }

    if (discountType === 'flat' && numValue > 100000) {
      return NextResponse.json(
        { success: false, message: 'Flat discount cannot exceed ₹1,00,000.' },
        { status: 400 }
      );
    }

    const numMinOrder = Number(minOrderValue) || 0;
    if (isNaN(numMinOrder) || numMinOrder < 0 || numMinOrder > 1000000) {
      return NextResponse.json(
        { success: false, message: 'Minimum order value must be between ₹0 and ₹10,00,000.' },
        { status: 400 }
      );
    }

    const activeBool = isActive === undefined ? true : Boolean(isActive);

    const payload = {
      code: cleanCode,
      discount_type: discountType,
      discount_value: numValue,
      min_order_value: numMinOrder,
      is_active: activeBool,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('inveins_coupons')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        return NextResponse.json(
          { success: false, message: `Promo code "${cleanCode}" already exists. Please choose another code.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Database error creating promo code: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Promo code "${cleanCode}" created successfully.`,
      coupon: data,
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/coupons:', err);
    return NextResponse.json(
      { success: false, message: 'Server error creating coupon: ' + (err?.message || '') },
      { status: 500 }
    );
  }
}
