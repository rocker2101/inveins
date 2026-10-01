import crypto from 'crypto';

/**
 * Server-Side Cashfree Payments Integration (API Version 2023-08-01)
 * High-performance, cryptographically secure payment gateway driver.
 */

function cleanEnv(val?: string): string {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
}

export function isCashfreeConfigured(): boolean {
  const appId = cleanEnv(process.env.CASHFREE_APP_ID);
  const secretKey = cleanEnv(process.env.CASHFREE_SECRET_KEY);
  return Boolean(
    appId &&
    secretKey &&
    !appId.includes('<') &&
    !secretKey.includes('<') &&
    !appId.includes('TEST_APP_ID_HERE')
  );
}

export function getCashfreeEnvironment(): 'sandbox' | 'production' {
  const env = cleanEnv(process.env.CASHFREE_ENVIRONMENT || process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT).toLowerCase();
  return env === 'production' || env === 'prod' ? 'production' : 'sandbox';
}

export function getCashfreeBaseUrl(): string {
  return getCashfreeEnvironment() === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

export interface CreateCashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface CashfreeOrderResponse {
  cfOrderId: string;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
  orderAmount: number;
  environment: 'sandbox' | 'production';
}

/**
 * Creates an authoritative payment order on Cashfree PG
 */
export async function createCashfreeOrder(
  params: CreateCashfreeOrderParams
): Promise<CashfreeOrderResponse | null> {
  const appId = cleanEnv(process.env.CASHFREE_APP_ID);
  const secretKey = cleanEnv(process.env.CASHFREE_SECRET_KEY);
  const apiVersion = cleanEnv(process.env.CASHFREE_API_VERSION) || '2023-08-01';

  if (!isCashfreeConfigured()) {
    console.warn('[CASHFREE] Missing or unconfigured Cashfree credentials.');
    return null;
  }

  const baseUrl = getCashfreeBaseUrl();
  const cleanPhone = params.customerPhone.replace(/\D/g, '').slice(-10) || '9999999999';
  const cleanEmail = params.customerEmail && params.customerEmail.includes('@')
    ? params.customerEmail.trim()
    : 'care@inveins.in';

  const defaultAppUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || 'https://www.inveins.in';
  const returnUrl = params.returnUrl || `${defaultAppUrl}/checkout?cf_id={order_id}`;
  const notifyUrl = params.notifyUrl || `${defaultAppUrl}/api/payment/cashfree-webhook`;

  const payload = {
    order_id: params.orderId,
    order_amount: Math.round(params.orderAmount * 100) / 100,
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${cleanPhone}`,
      customer_name: params.customerName.slice(0, 100) || 'Customer',
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl,
      payment_methods: 'cc,dc,upi,nb,app',
    },
    order_note: `INVEINS Order #${params.orderId}`,
  };

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': apiVersion,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    console.error('[CASHFREE] Order creation failed:', errorBody || response.statusText);
    throw new Error(errorBody?.message || errorBody?.error || 'Failed to create Cashfree order');
  }

  const data = await response.json();
  return {
    cfOrderId: String(data.cf_order_id),
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
    orderStatus: data.order_status,
    orderAmount: data.order_amount,
    environment: getCashfreeEnvironment(),
  };
}

/**
 * Fetches order details directly from Cashfree PG for authoritative validation
 */
export async function fetchCashfreeOrder(orderId: string): Promise<any | null> {
  const appId = cleanEnv(process.env.CASHFREE_APP_ID);
  const secretKey = cleanEnv(process.env.CASHFREE_SECRET_KEY);
  const apiVersion = cleanEnv(process.env.CASHFREE_API_VERSION) || '2023-08-01';

  if (!appId || !secretKey) return null;

  const baseUrl = getCashfreeBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': apiVersion,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[CASHFREE] Fetch order failed (${res.status}):`, await res.text());
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[CASHFREE] Error fetching order:', err);
    return null;
  }
}

/**
 * Cashfree Webhook Signature Verification
 * Cashfree signs webhooks with HMAC-SHA256 of `${timestamp}${rawBody}` using client secret.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string = process.env.CASHFREE_SECRET_KEY || ''
): boolean {
  const cleanSec = cleanEnv(secret);
  if (!rawBody || !signature || !timestamp || !cleanSec) {
    return false;
  }

  try {
    const dataToSign = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', cleanSec)
      .update(dataToSign)
      .digest('base64');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature.trim());

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    console.error('[CASHFREE] Signature verification error:', error);
    return false;
  }
}
