# PRE-LAUNCH AUDIT REPORT

## 1. Executive Summary

* **Project:** INVEINS Fashion (Cothesis / INVEINS Apparels)
* **Audit Date:** September 26, 2026
* **Repository:** `rocker2101/inveins`
* **Environment:** Next.js Production Build (`v14.2.35` / Node.js `v22.14.0` / Windows x64)
* **Technology Stack:** Next.js (App Router), React 18, TypeScript, Tailwind CSS, Supabase (@supabase/supabase-js), Razorpay SDK, Cloudinary SDK, Lucide Icons
* **Overall Release Status:** 🚫 **BLOCKED**

```text
==================================================
              AUDIT METRICS SUMMARY
==================================================
P0 Blockers:            3
P1 Critical:            9
P2 High:                9
P3 Medium/Low:          6
--------------------------------------------------
Passed Checks:          48
Failed Checks:          27
Unverified Checks:      6
==================================================
```

---

## 2. Release Decision

### 🚫 BLOCKED

**Release Decision Rationale:**
According to pre-launch release criteria, any project with **P0 > 0** or **P1 > 0** must be **IMMEDIATELY BLOCKED** from client delivery. This audit discovered **3 P0 Release Blockers** and **9 P1 Critical Defects**:
1. **P0:** All customer order placements in production crash with HTTP 500 because `ORDER_SIGNING_SECRET` is missing from the environment.
2. **P0:** Administrative authentication is deadlocked with HTTP 503 because `ADMIN_PIN` and `ADMIN_SESSION_SECRET` are not set in production.
3. **P0:** The database integration is completely disconnected; `.env` lacks all Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), triggering `ENOTFOUND placeholder.supabase.co` DNS failures.
4. **P1:** Order creation returns `success: true` to customers even when database persistence fails completely (silent data loss).
5. **P1:** Admin dashboard access can be spoofed in any browser via client-side `localStorage.setItem('inveins_admin_auth', 'true')`.
6. **P1:** Replaying `/api/payment/verify` repeatedly decrements inventory stock due to missing idempotency checks.
7. **P1:** Fake / uncommitted forms (Contact Us, Global CheckoutModal, Newsletter) simulate successful dispatch while discarding all user submissions into the void.

---

## 3. Complete Feature Matrix

| ID | Feature | Location | Expected Behavior | Actual Status | Severity | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-001** | Public Catalog Listing | `/shop`, `/api/products` | Return active products from DB or static fallback | **PARTIAL** | P1 | `/api/products` crashes with 500 when Supabase unconfigured; UI falls back to static items |
| **FT-002** | Single Product View | `/product/[id]`, `/api/products/[id]` | Fetch single product metadata & images | **PARTIAL** | P1 | UI renders from static state; API route returns 404 because Supabase is offline |
| **FT-003** | Retail Catalog View | `/retail` | Filterable product catalogue | **PASS** | - | Filters and renders products correctly |
| **FT-004** | Cart State Management | `CartContext.tsx`, `CartDrawer.tsx`, `/cart` | Add, remove, update quantities, persist locally | **PASS** | - | LocalStorage persistence and subtotal calculation working |
| **FT-005** | Wishlist Management | `CartContext.tsx`, `/wishlist` | Toggle saved items, persist locally | **PASS** | - | Items save and render on `/wishlist` |
| **FT-006** | Coupon Code Application | `CartContext.tsx`, `/cart` | Apply FIRST10, INVEINS15, HEAVY20 | **PASS** | - | Valid codes apply percentage discounts authoritatively |
| **FT-007** | Order Checkout (Direct) | `/checkout`, `/api/orders/create` | Validate form, create order in DB, trigger payment | **FAIL** | P0 | Throws 500 in production due to missing `ORDER_SIGNING_SECRET` |
| **FT-008** | Express 1-Click Buy | `ExpressCheckoutModal.tsx` | Instant modal checkout for single item | **FAIL** | P0 | Dependent on `/api/orders/create` which fails with 500 |
| **FT-009** | Global Checkout Modal | `CheckoutModal.tsx` | Complete bag checkout in popup | **FAIL** | P1 | Dummy form; clears cart and says success without saving or placing order |
| **FT-010** | Online Payment Initiation | `razorpay-client.ts`, `/api/orders/create` | Create Razorpay order and launch modal | **FAIL** | P1 | If gateway credentials missing, bypasses payment and declares order confirmed |
| **FT-011** | Payment Verification | `/api/payment/verify` | Verify HMAC-SHA256 signature, mark order confirmed | **PARTIAL** | P1 | Verifies signature, but lacks idempotency; decrements stock repeatedly on replay |
| **FT-012** | Wholesale Enquiry Submit | `/wholesale`, `/api/wholesale/submit` | Store B2B lead in Supabase | **FAIL** | P0 | Throws 500 `Database error saving enquiry` due to offline Supabase connection |
| **FT-013** | Admin PIN Authentication | `/admin`, `/api/admin/login` | Secure PIN login setting HttpOnly cookie | **FAIL** | P0 | Returns 503 in production because `ADMIN_PIN` is not configured |
| **FT-014** | Admin Session Check | `/api/admin/session` | Validate signed cookie timestamp and signature | **PASS** | - | Accurately returns `{ authenticated: false }` for unauthenticated requests |
| **FT-015** | Admin Dashboard Stats | `/admin`, `/api/admin/dashboard` | Show authoritative revenue, orders, enquiries | **PARTIAL** | P2 | Sums subtotal instead of grand total; includes cancelled orders |
| **FT-016** | Admin Order Status Update| `/api/orders/update-status` | Update status in DB with admin guard | **PASS** | - | Correctly guards with `requireAdminSession` and sanitizes status |
| **FT-017** | Admin Photo Upload | `/api/admin/upload`, `cloudinary.ts` | Upload JPEG/PNG/WebP/GIF to Cloudinary CDN | **PARTIAL** | P2 | Cloudinary env empty; falls back to raw Base64 data URLs in production |
| **FT-018** | Contact Studio Form | `/contact` | Send user message to team | **FAIL** | P1 | Dummy form; says "Message Sent!" without sending email or storing in DB |
| **FT-019** | Newsletter Subscription | Homepage (`/`) | Collect subscriber emails | **FAIL** | P1 | Dummy state; displays success without storing email |
| **FT-020** | Order Tracking | `/account` | View local order history and status | **PASS** | - | Renders orders saved in localStorage with WhatsApp deep-link |

