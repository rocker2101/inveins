import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    // Silently auto-clean abandoned payment-pending drafts older than 24 hours
    try {
      const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await Promise.allSettled([
        supabaseAdmin.from('inveins_orders').delete().eq('status', 'Payment Pending').lt('created_at', cutoffIso),
        supabaseAdmin.from('inveins_checkout_drafts').delete().lt('created_at', cutoffIso),
      ]);
    } catch {}

    // 1. Query Orders count & sum subtotal
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('inveins_orders')
      .select('id, subtotal, grand_total, status');

    if (ordersError) {
      console.error('Error querying orders for dashboard stats:', ordersError);
    }

    const orders = ordersData || [];
    // Strict real orders: COD (Pending/Confirmed/Dispatched/Delivered) & Paid (Confirmed/Dispatched/Delivered)
    // Exclude abandoned/unpaid 'Payment Pending' and 'Cancelled' orders
    const validOrders = orders.filter((o: any) => o.status !== 'Cancelled' && o.status !== 'Payment Pending');
    const totalOrders = validOrders.length;
    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + (Number(o.grand_total ?? o.subtotal) || 0), 0);

    // 2. Query Wholesale Enquiries count
    const { count: wholesaleCount, error: wsError } = await supabaseAdmin
      .from('inveins_wholesale_enquiries')
      .select('*', { count: 'exact', head: true });

    if (wsError) {
      console.error('Error querying wholesale enquiries count:', wsError);
    }

    // 3. Query Catalog Items count (from inveins_products)
    const { count: catalogCount, error: prodError } = await supabaseAdmin
      .from('inveins_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (prodError) {
      console.error('Error querying catalog items count:', prodError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        wholesaleEnquiries: wholesaleCount ?? 0,
        catalogItems: catalogCount ?? 0,
      },
    });
  } catch (err: any) {
    console.error('Server error in /api/admin/dashboard:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
