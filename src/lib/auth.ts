import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'inveins-super-secret-key-32-chars-minimum-2026';
const SERVER_ADMIN_PIN = process.env.ADMIN_PIN || 'inveins2025';

// Max session token lifetime: 7 days
const MAX_SESSION_LIFESPAN_MS = 7 * 24 * 60 * 60 * 1000;

export interface AdminSession {
  role: "ADMIN" | "STAFF";
  authenticated: boolean;
  issuedAt?: number;
}

/**
 * Validates session token signature AND expiration timestamp
 */
export function verifyAdminSessionToken(token: string): { valid: boolean; issuedAt?: number } {
  try {
    if (!token || typeof token !== "string") return { valid: false };

    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return { valid: false };
    }

    // Parse and validate issue timestamp: admin_session_<timestamp>
    const match = payload.match(/^admin_session_(\d+)$/);
    if (!match) return { valid: false };

    const issuedAt = parseInt(match[1], 10);
    const now = Date.now();

    // Reject tokens from the future (> 5 mins drift) or older than MAX_SESSION_LIFESPAN_MS
    if (issuedAt > now + 5 * 60 * 1000 || now - issuedAt > MAX_SESSION_LIFESPAN_MS) {
      return { valid: false };
    }

    return { valid: true, issuedAt };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates session token or authorization from the incoming NextRequest.
 */
export function getSessionFromRequest(req: NextRequest): AdminSession | null {
  try {
    // 1. Check for signed HttpOnly cookie
    const cookieToken = req.cookies.get("inveins_admin_token")?.value;
    if (cookieToken) {
      const result = verifyAdminSessionToken(cookieToken);
      if (result.valid) {
        return {
          role: "ADMIN",
          authenticated: true,
          issuedAt: result.issuedAt,
        };
      }
    }

    // 2. Fallback: Authorization header (Bearer token)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7).trim();
      const result = verifyAdminSessionToken(bearerToken);
      if (result.valid) {
        return {
          role: "ADMIN",
          authenticated: true,
          issuedAt: result.issuedAt,
        };
      }
    }

    // 3. Fallback: Direct PIN header (x-admin-pin)
    const pinHeader = req.headers.get("x-admin-pin");
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

/**
 * Standard guard helper returning 401/403 NextResponse or null if authorized
 */
export function requireAdminSession(req: NextRequest): NextResponse | null {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Admin authentication required." },
      { status: 401 }
    );
  }
  return null;
}

export function verifyAdminSession(token: string): boolean {
  return verifyAdminSessionToken(token).valid;
}
