import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'inveins-super-secret-key-32-chars-minimum-2026';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('inveins_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return NextResponse.json({ authenticated: false });
    }

    const [payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
