import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side admin secret from environment or default secure fallback
const SERVER_ADMIN_PIN = process.env.ADMIN_PIN || 'inveins2025';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'inveins-super-secret-key-32-chars-minimum-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const pinBuffer = Buffer.from(pin.trim());
    const expectedBuffer = Buffer.from(SERVER_ADMIN_PIN.trim());

    if (pinBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(pinBuffer, expectedBuffer)) {
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    // Generate signed HMAC session token
    const timestamp = Date.now();
    const payload = `admin_session_${timestamp}`;
    const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const sessionToken = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
    });

    // Set secure HttpOnly cookie (cannot be read by client-side JavaScript or XSS scripts!)
    response.cookies.set('inveins_admin_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error processing authentication' }, { status: 500 });
  }
}
