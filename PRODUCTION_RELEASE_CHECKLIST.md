# INVEINS PRODUCTION RELEASE GATE CHECKLIST

**Platform:** `https://inveins.in` / `https://www.inveins.in`  
**Current Release Status:** 🚫 **BLOCKED**

This checklist serves as the strict operational gate that must be completed and signed off before switching DNS, routing live customer traffic, or accepting real financial payments.

---

## 1. CRITICAL BLOCKERS (P0 Sign-Off)

- [ ] **1.1 Configure `ORDER_SIGNING_SECRET` in Hosting Provider (Vercel)**
  - Generate a 64-character cryptographically secure hex secret:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - Add `ORDER_SIGNING_SECRET` to Vercel Project Settings -> Environment Variables (Production & Preview).
  - Verify that `POST /api/orders/create` no longer throws HTTP 500.

- [ ] **1.2 Configure `ADMIN_SESSION_SECRET` & `ADMIN_PIN` in Hosting Provider (Vercel)**
  - Set a high-entropy `ADMIN_PIN` (minimum 12 characters alphanumeric/special).
  - Generate and set a separate 64-character `ADMIN_SESSION_SECRET`.
  - Verify that `/api/admin/login` allows authentication and sets `inveins_admin_token` cookie.

- [ ] **1.3 Configure `SUPABASE_SERVICE_ROLE_KEY` in Hosting Provider (Vercel)**
  - In Supabase Dashboard, navigate to **Project Settings** -> **API** -> **Project API keys**.
  - Copy the `service_role` secret (bypasses RLS).
  - Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel Environment Variables.
  - Verify server-side writes to `inveins_orders` succeed under PostgreSQL RLS.

- [ ] **1.4 Fix Webhook Order Persistence to Prevent `items: []` Data Loss**
  - In `src/app/api/orders/create/route.ts`, persist all online pending orders to `inveins_orders` with `status: 'Payment Pending'` directly in Supabase before returning the Cashfree session.
  - In `src/app/api/payment/cashfree-webhook/route.ts`, ensure order updates preserve and read `items` from Supabase rather than relying on ephemeral in-memory state.

---

## 2. PAYMENTS & FINANCIAL SETTLEMENTS (P0 & P1 Sign-Off)

- [ ] **2.1 Production Cashfree Credentials Verification**
  - Verify that `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` are valid Live Production credentials.
  - Set `CASHFREE_ENVIRONMENT="PRODUCTION"` and `NEXT_PUBLIC_CASHFREE_ENVIRONMENT="production"`.
  - Confirm API version is set to `2023-08-01`.

- [ ] **2.2 Register Production Webhook Endpoint**
  - Log in to Cashfree Merchant Dashboard -> **Developers** -> **Webhooks**.
  - Add webhook URL: `https://www.inveins.in/api/payment/cashfree-webhook`.
  - Subscribe to events: `ORDER_PAID`, `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`.
  - Ensure `CASHFREE_SECRET_KEY` matches the secret used in webhook signature computation.

- [ ] **2.3 Execute Live Test Transaction**
  - Place a live ₹1 or minimum allowed order on `https://www.inveins.in`.
  - Complete payment via UPI / Debit Card.
  - Confirm:
    - Customer receives on-screen confirmation with valid Order ID.
    - Cashfree Dashboard records status `PAID`.
    - Supabase `inveins_orders` record shows status `Confirmed` with accurate items and sizes.
    - Admin dashboard shows order in order management list.

---

## 3. DATABASE & INVENTORY INTEGRITY (P1 Sign-Off)

- [ ] **3.1 Execute Supabase RLS Migration**
  - Open Supabase SQL Editor and execute [`supabase-rls.sql`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/supabase-rls.sql).
  - Confirm RLS is enabled on `inveins_orders`, `inveins_products`, and `inveins_wholesale_enquiries`.
  - Confirm public anon key cannot query `inveins_orders`.

- [ ] **3.2 Activate Atomic Inventory Decrement Procedure**
  - Verify PostgreSQL function `decrement_product_stock(product_id TEXT, qty INT)` is compiled in Supabase.
  - Update `src/lib/payment-security.ts` to call `supabaseAdmin.rpc('decrement_product_stock', ...)`.

- [ ] **3.3 Size-Level Variant Stock Partitioning**
  - Review product stock model to ensure size availability (S, M, L, XL) is tracked accurately.

---

## 4. ASSETS & PERFORMANCE OPTIMIZATION (P1 & P2 Sign-Off)

- [ ] **4.1 Provision Cloudinary Media Storage**
  - Create or configure Cloudinary account.
  - Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Vercel.
  - Confirm new product image uploads in `/admin` yield `https://res.cloudinary.com/...` URLs.

- [ ] **4.2 Purge Inline Base64 Bloat from Products Table**
  - Replace the 3.7MB base64 image strings in `inveins_products` with hosted CDN image URLs.
  - Verify `GET /api/products` response payload drops below 100 KB.

- [ ] **4.3 Remove Relic SQLite File from Repository**
  - Remove `prisma/dev.db` from repository tracking.

---

## 5. NETWORK, SECURITY HEADERS & DOMAIN (P2 Sign-Off)

- [x] **5.1 Canonical Domain Redirect**
  - Verified: `https://inveins.in` redirects via HTTP 308 to `https://www.inveins.in/`.
- [x] **5.2 Security Headers Verified**
  - Strict-Transport-Security (`max-age=63072000; includeSubDomains; preload`).
  - X-Frame-Options (`DENY`).
  - X-Content-Type-Options (`nosniff`).
  - Content-Security-Policy configured for Cashfree, Supabase, and Cloudinary.
- [x] **5.3 Robots & Sitemaps Active**
  - `https://www.inveins.in/robots.txt` disallows `/admin` and `/api/*`.
  - `https://www.inveins.in/sitemap.xml` dynamically includes catalog routes.

---

## 6. FINAL LAUNCH AUTHORIZATION

| Role | Name | Status | Date |
| :--- | :--- | :--- | :--- |
| **Principal Security Auditor** | Antigravity AI | 🚫 **BLOCKED (Requires P0 Fixes)** | 2026-10-02 |
| **Lead Developer** | | [ ] Pending Environment Setup | |
| **Store Owner / Operator** | | [ ] Pending Live Payment Test | |
