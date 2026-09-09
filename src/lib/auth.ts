import { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'inveins-super-secret-key-32-chars-minimum-2026';
const SERVER_ADMIN_PIN = process.env.ADMIN_PIN || 'inveins2025';

export interface AdminSession {
  role: "ADMIN" | "STAFF";
  authenticated: boolean;
  userId?: string;
}

/**
 * Validates session token or authorization from the incoming NextRequest.
 */
export function getSessionFromRequest(req: NextRequest): AdminSession | null {
  try {
    // 1. Check for signed HttpOnly cookie
    const token = req.cookies.get('inveins_admin_token')?.value;
    if (token) {
      const parts = token.split('.');
      if (parts.length === 2) {
        const [payload, signature] = parts;
        const expectedSignature = crypto
          .createHmac('sha256', SESSION_SECRET)
          .update(payload)
          .digest('hex');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (
          sigBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
          return {
            role: "ADMIN",
            authenticated: true,
          };
        }
      }
    }

    // 2. Fallback: Authorization header (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const parts = bearerToken.split('.');
      if (parts.length === 2) {
        const [payload, signature] = parts;
        const expectedSignature = crypto
          .createHmac('sha256', SESSION_SECRET)
          .update(payload)
          .digest('hex');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (
          sigBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
          return {
            role: "ADMIN",
            authenticated: true,
          };
        }
      }
    }

    // 3. Fallback: Direct PIN header (x-admin-pin)
    const pinHeader = req.headers.get('x-admin-pin');
    if (pinHeader && pinHeader.trim() === SERVER_ADMIN_PIN.trim()) {
      return {
        role: "ADMIN",
        authenticated: true,
      };
    }

    return null;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export function verifyAdminSession(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    return (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    );
  } catch {
    return false;
  }
}
