import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface WindowRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding-window store
const tracker = new Map<string, WindowRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    tracker.forEach((value, key) => {
      if (now > value.resetTime) {
        tracker.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP address from Next.js request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks if a specific client has exceeded allowed request limits
 */
export function checkRateLimit(
  req: NextRequest,
  endpointKey: string,
  config: RateLimitConfig = { windowMs: 60 * 1000, max: 20 }
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const ip = getClientIp(req);
  const key = `${endpointKey}:${ip}`;
  const now = Date.now();

  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (record.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: config.max - record.count,
    resetSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}
