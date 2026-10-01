import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/auth';

// Force dynamic execution and eliminate any Next.js edge/fetch caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function safeParse(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function GET(req: NextRequest) {
  try {
    // Enforce administrative authorization to prevent customer PII exposure
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const { data, error } = await supabaseAdmin
      .from('inveins_orders')
      .select('*')
      .neq('status', 'Payment Pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json({ success: false, message: error.message, orders: [] }, { status: 500 });
    }

    // Map database fields to the frontend Order interface
    const orders = (data || []).map((row: any) => {
      const parsedCustomer = safeParse(row.customer, { name: 'Customer', phone: '', address: '', city: '', pincode: '' });
      const parsedItems = safeParse(row.items, []);
      return {
        id: row.id,
        customer: parsedCustomer,
        items: Array.isArray(parsedItems) ? parsedItems : [],
        subtotal: Number(row.subtotal) || 0,
        discount: Number(row.discount) || 0,
        shippingFee: Number(row.shipping_fee) || 0,
        grandTotal: Number(row.grand_total) || 0,
        paymentMethod: row.payment_method || 'upi',
        paymentId: row.payment_id || parsedCustomer?.payment_id || undefined,
        cashfreeOrderId: row.cashfree_order_id || parsedCustomer?.cashfree_order_id || undefined,
        status: row.status || 'Confirmed',
        trackingNumber: row.tracking_number,
        verificationToken: row.verification_token,
        createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error('Server error in /api/orders/list:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders from database', orders: [] }, { status: 500 });
  }
}
