import { supabaseAdmin } from '@/lib/supabase';

export interface DbCoupon {
  id: string;
  code: string;
  discount_type: 'flat' | 'percent';
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: {
    code: string;
    discountType: 'flat' | 'percent';
    discountValue: number;
    discountAmount: number;
    minOrderValue: number;
  };
}

/**
 * Consistently normalize coupon codes across application:
 * Trims leading/trailing whitespace and converts to uppercase.
 */
export function normalizeCouponCode(code?: string | null): string {
  if (!code || typeof code !== 'string') return '';
  return code.trim().toUpperCase();
}

/**
 * Pure helper to compute discount amount and enforce bounds:
 * 0 <= discountAmount <= subtotal
 */
export function calculateCouponDiscount(
  coupon: {
    discount_type: 'flat' | 'percent';
    discount_value: number;
    min_order_value?: number;
  },
  subtotal: number
): { discountAmount: number; eligible: boolean; reason?: string } {
  if (typeof subtotal !== 'number' || isNaN(subtotal) || subtotal <= 0) {
    return { discountAmount: 0, eligible: false, reason: 'Cart subtotal must be greater than zero.' };
  }

  const minOrder = Number(coupon.min_order_value) || 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return {
      discountAmount: 0,
      eligible: false,
      reason: `Minimum order value of ₹${minOrder.toLocaleString('en-IN')} required for promo code.`,
    };
  }

  const value = Number(coupon.discount_value);
  if (isNaN(value) || value <= 0) {
    return { discountAmount: 0, eligible: false, reason: 'Invalid coupon discount value.' };
  }

  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = Math.min(subtotal, Math.round(value));
  } else if (coupon.discount_type === 'percent') {
    if (value > 100) {
      return { discountAmount: 0, eligible: false, reason: 'Percentage discount cannot exceed 100%.' };
    }
    discount = Math.min(subtotal, Math.round((subtotal * value) / 100));
  } else {
    return { discountAmount: 0, eligible: false, reason: 'Unsupported discount type.' };
  }

  discount = Math.max(0, Math.min(subtotal, discount));
  return { discountAmount: discount, eligible: true };
}

/**
 * Fetches a coupon record by code from Supabase database.
 * Returns null if the coupon does not exist.
 */
export async function getCouponByCode(rawCode: string): Promise<DbCoupon | null> {
  const cleanCode = normalizeCouponCode(rawCode);
  if (!cleanCode) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('inveins_coupons')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_value: Number(data.min_order_value || 0),
        is_active: Boolean(data.is_active),
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }
  } catch (err) {
    console.error('Error fetching coupon from database:', err);
  }

  return null;
}

/**
 * Server-authoritative coupon validation function.
 * Validates existence, active state, minimum order requirement, first-order constraint,
 * and calculates exact bounded discount.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  customerPhone?: string
): Promise<CouponValidationResult> {
  const cleanCode = normalizeCouponCode(rawCode);
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a valid promo code.' };
  }

  const coupon = await getCouponByCode(cleanCode);
  if (!coupon) {
    return { valid: false, message: `Promo code "${cleanCode}" is invalid.` };
  }

  if (!coupon.is_active) {
    return { valid: false, message: `Promo code "${cleanCode}" is currently inactive.` };
  }

  // Preserve FIRST10 single-use rule for first-time orders only
  if (cleanCode === 'FIRST10' && customerPhone) {
    try {
      const { data: priorOrders } = await supabaseAdmin
        .from('inveins_orders')
        .select('id')
        .contains('customer', { phone: customerPhone })
        .in('status', ['Confirmed', 'Processing', 'Dispatched', 'Delivered'])
        .limit(1);

      if (priorOrders && priorOrders.length > 0) {
        return {
          valid: false,
          message: 'Promo code FIRST10 is valid for first-time orders only.',
        };
      }
    } catch (e) {
      // Continue gracefully if json indexing is warming up
    }
  }

  const calc = calculateCouponDiscount(coupon, subtotal);
  if (!calc.eligible) {
    return { valid: false, message: calc.reason || 'Cart is not eligible for this promo code.' };
  }

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: calc.discountAmount,
      minOrderValue: coupon.min_order_value,
    },
  };
}

export interface PublicCoupon {
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrderValue: number;
}

/**
 * Returns safe public information for active coupons so customers can view and pick available offers.
 * Returns an empty array if no active coupons exist in the database.
 */
export async function getActivePublicCoupons(): Promise<PublicCoupon[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('inveins_coupons')
      .select('code, discount_type, discount_value, min_order_value')
      .eq('is_active', true)
      .order('discount_value', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(c => ({
        code: c.code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        minOrderValue: Number(c.min_order_value || 0),
      }));
    }
  } catch (err) {
    console.error('Error fetching active public coupons:', err);
  }

  return [];
}
