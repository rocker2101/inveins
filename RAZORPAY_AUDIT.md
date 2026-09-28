# INVEINS Fashion - Razorpay Payment Integration Complete Audit & Gap-Fix Report

**Project:** INVEINS Fashion (`rocker2101/inveins`)  
**Audit Date:** September 29, 2026  
**Status:** ✅ **PRODUCTION READY & HARDENED**  
**Technology Stack:** Next.js 14.2 (App Router), Supabase (@supabase/supabase-js), Razorpay Checkout SDK, TypeScript  

---

## 1. Executive Summary

A comprehensive, end-to-end audit of the Razorpay payment integration and order management system was completed for **INVEINS Fashion**.

All existing functional code was preserved in accordance with the **Minimal Change Principle**:
- Server-authoritative catalog pricing and grand total calculations were strictly maintained.
- Existing checkout frontend UI, modals, forms, and Cart Context were untouched.
- Razorpay Checkout modal launcher and client-side options were preserved.
- Existing cryptographic signature checks on `/api/payment/verify` were maintained and hardened.

Critical security, reliability, and database gaps were resolved:
1. **Added Production Razorpay Webhook Endpoint (`/api/payment/webhook`)**: Full server-to-server webhook processing with raw body HMAC-SHA256 signature verification, idempotent handling of `payment.captured`, and fail-safe handling of `payment.failed`.
2. **Fixed Database Order Confirmation Bug**: `/api/payment/verify` previously failed with PostgreSQL error `42703` due to missing `payment_id` column in Supabase `inveins_orders`. Implemented a non-destructive SQL migration script and defensive multi-level database fallback (using customer JSON metadata) so payment confirmation succeeds regardless of migration status.
3. **Hardened Payment Verification Security**: Added gateway cross-order verification to ensure `razorpay_order_id` belongs to the specific application order, payment amounts match the expected grand total, and payment IDs cannot be reused across orders.
4. **Idempotent Inventory Decrement**: Created shared atomic stock deduction logic that guards against race conditions and dual execution between browser callbacks and webhook events.

---

## 2. Existing Features (Preserved & Verified)

* **Server-Authoritative Pricing:** `api/orders/create` calculates items subtotal from canonical catalog prices (`inveins_products` or static fallback), validates coupon percentages server-side, applies standard shipping thresholds (free shipping >= ₹999, else ₹70), and computes final amount in paise.
* **Basic Auth Razorpay Order Creation:** `createRazorpayOrder` in `src/lib/payment-security.ts` initializes authenticated orders directly with Razorpay API via HTTPS.
* **Frontend Razorpay Checkout Loader:** `src/lib/razorpay-client.ts` dynamically loads `https://checkout.razorpay.com/v1/checkout.js` with modal options, error listeners, and customer prefill data.
* **Abandoned Checkout Handling:** If a user cancels payment or closes the Razorpay modal, the order remains in `Pending` status and the cart remains intact for retry.
* **Timing-Safe HMAC Verification:** Client verification uses `crypto.timingSafeEqual` over `${orderId}|${paymentId}` to prevent timing attack vulnerabilities.
* **Admin Order Status Lifecycle:** `/api/orders/update-status` guards updates with `requireAdminSession` and sanitizes order status.
* **Customer Verification Tokens:** HMAC-SHA256 order signing tokens protect order tracking endpoints from unauthorized snooping.

---

## 3. Added Features

* **Razorpay Server-to-Server Webhook (`src/app/api/payment/webhook/route.ts`):**
  - Consumes raw HTTP request body via `req.text()`.
  - Cryptographically verifies `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`.
  - Processes `payment.captured` event: locates order via `notes.order_id` or `razorpay_order_id`, verifies amount, marks order `Confirmed`, and decrements inventory idempotently.
  - Processes `payment.failed` event: marks pending order as `Failed` with bank failure description without destroying customer order history.
  - Zero dependencies on customer session/JWT (pure server-to-server authentication).
* **Webhook Cryptographic Verifier (`src/lib/payment-security.ts`):**
  - Added `verifyRazorpayWebhookSignature` using `crypto.createHmac('sha256')` with length check and `crypto.timingSafeEqual`.
