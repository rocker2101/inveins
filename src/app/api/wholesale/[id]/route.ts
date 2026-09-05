import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      return NextResponse.json({ success: false, message: 'Enquiry ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('inveins_wholesale_enquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Enquiry not found' }, { status: 404 });
    }

    const enquiry = {
      id: data.id,
      name: data.name || '',
      company: data.company || '',
      email: data.email || '',
      phone: data.phone || '',
      cityCountry: data.city_country || '',
      productInterest: data.product_interest || '',
      quantity: data.quantity || '',
      message: data.message || '',
      createdAt: data.created_at ? new Date(data.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
    };

    return NextResponse.json({ success: true, enquiry });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Enquiry ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('inveins_wholesale_enquiries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Failed to delete enquiry ${id} from Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Enquiry ${id} deleted successfully` });
  } catch (err: any) {
    console.error('Server error in DELETE /api/wholesale/[id]:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
