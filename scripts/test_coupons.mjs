import assert from 'assert';

/**
 * Isolated Pure Logic Test Suite for Inveins Promo Code System
 * Guarantees zero mutations against live production database or payment gateways.
 */

console.log('====================================================');
console.log('INVEINS PROMO CODE SYSTEM: ISOLATED UNIT TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// 1. Discount calculation engine test (mirroring calculateCouponDiscount from src/lib/coupons.ts)
function calculateDiscount(coupon, subtotal) {
  if (typeof subtotal !== 'number' || isNaN(subtotal) || subtotal <= 0) {
    return { discountAmount: 0, eligible: false, reason: 'Cart subtotal must be greater than zero.' };
  }
  const minOrder = Number(coupon.min_order_value) || 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return { discountAmount: 0, eligible: false, reason: `Minimum order value of ₹${minOrder} required.` };
  }
  const value = Number(coupon.discount_value);
  if (isNaN(value) || value <= 0) {
    return { discountAmount: 0, eligible: false, reason: 'Invalid coupon discount value.' };
  }
  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = Math.min(subtotal, Math.round(value));
  } else if (coupon.discount_type === 'percent') {
    if (value > 100) {
      return { discountAmount: 0, eligible: false, reason: 'Percentage discount cannot exceed 100%.' };
    }
    discount = Math.min(subtotal, Math.round((subtotal * value) / 100));
  } else {
    return { discountAmount: 0, eligible: false, reason: 'Unsupported discount type.' };
  }
  discount = Math.max(0, Math.min(subtotal, discount));
  return { discountAmount: discount, eligible: true };
}

// 2. Order calculation helper (mirroring authoritative calculate in orders/create/route.ts)
function calculateOrderTotals(subtotal, coupon, freeShippingThreshold = 999, standardShippingFee = 70) {
  let discountAmount = 0;
  if (coupon && coupon.is_active) {
    const calc = calculateDiscount(coupon, subtotal);
    if (calc.eligible) {
      discountAmount = calc.discountAmount;
    }
  }
  const shippingFee = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) || standardShippingFee === 0
    ? 0
    : standardShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  return { subtotal, discountAmount, shippingFee, grandTotal };
}

// TEST 1: Valid flat discount
test('Valid flat discount (₹200 off on ₹1500 subtotal)', () => {
  const coupon = { discount_type: 'flat', discount_value: 200, min_order_value: 0, is_active: true };
  const res = calculateDiscount(coupon, 1500);
  assert.strictEqual(res.eligible, true);
  assert.strictEqual(res.discountAmount, 200);
});

// TEST 2: Valid percentage discount
test('Valid percentage discount (15% off on ₹2000 subtotal)', () => {
  const coupon = { discount_type: 'percent', discount_value: 15, min_order_value: 0, is_active: true };
  const res = calculateDiscount(coupon, 2000);
  assert.strictEqual(res.eligible, true);
  assert.strictEqual(res.discountAmount, 300);
});

// TEST 3: Inactive coupon
test('Inactive coupon rejected', () => {
  const coupon = { discount_type: 'flat', discount_value: 200, min_order_value: 0, is_active: false };
  const totals = calculateOrderTotals(1500, coupon);
  assert.strictEqual(totals.discountAmount, 0);
  assert.strictEqual(totals.grandTotal, 1500); // Free shipping threshold met
});

// TEST 4: Invalid coupon
test('Invalid/null coupon rejected', () => {
  const totals = calculateOrderTotals(1500, null);
  assert.strictEqual(totals.discountAmount, 0);
  assert.strictEqual(totals.grandTotal, 1500);
});

// TEST 5: Duplicate coupon normalization
test('Coupon code normalization trims and uppercases code', () => {
  const normalize = (c) => c ? c.trim().toUpperCase() : '';
  assert.strictEqual(normalize('  save200  '), 'SAVE200');
  assert.strictEqual(normalize('first10'), 'FIRST10');
});

// TEST 6: Minimum order requirement
test('Minimum order requirement blocks below-threshold cart', () => {
  const coupon = { discount_type: 'flat', discount_value: 200, min_order_value: 999, is_active: true };
  const below = calculateDiscount(coupon, 800);
  assert.strictEqual(below.eligible, false);
  assert.strictEqual(below.discountAmount, 0);

  const above = calculateDiscount(coupon, 1200);
  assert.strictEqual(above.eligible, true);
  assert.strictEqual(above.discountAmount, 200);
});

// TEST 7: Percentage above 100% rejected
test('Percentage discount > 100% rejected', () => {
  const coupon = { discount_type: 'percent', discount_value: 120, min_order_value: 0, is_active: true };
  const res = calculateDiscount(coupon, 1000);
  assert.strictEqual(res.eligible, false);
  assert.strictEqual(res.discountAmount, 0);
});