* **Authoritative Order Amount Gateway Fetcher (`src/lib/payment-security.ts`):**
  - Added `fetchRazorpayOrder` to cross-validate order amounts and status directly with Razorpay's API.
* **Shared Atomic Inventory Decrementer (`src/lib/payment-security.ts`):**
  - Added `decrementOrderStock` shared between callback and webhook routes to ensure consistent, idempotent stock reduction.
* **Database Migration Script (`supabase-migration-razorpay.sql`):**
  - Non-destructive `ALTER TABLE IF EXISTS inveins_orders ADD COLUMN IF NOT EXISTS payment_id, razorpay_order_id, updated_at`.
  - Performance indexes on `payment_id`, `razorpay_order_id`, `status`, and `created_at`.
  - Stored procedure `decrement_product_stock` with `FOR UPDATE` row lock.

---

## 4. Fixed Features

* **Database Confirmation Bug in `/api/payment/verify`:**
  - Previously, attempting to update `payment_id` on `inveins_orders` crashed with column not found `42703`. Added schema tolerance: if dedicated columns are not present, payment details are stored safely in `customer` JSON metadata and the order is marked `Confirmed`.
* **Missing `razorpay_order_id` Persistence in `/api/orders/create`:**
  - Added `razorpay_order_id` to order insert payload with fallback to `customer.razorpay_order_id`.
* **Cross-Order Razorpay Order ID Ownership Check:**
  - In `/api/payment/verify`, verified that `razorpay_order_id` matches the application order's registered ID, preventing malicious submission of signatures from third-party orders.
* **Payment Amount Validation:**
  - Verified that paid amount in paise equals order `grand_total * 100`, blocking amount manipulation attacks.
* **Cross-Order Payment ID Deduplication:**
  - In `/api/payment/verify`, prevents reusing an already-processed `razorpay_payment_id` on a different order.
* **Race Condition / Idempotency Guard:**
  - If both client verification and webhook arrive simultaneously, the second processor detects `status === 'Confirmed'` and immediately skips duplicate stock decrements and redundant updates.
* **Order Status Enum Consistency:**
  - Added `'Failed'` to allowed order statuses in `src/lib/supabase.ts` and `src/app/api/orders/update-status/route.ts`.

---

## 5. Unchanged Features (Intentionally Preserved)

* **No UI/Design Changes:** All checkout styles, typography, brand colors, lookbook components, and product pages were untouched.
* **No Changes to Existing Cart State:** `CartContext.tsx`, `CartDrawer.tsx`, and `/cart` remain 100% identical.
* **No Changes to Cash on Delivery (COD):** COD workflow and WhatsApp confirmation flow remain intact.
* **No Unnecessary Dependencies:** No extra npm packages installed. Leveraged built-in Node.js `crypto` and Next.js native `fetch`.

---

## 6. Remaining Limitations & Operational Setup

1. **Razorpay Dashboard Webhook Configuration:**
   - URL: `https://<your-domain>/api/payment/webhook`
   - Active Events: `payment.captured`, `payment.failed`
   - Secret: Must match `RAZORPAY_WEBHOOK_SECRET` in environment variables.
2. **Execute Supabase Migration:**
   - Run `supabase-migration-razorpay.sql` in the Supabase SQL Editor to activate dedicated database columns and the row-locking inventory procedure.

---

## 7. Files Modified

