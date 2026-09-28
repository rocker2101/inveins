import crypto from 'crypto';

/**
 * Enterprise Cryptographic Signature Verification for Payment Gateways
 * Protects against payment spoofing, fake payment callbacks, and transaction tampering.
 */

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('<') &&
    !keySecret.includes('<') &&
    keyId.startsWith('rzp_')
  );
}

/**
 * Creates a server-side order with Razorpay's API
 */
export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string,
  notes: Record<string, string> = {}
): Promise<{ id: string; amount: number; currency: string; keyId: string } | null> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || !isRazorpayConfigured()) {
    console.warn("Razorpay credentials not fully configured in environment.");
    return null;
  }

  const auth = Buffer.from(`${keyId.trim()}:${keySecret.trim()}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: Math.round(amountInPaise),
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Razorpay order creation error:", errorData);
    throw new Error(errorData?.error?.description || "Failed to create Razorpay payment order");
  }

  const data = await response.json();
  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId,
  };
}

// Razorpay HMAC-SHA256 Signature Verification
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = process.env.RAZORPAY_KEY_SECRET || ''
): boolean {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret.trim())
      .update(`${orderId.trim()}|${paymentId.trim()}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature.trim());

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * Razorpay Webhook HMAC-SHA256 Signature Verification
 * Verifies that the incoming webhook originated directly from Razorpay's servers.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET || ''
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret.trim())
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature.trim());

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * Fetches Razorpay Order details directly from Razorpay API for authoritative cross-verification
 */
export async function fetchRazorpayOrder(
  razorpayOrderId: string
): Promise<{ id: string; amount: number; status: string; notes?: Record<string, string> } | null> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  const auth = Buffer.from(`${keyId.trim()}:${keySecret.trim()}`).toString('base64');
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching Razorpay order from API:', err);
    return null;
  }
}

/**
 * Atomically decrements catalog inventory for an order's items
 * Uses Supabase RPC procedure if available, falling back to direct safe query
 */
export async function decrementOrderStock(items: any): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const rawItems = typeof items === 'string' ? JSON.parse(items) : items;
    if (!Array.isArray(rawItems)) return;

    for (const item of rawItems) {
      const prodId = item?.product?.id;
      const qty = Math.max(1, Number(item?.quantity) || 1);
      if (!prodId) continue;

      // 1. Try atomic database RPC function with row lock
      const { error: rpcError } = await supabaseAdmin.rpc('decrement_product_stock', {
        product_id: prodId,
        qty,
      });

      // 2. Fallback to direct decrement if RPC is not deployed in Supabase
      if (rpcError) {
        const { data: currentProd } = await supabaseAdmin
          .from('inveins_products')
          .select('available_stock')
          .eq('id', prodId)
          .single();

        if (currentProd) {
          const currentStock = Number(currentProd.available_stock) || 0;
          const newStock = Math.max(0, currentStock - qty);
          await supabaseAdmin
            .from('inveins_products')
            .update({
              available_stock: newStock,
              badge: newStock <= 0 ? 'SOLD OUT' : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', prodId);
        }
      }
    }
  } catch (stockErr) {
    console.warn('[STOCK DECREMENT NOTICE]', stockErr);
  }
}



// Verify Order Verification Token issued by /api/orders/create
export function verifyOrderToken(
  orderId: string,
  grandTotal: number,
  customerPhone: string,
  createdAt: string,
  token: string,
  secret: string = process.env.ORDER_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'inveins_dev_order_secret_ephemeral')
): boolean {
  if (!secret) return false;
  try {
    const payload = `${orderId}|${grandTotal}|${customerPhone}|${createdAt}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expectedBuffer = Buffer.from(expected);
    const tokenBuffer = Buffer.from(token);

    if (expectedBuffer.length !== tokenBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, tokenBuffer);
  } catch (e) {
    return false;
  }
}
