import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getAdminPin, getSessionSecret } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    // Prevent brute-force password guessing: max 5 attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(req, 'admin_login', { windowMs: 15 * 60 * 1000, max: 5 });
    if (!rateCheck.allowed) {
      logSecurityEvent({
        event: 'ADMIN_LOGIN_RATE_LIMITED',
        severity: 'WARNING',
        ip,
        endpoint: '/api/admin/login',
        metadata: { resetSeconds: rateCheck.resetSeconds },
      });

      return NextResponse.json(
        { success: false, message: `Too many login attempts. Please try again in ${Math.ceil(rateCheck.resetSeconds / 60)} minutes.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
    }

    const serverAdminPin = getAdminPin();
    const sessionSecret = getSessionSecret();

    if (!serverAdminPin || !sessionSecret) {
      logSecurityEvent({
        event: 'ADMIN_LOGIN_CONFIGURATION_ERROR',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/admin/login',
      });
      return NextResponse.json({ success: false, message: 'Authentication service temporarily unavailable' }, { status: 503 });
    }

    // Timing-safe comparison to prevent side-channel timing attacks
    const pinBuffer = Buffer.from(pin.trim());
    const expectedBuffer = Buffer.from(serverAdminPin.trim());

    if (pinBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(pinBuffer, expectedBuffer)) {
      logSecurityEvent({
        event: 'ADMIN_LOGIN_FAILED',
        severity: 'WARNING',
        ip,
        endpoint: '/api/admin/login',
      });
      return NextResponse.json({ success: false, message: 'Invalid Admin Passcode' }, { status: 401 });
    }

    // Generate signed HMAC session token
    const timestamp = Date.now();
    const payload = `admin_session_${timestamp}`;
    const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('hex');
    const sessionToken = `${payload}.${signature}`;

    logSecurityEvent({
      event: 'ADMIN_LOGIN_SUCCESS',
      severity: 'INFO',
      ip,
      endpoint: '/api/admin/login',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
    });

    // Set secure HttpOnly cookie (cannot be read by client-side JavaScript or XSS scripts)
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