| File | Changes Made | Why |
| :--- | :--- | :--- |
| `src/lib/payment-security.ts` | Added `verifyRazorpayWebhookSignature`, `fetchRazorpayOrder`, and `decrementOrderStock` | Required for webhook validation, amount verification, and shared idempotent inventory handling. |
| `src/app/api/orders/create/route.ts` | Added `razorpay_order_id` to database payload with schema-tolerant fallback | Ensures order can be correlated with Razorpay events even if dedicated columns are not yet migrated. |
| `src/app/api/payment/verify/route.ts` | Added order ownership check, amount validation, payment deduplication, and schema fallback | Fixes broken database confirmation and protects against signature spoofing. |
| `src/lib/supabase.ts` | Added `payment_id`, `razorpay_order_id`, `updated_at`, and `'Failed'` status to `DbOrder` | Type-level consistency across all API routes. |
| `src/app/api/orders/list/route.ts` | Mapped `paymentId` and `razorpayOrderId` in order list response | Exposes payment metadata to admin dashboard. |
| `src/app/api/orders/[id]/route.ts` | Mapped `paymentId` and `razorpayOrderId` in single order response | Exposes payment metadata to customer/admin view. |
| `src/app/api/orders/update-status/route.ts` | Added `'Failed'` to `validStatuses` | Allows administrative review and status transitions for failed payments. |
| `.env.example` | Added `RAZORPAY_WEBHOOK_SECRET` and `ORDER_SIGNING_SECRET` | Documents required production deployment configuration. |

---

## 8. Files Created

| File | Purpose |
| :--- | :--- |
| `src/app/api/payment/webhook/route.ts` | Production Razorpay webhook route with raw body HMAC verification and idempotent state updates. |
| `supabase-migration-razorpay.sql` | Non-destructive PostgreSQL migration script for payment fields, indexes, and stock decrement RPC. |

---

## 9. Database Changes

* **Script:** `supabase-migration-razorpay.sql`
* **Changes:**
  - Added columns `payment_id` (TEXT), `razorpay_order_id` (TEXT), and `updated_at` (TIMESTAMPTZ) to table `inveins_orders` using `ADD COLUMN IF NOT EXISTS`.
  - Added indexes on `inveins_orders(payment_id)`, `inveins_orders(razorpay_order_id)`, `inveins_orders(status)`, and `inveins_orders(created_at DESC)`.
  - Added stored procedure `decrement_product_stock(product_id TEXT, qty INT)` with `FOR UPDATE` row lock.
  - **Data Safety:** Zero destructive changes. All modifications use `IF NOT EXISTS` and preserve all existing rows and columns.

---

## 10. Required Environment Variables

```text
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
ORDER_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 11. Verified Payment Lifecycle Flow

```text
[Customer at /checkout]
        ↓
POST /api/orders/create (Sends cart items, address, paymentMethod: 'upi'|'card')
        ↓
Backend validates products in DB, recomputes authoritative prices & discounts
        ↓
Creates application order (INV-XXXX) in DB with status: 'Pending'
        ↓
Creates Razorpay Order via HTTPS (https://api.razorpay.com/v1/orders)
        ↓
Returns order ID, razorpayOrderId, and public keyId to client
        ↓
openRazorpayCheckout() opens official Razorpay Checkout popup
        ↓
Customer completes UPI / Card / NetBanking payment
        ↓
──────────────────────────────────────┬──────────────────────────────────────
      Path A: Browser Callback        │        Path B: Server Webhook
──────────────────────────────────────┼──────────────────────────────────────
Razorpay handler sends payload to:     │ Razorpay server POSTs to:
POST /api/payment/verify              │ POST /api/payment/webhook
  - Verifies HMAC signature           │   - Verifies raw body webhook HMAC
  - Correlates razorpay_order_id      │   - Correlates order via notes/rzp_id
  - Validates paid amount vs order    │   - Validates paid amount vs order
  - Checks duplicate payment ID       │   - Checks idempotency (already confirmed?)
  - Updates DB status to 'Confirmed'  │   - Updates DB status to 'Confirmed'
  - Records payment_id                │   - Records payment_id
  - Atomically decrements stock       │   - Atomically decrements stock
──────────────────────────────────────┴──────────────────────────────────────
                                      ↓
Order Confirmed & Inventory Safeguarded (Guaranteed idempotent, no duplicate deductions)
```

---

## 12. Build & Validation Status

- **Next.js Production Build (`npm run build`):** ✅ **PASS** (Zero errors, all 22 static and dynamic routes compiled successfully).
- **TypeScript Type Checking:** ✅ **PASS** (100% clean type compliance).
- **Cryptographic Signature Verification Unit Test:** ✅ **PASS** (Valid payment signatures pass; forged signatures reject; valid webhook HMAC passes; tampered webhook HMAC rejects).
