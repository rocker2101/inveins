import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { requireAdminSession, getSessionFromRequest } from '@/lib/auth';
import { WholesaleProduct } from '@/types/wholesale';

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

const DEFAULT_WHOLESALE_PRODUCTS: WholesaleProduct[] = [
  {
    id: 'ws-heavyweight-blank-tee',
    name: 'Heavyweight Oversized Blank Tee (240 GSM)',
    category: 'Tees & Tops',
    moq: '50 Pieces',
    gsm: '240 GSM',
    tagline: '100% Combed Cotton, drop shoulder cut, ready for DTF & screen print branding.',
    description: 'Engineered specifically for streetwear brands, independent labels, and university merch. Pre-shrunk, bio-washed combed cotton with dense weave that holds vibrant DTF inks and high-density screen prints without ink bleeding.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    customizationOptions: ['DTF Printing', 'Screen Printing', 'High-Density Puff Print', 'Custom Woven Neck Labels', 'Blank Supplies'],
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'],
    badge: 'FACTORY DIRECT',
    isActive: true,
  },
  {
    id: 'ws-dtf-printing-service',
    name: 'Direct-to-Film (DTF) Bulk Printing Service',
    category: 'Printing & Customization',
    moq: '50 Pieces',
    gsm: 'Multi-substrate',
    tagline: 'Computerized multi-color transfer with ultra-fine detail reproduction.',
    description: 'Industrial grade DTF transfers applied on 100% cotton, poly-cotton blends, and fleece. Hot-peel release with high stretchability and wash fastness exceeding 50+ domestic washes.',
    availableSizes: ['Chest 4x4 in', 'A4 Front', 'A3 Back', 'Sleeve Insignia'],
    customizationOptions: ['Full Color CMYK+White', 'Metallic Gold/Silver Foil', 'Puff 3D Effect', 'Custom Branding'],
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg'],
    badge: 'BULK READY',
    isActive: true,
  },
  {
    id: 'ws-embroidery-service',
    name: 'Multi-Head Computerized Embroidery',
    category: 'Embroidery & Badges',
    moq: '50 Pieces',
    gsm: 'All Apparel',
    tagline: 'High stitch count embroidery for corporate crests, chest logos, and caps.',
    description: 'Precision Japanese Tajima embroidery heads delivering sharp satin and tatami stitches. Madeira polyester embroidery threads that resist chlorine and industrial laundering.',
    availableSizes: ['Chest Logo (up to 4")', 'Sleeve Patch', 'Back Monogram', 'Cap/Beanie'],
    customizationOptions: ['3D Foam Puff Embroidery', 'Applique Work', 'Flat Satin Stitch', 'Custom Patches'],
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/3/590934041/EV/YM/MP/180956315/embroidery-500x500.jpeg'],
    badge: 'PREMIUM FINISH',
    isActive: true,
  },
  {
    id: 'ws-french-terry-hoodie',
    name: 'Heavy French Terry Oversized Hoodie (380 GSM)',
    category: 'Hoodies & Outerwear',
    moq: '30 Pieces',
    gsm: '380 GSM',
    tagline: 'Double-layered hood, kangaroo pouch with bartack reinforcement.',
    description: 'Luxury streetwear silhouette crafted from 380 GSM loopback French Terry. Ribbed cuffs and hem with spandex memory, tailored for premium winter collections and startup brand releases.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    customizationOptions: ['Chest Embroidery', 'Back DTF Graphic', 'Kangaroo Pocket Label', 'Metal Drawstring Tips'],
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/4/598343279/DS/SE/FU/180956315/imported-jersey-customization-500x500.jpeg'],
    badge: 'WINTER COLLECTION',
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = getSessionFromRequest(req);
    const isAdmin = session && (session.role === 'ADMIN' || session.role === 'STAFF');
    const includeInactive = searchParams.get('all') === 'true' && Boolean(isAdmin);

    let query = supabaseAdmin.from('inveins_wholesale_products').select('*');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.warn('Note: inveins_wholesale_products query error or table empty, using fallback:', error.message);
      return NextResponse.json({
        success: true,
        products: DEFAULT_WHOLESALE_PRODUCTS,
        isFallback: true,
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        products: DEFAULT_WHOLESALE_PRODUCTS,
        isFallback: true,
      });
    }

    const products: WholesaleProduct[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || 'Tees & Blanks',
      moq: row.moq || '50 Pieces',
      gsm: row.gsm || undefined,
      tagline: row.tagline || '',
      description: row.description || '',
      availableSizes: safeParseArray(row.available_sizes, ['S', 'M', 'L', 'XL', 'XXL']),
      customizationOptions: safeParseArray(row.customization_options, ['DTF Printing', 'Embroidery', 'Blanks']),
      images: safeParseArray(row.images, []),
      badge: row.badge || undefined,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('Server error in /api/wholesale/products:', err);
    return NextResponse.json({
      success: true,
      products: DEFAULT_WHOLESALE_PRODUCTS,
      isFallback: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json();
    const {
      name,
      category = 'Tees & Tops',
      moq = '50 Pieces',
      gsm = '',
      tagline = '',
      description = '',
      availableSizes = ['S', 'M', 'L', 'XL', 'XXL'],
      customizationOptions = ['DTF Printing', 'Embroidery', 'Screen Print', 'Plain Blanks'],
      images = [],
      badge = 'BULK READY',
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Product title / name is required.' }, { status: 400 });
    }

    const cleanName = sanitizeString(name);
    const slugId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `ws-item-${Date.now()}`;
    const cleanId = `ws-${slugId}-${Math.floor(100 + Math.random() * 900)}`;

    const newRow = {
      id: cleanId,
      name: cleanName,
      category: sanitizeString(category),
      moq: sanitizeString(moq || '50 Pieces'),
      gsm: gsm ? sanitizeString(gsm) : null,
      tagline: sanitizeString(tagline || ''),
      description: sanitizeString(description || ''),
      available_sizes: Array.isArray(availableSizes) ? availableSizes : ['S', 'M', 'L', 'XL', 'XXL'],
      customization_options: Array.isArray(customizationOptions) ? customizationOptions : ['DTF Printing', 'Embroidery', 'Blanks'],
      images: Array.isArray(images) && images.length > 0 ? images : ['https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'],
      badge: badge ? sanitizeString(badge) : 'BULK READY',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('inveins_wholesale_products')
      .insert([newRow])
      .select()
      .single();

    if (error) {
      console.error('Error inserting wholesale product to Supabase:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wholesale product created successfully!',
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
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    console.error('Server error in POST /api/wholesale/products:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
