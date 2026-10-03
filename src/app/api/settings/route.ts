import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/store-settings';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Public GET: Fetches current store shipping configuration for cart & checkout
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      {
        success: true,
        settings,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings', error: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Authenticated POST: Updates shipping settings from Admin Control Panel
 */
export async function POST(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json();
    const { standardShippingFee, freeShippingThreshold } = body;

    if (standardShippingFee === undefined && freeShippingThreshold === undefined) {
      return NextResponse.json(
        { success: false, message: 'Please provide standardShippingFee or freeShippingThreshold.' },
        { status: 400 }
      );
    }

    if (standardShippingFee !== undefined && (typeof standardShippingFee !== 'number' || isNaN(standardShippingFee) || standardShippingFee < 0 || standardShippingFee > 10000)) {
      return NextResponse.json(
        { success: false, message: 'standardShippingFee must be a valid number between 0 and 10,000.' },
        { status: 400 }
      );
    }

    if (freeShippingThreshold !== undefined && (typeof freeShippingThreshold !== 'number' || isNaN(freeShippingThreshold) || freeShippingThreshold < 0 || freeShippingThreshold > 100000)) {
      return NextResponse.json(
        { success: false, message: 'freeShippingThreshold must be a valid number between 0 and 100,000.' },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings({
      standardShippingFee: typeof standardShippingFee === 'number' ? standardShippingFee : undefined,
      freeShippingThreshold: typeof freeShippingThreshold === 'number' ? freeShippingThreshold : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Shipping settings updated successfully.',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update settings', error: error?.message },
      { status: 500 }
    );
  }
}
