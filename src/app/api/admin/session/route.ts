import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);

    if (!session || !session.authenticated) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      role: session.role,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
