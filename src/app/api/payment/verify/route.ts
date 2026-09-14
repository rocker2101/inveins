import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/payment-security';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeString } from '@/lib/sanitize';
import { logSecurityEvent } from '@/lib/audit-logger';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required Razorpay payment credentials.' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      logSecurityEvent({
        event: 'FORGED_PAYMENT_SIGNATURE_ATTEMPT',
        severity: 'CRITICAL',
        ip,
        endpoint: '/api/payment/verify',
        metadata: { razorpay_order_id, razorpay_payment_id, order_id },
      });

      return NextResponse.json(
        { success: false, message: 'Invalid or forged payment signature detected. Transaction rejected.' },
        { status: 400 }
      );
    }

    let confirmedOrder = null;

    // 2. Update order in Supabase to Confirmed using privileged service-role
    if (order_id) {
      const cleanOrderId = sanitizeString(order_id);
      const cleanPaymentId = sanitizeString(razorpay_payment_id);

      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('inveins_orders')
        .update({
          status: 'Confirmed',
          payment_id: cleanPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanOrderId)
        .select()
        .single();

      if (!updateError && updatedOrder) {
        confirmedOrder = updatedOrder;

        logSecurityEvent({
          event: 'PAYMENT_VERIFIED_SUCCESS',
          severity: 'INFO',
          ip,
          endpoint: '/api/payment/verify',
          metadata: { orderId: cleanOrderId, paymentId: cleanPaymentId },
        });

        // 3. Atomically decrement stock for purchased items
        try {
          const rawItems = typeof updatedOrder.items === 'string'
            ? JSON.parse(updatedOrder.items)
            : updatedOrder.items;

          if (Array.isArray(rawItems)) {
            for (const item of rawItems) {
              const prodId = item?.product?.id;
              const qty = Number(item?.quantity) || 1;
              if (prodId) {
                // Try calling atomic RPC function if present, otherwise direct update
                const { error: rpcError } = await supabaseAdmin.rpc('decrement_product_stock', {
                  product_id: prodId,
                  qty,
                });

                if (rpcError) {
                  // Fallback to direct decrement query
                  const { data: currentProd } = await supabaseAdmin
                    .from('inveins_products')
                    .select('available_stock')
                    .eq('id', prodId)
                    .single();

                  if (currentProd) {
                    const newStock = Math.max(0, (Number(currentProd.available_stock) || 0) - qty);
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
            }
          }
        } catch (stockErr) {
          console.warn('Stock decrement notice:', stockErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cryptographically verified and order confirmed.',
      paymentId: razorpay_payment_id,
      order: confirmedOrder,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error verifying payment signature.' },
      { status: 500 }
    );
  }
}
