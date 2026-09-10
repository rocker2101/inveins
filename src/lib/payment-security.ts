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

// Verify Order Verification Token issued by /api/orders/create
export function verifyOrderToken(
  orderId: string,
  grandTotal: number,
  customerPhone: string,
  createdAt: string,
  token: string,
  secret: string = process.env.ORDER_SIGNING_SECRET || 'inveins-order-integrity-hmac-secret-2026'
): boolean {
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
