import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic so fresh data is always returned across mobile & desktop
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inveins_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json({ success: false, message: error.message, orders: [] }, { status: 500 });
    }

    // Map database fields to the frontend Order interface
    const orders = (data || []).map((row: any) => ({
      id: row.id,
      customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      subtotal: Number(row.subtotal) || 0,
      discount: Number(row.discount) || 0,
      shippingFee: Number(row.shipping_fee) || 0,
      grandTotal: Number(row.grand_total) || 0,
      paymentMethod: row.payment_method || 'upi',
      status: row.status || 'Confirmed',
      trackingNumber: row.tracking_number,
      verificationToken: row.verification_token,
      createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
    }));

    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error('Server error in /api/orders/list:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch orders from database', orders: [] }, { status: 500 });
  }
}
