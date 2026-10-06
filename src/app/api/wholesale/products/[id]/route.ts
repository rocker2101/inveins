import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ success: false, message: 'Wholesale product ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('inveins_wholesale_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Wholesale product not found' }, { status: 404 });
    }

    const product = {
      id: data.id,
      name: data.name,
      category: data.category,
      moq: data.moq,
      gsm: data.gsm,
      tagline: data.tagline,
      description: data.description,
      availableSizes: safeParseArray(data.available_sizes, []),
      customizationOptions: safeParseArray(data.customization_options, []),
      images: safeParseArray(data.images, []),
      badge: data.badge,
      isActive: data.is_active ?? true,
      createdAt: data.created_at,
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
      return NextResponse.json({ success: false, message: 'Wholesale product ID required' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = sanitizeString(body.name);
    if (body.category !== undefined) updateData.category = sanitizeString(body.category);
    if (body.moq !== undefined) updateData.moq = sanitizeString(body.moq);
    if (body.gsm !== undefined) updateData.gsm = body.gsm ? sanitizeString(body.gsm) : null;
    if (body.tagline !== undefined) updateData.tagline = sanitizeString(body.tagline);
    if (body.description !== undefined) updateData.description = sanitizeString(body.description);
    if (body.availableSizes !== undefined) updateData.available_sizes = Array.isArray(body.availableSizes) ? body.availableSizes : [];
    if (body.customizationOptions !== undefined) updateData.customization_options = Array.isArray(body.customizationOptions) ? body.customizationOptions : [];
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [body.images];
    if (body.badge !== undefined) updateData.badge = body.badge ? sanitizeString(body.badge) : null;
    if (body.isActive !== undefined) updateData.is_active = Boolean(body.isActive);

    const { data, error } = await supabaseAdmin
      .from('inveins_wholesale_products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wholesale product:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wholesale product updated successfully',
      product: {
        id: data.id,
        name: data.name,
        category: data.category,
        moq: data.moq,
        gsm: data.gsm,
        tagline: data.tagline,
        description: data.description,
        availableSizes: safeParseArray(data.available_sizes, []),
        customizationOptions: safeParseArray(data.customization_options, []),
        images: safeParseArray(data.images, []),
        badge: data.badge,
        isActive: data.is_active,
      },
    });
  } catch (err: any) {
    console.error('Server error in PATCH /api/wholesale/products/[id]:', err);
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
      return NextResponse.json({ success: false, message: 'Wholesale product ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('inveins_wholesale_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wholesale product:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wholesale product deleted successfully',
    });
  } catch (err: any) {
    console.error('Server error in DELETE /api/wholesale/products/[id]:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
