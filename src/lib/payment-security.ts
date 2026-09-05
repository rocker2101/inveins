import crypto from 'crypto';

/**
 * Enterprise Cryptographic Signature Verification for Payment Gateways
 * Protects against payment spoofing, fake payment callbacks, and transaction tampering.
 */

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
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);

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
