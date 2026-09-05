import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    // 1. Query Orders count & sum subtotal
    const { data: ordersData, error: ordersError } = await supabase
      .from('inveins_orders')
      .select('id, subtotal, grand_total, status');

    if (ordersError) {
      console.error('Error querying orders for dashboard stats:', ordersError);
    }

    const orders = ordersData || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.subtotal) || 0), 0);

    // 2. Query Wholesale Enquiries count
    const { count: wholesaleCount, error: wsError } = await supabase
      .from('inveins_wholesale_enquiries')
      .select('*', { count: 'exact', head: true });

    if (wsError) {
      console.error('Error querying wholesale enquiries count:', wsError);
    }

    // 3. Query Catalog Items count (from inveins_products)
    const { count: catalogCount, error: prodError } = await supabase
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
