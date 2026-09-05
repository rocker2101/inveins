import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';

    let query = supabase.from('inveins_products').select('*');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return NextResponse.json({ success: false, message: error.message, products: [] }, { status: 500 });
    }

    // Map DB column names to frontend Product interface
    const products = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price) || 0,
      currency: row.currency || '₹',
      category: row.category,
      badge: row.badge || undefined,
      tagline: row.tagline || '',
      description: row.description || '',
      availableStock: Number(row.available_stock) ?? 0,
      images: Array.isArray(row.images) ? row.images : typeof row.images === 'string' ? JSON.parse(row.images) : [],
      sizes: Array.isArray(row.sizes) ? row.sizes : typeof row.sizes === 'string' ? JSON.parse(row.sizes) : ['S', 'M', 'L', 'XL'],
      details: Array.isArray(row.details) ? row.details : typeof row.details === 'string' ? JSON.parse(row.details) : [],
      materialCare: Array.isArray(row.material_care) ? row.material_care : typeof row.material_care === 'string' ? JSON.parse(row.material_care) : [],
      shippingInfo: row.shipping_info || '',
      returnsInfo: row.returns_info || '',
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error('Server error in /api/products:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch products', products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      price,
      currency = '₹',
      category = 'Tees',
      badge = 'NEW',
      tagline = '',
      description = '',
      availableStock = 20,
      images = [],
      sizes = ['S', 'M', 'L', 'XL'],
      details = [],
      materialCare = [],
      shippingInfo = 'Complimentary shipping across India on orders above ₹999.',
      returnsInfo = 'Hassle-free 7-day exchange & return policy.',
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ success: false, message: 'Product name and price are required' }, { status: 400 });
    }

    const cleanName = sanitizeString(name);
    const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
    const cleanId = `${slugId}-${Math.floor(100 + Math.random() * 900)}`;

    const newRow = {
      id: cleanId,
      name: cleanName,
      price: Number(price) || 0,
      currency: sanitizeString(currency) || '₹',
      category: sanitizeString(category),
      badge: sanitizeString(badge) || null,
      tagline: sanitizeString(tagline),
      description: sanitizeString(description),
      available_stock: Number(availableStock) || 0,
      images: Array.isArray(images) ? images : [images],
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL'],
      details: Array.isArray(details) ? details : [],
      material_care: Array.isArray(materialCare) ? materialCare : [],
      shipping_info: sanitizeString(shippingInfo),
      returns_info: sanitizeString(returnsInfo),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inveins_products')
      .insert([newRow])
      .select()
      .single();

    if (error) {
      console.error('Error inserting product to Supabase:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        currency: data.currency,
        category: data.category,
        badge: data.badge,
        tagline: data.tagline,
        description: data.description,
        availableStock: Number(data.available_stock),
        images: data.images,
        sizes: data.sizes,
        details: data.details,
        materialCare: data.material_care,
        shippingInfo: data.shipping_info,
        returnsInfo: data.returns_info,
        isActive: data.is_active,
      },
    });
  } catch (err: any) {
    console.error('Server error in POST /api/products:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
