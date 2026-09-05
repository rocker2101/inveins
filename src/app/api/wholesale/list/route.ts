import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inveins_wholesale_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wholesale enquiries from Supabase:', error);
      return NextResponse.json({ success: false, message: error.message, enquiries: [] }, { status: 500 });
    }

    const enquiries = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name || '',
      company: row.company || '',
      email: row.email || '',
      phone: row.phone || '',
      cityCountry: row.city_country || '',
      productInterest: row.product_interest || '',
      quantity: row.quantity || '',
      message: row.message || '',
      createdAt: row.created_at ? new Date(row.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString(),
    }));

    return NextResponse.json({ success: true, enquiries });
  } catch (err: any) {
    console.error('Server error in /api/wholesale/list:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch enquiries', enquiries: [] }, { status: 500 });
  }
}
