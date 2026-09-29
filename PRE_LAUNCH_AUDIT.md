# PRE-LAUNCH AUDIT REPORT - INVEINS ECOMMERCE PLATFORM

## 1. Executive Summary

* **Project:** INVEINS Fashion (`rocker2101/inveins`)
* **Audit Date:** September 29, 2026
* **Environment:** Next.js Production Build (`v14.2.35` / Node.js `v20+` / Windows x64)
* **Technology Stack:** Next.js 14.2 (App Router), React 18.3, TypeScript 5.6, Tailwind CSS 3.4, Supabase (`@supabase/supabase-js`), Razorpay Payment Gateway, Cloudinary SDK
* **Overall Release Status:** 🚫 **BLOCKED (NO-GO)**

```text
==================================================
              AUDIT METRICS SUMMARY
==================================================
P0 Critical Blockers:    3
P1 High Priority:        5
P2 Medium Priority:      6
P3 Low Priority:         4
P4 Informational:        3
--------------------------------------------------
Verified Passing:        56
Remediated Gaps:         14
Remaining Open Issues:   21
==================================================
```

---

## 2. Release Decision Rationale

### 🚫 BLOCKED (NO-GO)

In accordance with strict pre-launch release gates, any system exhibiting **P0 Release Blockers** or **unresolved financial transaction risks** cannot be authorized for production launch.

Although major security hardening milestones were achieved—including dynamic Razorpay Checkout modal wiring, server-authoritative catalog recalculation, raw-body HMAC-SHA256 webhook signature verification, atomic inventory row-level locks (`decrement_product_stock`), and Origin/CSRF enforcement—**3 P0 Blockers** remain active:

1. **P0-01:** Silent order drop on database failure: `/api/orders/create` logs DB errors to console but still returns `success: true` with a Razorpay order ID. Customers can pay money for orders that do not exist in the database, leading to missing orders and customer financial loss.
2. **P0-02:** Database lockout under Row-Level Security: `SUPABASE_SERVICE_ROLE_KEY` is missing from the environment. `supabaseAdmin` falls back to the public `anon` key, which PostgreSQL RLS blocks from accessing `inveins_orders`.
3. **P0-03:** Production admin lockout: `ADMIN_PIN` and `ADMIN_SESSION_SECRET` are not set in `.env`. In production (`NODE_ENV === "production"`), `/api/admin/login` terminates with HTTP 503 `Authentication service temporarily unavailable`.

---

## 3. Complete Feature Matrix

