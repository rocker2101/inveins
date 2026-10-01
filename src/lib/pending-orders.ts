import crypto from 'crypto';
import { getOrderSigningSecret } from '@/lib/payment-security';

export interface PendingOrderPayload {
  id: string;
  customer: Record<string, any>;
  items: Array<any>;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  grand_total: number;
  payment_method: string;
  status: string;
  tracking_number: string;
  verification_token: string;
  created_at: string;
}

// In-memory cache for fast lookup during same-process callbacks / webhooks
const pendingOrdersCache = new Map<string, { payload: PendingOrderPayload; expiresAt: number }>();

// Clean up expired entries every 15 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    pendingOrdersCache.forEach((item, id) => {
      if (item.expiresAt < now) {
        pendingOrdersCache.delete(id);
      }
    });
  }, 15 * 60 * 1000);
}

/**
 * Stores pending order in memory cache (valid for 2 hours)
 */
export function setPendingOrder(orderId: string, payload: PendingOrderPayload): void {
  pendingOrdersCache.set(orderId, {
    payload,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
  });
}

/**
 * Retrieves pending order from memory cache if available
 */
export function getPendingOrder(orderId: string): PendingOrderPayload | null {
  const item = pendingOrdersCache.get(orderId);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    pendingOrdersCache.delete(orderId);
    return null;
  }
  return item.payload;
}

/**
 * Generates a tamper-proof cryptographic token representing the uncommitted order
 */
export function signOrderToken(payload: PendingOrderPayload): string {
  const secret = getOrderSigningSecret();
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Data).digest('hex');
  return `${base64Data}.${signature}`;
}

/**
 * Cryptographically verifies and extracts the order payload from an order token
 */
export function verifyOrderToken(token: string): PendingOrderPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [base64Data, signature] = parts;
    const secret = getOrderSigningSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(base64Data).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (err) {
    console.error('Order token verification failed:', err);
    return null;
  }
}
