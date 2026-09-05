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
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('inveins_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const product = {
      id: data.id,
      name: data.name,
      price: Number(data.price) || 0,
      currency: data.currency || '₹',
      category: data.category,
      badge: data.badge || undefined,
      tagline: data.tagline || '',
      description: data.description || '',
      availableStock: Number(data.available_stock) ?? 0,
      images: Array.isArray(data.images) ? data.images : [],
      sizes: Array.isArray(data.sizes) ? data.sizes : ['S', 'M', 'L', 'XL'],
      details: Array.isArray(data.details) ? data.details : [],
      materialCare: Array.isArray(data.material_care) ? data.material_care : [],
      shippingInfo: data.shipping_info || '',
      returnsInfo: data.returns_info || '',
      isActive: data.is_active ?? true,
    };

    return NextResponse.json({ success: true, product });
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
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.availableStock !== undefined) {
      updateData.available_stock = Number(body.availableStock);
    }
    if (body.badge !== undefined) {
      updateData.badge = body.badge ? sanitizeString(body.badge) : null;
    }
    if (body.price !== undefined) {
      updateData.price = Number(body.price);
    }
    if (body.isActive !== undefined) {
      updateData.is_active = Boolean(body.isActive);
    }
    if (body.name !== undefined) {
      updateData.name = sanitizeString(body.name);
    }

    const { data, error } = await supabase
      .from('inveins_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update product ${id} in Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: data,
    });
  } catch (err: any) {
    console.error('Server error in PATCH /api/products/[id]:', err);
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
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('inveins_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Failed to delete product ${id} from Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully` });
  } catch (err: any) {
    console.error('Server error in DELETE /api/products/[id]:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
