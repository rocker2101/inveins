import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'orderId and status are required' }, { status: 400 });
    }

    const cleanOrderId = sanitizeString(orderId);
    const cleanStatus = sanitizeString(status);

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled', 'Failed', 'Refunded'];
    if (!validStatuses.includes(cleanStatus)) {
      return NextResponse.json({ success: false, message: 'Invalid order status value' }, { status: 400 });
    }

    // 1. Fetch current order to check previous status and items
    const { data: currentOrder } = await supabaseAdmin
      .from('inveins_orders')
      .select('status, items')
      .eq('id', cleanOrderId)
      .maybeSingle();

    const previousStatus = currentOrder?.status;

    // 2. Update status in database
    const { error } = await supabaseAdmin
      .from('inveins_orders')
      .update({ 
        status: cleanStatus,
      })
      .eq('id', cleanOrderId);

    if (error) {
      console.error('Failed to update order status in Supabase:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // 3. If transitioning to Cancelled or Refunded from an active state, restore inventory
    if ((cleanStatus === 'Cancelled' || cleanStatus === 'Refunded') && 
        previousStatus && 
        !['Cancelled', 'Refunded', 'Failed'].includes(previousStatus)) {
      const { restoreOrderStock } = await import('@/lib/payment-security');
      await restoreOrderStock(currentOrder.items);
    }

    return NextResponse.json({ success: true, message: 'Order status updated successfully' });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
