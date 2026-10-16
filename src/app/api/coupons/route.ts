import { NextResponse } from 'next/server';
import { getActivePublicCoupons } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

/**
 * GET /api/coupons: Public read-only endpoint returning active promo offers for customers
 */
export async function GET() {
  try {
    const coupons = await getActivePublicCoupons();
    return NextResponse.json(
      {
        success: true,
        coupons,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Failed to fetch public coupons:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch available offers' },
      { status: 500 }
    );
  }
}
