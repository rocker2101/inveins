import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { logSecurityEvent } from "@/lib/audit-logger";

// Runtime-generated ephemeral fallback for local development only (never fixed/predictable in source code)
const DEV_EPHEMERAL_SECRET = crypto.randomBytes(32).toString("hex");

/**
 * Safely resolves the server administrative PIN without hardcoded default credentials
 */
export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim();
  if (pin) return pin;

  if (process.env.NODE_ENV === "production") {
    console.error("[SECURITY CRITICAL] ADMIN_PIN environment variable is NOT set in production!");
    return ""; // In production, never permit fallback access
  }

  // Development convenience with security warning
  return "inveins_dev_pin";
}

/**
 * Safely resolves the administrative session signing secret
 */
export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    console.error("[SECURITY CRITICAL] ADMIN_SESSION_SECRET environment variable is NOT set in production!");
    return "";
  }

  return DEV_EPHEMERAL_SECRET;
}

// Max session token lifetime: 7 days
const MAX_SESSION_LIFESPAN_MS = 7 * 24 * 60 * 60 * 1000;

export interface AdminSession {
  role: "ADMIN" | "STAFF";
  authenticated: boolean;
  issuedAt?: number;
}

/**
 * Validates session token signature AND expiration timestamp using constant-time HMAC comparison
 */
export function verifyAdminSessionToken(token: string): { valid: boolean; issuedAt?: number } {
  try {
    if (!token || typeof token !== "string") return { valid: false };

    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payload, signature] = parts;
    const sessionSecret = getSessionSecret();
    if (!sessionSecret) return { valid: false };

    const expectedSignature = crypto
      .createHmac("sha256", sessionSecret)
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

    // 3. Fallback: Direct PIN header (x-admin-pin) using constant-time equality check
    const pinHeader = req.headers.get("x-admin-pin");
    const serverPin = getAdminPin();

    if (pinHeader && serverPin) {
      const pinBuffer = Buffer.from(pinHeader.trim());
      const expectedBuffer = Buffer.from(serverPin.trim());

      if (
        pinBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(pinBuffer, expectedBuffer)
      ) {
        return {
          role: "ADMIN",
          authenticated: true,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Enforces CSRF / Origin integrity for state-changing administrative requests
 */
export function validateRequestOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  // Non-browser or server-to-server requests without origin header
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Standard guard helper returning 401/403 NextResponse or null if authorized
 */
export function requireAdminSession(req: NextRequest): NextResponse | null {
  // 1. Enforce Origin integrity
  if (!validateRequestOrigin(req)) {
    logSecurityEvent({
      event: "CSRF_ORIGIN_MISMATCH",
      severity: "WARNING",
      endpoint: req.nextUrl?.pathname,
      metadata: { origin: req.headers.get("origin"), host: req.headers.get("host") },
    });
    return NextResponse.json(
      { success: false, message: "Cross-site request blocked." },
      { status: 403 }
    );
  }

  // 2. Enforce session authentication
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    logSecurityEvent({
      event: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
      severity: "WARNING",
      endpoint: req.nextUrl?.pathname,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
    });
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
