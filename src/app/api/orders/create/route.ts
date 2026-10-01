import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PRODUCTS } from '@/data/products';
import { sanitizeString, isValidEmail, isValidPhone, isValidPincode, normalizePhone } from '@/lib/sanitize';
import { supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';
import { createCashfreeOrder, isCashfreeConfigured } from '@/lib/cashfree';

export const dynamic = 'force-dynamic';

function getOrderSigningSecret(): string {
  const secret = process.env.ORDER_SIGNING_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ORDER_SIGNING_SECRET is required in production environment.');
  }
  return 'inveins_dev_order_secret_ephemeral';
}
const VALID_COUPONS: Record<string, number> = {
  FIRST10: 10,
  INVEINS15: 15,
  HEAVY20: 20,
};
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

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
    if (customer && !customer.city && customer.address) {
      const addrParts = customer.address.split(',').map((s: string) => s.trim()).filter(Boolean);
      customer.city = addrParts.length > 1 ? addrParts[addrParts.length - 1] : 'Kanpur';
    }

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
    const { data: dbProducts } = await supabaseAdmin.from('inveins_products').select('*');
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
      .createHmac('sha256', getOrderSigningSecret())
      .update(verificationPayload)
      .digest('hex');

    // Payment method & initial status: COD is Confirmed, online methods start as Pending
    const selectedMethod = (paymentMethod === 'cod' || paymentMethod === 'whatsapp') ? paymentMethod : 'upi';
    const initialStatus = selectedMethod === 'cod' ? 'Confirmed' : 'Pending';

    // 5b. For Online Payments (UPI / Card): Create Authoritative Cashfree Order
    let cashfreeData = null;

    if (selectedMethod === 'upi' || selectedMethod === 'card') {
      if (isCashfreeConfigured()) {
        try {
          const cfOrder = await createCashfreeOrder({
            orderId,
            orderAmount: grandTotal,
            customerName: sanitizedCustomer.name,
            customerPhone: sanitizedCustomer.phone,
            customerEmail: sanitizedCustomer.email,
          });

          if (cfOrder) {
            cashfreeData = {
              orderId: cfOrder.orderId,
              cfOrderId: cfOrder.cfOrderId,
              paymentSessionId: cfOrder.paymentSessionId,
              amount: cfOrder.orderAmount,
              environment: cfOrder.environment,
            };
          }
        } catch (cfErr: any) {
          console.error('[CASHFREE] Order creation failed:', cfErr?.message || cfErr);
          return NextResponse.json(
            { success: false, message: 'Payment gateway error: ' + (cfErr?.message || 'Failed to initialize payment') },
            { status: 502 }
          );
        }
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
      cashfreeOrderId: cashfreeData?.orderId,
    };

    // 6. Persist order directly into Supabase PostgreSQL database
    try {
      const orderPayload: Record<string, any> = {
        id: orderId,
        customer: {
          ...sanitizedCustomer,
          ...(cashfreeData?.orderId ? { cashfree_order_id: cashfreeData.orderId } : {}),
        },
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
      };

      const { error: dbError } = await supabaseAdmin.from('inveins_orders').insert(orderPayload);

      if (dbError) {
        console.error('Supabase DB error saving order:', dbError);
        return NextResponse.json(
          { success: false, message: 'Database service unavailable. Order could not be saved.' },
          { status: 500 }
        );
      }
    } catch (dbErr) {
      console.error('Failed to communicate with Supabase:', dbErr);
      return NextResponse.json(
        { success: false, message: 'Failed to communicate with database. Order could not be created.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order validated and created successfully.',
      order: verifiedOrder,
      cashfree: cashfreeData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error validating order.' },
      { status: 500 }
    );
  }
}
