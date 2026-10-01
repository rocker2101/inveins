import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/store-settings';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Public GET: Fetches current store shipping configuration for cart & checkout
 */
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
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
