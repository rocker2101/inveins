import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('inveins_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const order = {
      id: data.id,
      customer: typeof data.customer === 'string' ? JSON.parse(data.customer) : data.customer,
      items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      shippingFee: Number(data.shipping_fee) || 0,
      grandTotal: Number(data.grand_total) || 0,
      paymentMethod: data.payment_method || 'upi',
      status: data.status || 'Confirmed',
      trackingNumber: data.tracking_number,
      verificationToken: data.verification_token,
      createdAt: data.created_at ? new Date(data.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
    };

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.status) {
      updateData.status = sanitizeString(body.status);
    }
    if (body.trackingNumber) {
      updateData.tracking_number = sanitizeString(body.trackingNumber);
    }

    const { data, error } = await supabase
      .from('inveins_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update order ${id} in Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully', order: data });
  } catch (err: any) {
    console.error('Server error in PATCH /api/orders/[id]:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('inveins_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Failed to delete order ${id} from Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Order ${id} deleted successfully` });
  } catch (err: any) {
    console.error('Server error in DELETE /api/orders/[id]:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
