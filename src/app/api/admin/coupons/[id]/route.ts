import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/admin/coupons/[id]: Updates an existing promo code's status or settings
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const couponId = params.id;
    if (!couponId) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required.' }, { status: 400 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON request body.' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.isActive !== undefined) {
      updates.is_active = Boolean(body.isActive);
    }

    if (body.discountType !== undefined) {
      if (body.discountType !== 'flat' && body.discountType !== 'percent') {
        return NextResponse.json(
          { success: false, message: 'Discount type must be either "flat" or "percent".' },
          { status: 400 }
        );
      }
      updates.discount_type = body.discountType;
    }

    if (body.discountValue !== undefined) {
      const numVal = Number(body.discountValue);
      if (isNaN(numVal) || numVal <= 0) {
        return NextResponse.json(
          { success: false, message: 'Discount value must be a positive number greater than 0.' },
          { status: 400 }
        );
      }
      if (body.discountType === 'percent' && numVal > 100) {
        return NextResponse.json(
          { success: false, message: 'Percentage discount cannot exceed 100%.' },
          { status: 400 }
        );
      }
      updates.discount_value = numVal;
    }

    if (body.minOrderValue !== undefined) {
      const numMin = Number(body.minOrderValue);
      if (isNaN(numMin) || numMin < 0) {
        return NextResponse.json(
          { success: false, message: 'Minimum order value must be 0 or greater.' },
          { status: 400 }
        );
      }
      updates.min_order_value = numMin;
    }

    const { data, error } = await supabaseAdmin
      .from('inveins_coupons')
      .update(updates)
      .eq('id', couponId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to update promo code: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code updated successfully.',
      coupon: data,
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/admin/coupons/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Server error updating coupon: ' + (err?.message || '') },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[id]: Permanently removes a promo code after admin confirmation
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const couponId = params.id;
    if (!couponId) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('inveins_coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete promo code: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/coupons/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Server error deleting coupon: ' + (err?.message || '') },
      { status: 500 }
    );
  }
}
