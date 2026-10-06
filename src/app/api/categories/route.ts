import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategories } from '@/lib/category-settings';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Public GET: Fetches current homepage categories for the grid
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(
      {
        success: true,
        categories,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Authenticated POST: Updates homepage categories from Admin Control Panel
 */
export async function POST(req: NextRequest) {
  try {
    const authError = requireAdminSession(req);
    if (authError) return authError;

    const body = await req.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: "categories" must be an array.' },
        { status: 400 }
      );
    }

    const updated = await saveCategories(categories);

    return NextResponse.json({
      success: true,
      message: 'Homepage categories updated successfully.',
      categories: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update categories', error: error?.message },
      { status: 500 }
    );
  }
}
