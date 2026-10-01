import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature, isCashfreeConfigured } from '@/lib/cashfree';
import { decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // 1. Signature Verification
    if (isCashfreeConfigured()) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        logSecurityEvent({
          event: 'FORGED_CASHFREE_WEBHOOK_SIGNATURE',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/cashfree-webhook',
          metadata: { timestamp, signature },
        });

        return NextResponse.json(
          { success: false, message: 'Invalid Cashfree webhook signature' },
          { status: 401 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order || {};
    const paymentData = payload.data?.payment || payload.payment || {};
    const orderId = sanitizeString(orderData.order_id || payload.orderId || '');

    if (!orderId) {
      return NextResponse.json({ success: true, message: 'No order ID in webhook payload' });
    }

    // Process PAYMENT_SUCCESS_WEBHOOK or ORDER_PAID
    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'ORDER_PAID' || paymentData.payment_status === 'SUCCESS') {
      const { data: existingOrder } = await supabaseAdmin
        .from('inveins_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (existingOrder && existingOrder.status !== 'Confirmed') {
        const paymentId = String(paymentData.cf_payment_id || `cf_${orderId}`);
        const updatedCustomer = {
          ...(typeof existingOrder.customer === 'object' && existingOrder.customer !== null ? existingOrder.customer : {}),
          payment_id: paymentId,
          paid_at: new Date().toISOString(),
          payment_status: 'SUCCESS',
        };

        await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            payment_method: 'cashfree_upi',
            customer: updatedCustomer,
          })
          .eq('id', orderId);

        await decrementOrderStock(existingOrder.items);

        logSecurityEvent({
          event: 'CASHFREE_WEBHOOK_PAYMENT_CONFIRMED',
          severity: 'INFO',
          ip,
          endpoint: '/api/payment/cashfree-webhook',
          metadata: { orderId, paymentId },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Cashfree webhook acknowledged' });
  } catch (err: any) {
    console.error('[CASHFREE] Webhook error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error processing webhook' }, { status: 500 });
  }
}
