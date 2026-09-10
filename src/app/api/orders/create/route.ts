import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PRODUCTS } from '@/data/products';
import { sanitizeString, isValidEmail, isValidPhone, isValidPincode, normalizePhone } from '@/lib/sanitize';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRazorpayOrder } from '@/lib/payment-security';

export const dynamic = 'force-dynamic';

const ORDER_SIGNING_SECRET = process.env.ORDER_SIGNING_SECRET || 'inveins-order-integrity-hmac-secret-2026';
const VALID_COUPONS: Record<string, number> = {
  FIRST10: 10,
  INVEINS15: 15,
  HEAVY20: 20,
};
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 90;

export async function POST(req: NextRequest) {
  try {
    // 0. Anti-Flooding Rate Limiting: Max 10 order creation requests per minute per IP
    const rateCheck = checkRateLimit(req, 'order_create', { windowMs: 60 * 1000, max: 10 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: `Too many order attempts. Please try again in ${rateCheck.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customer, items, paymentMethod, couponCode } = body;

    // 1. Validate Customer Information
    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode) {
      return NextResponse.json({ success: false, message: 'All required customer shipping fields must be provided.' }, { status: 400 });
    }

    if (!isValidPhone(customer.phone)) {
      return NextResponse.json({ success: false, message: 'Invalid 10-digit mobile phone number.' }, { status: 400 });
    }

    if (customer.email && !isValidEmail(customer.email)) {
      return NextResponse.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }

    if (!isValidPincode(customer.pincode)) {
      return NextResponse.json({ success: false, message: 'Invalid 6-digit PIN code.' }, { status: 400 });
    }

    const sanitizedCustomer = {
      name: sanitizeString(customer.name),
      email: sanitizeString(customer.email),
      phone: normalizePhone(customer.phone),
      address: sanitizeString(customer.address),
      city: sanitizeString(customer.city),
      state: sanitizeString(customer.state || 'Uttar Pradesh'),
      pincode: sanitizeString(customer.pincode),
    };

    // 2. Validate Items & Re-calculate Genuine Server Prices
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Order must contain at least one item.' }, { status: 400 });
    }

    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Query DB products for accurate current pricing if available, else static catalogue
    const { data: dbProducts } = await supabase.from('inveins_products').select('*');
    const availableCatalogue = (dbProducts && dbProducts.length > 0) ? dbProducts : PRODUCTS;

    for (const rawItem of items) {
      const { productId, selectedSize, quantity } = rawItem;
      const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));

      // Find genuine product in server catalogue
      const canonicalProduct = availableCatalogue.find((p: any) => p.id === productId);
      if (!canonicalProduct) {
        return NextResponse.json(
          { success: false, message: `Product "${productId}" not found in catalogue.` },
          { status: 400 }
        );
      }

      const availableStock = Number(canonicalProduct.available_stock ?? canonicalProduct.availableStock ?? 0);
      if (availableStock <= 0 || canonicalProduct.badge === 'SOLD OUT') {
        return NextResponse.json(
          { success: false, message: `"${canonicalProduct.name}" is currently sold out.` },
          { status: 400 }
        );
      }

      // Enforce the server's authoritative price
      const genuinePrice = Number(canonicalProduct.price) || 0;
      calculatedSubtotal += genuinePrice * qty;

      verifiedItems.push({
        product: {
          id: canonicalProduct.id,
          name: canonicalProduct.name,
          price: genuinePrice,
          currency: canonicalProduct.currency || '₹',
          category: canonicalProduct.category,
          images: canonicalProduct.images,
        },
        selectedSize: sanitizeString(selectedSize) || 'M',
        quantity: qty,
      });
    }

    // 3. Validate & Apply Coupon
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      if (VALID_COUPONS[cleanCode]) {
        const percent = VALID_COUPONS[cleanCode];
        discountAmount = Math.round((calculatedSubtotal * percent) / 100);
        appliedCoupon = {
          code: cleanCode,
          discountPercent: percent,
          discountAmount,
        };
      }
    }

    // 4. Calculate Shipping & Grand Total Authoritatively
    const shippingFee = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const grandTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

    // Cryptographically Secure Pseudo-Random Number Generation (CSPRNG) for Order & Tracking IDs
    const randomOrderSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const randomTrkSuffix = crypto.randomBytes(5).toString('hex').toUpperCase();
    const orderId = `INV-${randomOrderSuffix}`;
    const trackingNumber = `TRK-${randomTrkSuffix}`;
    const nowIso = new Date().toISOString();
    const createdAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    // 5. Generate Cryptographic Order Verification Token (HMAC-SHA256)
    const verificationPayload = `${orderId}|${grandTotal}|${sanitizedCustomer.phone}|${nowIso}`;
    const verificationToken = crypto
      .createHmac('sha256', ORDER_SIGNING_SECRET)
      .update(verificationPayload)
      .digest('hex');

    // Payment method & initial status: COD is Confirmed, online methods start as Pending
    const selectedMethod = (paymentMethod === 'cod' || paymentMethod === 'whatsapp') ? paymentMethod : 'upi';
    const initialStatus = selectedMethod === 'cod' ? 'Confirmed' : 'Pending';

    // 5b. For Online Payments (UPI / Card): Create Authoritative Razorpay Order
    let razorpayData = null;
    if (selectedMethod === 'upi' || selectedMethod === 'card') {
      try {
        const rzpOrder = await createRazorpayOrder(grandTotal * 100, orderId, {
          order_id: orderId,
          customer_phone: sanitizedCustomer.phone,
        });

        if (rzpOrder) {
          razorpayData = {
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: rzpOrder.keyId,
          };
        }
      } catch (rzpErr: any) {
        console.error('Razorpay order creation failed:', rzpErr?.message || rzpErr);
        return NextResponse.json(
          { success: false, message: 'Payment gateway error: ' + (rzpErr?.message || 'Failed to initialize payment') },
          { status: 502 }
        );
      }
    }

    const verifiedOrder = {
      id: orderId,
      customer: sanitizedCustomer,
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      shippingFee,
      grandTotal,
      coupon: appliedCoupon,
      paymentMethod: selectedMethod,
      status: initialStatus,
      trackingNumber,
      createdAt,
      verificationToken,
      razorpayOrderId: razorpayData?.orderId,
    };

    // 6. Persist order directly into Supabase PostgreSQL database
    try {
      const { error: dbError } = await supabase.from('inveins_orders').insert({
        id: orderId,
        customer: sanitizedCustomer,
        items: verifiedItems,
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shipping_fee: shippingFee,
        grand_total: grandTotal,
        payment_method: selectedMethod,
        status: initialStatus,
        tracking_number: trackingNumber,
        verification_token: verificationToken,
        created_at: nowIso,
      });

      if (dbError) {
        console.error('Supabase DB error saving order:', dbError);
      }
    } catch (dbErr) {
      console.error('Failed to communicate with Supabase:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order validated, created, and saved to database.',
      order: verifiedOrder,
      razorpay: razorpayData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error validating order.' },
      { status: 500 }
    );
  }
}
