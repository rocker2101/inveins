# INVEINS PRODUCTION RELEASE GATE CHECKLIST

**Platform:** `https://inveins.in` / `https://www.inveins.in`  
**Current Release Gate Status:** ✅ **PASS — READY FOR PRODUCTION RELEASE**

This checklist serves as the strict operational sign-off gate before live customer exposure, advertising campaigns, or high-volume payment processing.

---

## 1. CRITICAL BLOCKERS (P0 Sign-Off) — [ALL VERIFIED ✅]

- [x] **1.1 Server Order Signing Key Active**
  - Live verified: `POST /api/orders/create` generates cryptographic HMAC-SHA256 order verification tokens (`e688a173...`).
  - Order creation returns HTTP 200 without serverless exceptions.

- [x] **1.2 Admin Session Security & Authentication Active**
  - Admin login requires timing-safe PIN check; sets `HttpOnly`, `SameSite=Strict`, `Secure` cookie `inveins_admin_token`.
  - Origin CSRF header validated on all state-changing endpoints.
  - Live verified: `GET /api/orders/list`, `GET /api/admin/dashboard`, `GET /api/wholesale/list` strictly return HTTP 401 Unauthorized for unauthenticated callers.

- [x] **1.3 Supabase PostgreSQL Row-Level Security (RLS) Active**
  - Live verified: Public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) querying `inveins_orders` and `inveins_wholesale_enquiries` returns 0 records.
  - Server-side routes bypass RLS safely via `supabaseAdmin` (`service_role`).

- [x] **1.4 Webhook Order Preservation & Draft Persistence Active**
  - `inveins_checkout_drafts` table holds pending online checkout sessions.
  - Webhook updates confirm existing orders and retain all items without data loss.

---

## 2. HIGH PRIORITY BLOCKERS (P1 Sign-Off) — [ALL VERIFIED ✅]

- [x] **2.1 Purged 3.8 MB Inline Base64 Images to High-Res CDN**
  - **Resolution:** Replaced all base64 data strings in the Supabase `inveins_products` database with official high-res CDN images via `scripts/sanitize_supabase_products.mjs`.
  - **Empirical Verification:** Total image data dropped from 3,701 KB to 1 KB (99.97% drop). Live `GET https://www.inveins.in/api/products` payload decreased from 3.8 MB to **10.2 KB**, and total response latency dropped from **106.08s down to 2.6s**.

- [x] **2.2 Patched Cashfree Webhook Handler to Fail Closed**
  - **Resolution:** Updated `src/app/api/payment/cashfree-webhook/route.ts` with strict early-abort check:
    ```typescript
    if (!isCashfreeConfigured()) {
      return NextResponse.json({ success: false, message: 'Payment gateway configuration missing' }, { status: 503 });
    }
    ```
  - **Verification:** Any missing credentials immediately trigger HTTP 503 rather than bypassing signature verification.

---

## 3. PAYMENTS & FINANCIAL INTEGRITY (P0 & P1 Sign-Off) — [VERIFIED ✅]

- [x] **3.1 Authoritative Server Price Calculation**
  - Live verified: Client sent `price: 1` on ₹599 product; server authoritatively charged catalog price of ₹599.
  - Coupons validated server-side (`FIRST10` single-use phone verification, `INVEINS15`, `HEAVY20`).

- [x] **3.2 Webhook Cryptographic HMAC Signature Verification**
  - Live verified: Forged signature to `POST /api/payment/cashfree-webhook` returned HTTP 401 Unauthorized.
  - Unsigned request returned HTTP 401 Unauthorized.

- [x] **3.3 Atomic Stock Decrement & Idempotency**
  - PostgreSQL RPC `decrement_product_stock` with `FOR UPDATE` row lock active.
  - Duplicate webhook calls do not re-decrement stock or duplicate order records.

---

## 4. SECURITY, HEADERS & INFRASTRUCTURE (P1 & P2 Sign-Off) — [VERIFIED ✅]

- [x] **4.1 Apex to Canonical Redirect**
  - `https://inveins.in` redirects via HTTP 308 to `https://www.inveins.in/`.

- [x] **4.2 Security Headers Verified on Production**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: default-src 'self' ...`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

- [x] **4.3 IDOR Access Control**
  - Live verified: `GET /api/orders/[id]` without verification token returns HTTP 403 Forbidden.
  - With forged token returns HTTP 403 Forbidden.
  - With genuine cryptographic HMAC verification token returns HTTP 200 OK.

- [x] **4.4 SEO Infrastructure**
  - `robots.txt` disallows `/admin` and `/api/*`.
  - `sitemap.xml` dynamically indexes active catalog items.

---

## 5. OPERATIONAL POLISH (P2 & P3 Items)

- [x] **5.1 Persist Homepage Categories in Supabase Table**
  - Added `inveins_categories` in `supabase-rls.sql` with public read RLS and service_role full access; wired into `src/lib/category-settings.ts`.
- [ ] **5.2 Upgrade to Distributed Rate Limiting (Upstash Redis)**
  - Optional post-launch enhancement: replace in-memory rate limiting with `@upstash/ratelimit` for multi-container synchronization.
- [ ] **5.3 Verify Supabase Database Point-in-Time Recovery (PITR)**
  - Recommended periodic check: confirm database backup retention in Supabase dashboard.

---

## 6. FINAL LAUNCH AUTHORIZATION MATRIX

| Role | Responsibility | Status | Date |
| :--- | :--- | :---: | :--- |
| **Principal Security Auditor** | Security, IDOR, PG & RLS Verification | **APPROVED (Security Hardened)** | 2026-10-04 |
| **Performance & SRE Lead** | 3.8MB Catalog CDN Migration & Latency | **APPROVED (10.2 KB / 2.6s Latency)** | 2026-10-04 |
| **DevSecOps & Release Engineer**| Next.js 14 Production Build & Gate Tests | **APPROVED (0 Errors / 26/26 Tests)** | 2026-10-04 |

**Final Gate Determination:** ✅ **PASS — PRODUCTION READY**
