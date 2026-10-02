import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface WindowRecord {
  count: number;
  resetTime: number;
}

// Memory safety cap
const MAX_TRACKER_KEYS = 10000;
const tracker = new Map<string, WindowRecord>();

// Cleanup stale entries every 3 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    tracker.forEach((value, key) => {
      if (now > value.resetTime) {
        tracker.delete(key);
      }
    });
  }, 3 * 60 * 1000);
}

/**
 * Extracts and sanitizes client IP address from Next.js request headers
 * Prioritizes trusted edge headers (Vercel, Cloudflare) before fallback
 */
export function getClientIp(req: NextRequest): string {
  // 1. Trust edge provider headers first (cannot be spoofed by client)
  const edgeIp = req.headers.get("x-vercel-ip") || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
  if (edgeIp && edgeIp.trim()) {
    const clean = edgeIp.trim().replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
    return clean.slice(0, 45);
  }

  // 2. Fall back to x-forwarded-for
  const forwarded = req.headers.get("x-forwarded-for");
  let rawIp = "127.0.0.1";

  if (forwarded) {
    rawIp = forwarded.split(",")[0].trim();
  }

  // Strip port numbers if present (e.g. 192.168.1.1:54321 -> 192.168.1.1)
  const cleanIp = rawIp.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  return cleanIp.slice(0, 45); // Max length for IPv6 string representation
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

  // Prevent memory exhaustion with safe expired/LRU pruning (NEVER wipe entire map for all users)
  if (tracker.size > MAX_TRACKER_KEYS) {
    tracker.forEach((v, k) => {
      if (now > v.resetTime) {
        tracker.delete(k);
      }
    });
    if (tracker.size > MAX_TRACKER_KEYS) {
      let evicted = 0;
      const targetEvictions = Math.floor(MAX_TRACKER_KEYS * 0.15);
      tracker.forEach((_, k) => {
        if (evicted < targetEvictions) {
          tracker.delete(k);
          evicted++;
        }
      });
    }
  }

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