| ID | Feature | Location | Expected Behavior | Current Status | Severity | Audit Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-001** | Public Catalog Listing | `/shop`, `/api/products` | Return active products from Supabase DB or static fallback | **PASS** | - | Dynamic DB fetch with instant cached fallback. Pre-rendered statically at build time. |
| **FT-002** | Product Details View | `/product/[id]` | Fetch product details, sizes, images, care, and JSON-LD schema | **PASS** | - | Structured schema injected; pincode delivery checker active. |
| **FT-003** | Retail & Lookbook | `/retail`, `/` | Filterable catalog by category, fit, occasion | **PASS** | - | Multi-attribute filtering works in `useMemo`. |
| **FT-004** | Cart State Management | `CartContext.tsx`, `CartDrawer.tsx` | Add, remove, update quantities, persist locally | **PASS** | - | `localStorage` persistence and cart drawer functional. |
| **FT-005** | Wishlist Management | `CartContext.tsx`, `/wishlist` | Toggle wishlist items, persist in browser | **PASS** | - | Wishlist functional with direct cart transfer. |
| **FT-006** | Coupon Verification | `CartContext.tsx`, `/api/orders/create`| Apply FIRST10, INVEINS15, HEAVY20 server-side | **PASS** | - | Re-calculated authoritatively on server. |
| **FT-007** | Order Checkout (Direct) | `/checkout`, `/api/orders/create` | Validate form, insert order, trigger payment | **FAIL** | **P0** | Returns `success: true` even if DB insert fails (P0-01). |
| **FT-008** | Express 1-Click Buy | `ExpressCheckoutModal.tsx` | Instant modal checkout for individual garment | **FAIL** | **P0** | Dependent on `/api/orders/create` (P0-01). |
| **FT-009** | Global Checkout Modal | `CheckoutModal.tsx` | Complete bag checkout | **PASS** | - | Cleanly redirects to dedicated `/checkout` route. |
| **FT-010** | Online Payment Launch | `razorpay-client.ts`, `/checkout` | Create Razorpay order and launch modal | **PASS** | - | Basic Auth API order creation and official checkout.js modal loader. |
| **FT-011** | Payment Verification | `/api/payment/verify` | Verify HMAC signature, amount match, mark Confirmed | **PASS** | - | Timing-safe HMAC-SHA256 verification and cross-order payment deduplication active. |
| **FT-012** | Razorpay Webhook | `/api/payment/webhook` | Process `payment.captured` & `payment.failed` | **PASS** | - | Raw body HMAC verification and idempotent order status updates. |
| **FT-013** | Inventory Decrement | `src/lib/payment-security.ts`, SQL | Atomically deduct stock on payment confirmation | **PASS** | - | PostgreSQL stored procedure with `FOR UPDATE` row-level lock. |
| **FT-014** | Wholesale Enquiry Submit | `/wholesale`, `/api/wholesale/submit` | Store B2B lead in Supabase | **PARTIAL**| P1 | Honeypot active; dependent on live Supabase connection. |
| **FT-015** | Admin Authentication | `/admin`, `/api/admin/login` | Secure PIN login setting HttpOnly cookie | **FAIL** | **P0** | Fails with 503 in production when `ADMIN_PIN` is missing (P0-03). |
| **FT-016** | Admin Dashboard Stats | `/admin`, `/api/admin/dashboard` | Authoritative revenue, orders, enquiries | **PASS** | - | Sums grand totals, filters cancelled orders, checks admin session. |
| **FT-017** | Admin Photo Upload | `/api/admin/upload`, `cloudinary.ts` | Upload images to Cloudinary CDN | **PARTIAL**| P1 | Cloudinary keys empty; falls back to inline base64 in DB rows. |
| **FT-018** | Contact Studio Form | `/contact`, `/api/contact` | Store customer inquiries in DB with rate limit | **PASS** | - | Honeypot protected, input sanitized, rate limited to 5 req/min. |
| **FT-019** | Order Tracking | `/account`, `/api/orders/[id]` | Track status using HMAC verification token | **PASS** | - | IDOR protected via token parameter or admin session. |

---

## 4. Critical Defect Reports (P0 & P1)