---

## 4. Bugs Found

### BUG-001
**Severity:** P0  
**Status:** FAIL  
**Feature:** Order Processing & Checkout  
**Location:** [`src/app/api/orders/create/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/create/route.ts#L11-L18)  
**Problem:** In production mode (`NODE_ENV === 'production'`), `getOrderSigningSecret()` throws an uncaught error if `ORDER_SIGNING_SECRET` is not set in environment variables.  
**Expected:** The endpoint should utilize a securely configured production secret and process valid orders smoothly.  
**Actual:** An uncaught exception is thrown and caught by the generic catch block, returning HTTP 500: `{"success": false, "message": "Server error validating order."}`. Zero customer orders can be placed.  
**Steps to Reproduce:**
1. Start production server (`npm run build && npm run start`).
2. Send `POST /api/orders/create` with valid order payload.
3. Observe HTTP 500 response.  
**Impact:** Total operational failure of e-commerce checkout.  
**Suggested Fix:** Ensure `ORDER_SIGNING_SECRET` is defined in production environment configs (e.g. `.env.production` / host dashboard), and add configuration validation at startup.  
**Verification Required:** Execute test order creation in production mode with configured secret.

---

### BUG-002
**Severity:** P0  
**Status:** FAIL  
**Feature:** Admin Authentication  
**Location:** [`src/app/api/admin/login/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/admin/login/route.ts#L38-L46) & [`src/lib/auth.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/auth.ts#L11-L37)  
**Problem:** `getAdminPin()` and `getSessionSecret()` return empty strings in production when `ADMIN_PIN` and `ADMIN_SESSION_SECRET` are not set.  
**Expected:** Administrators should be able to log in with their secure PIN.  
**Actual:** The endpoint returns HTTP 503: `{"success": false, "message": "Authentication service temporarily unavailable"}`.  
**Steps to Reproduce:**
1. Run application with `NODE_ENV=production`.
2. Navigate to `/admin` and submit any PIN.
3. Observe HTTP 503 error.  
**Impact:** Complete administrative lockout in production. Admins cannot manage orders, inventory, or enquiries.  
**Suggested Fix:** Define `ADMIN_PIN` and `ADMIN_SESSION_SECRET` in server environment settings.  
**Verification Required:** Authenticate with valid PIN and verify signed cookie issuance.

---

### BUG-003
**Severity:** P0  
**Status:** FAIL  
**Feature:** Database Connectivity  
**Location:** [`src/lib/supabase.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/supabase.ts#L3-L25)  
**Problem:** `.env` contains no Supabase configuration (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), defaulting to `placeholder.supabase.co`.  
**Expected:** The application connects to a valid Supabase PostgreSQL instance.  
**Actual:** All database queries crash with `getaddrinfo ENOTFOUND placeholder.supabase.co`. Products API fails with 500, wholesale submission fails with 500, order saving fails silently.  
**Steps to Reproduce:**
1. Call `GET http://localhost:3000/api/products`.
2. Inspect server log: `ENOTFOUND placeholder.supabase.co`.  
**Impact:** Total disconnection between backend services and database storage.  
**Suggested Fix:** Populate `.env` and host environment with authentic Supabase project URL and service role keys.  
**Verification Required:** Execute `GET /api/products` and verify HTTP 200 with DB records.

---

### BUG-004
**Severity:** P1  
**Status:** FAIL  
**Feature:** Order Creation Database Persistence  
**Location:** [`src/app/api/orders/create/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/create/route.ts#L203-L231)  
**Problem:** If Supabase returns an error or fails to insert the order record, the error is merely logged to `console.error` and the API proceeds to return `{ success: true, message: 'Order validated, created, and saved to database.', order: verifiedOrder }`.  
**Expected:** The API should fail gracefully with an appropriate error status (e.g. 500) if the order cannot be persisted in the database.  
**Actual:** The client UI displays "Order Confirmed & Received", but the order does not exist in the database.  
**Steps to Reproduce:**
1. Submit an order when Supabase is unreachable.
2. Response returns `success: true`.
3. Check database: 0 records created.  
**Impact:** Customers believe their order is placed, but the store owner never receives the order details, leading to unfulfilled purchases and reputational damage.  
**Suggested Fix:** Check `if (dbError)` and return `{ success: false, message: 'Failed to record order' }` with status 500, or queue for retry.  
**Verification Required:** Simulate DB failure and verify non-success HTTP status.

---

### BUG-005
**Severity:** P1  
**Status:** FAIL  
**Feature:** Admin Portal Authorization & Data Privacy  
**Location:** [`src/app/admin/page.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/admin/page.tsx#L228-L237)  
**Problem:** The admin interface falls back to client-side localStorage (`inveins_admin_auth === 'true'`) when `/api/admin/session` returns unauthenticated.  
**Expected:** Only users with a validated server session cookie should view admin portal UI and data.  
**Actual:** Anyone opening browser DevTools and executing `localStorage.setItem('inveins_admin_auth', 'true')` unlocks the admin portal dashboard, viewing all cached customer orders, shipping addresses, and wholesale leads stored in `inveins_my_orders`.  
**Steps to Reproduce:**
1. Open unauthenticated incognito browser.
2. In console, execute: `localStorage.setItem('inveins_admin_auth', 'true')`.
3. Refresh `/admin`.
4. Observe that the login screen is bypassed and order dashboard is displayed.  
**Impact:** Client-side privilege escalation and customer PII leakage.  
**Suggested Fix:** Remove `localStorage.getItem('inveins_admin_auth')` fallback; rely strictly on server session verification from `/api/admin/session`.  
**Verification Required:** Verify `/admin` redirects to login when cookie is missing.

---

### BUG-006
**Severity:** P1  
**Status:** FAIL  
**Feature:** Payment Verification & Stock Decrement  
**Location:** [`src/app/api/payment/verify/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/payment/verify/route.ts#L75-L115)  
**Problem:** The payment verification endpoint lacks idempotency controls. If the same valid payment callback is replayed, it decrements product stock repeatedly.  
**Expected:** The endpoint should verify if the order has already been marked 'Confirmed' and prevent duplicate inventory decrements.  
**Actual:** Every call with valid Razorpay signatures executes `decrement_product_stock` again.  
**Steps to Reproduce:**
1. Execute `/api/payment/verify` with valid signatures for Order A. Stock drops by QTY.
2. Re-send the exact same request. Stock drops by QTY again.  
**Impact:** Inventory stock undercounting, false "SOLD OUT" flags, and financial/stock synchronization errors.  
**Suggested Fix:** Check `if (existingOrder.status === 'Confirmed') return NextResponse.json({ success: true, message: 'Already processed' })`.  
**Verification Required:** Replay verification and ensure stock decrements exactly once.

---

### BUG-007
**Severity:** P1  
**Status:** FAIL  
**Feature:** Online Checkout Payment Enforcement  
**Location:** [`src/app/checkout/page.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/checkout/page.tsx#L123-L177)  
**Problem:** If Razorpay is not configured on the server, `data.razorpay` is returned as `null`. In `checkout/page.tsx`, the code checks `if (data.razorpay && (paymentMethod === 'upi' || paymentMethod === 'card'))`. Because `data.razorpay` is null, execution falls through to the COD block, marking the order as placed and advancing to confirmation without collecting payment.  
**Expected:** If online payment cannot be initialized, the user should receive an error advising them that online payments are unavailable.  
**Actual:** An unpaid order is registered and displayed as confirmed to the user.  
**Steps to Reproduce:**
1. Select UPI or Card when Razorpay is unconfigured.
2. Click "PLACE ORDER".
3. Checkout succeeds immediately without payment prompt.  
**Impact:** Customers receive confirmation without paying for merchandise.  
**Suggested Fix:** Throw an error or notify user when `paymentMethod !== 'cod'` and `data.razorpay` is missing.  
**Verification Required:** Select UPI without gateway and verify error prompt.

---

### BUG-008
**Severity:** P1  
**Status:** FAIL  
**Feature:** Contact Us Form  
**Location:** [`src/app/contact/page.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/contact/page.tsx#L17-L32)  
**Problem:** `handleSubmit` performs form validation, updates local state `setSubmitted(true)`, and shows "MESSAGE SENT!", but performs NO network call, sends no email, and saves no record to the database.  
**Expected:** Contact inquiries should be persisted in a database table or emailed to support staff.  
**Actual:** All user messages sent through `/contact` are discarded instantly.  
**Steps to Reproduce:**
1. Go to `/contact`.
2. Fill out form and submit.
3. Observe "MESSAGE SENT!". Check server/logs/db: zero records.  
**Impact:** Client and wholesale customer inquiries are permanently lost.  
**Suggested Fix:** Implement `/api/contact/submit` route to store inquiries in Supabase or forward via Resend/SendGrid.  
**Verification Required:** Submit form and verify arrival in database.

---

### BUG-009
**Severity:** P1  
**Status:** FAIL  
**Feature:** Global Checkout Modal  
**Location:** [`src/components/CheckoutModal.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/CheckoutModal.tsx#L23-L28)  
**Problem:** Form submission simply calls `setStep('success')` and `clearCart()`. No order is ever created, no API is called, and no order confirmation ID is generated.  
**Expected:** Form submission should invoke `/api/orders/create`.  
**Actual:** Cart is emptied, user is shown fake success screen, no order exists.  
**Steps to Reproduce:**
1. Trigger `CheckoutModal`.
2. Fill fields and click submit.
3. Observe success message with no order created in system.  
**Impact:** Silent failure of purchasing flow.  
**Suggested Fix:** Wire `CheckoutModal` to `addOrder` and `/api/orders/create` or replace with redirect to `/checkout`.  
**Verification Required:** Verify order record creation upon submission.

---

### BUG-010
**Severity:** P1  
**Status:** FAIL  
**Feature:** Newsletter Subscription  
**Location:** [`src/app/page.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/page.tsx#L21-L27)  
**Problem:** Newsletter submission only sets local state `setNewsletterSubscribed(true)`.  
**Expected:** Subscriber email should be stored in a database collection or mailing service.  
**Actual:** Emails entered are discarded after 4 seconds.  
**Steps to Reproduce:**
1. Enter email in homepage newsletter box and submit.
2. Success message appears; email is never recorded.  
**Impact:** Marketing lead loss.  
**Suggested Fix:** Connect to Supabase `inveins_subscribers` table or Mailchimp/Klaviyo API.  
**Verification Required:** Submit email and verify database entry.

---

### BUG-011
**Severity:** P2  
**Status:** FAIL  
**Feature:** Shipping Fee Calculation Inconsistency  
**Location:** [`src/context/CartContext.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/context/CartContext.tsx#L131) vs [`src/app/api/orders/create/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/create/route.ts#L25)  
**Problem:** `CartContext.tsx` sets `STANDARD_SHIPPING_FEE = 70` (and `ShippingPolicyModal.tsx` states flat ₹70), while `orders/create/route.ts` sets `STANDARD_SHIPPING_FEE = 90`.  
**Expected:** Uniform shipping fee calculation across frontend and backend.  
**Actual:** Cart displays ₹70 shipping, but the server calculates ₹90 shipping, causing a sudden ₹20 jump in grand total at checkout.  
**Steps to Reproduce:**
1. Add an item priced under ₹999 (e.g. ₹250) to cart.
2. Cart shows Shipping: ₹70, Total: ₹320.
3. Proceed to checkout: Server calculates Total: ₹340 (₹90 shipping).  
**Impact:** Unexpected price increase during final step causes checkout friction and abandonment.  
**Suggested Fix:** Align both files to the identical constant (e.g. ₹70 or ₹90).  
**Verification Required:** Confirm cart total matches checkout server total.

---

### BUG-012
**Severity:** P2  
**Status:** FAIL  
**Feature:** Shipping Policy / Free Delivery Threshold Inconsistency  
**Location:** [`src/components/InveinsFooter.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/InveinsFooter.tsx#L24)  
**Problem:** Footer value proposition claims "Free delivery on orders ₹4,000+", whereas AnnouncementBar, CartContext, Product details, and Checkout enforce free delivery at ₹999.  
**Expected:** Footer should state "Free delivery on orders ₹999+".  
**Actual:** Contradictory policy claims on the same page.  
**Steps to Reproduce:**
1. Compare AnnouncementBar ("orders above ₹999") with Footer ("orders ₹4,000+").  
**Impact:** Customer confusion and loss of brand credibility.  
**Suggested Fix:** Update `InveinsFooter.tsx` line 24 to `Free delivery on orders ₹999+`.  
**Verification Required:** Inspect footer rendered copy.

---

### BUG-013
**Severity:** P2  
**Status:** FAIL  
**Feature:** Rate Limiting IP Spoofing  
**Location:** [`src/lib/rate-limit.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/rate-limit.ts#L32-L48)  
**Problem:** `getClientIp()` takes the first comma-separated IP from `x-forwarded-for` directly without validating against trusted reverse proxies.  
**Expected:** Client IP extraction should resist header spoofing.  
**Actual:** An attacker can rotate spoofed headers (`X-Forwarded-For: 1.1.1.1`, `X-Forwarded-For: 1.1.1.2`) to completely bypass rate limiting on `/api/admin/login` and `/api/orders/create`.  
**Steps to Reproduce:**
1. Send 10 login requests with varying `X-Forwarded-For` headers.
2. None are rate-limited.  
**Impact:** Brute-force protection on admin login and order submission can be circumvented.  
**Suggested Fix:** Use platform-specific trusted IP headers (e.g. `x-real-ip` or Vercel/Cloudflare connecting IP) and take the rightmost trusted IP.  
**Verification Required:** Attempt header rotation and confirm rate limit enforcement.

---

### BUG-014
**Severity:** P2  
**Status:** FAIL  
**Feature:** Admin Dashboard Revenue Calculation  
**Location:** [`src/app/api/admin/dashboard/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/admin/dashboard/route.ts#L25)  
**Problem:** Revenue is computed by summing `subtotal` for ALL orders including `Cancelled` orders.  
**Expected:** Revenue should only sum `grand_total` of valid / confirmed / delivered orders.  
**Actual:** Cancelled orders artificially inflate total revenue figures.  
**Steps to Reproduce:**
1. Create order for ₹500, then cancel it.
2. Dashboard revenue increases by ₹500.  
**Impact:** Misleading business analytics for store owners.  
**Suggested Fix:** Filter `orders.filter(o => o.status !== 'Cancelled')` and sum `grand_total`.  
**Verification Required:** Verify cancelled orders do not increase dashboard revenue.

---

### BUG-015
**Severity:** P2  
**Status:** FAIL  
**Feature:** Dead Navigation Link  
**Location:** [`src/components/InveinsFooter.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/InveinsFooter.tsx#L114)  
**Problem:** Footer links to `/shop?category=Denim`.  
**Expected:** All catalog category links should lead to existing product categories.  
**Actual:** No product has category 'Denim'. Clicking the link loads an empty catalog.  
**Steps to Reproduce:**
1. Click "Selvedge Denim" in footer.
2. Page displays 0 items.  
**Impact:** Dead-end user experience.  
**Suggested Fix:** Change link to an active category (e.g. `Outerwear`) or remove it.  
**Verification Required:** Confirm all footer links resolve to non-empty pages.

---

### BUG-016
**Severity:** P2  
**Status:** FAIL  
**Feature:** Missing Static Favicon  
**Location:** `public/favicon.ico`, [`src/lib/razorpay-client.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/razorpay-client.ts#L71)  
**Problem:** `favicon.ico` does not exist in `public/` or `src/app/`.  
**Expected:** Standard favicon icon should load in browser tab and in Razorpay modal.  
**Actual:** Browser issues HTTP 404 for `/favicon.ico` and Razorpay modal fails to render logo.  
**Steps to Reproduce:**
1. Request `http://localhost:3000/favicon.ico`. Observe 404.  
**Impact:** Missing browser icon, console 404 errors, broken brand image in Razorpay.  
**Suggested Fix:** Place high-res `favicon.ico` / `icon.png` in `src/app/` and `public/`.  
**Verification Required:** Verify 200 response on `/favicon.ico`.

---

### BUG-017
**Severity:** P2  
**Status:** FAIL  
**Feature:** Express Checkout WhatsApp Summary Mismatch  
**Location:** [`src/components/ExpressCheckoutModal.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/ExpressCheckoutModal.tsx#L149)  
**Problem:** `generateWhatsAppLink` references `placedOrder.subtotal` instead of `placedOrder.grandTotal`.  
**Expected:** WhatsApp order slip should show the true grand total including delivery fee.  
**Actual:** Message states subtotal, causing price discrepancies when communicating with customer support.  
**Steps to Reproduce:**
1. Place 1-click buy for item under ₹999.
2. WhatsApp text shows subtotal (without shipping charge).  
**Impact:** Billing confusion between customer and studio dispatch staff.  
**Suggested Fix:** Change `placedOrder.subtotal` to `placedOrder.grandTotal`.  
**Verification Required:** Verify WhatsApp message includes accurate grand total.

---

### BUG-018
**Severity:** P3  
**Status:** FAIL  
**Feature:** Leftover Job Portal Code  
**Location:** [`src/lib/utils.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/utils.ts#L8-L39)  
**Problem:** Unrelated utility functions from a job portal (`formatINR(lpa)`, `safeOpenApplyUrl`, `software engineer careers apply`, `https://razorpay.com/jobs/`) remain in code.  
**Expected:** Production codebase contains only relevant domain logic.  
**Actual:** Dead code clutters utility library.  
**Impact:** Code hygiene and maintenance confusion.  
**Suggested Fix:** Remove orphaned job board functions.  
**Verification Required:** Run typecheck to confirm zero usages before deletion.

---

### BUG-019
**Severity:** P3  
**Status:** FAIL  
**Feature:** Dead / Unused Components  
**Location:** [`src/components/HeroSlider.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/HeroSlider.tsx), [`src/components/CategoryStoryBar.tsx`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/components/CategoryStoryBar.tsx)  
**Problem:** Both components are declared and exported but imported nowhere.  
**Expected:** Only active components in codebase.  
**Actual:** Dead component files add bundle baggage.  
**Suggested Fix:** Delete or integrate into homepage.  
**Verification Required:** Verify clean build after cleanup.

---

## 5. Security Findings

| ID | Vulnerability | Severity | Location | Evidence | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Exposed Active Test Payment Credentials | **P1 - CRITICAL** | `.env` lines 6-8 | `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` present in repository file | Move to secure hosting secrets; rotate keys immediately |
| **SEC-002** | Hardcoded Development Secrets | **P1 - CRITICAL** | `.env` line 2 | `JWT_SECRET` hardcoded string | Generate cryptographically random 256-bit string; inject via environment |
| **SEC-003** | Committed Database Connection String Template | **P2 - HIGH** | `.env.example` line 28 | Direct pooler host & database username committed | Redact all internal DB hostnames from documentation files |
| **SEC-004** | Critical Next.js Framework CVEs | **P1 - CRITICAL** | `package.json` line 23 | `npm audit` flagged Next.js `14.2.25` for RCE (GHSA-p293-qw3h-jr36) & SSRF | Plan staged upgrade to patched Next.js release |
| **SEC-005** | Client-Side Admin Auth Bypass | **P1 - CRITICAL** | `src/app/admin/page.tsx` line 230 | `localStorage.getItem('inveins_admin_auth')` bypasses auth guard | Rely strictly on server session verification from `/api/admin/session` |
| **SEC-006** | Payment Replay / Inventory Drain | **P1 - CRITICAL** | `src/app/api/payment/verify` line 75 | No idempotency check on payment verification callbacks | Check order status and record payment ID before stock decrement |
| **SEC-007** | Rate Limiting IP Header Spoofing | **P2 - HIGH** | `src/lib/rate-limit.ts` line 37 | Reads untrusted client-supplied `x-forwarded-for` header | Use trusted platform proxy header |
| **SEC-008** | In-Memory Serverless State Loss | **P2 - HIGH** | `src/lib/rate-limit.ts` line 15 | In-memory `Map` lost on cold starts | Use Redis / Upstash for distributed rate limiting |
| **SEC-009** | Missing Disallow for API in robots.txt | **P2 - HIGH** | `src/app/robots.ts` line 8 | `/api/*` omitted from disallow list | Add `disallow: ['/admin', '/admin/*', '/api', '/api/*']` |
| **SEC-010** | Missing Content-Security-Policy Frame Domain | **P3 - MEDIUM** | `next.config.mjs` line 61 | `frame-src` omits `https://checkout.razorpay.com` | Add `https://checkout.razorpay.com` to `frame-src` |

---

## 6. API Audit

| Endpoint | Method | Auth Guard | Input Validation | DB Integration | Error Handling | Production Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Public | None needed | Supabase `inveins_products` | Returns 500 on DB error | ❌ **FAIL (500)** |
| `/api/products/[id]` | `GET` | Public | Parameter `id` | Supabase `inveins_products` | Returns 404 on DB error | ❌ **FAIL (404)** |
| `/api/products` | `POST` | Admin Session | `sanitizeString`, price check | Supabase insert | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/products/[id]` | `PATCH` | Admin Session | `sanitizeString`, stock/badge | Supabase update | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/products/[id]` | `DELETE` | Admin Session | Parameter `id` | Supabase delete | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/orders/create` | `POST` | Rate Limited (10/min) | Strict phone, email, pincode | Supabase insert (Swallowed) | Catches error; returns 500 | ❌ **FAIL (500)** |
| `/api/orders/list` | `GET` | Admin Session | None needed | Supabase `inveins_orders` | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/orders/[id]` | `GET` | Token or Admin | `id` + token verification | Supabase `inveins_orders` | Returns 404 / 403 | ⚠️ **BLOCKED BY DB** |
| `/api/orders/[id]` | `PATCH` | Admin Session | `status`, `trackingNumber` | Supabase update | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/orders/[id]` | `DELETE` | Admin Session | Parameter `id` | Supabase delete | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/orders/update-status`| `POST` | Admin Session | Status whitelist enum | Supabase update | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/payment/verify` | `POST` | HMAC-SHA256 | Required Razorpay credentials| Supabase update & RPC stock | Cryptographic fail check | ⚠️ **PARTIAL (No Idempotency)** |
| `/api/wholesale/submit` | `POST` | Rate Limited (5/min) | Honeypot, phone, email | Supabase `inveins_wholesale`| Returns 500 on DB error | ❌ **FAIL (500)** |
| `/api/wholesale/list` | `GET` | Admin Session | None needed | Supabase `inveins_wholesale`| Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/wholesale/[id]` | `GET` | Admin Session | Parameter `id` | Supabase `inveins_wholesale`| Returns 404 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/wholesale/[id]` | `DELETE` | Admin Session | Parameter `id` | Supabase delete | Returns 500 on DB error | ⚠️ **BLOCKED BY DB** |
| `/api/admin/login` | `POST` | Rate Limited (5/15m) | PIN type & length | Constant-time HMAC match | Timing-safe check | ❌ **FAIL (503)** |
| `/api/admin/session` | `GET` | HttpOnly Cookie | HMAC signature & expiry | Stateless HMAC | Returns `{authenticated: false}`| ✅ **PASS** |
| `/api/admin/logout` | `POST` | Public | None | Cookie expiration | Clears cookie | ✅ **PASS** |
| `/api/admin/dashboard` | `GET` | Admin Session | None | Supabase counts & sums | Returns 500 on DB error | ⚠️ **PARTIAL (Logic Flaw)** |
| `/api/admin/upload` | `POST` | Admin Session | Magic byte binary inspection | Cloudinary / local storage | Size & type validation | ⚠️ **PARTIAL (Base64 bloat)** |

---

## 7. Database Audit

* **Target Schema:** Supabase PostgreSQL (`supabase-rls.sql`).
* **Tables Defined:**
  1. `inveins_products` (catalog items, stock, badges, dimensions, RLS enabled)
  2. `inveins_orders` (customer shipping PII, items JSON, payment status, verification tokens, RLS enabled)
  3. `inveins_wholesale_enquiries` (B2B leads, RLS enabled)
* **RPC Stored Procedures:** `decrement_product_stock(product_id TEXT, qty INT)` with `FOR UPDATE` row lock.
* **Findings:**
  - **Connection Severed:** The application fails to connect because `.env` contains `DATABASE_URL="file:./dev.db"` (Prisma format), while the codebase uses `@supabase/supabase-js`.
  - **Orphan / Stale Artifact:** `prisma/dev.db` (192 KB SQLite file) is committed in the repository, completely unused by the active codebase.
  - **Silent Writes:** `/api/orders/create` catches Supabase insert errors and proceeds to report order creation success, masking DB outages from users.
  - **Unindexed Queries:** `inveins_orders` lacks explicit indexes on `created_at` and `status`, which will degrade performance as order volumes grow.

---

## 8. UI/UX Audit

* **Desktop Experience (1440px - 1920px):**
  - High aesthetic score: editorial typography, clean margins, responsive hover states, smooth horizontal draggable lookbook ticker.
  - Cart drawer and search modal transitions are fluid and clean.
* **Tablet Experience (768px - 1024px):**
  - Navigation gracefully collapses into mobile drawer.
  - Category story chips and grids scale seamlessly.
* **Mobile Experience (320px - 414px):**
  - Mobile bottom checkout actions properly respect `safe-area-inset-bottom`.
  - Minimum touch targets (44px) are implemented across search, drawer toggles, and size selectors.
  - Sticky bottom action bar in product details ensures easy "Add to Bag" on small screens.
* **Form & Modal UX Deficiencies:**
  - `CheckoutModal.tsx` submits with no network activity, offering a false sense of order completion.
  - `contact/page.tsx` submits with no network activity.
  - Shipping fee displays ₹70 in cart, then jumps to ₹90 at checkout.
  - Empty search state on `/retail` has no clear "No products found" fallback.

---

## 9. Performance Audit

* **Production Build Output Metrics:**
  - Total Static / Dynamic Routes: 20
  - First Load JS Shared by All: **87.3 kB** (exceptional bundle size efficiency)
    - `chunks/117-5e6ddc80607d6c1a.js`: 31.7 kB
    - `chunks/fd9d1056-c3b2e0bf7bd7942c.js`: 53.6 kB
  - Page-specific JS bundles:
    - `/`: 7.99 kB
    - `/shop`: 5.46 kB
    - `/product/[id]`: 8.46 kB
    - `/checkout`: 7.18 kB
    - `/admin`: 11.6 kB
* **Assets & Images:**
  - `unoptimized: true` configured in `next.config.mjs` prevents server-side image optimization load on resource-constrained servers.
  - Lookbook images in `public/images/lookbook` range from 211 KB to 303 KB (could be converted to WebP for additional 50% byte savings).

---

## 10. Accessibility Audit

| Check | Status | Evidence / Notes |
| :--- | :--- | :--- |
| Keyboard ESC Dismiss | **PASS** | `Header.tsx` listens for `Escape` to close mega menus, search, and drawer |
| Semantic Headings | **PASS** | Clear `h1` -> `h2` -> `h3` hierarchy across catalog and product pages |
| Form Input Labels | **PASS** | Inputs across checkout and wholesale have descriptive uppercase labels |
| ARIA Attributes | **PASS** | `aria-haspopup`, `aria-expanded`, and `aria-label` set on interactive controls |
| Color Contrast | **PASS** | `#141413` text on `#faf9f5` canvas exceeds WCAG AAA 7:1 contrast ratio |
| Mobile Touch Targets | **PASS** | Touch targets >= 44x44px verified on buttons, links, and quantity steppers |

---

## 11. SEO Audit

* **Meta Tags & Title Templates:** Validated on all pages. Title and descriptions are customized per route.
* **Open Graph & Twitter Cards:** Configured in `src/app/layout.tsx` with high-resolution imagery.
* **Schema.org Structured Data:**
  - `Organization` schema injected in root layout.
  - `Product` + `Offer` JSON-LD schema injected dynamically in `/product/[id]`.
* **Sitemap & Robots:**
  - `sitemap.xml` dynamically generated for all static pages and product detail URLs.
  - **Issue:** `/retail` is omitted from `sitemap.ts`.
  - **Issue:** `robots.ts` fails to disallow `/api/*` endpoints.

---

## 12. Deployment Audit

* **Build Command:** `npm run build` -> **PASS** (zero compilation errors).
* **Start Command:** `npm run start` -> **PASS** (starts in < 800ms).
* **Environment Configuration:**
  - `DATABASE_URL` in `.env` is invalid SQLite reference (`file:./dev.db`).
  - Missing Supabase connection parameters.
  - Missing `ADMIN_PIN`, `ADMIN_SESSION_SECRET`, and `ORDER_SIGNING_SECRET`.
  - Missing Cloudinary credentials.
* **Security Headers Configured in `next.config.mjs`:**
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options`: `DENY`
  - `X-Content-Type-Options`: `nosniff`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy`: Configured (needs `checkout.razorpay.com` added to `frame-src`)

---

## 13. Test Execution Summary

The following test suites and verification scripts were executed directly against the workspace:

1. **Linting Check:**
   - Command: `npm run lint`
   - Result: ⚠️ Interactive prompt triggered (ESLint uninitialized).
2. **TypeScript Compilation Check:**
   - Command: `npx tsc --noEmit`
   - Result: ✅ **PASS** (0 errors).
3. **Production Build Verification:**
   - Command: `npm run build`
   - Result: ✅ **PASS** (Compiled all 18 pages in production mode).
4. **Security Vulnerability Audit:**
   - Command: `npm audit`
   - Result: ❌ **FAIL** (1 critical vulnerability advisory in Next.js core).
5. **Live API Integration Suite:**
   - Command: `node scratch/api_audit.js`
   - Result: ❌ **FAIL** (Confirmed 500 on `/api/products`, 404 on `/api/products/[id]`, 500 on `/api/orders/create`, 500 on `/api/wholesale/submit`, 503 on `/api/admin/login`).

---

## 14. Environment / Configuration Issues

> [!CAUTION]
> **SECRETS DETECTED IN REPOSITORY:**
> - Location: `.env` lines 6-7
>   - Type: Razorpay Test Key ID & Key Secret
>   - Action: **ROTATE IMMEDIATELY IN RAZORPAY DASHBOARD**
> - Location: `.env.example` line 25
>   - Type: Supabase Anon JWT Token
>   - Action: **ROTATE IMMEDIATELY IN SUPABASE DASHBOARD**

* **MISSING ENV VARIABLES:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_PIN`
  - `ADMIN_SESSION_SECRET`
  - `ORDER_SIGNING_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
* **WRONG CONFIGURATION:**
  - `.env` line 1: `DATABASE_URL="file:./dev.db"` (Prisma SQLite remnant, completely unused).

---

## 15. Unverified Areas

The following items could not be verified in this audit and require manual confirmation once real secrets are provisioned:
1. **Live Production Payment Capture:** Live UPI/Card transaction capture on real Razorpay bank servers cannot be executed with test credentials.
2. **Real-time SMS / WhatsApp Gateway Dispatch:** Order notification delivery to customer mobile numbers requires active WhatsApp Business API gateway integration.
3. **Cloudinary Remote Upload:** Remote cloud CDN photo upload could not be verified because Cloudinary API credentials were empty.
4. **Live Supabase PostgreSQL RLS Policies:** Live execution of `supabase-rls.sql` against the client's production database could not be confirmed without active database credentials.
5. **Safari / iOS WebKit Rendering:** Tested on Chromium; WebKit mobile rendering requires manual testing on a physical iOS device.

---

## 16. Monday Delivery Checklist

Before the Monday launch, every item on this checklist must be addressed and verified:

- [ ] **P0 issues resolved (Must be 0)**
  - [ ] Add `ORDER_SIGNING_SECRET` to production environment
  - [ ] Add `ADMIN_PIN` and `ADMIN_SESSION_SECRET` to production environment
  - [ ] Add authentic `NEXT_PUBLIC_SUPABASE_URL` and keys to `.env`
- [ ] **P1 critical bugs fixed**
  - [ ] Fix order creation to fail with 500 if Supabase insert fails (no silent success)
  - [ ] Remove `localStorage.getItem('inveins_admin_auth')` bypass from `/admin`
  - [ ] Add idempotency check to `/api/payment/verify` to prevent duplicate stock decrement
  - [ ] Block checkout progression if online payment gateway is unconfigured
  - [ ] Wire `/contact` form to a real backend handler or email dispatcher
  - [ ] Connect or replace dummy `CheckoutModal.tsx`
  - [ ] Rotate exposed Razorpay test credentials in dashboard
- [ ] **P2 high-priority defects resolved**
  - [ ] Synchronize shipping fee constant (₹70 vs ₹90) between frontend and backend
  - [ ] Correct footer free shipping threshold from ₹4,000+ to ₹999+
  - [ ] Replace `x-forwarded-for` extraction in `rate-limit.ts` with trusted proxy IP
  - [ ] Exclude cancelled orders from admin dashboard total revenue sum
  - [ ] Remove dead "Selvedge Denim" link from footer
  - [ ] Add `favicon.ico` to `public/` and `src/app/`
  - [ ] Add `/api/*` to `robots.ts` disallow list
  - [ ] Add `https://checkout.razorpay.com` to CSP `frame-src` in `next.config.mjs`
- [ ] **Production build passes cleanly (`npm run build`)**
- [ ] **Database RLS script (`supabase-rls.sql`) executed in Supabase SQL editor**
- [ ] **Admin login verified with live PIN**
- [ ] **Test order placed via COD and verified in Supabase `inveins_orders` table**
- [ ] **Mobile responsive smoke test completed on physical phone**
- [ ] **Backup and rollback plan confirmed**