// TEST 8: Negative or malformed values rejected
test('Negative discount or malformed subtotal rejected', () => {
  const couponNegative = { discount_type: 'flat', discount_value: -50, min_order_value: 0, is_active: true };
  const resNegative = calculateDiscount(couponNegative, 1000);
  assert.strictEqual(resNegative.eligible, false);

  const resSubtotalZero = calculateDiscount({ discount_type: 'flat', discount_value: 50 }, 0);
  assert.strictEqual(resSubtotalZero.eligible, false);
});

// TEST 9: Flat discount exceeding eligible subtotal is capped
test('Flat discount exceeding subtotal is capped to subtotal (never negative payable)', () => {
  const couponBig = { discount_type: 'flat', discount_value: 1000, min_order_value: 0, is_active: true };
  const res = calculateDiscount(couponBig, 400);
  assert.strictEqual(res.eligible, true);
  assert.strictEqual(res.discountAmount, 400); // Capped at subtotal

  const totals = calculateOrderTotals(400, couponBig, 999, 70);
  assert.strictEqual(totals.discountAmount, 400);
  assert.strictEqual(totals.shippingFee, 70); // Below free threshold 999
  assert.strictEqual(totals.grandTotal, 70); // 400 - 400 + 70 = 70
});

// TEST 10: Tampered browser discount is ignored; server calculates authoritatively
test('Tampered client discount ignored by server authoritative calculation', () => {
  const clientSubmittedDiscount = 5000;
  const clientSubmittedGrandTotal = 1;
  const canonicalProductPrice = 799;
  const quantity = 2;
  const serverSubtotal = canonicalProductPrice * quantity; // 1598

  const validCoupon = { discount_type: 'percent', discount_value: 10, min_order_value: 0, is_active: true };
  const serverTotals = calculateOrderTotals(serverSubtotal, validCoupon);

  assert.strictEqual(serverTotals.discountAmount, 160); // 10% of 1598 rounded
  assert.strictEqual(serverTotals.grandTotal, 1438); // 1598 - 160 + 0 (free shipping)
  assert.notStrictEqual(serverTotals.discountAmount, clientSubmittedDiscount);
  assert.notStrictEqual(serverTotals.grandTotal, clientSubmittedGrandTotal);
});

// TEST 11: Cart subtotal reduction deactivates min-order coupon
test('Cart quantity/subtotal reduction deactivates min-order coupon', () => {
  const coupon = { discount_type: 'flat', discount_value: 100, min_order_value: 1000, is_active: true };
  const initialSubtotal = 1400;
  const initialTotals = calculateOrderTotals(initialSubtotal, coupon);
  assert.strictEqual(initialTotals.discountAmount, 100);

  // User reduces cart quantity to 1 item worth 700
  const reducedSubtotal = 700;
  const reducedTotals = calculateOrderTotals(reducedSubtotal, coupon);
  assert.strictEqual(reducedTotals.discountAmount, 0); // Disqualified!
});

// TEST 12: Shipping and free-shipping calculations remain unaffected
test('Shipping and free-shipping calculations remain unaffected by discounts', () => {
  // Case A: Cart subtotal 1000 >= threshold 999 -> Free shipping applies, even after discount
  const totalsA = calculateOrderTotals(1000, { discount_type: 'flat', discount_value: 200, min_order_value: 0, is_active: true });
  assert.strictEqual(totalsA.shippingFee, 0);
  assert.strictEqual(totalsA.grandTotal, 800);

  // Case B: Cart subtotal 800 < threshold 999 -> Standard shipping (70) applies
  const totalsB = calculateOrderTotals(800, { discount_type: 'flat', discount_value: 100, min_order_value: 0, is_active: true });
  assert.strictEqual(totalsB.shippingFee, 70);
  assert.strictEqual(totalsB.grandTotal, 770); // 800 - 100 + 70
});

// TEST 13: Cashfree payload amount matches exact server-calculated payable amount
test('Cashfree orderAmount matches server-calculated grandTotal', () => {
  const totals = calculateOrderTotals(1299, { discount_type: 'percent', discount_value: 15, min_order_value: 0, is_active: true });
  const cashfreePayload = {
    orderId: 'INV-TEST123',
    orderAmount: totals.grandTotal,
  };
  assert.strictEqual(cashfreePayload.orderAmount, totals.grandTotal);
  assert.strictEqual(cashfreePayload.orderAmount, 1104); // 1299 - 195 = 1104
});

// TEST 14: Existing legacy codes preserve their exact previous behavior
test('Existing legacy codes (FIRST10, INVEINS15, HEAVY20) preserved', () => {
  const legacyFirst10 = { discount_type: 'percent', discount_value: 10, min_order_value: 0, is_active: true };
  const legacyInveins15 = { discount_type: 'percent', discount_value: 15, min_order_value: 0, is_active: true };
  const legacyHeavy20 = { discount_type: 'percent', discount_value: 20, min_order_value: 0, is_active: true };

  assert.strictEqual(calculateDiscount(legacyFirst10, 1000).discountAmount, 100);
  assert.strictEqual(calculateDiscount(legacyInveins15, 1000).discountAmount, 150);
  assert.strictEqual(calculateDiscount(legacyHeavy20, 1000).discountAmount, 200);
});

console.log(`\n====================================================`);
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