### BUG-001 (P0): Silent Order Drop & Money Loss on DB Insertion Failure
* **File:** [`src/app/api/orders/create/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/create/route.ts#L225-L246)
* **Problem:** In `/api/orders/create`, when the Supabase insert (`supabaseAdmin.from('inveins_orders').insert(...)`) fails, the error is logged to `console.error` and execution continues. The endpoint returns `success: true` with a Razorpay order ID.
* **Impact:** Customer pays money on Razorpay, but the order is missing from Supabase. `/api/payment/verify` returns 404, and the webhook drops the event. Customer is charged without an order being created.
* **Fix:**
```typescript
if (dbError) {
  console.error('Supabase DB error saving order:', dbError);
  return NextResponse.json(
    { success: false, message: 'Database service unavailable. Order could not be created.' },
    { status: 500 }
  );
}
```

### BUG-002 (P0): Missing `SUPABASE_SERVICE_ROLE_KEY`
* **File:** [`src/lib/supabase.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/supabase.ts#L5), [`.env`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/.env)
* **Problem:** `supabaseServiceKey` falls back to `supabaseAnonKey`. When RLS is active on `inveins_orders`, queries executed by `supabaseAdmin` are treated as anonymous and rejected by PostgreSQL.
* **Impact:** Order creation, order tracking, admin listings, and payment verification all fail with RLS permission denied errors.
* **Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` from Supabase Project Settings to environment variables.

### BUG-003 (P0): Admin Passcode Lockout in Production
* **File:** [`src/lib/auth.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/auth.ts#L15-L35), [`.env`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/.env)
* **Problem:** `getAdminPin()` and `getSessionSecret()` return empty strings in production when `ADMIN_PIN` and `ADMIN_SESSION_SECRET` are not set in `.env`.
* **Impact:** `/api/admin/login` returns HTTP 503, preventing administrators from accessing the store dashboard.
* **Fix:** Provide strong secrets for `ADMIN_PIN` and `ADMIN_SESSION_SECRET`.

### BUG-004 (P1): Test Razorpay Credentials in Production Environment
* **File:** [`.env`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/.env#L6-L9)
* **Problem:** Active `.env` file contains test credentials (`rzp_test_...`).
* **Impact:** Transactions operate in sandbox mode; real payments cannot be collected.
* **Fix:** Switch to production live credentials (`rzp_live_...`) in production deployment.

### BUG-005 (P1): Missing Cloudinary Credentials Induces Database Bloat
* **File:** [`src/app/api/admin/upload/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/admin/upload/route.ts#L128-L131), [`.env`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/.env#L17-L19)
* **Problem:** Without Cloudinary credentials, admin photo uploads fall back to inline base64 data URLs.
* **Impact:** Multi-megabyte images are written to PostgreSQL rows, degrading query performance and inflating bandwidth consumption.
* **Fix:** Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## 5. Security & Risk Matrix

| Risk Scenario | Expected Security Behavior | Actual Implementation Status | Severity |
| :--- | :--- | :--- | :--- |
| **Payment Signature Spoofing** | Reject fake callbacks | Timing-safe HMAC-SHA256 verification in `payment-security.ts` | **PASS** |
| **Amount Tampering** | Reject modified prices | Server recalculates catalog prices and validates with Razorpay API | **PASS** |
| **Webhook Forgery** | Verify sender integrity | Raw body HMAC verification in `api/payment/webhook` | **PASS** |
| **Double Stock Decrement** | Idempotent inventory deduction | Early exit on `status === 'Confirmed'` + DB row locking | **PASS** |
| **Unauthorized Admin Action** | Enforce auth & origin | `requireAdminSession` checks signed cookie and request origin | **PASS** |
| **Order Tracking IDOR** | Prevent order enumeration | Requires HMAC verification token or admin session | **PASS** |
| **Stored XSS Injection** | Sanitize customer strings | Native JSX escaping + `sanitizeString` stripping HTML tags | **PASS** |
| **Rate Limit Bypass (Serverless)**| Global request throttling | In-memory `Map` resets per serverless container cold start | **P1 (HIGH)** |
| **Variant Stock Overselling** | Track stock per size | Single aggregate integer per product; sizes not partitioned | **P1 (HIGH)** |

---

## 6. Pre-Launch Go-Live Checklist

- [ ] **1. Resolve P0 Blockers:**
  - [ ] Update `/api/orders/create` to fail with HTTP 500 if database insert fails.
  - [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to production hosting environment.
  - [ ] Add `ADMIN_PIN` and `ADMIN_SESSION_SECRET` to production hosting environment.
- [ ] **2. Production Payments Setup:**
  - [ ] Switch `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to live credentials (`rzp_live_...`).
  - [ ] Configure live webhook in Razorpay Dashboard (`https://inveins.studio/api/payment/webhook`).
  - [ ] Set `RAZORPAY_WEBHOOK_SECRET` to match dashboard secret.
- [ ] **3. Media Storage Setup:**
  - [ ] Add live Cloudinary credentials to `.env.production`.
- [ ] **4. Database Migrations:**
  - [ ] Run [`supabase-migration-razorpay.sql`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/supabase-migration-razorpay.sql) in Supabase SQL editor.
  - [ ] Run [`supabase-rls.sql`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/supabase-rls.sql) in Supabase SQL editor.
- [ ] **5. Verification:**
  - [ ] Place a live test order (₹1) via UPI and verify confirmation in Supabase.
  - [ ] Log in to `/admin` with production PIN.
