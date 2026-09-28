import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpayWebhookSignature, decrementOrderStock } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Razorpay Webhook Handler
 * Enterprise server-to-server webhook endpoint for payment event processing.
 * Does not require customer JWT authentication; authenticated via Razorpay HMAC signature.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    // 1. Read Raw Body for HMAC-SHA256 signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      logSecurityEvent({
        event: 'WEBHOOK_MISSING_SIGNATURE',
        severity: 'WARNING',
        ip,
        endpoint: '/api/payment/webhook',
      });
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[WEBHOOK CONFIG WARNING] RAZORPAY_WEBHOOK_SECRET is not configured in environment.');
      // If secret not configured in local development, block in production or log warning
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Webhook service not configured' }, { status: 503 });
      }
    }

    // 2. Cryptographic Webhook Signature Verification
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid && process.env.NODE_ENV === 'production') {
      logSecurityEvent({
        event: 'INVALID_WEBHOOK_SIGNATURE',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/webhook',
      });
      return NextResponse.json({ error: 'Invalid webhook cryptographic signature' }, { status: 400 });
    }

    // 3. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventType = event?.event;

    // 4. Handle "payment.captured" Event
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 });
      }

      const paymentId = payment.id;
      const rzpOrderId = payment.order_id;
      const appOrderId = payment.notes?.order_id;
      const paidAmountPaise = payment.amount;

      // Locate corresponding order in database
      let order = null;
      if (appOrderId) {
        const { data } = await supabaseAdmin
          .from('inveins_orders')
          .select('*')
          .eq('id', appOrderId)
          .maybeSingle();
        order = data;
      }

      if (!order && rzpOrderId) {
        try {
          const { data } = await supabaseAdmin
            .from('inveins_orders')
            .select('*')
            .eq('razorpay_order_id', rzpOrderId)
            .maybeSingle();
          order = data;
        } catch {
          // If razorpay_order_id column is not yet queried
        }
      }

      if (!order) {
        console.warn(`[WEBHOOK WARNING] Order not found for Razorpay order: ${rzpOrderId}, appOrder: ${appOrderId}`);
        // Return 200 so Razorpay does not endlessly retry orphaned event
        return NextResponse.json({ status: 'ok', warning: 'Order not found in database' }, { status: 200 });
      }

      // Validate payment amount against order grand total
      const expectedPaise = Math.round(Number(order.grand_total) * 100);
      if (paidAmountPaise !== expectedPaise) {
        logSecurityEvent({
          event: 'WEBHOOK_AMOUNT_MISMATCH',
          severity: 'CRITICAL',
          ip,
          endpoint: '/api/payment/webhook',
          metadata: { orderId: order.id, expectedPaise, receivedPaise: paidAmountPaise },
        });
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
      }

      // Idempotency: If already confirmed, acknowledge receipt without duplicate processing
      if (order.status === 'Confirmed') {
        return NextResponse.json({ status: 'ok', message: 'Order already confirmed previously' }, { status: 200 });
      }

      // Update order status to Confirmed with defensive column fallback
      const nowIso = new Date().toISOString();
      const storedCustomer = typeof order.customer === 'string'
        ? JSON.parse(order.customer)
        : (order.customer || {});

      let { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('inveins_orders')
        .update({
          status: 'Confirmed',
          payment_id: paymentId,
          razorpay_order_id: rzpOrderId,
          updated_at: nowIso,
        })
        .eq('id', order.id)
        .select()
        .maybeSingle();

      if (updateError && updateError.code === '42703') {
        const fallbackCustomer = {
          ...storedCustomer,
          payment_id: paymentId,
          razorpay_order_id: rzpOrderId,
          webhook_verified_at: nowIso,
        };

        const fallbackResult = await supabaseAdmin
          .from('inveins_orders')
          .update({
            status: 'Confirmed',
            customer: fallbackCustomer,
          })
          .eq('id', order.id)
          .select()
          .maybeSingle();

        updatedOrder = fallbackResult.data;
        updateError = fallbackResult.error;
      }

      if (!updateError) {
        logSecurityEvent({
          event: 'WEBHOOK_PAYMENT_CAPTURED_SUCCESS',
          severity: 'INFO',
          ip,
          endpoint: '/api/payment/webhook',
          metadata: { orderId: order.id, paymentId, rzpOrderId },
        });

        // Atomically decrement stock
        await decrementOrderStock(order.items);
      } else {
        console.error('[WEBHOOK ERROR] Failed to update order status in DB:', updateError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      return NextResponse.json({ status: 'ok', message: 'Order payment captured and confirmed' }, { status: 200 });
    }

    // 5. Handle "payment.failed" Event
    if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      const appOrderId = payment?.notes?.order_id;
      const rzpOrderId = payment?.order_id;
      const errorDesc = payment?.error_description || 'Transaction declined by bank';

      if (appOrderId) {
        const { data: order } = await supabaseAdmin
          .from('inveins_orders')
          .select('*')
          .eq('id', appOrderId)
          .maybeSingle();

        // Only mark failed if still in Pending state (never overwrite a Confirmed order)
        if (order && order.status === 'Pending') {
          const storedCustomer = typeof order.customer === 'string'
            ? JSON.parse(order.customer)
            : (order.customer || {});

          const updatedCustomer = {
            ...storedCustomer,
            payment_error: errorDesc,
            failed_at: new Date().toISOString(),
          };

          await supabaseAdmin
            .from('inveins_orders')
            .update({
              status: 'Failed',
              customer: updatedCustomer,
            })
            .eq('id', order.id);

          logSecurityEvent({
            event: 'WEBHOOK_PAYMENT_FAILED',
            severity: 'WARNING',
            ip,
            endpoint: '/api/payment/webhook',
            metadata: { orderId: order.id, rzpOrderId, errorDesc },
          });
        }
      }

      return NextResponse.json({ status: 'ok', message: 'Payment failure recorded' }, { status: 200 });
    }

    // Acknowledge other webhook event types (refunds, disputes, etc.)
    return NextResponse.json({ status: 'ok', message: `Event ${eventType} received` }, { status: 200 });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
