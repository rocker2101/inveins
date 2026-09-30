import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function safeParseArray(val: any, fallback: any[] = []): any[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(s => s.replace(/^"(.*)"$/, '$1').trim())
        .filter(Boolean);
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
      return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return fallback;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
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
      images: safeParseArray(data.images, []),
      sizes: safeParseArray(data.sizes, ['S', 'M', 'L', 'XL']),
      details: safeParseArray(data.details, []),
      materialCare: safeParseArray(data.material_care, []),
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
    const authError = requireAdminSession(req);
    if (authError) return authError;

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
    if (body.category !== undefined) {
      updateData.category = sanitizeString(body.category);
    }
    if (body.tagline !== undefined) {
      updateData.tagline = sanitizeString(body.tagline);
    }
    if (body.description !== undefined) {
      updateData.description = sanitizeString(body.description);
    }
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? body.images : [body.images];
    }
    if (body.sizes !== undefined) {
      updateData.sizes = Array.isArray(body.sizes) ? body.sizes : ['S', 'M', 'L', 'XL'];
    }
    if (body.details !== undefined) {
      updateData.details = Array.isArray(body.details) ? body.details : [];
    }
    if (body.materialCare !== undefined) {
      updateData.material_care = Array.isArray(body.materialCare) ? body.materialCare : [];
    }
    if (body.shippingInfo !== undefined) {
      updateData.shipping_info = sanitizeString(body.shippingInfo);
    }
    if (body.returnsInfo !== undefined) {
      updateData.returns_info = sanitizeString(body.returnsInfo);
    }

    const { data, error } = await supabaseAdmin
      .from('inveins_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update product ${id} in Supabase:`, error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const formattedProduct = {
      id: data.id,
      name: data.name,
      price: Number(data.price) || 0,
      currency: data.currency || '₹',
      category: data.category,
      badge: data.badge || undefined,
      tagline: data.tagline || '',
      description: data.description || '',
      availableStock: Number(data.available_stock) ?? 0,
      images: Array.isArray(data.images) ? data.images : typeof data.images === 'string' ? JSON.parse(data.images) : [],
      sizes: Array.isArray(data.sizes) ? data.sizes : typeof data.sizes === 'string' ? JSON.parse(data.sizes) : ['S', 'M', 'L', 'XL'],
      details: Array.isArray(data.details) ? data.details : [],
      materialCare: Array.isArray(data.material_care) ? data.material_care : [],
      shippingInfo: data.shipping_info || '',
      returnsInfo: data.returns_info || '',
      isActive: data.is_active ?? true,
    };

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: formattedProduct,
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
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
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
