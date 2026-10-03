# INVEINS PRODUCTION AUDIT: FINDINGS REGISTRY

Permanent registry of all discovered defects, security vulnerabilities, performance bottlenecks, and architectural risks for `https://inveins.in` (`rocker2101/inveins`).

Status Lifecycle: `OPEN` → `FIXED` → `VERIFIED` (or `WAIVED`)

---

## FINDING-001

* **Category:** Payment & Orders
* **Severity:** P0 — CRITICAL
* **Status:** VERIFIED
* **Discovered:** 2026-10-03
* **Resolved:** 2026-10-03
* **Affected Component:** `src/app/api/orders/create/route.ts`, `src/lib/payment-security.ts`
* **Problem:** Order creation failed or lacked cryptographic HMAC-SHA256 verification tokens if `ORDER_SIGNING_SECRET` was improperly initialized.
* **Impact:** Checkout crash or order token forgery.
* **Fix:** Hardened `getOrderSigningSecret()` with fallback mechanism; ensured all created orders return valid HMAC tokens (`generateOrderToken`).
* **Verification:** Live test executed `POST /api/orders/create` with valid cart data. Endpoint returned HTTP 200 with 64-char hex HMAC token (`e688a173...`).
* **Regression Test:** `ORDER-001`
* **Regression Result:** PASS

---

## FINDING-002

* **Category:** Database Security & Customer Data Isolation
* **Severity:** P0 — CRITICAL
* **Status:** VERIFIED
* **Discovered:** 2026-10-03
* **Resolved:** 2026-10-03
* **Affected Component:** Supabase PostgreSQL Tables (`inveins_orders`, `inveins_wholesale_enquiries`), `supabase-rls.sql`
* **Problem:** Without strict Row-Level Security (RLS) policies, public anonymous Supabase keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) could query or manipulate customer order history and wholesale contact details.
* **Impact:** Critical customer PII data leak.
* **Fix:** Implemented strict RLS in `supabase-rls.sql`: revoked anon SELECT/INSERT on sensitive tables; routed all mutations via `supabaseAdmin` service role key on backend.
* **Verification:** Querying `inveins_orders` and `inveins_wholesale_enquiries` with anon key returned 0 rows (denied).
* **Regression Test:** `AUTHZ-003`
* **Regression Result:** PASS

---

## FINDING-003

* **Category:** Payment Webhooks & Order Integrity
* **Severity:** P0 — CRITICAL
* **Status:** VERIFIED
* **Discovered:** 2026-10-03
* **Resolved:** 2026-10-03
* **Affected Component:** `src/app/api/payment/cashfree-webhook/route.ts`, `inveins_checkout_drafts`
* **Problem:** Webhook payloads from payment gateway lacked order items. If order row did not exist or was updated blindly, item arrays were dropped, causing empty order records upon payment success.
* **Impact:** Customers charged without recorded purchased items.
* **Fix:** Implemented pre-payment checkout drafts in `inveins_checkout_drafts`. Webhook looks up pending draft to restore item array if order record was absent.
* **Verification:** Simulated webhook confirmed preservation of order line items during asynchronous gateway settlement.
* **Regression Test:** `WEBHOOK-002`
* **Regression Result:** PASS

---

## FINDING-004

* **Category:** Admin Security & Session Security
* **Severity:** P0 — CRITICAL
* **Status:** VERIFIED
* **Discovered:** 2026-10-03
* **Resolved:** 2026-10-03
* **Affected Component:** `src/app/api/admin/*`, `src/lib/admin-auth.ts`
* **Problem:** Admin API endpoints lacked timing-safe PIN verification, CSRF headers, and secure cookie validation.
* **Impact:** Potential brute-force attacks and unauthorized access to store backend.
* **Fix:** Implemented constant-time PIN comparison (`crypto.timingSafeEqual`), `HttpOnly`, `SameSite=Strict`, `Secure` cookie session token (`inveins_admin_token`), and Origin header CSRF validation.
* **Verification:** Live test confirmed `GET /api/orders/list`, `GET /api/admin/dashboard`, `GET /api/wholesale/list` reject unauthenticated requests with HTTP 401. Invalid PIN attempt rejected with HTTP 401.
* **Regression Test:** `ADMIN-001`
* **Regression Result:** PASS

---

## FINDING-005

* **Category:** Performance & Catalog Delivery
* **Severity:** P1 — HIGH
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `inveins_products` Supabase table, `GET /api/products`
* **Problem:** Catalog API payload was 3.8 MB (3,799,201 bytes) and took 106.08 seconds to download. All 9 product records contained raw inline Base64 JPEG data URLs (`data:image/jpeg;base64,...`) exceeding 1,500 lines each.
* **Impact:** Extreme client latency, browser tab freeze, mobile data exhaustion, and potential Vercel serverless function timeouts.
* **Fix:** Executed `scripts/sanitize_supabase_products.mjs` against Supabase database, replacing base64 strings with lightweight, official high-res CDN URLs.
* **Verification:** Live test confirmed `GET https://www.inveins.in/api/products` payload decreased from 3.8 MB to 10.2 KB (99.7% reduction) and download latency dropped from 106.08s to 2.6s.
* **Regression Test:** `PERF-001`
* **Regression Result:** PASS

---

## FINDING-006

* **Category:** Payment Webhooks & Gateway Security
* **Severity:** P1 — HIGH
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/app/api/payment/cashfree-webhook/route.ts`
* **Problem:** Signature verification was wrapped in `if (isCashfreeConfigured())`. If environment variables were unconfigured or missing in an environment, the handler failed open, processing webhooks without signature verification.
* **Impact:** Forged webhook attack vector in unconfigured gateway scenarios.
* **Fix:** Implemented fail-closed guard: if gateway is not configured, handler logs critical security event and returns HTTP 503 (`Payment gateway configuration missing`).
* **Verification:** Verified code path fails closed. Live test confirmed forged webhook signature returns HTTP 401; unsigned request returns HTTP 401.
* **Regression Test:** `WEBHOOK-001`
* **Regression Result:** PASS

---

## FINDING-007

* **Category:** Categories & Serverless Data Durability
* **Severity:** P2 — MEDIUM
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/lib/category-settings.ts`, `src/app/api/categories/route.ts`, `supabase-rls.sql`
* **Problem:** `saveCategories` wrote to `src/data/categories.json` via `fs.writeFileSync`. On Vercel serverless containers, the filesystem is read-only (`EROFS`), losing category customizations across container recycles.
* **Impact:** Admin modifications to homepage shop-by-category cards disappeared after deployment.
* **Fix:** Upgraded `src/lib/category-settings.ts` with hierarchical persistence: In-Memory Cache -> Supabase `inveins_categories` table -> Disk JSON -> Defaults. Added table schema and RLS policies to Section 8 of `supabase-rls.sql`.
* **Verification:** Code handles read-only FS gracefully; reads from Supabase database when available.
* **Regression Test:** `CAT-001`
* **Regression Result:** PASS

---

## FINDING-008

* **Category:** API Security & Rate Limiting
* **Severity:** P2 — MEDIUM
* **Status:** OPEN (Operational Roadmap)
* **Discovered:** 2026-10-04
* **Affected Component:** `src/lib/rate-limit.ts`
* **Problem:** In-memory sliding window rate limiting is local to each serverless container. In multi-container edge deployments, attackers can distribute requests across lambdas.
* **Impact:** Rate limit evasion under distributed bot attacks.
* **Fix Plan:** Migrate from in-memory map to `@upstash/ratelimit` with Redis backing.
* **Verification:** To be verified when Upstash Redis is provisioned.
* **Regression Test:** `SEC-004`
* **Regression Result:** PENDING

---

## FINDING-009

* **Category:** Payment Security
* **Severity:** P3 — LOW
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/lib/payment-security.ts`
* **Problem:** Parameter default in `verifyOrderToken` directly evaluated `process.env.ORDER_SIGNING_SECRET` rather than calling the centralized `getOrderSigningSecret()` helper.
* **Impact:** Potential secret mismatch if ephemeral fallbacks were relied upon.
* **Fix:** Updated default parameter to `secret: string = getOrderSigningSecret()`.
* **Verification:** Verified unit test order token generation and validation.
* **Regression Test:** `PAY-003`
* **Regression Result:** PASS

---

## FINDING-010

* **Category:** Frontend & Image Optimization
* **Severity:** P3 — LOW
* **Status:** OPEN (Cosmetic / Polish)
* **Discovered:** 2026-10-04
* **Affected Component:** `src/app/admin/page.tsx`
* **Problem:** Next.js build emits warnings for raw `<img>` tags in admin dashboard.
* **Impact:** Sub-optimal image rendering in admin panel only (no customer impact).
* **Fix Plan:** Replace raw `<img>` tags with Next.js `<Image />` component.
* **Regression Test:** `ADMIN-002`
* **Regression Result:** PENDING

---

## FINDING-011 (REDTEAM-001)

* **Category:** Payment & Authorization (BOLA)
* **Severity:** P1 — HIGH
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/app/api/payment/cashfree-verify/route.ts`
* **Problem:** In `POST /api/payment/cashfree-verify`, `verifyOrderToken(order_token)` extracted order data without checking that `parsedToken.id === cleanOrderId`. An attacker paying for order X could provide a signed token from order Y (having the same paid amount) to substitute customer details, items, and verification tokens.
* **Impact:** Cross-order item and metadata substitution during payment verification.
* **Fix:** Added strict binding assertion: if `parsedToken.id !== cleanOrderId`, logs `ORDER_TOKEN_ID_MISMATCH` and terminates with HTTP 400 (`Invalid order token for the requested order ID.`).
* **Verification:** Simulated mismatched token against order verification endpoint; verified rejection with HTTP 400.
* **Regression Test:** `PAY-004`
* **Regression Result:** PASS

---

## FINDING-012 (REDTEAM-002)

* **Category:** Performance & Asset Storage
* **Severity:** P1 — HIGH
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/app/api/admin/upload/route.ts`
* **Problem:** If Cloudinary CDN failed or credentials were unconfigured, the upload endpoint silently fell back to encoding up to 5MB binary images into multi-megabyte inline Base64 data URLs. This was the exact mechanism that originally caused the 3.8MB catalog bloat (FINDING-005).
* **Impact:** Inadvertent re-injection of multi-megabyte base64 strings into the database, causing 100+ second client latency.
* **Fix:** Enforced strict guard in production serverless: blocked generating Base64 strings larger than 50KB when Cloudinary fails or is unconfigured; returns HTTP 502/503 requiring valid Cloudinary CDN.
* **Verification:** Uploaded mock 100KB payload in serverless mode without Cloudinary; verified rejection with HTTP 503 instead of silent Base64 generation.
* **Regression Test:** `UPLOAD-001`
* **Regression Result:** PASS

---

## FINDING-013 (REDTEAM-003)

* **Category:** Session Security & Token Invalidation
* **Severity:** P2 — MEDIUM
* **Status:** OPEN (Operational Roadmap)
* **Discovered:** 2026-10-04
* **Affected Component:** `src/app/api/admin/logout/route.ts`, `src/lib/auth.ts`
* **Problem:** Admin session tokens are stateless HMAC tokens valid for 7 days. `POST /api/admin/logout` only clears the client-side cookie. If an attacker exfiltrates the session token, it remains usable until the 7-day TTL expires.
* **Impact:** Inability to immediately revoke compromised administrative sessions from the server side.
* **Fix Plan:** Implement distributed token revocation list (Redis/KV) or store an `admin_session_epoch` in Supabase store settings that invalidates all tokens issued prior to epoch.
* **Regression Test:** `AUTH-004`
* **Regression Result:** PENDING

---

## FINDING-014 (REDTEAM-004)

* **Category:** Input Validation & Resource Exhaustion (DoS)
* **Severity:** P2 — MEDIUM
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/app/api/orders/create/route.ts`
* **Problem:** `POST /api/orders/create` lacked an upper bound on `items` array length and customer shipping field lengths, and threw uncaught 500 exceptions on malformed JSON bodies.
* **Impact:** Denial-of-service via resource exhaustion (O(N) catalogue scans and database stock decrements); server error disclosure on invalid JSON.
* **Fix:** Capped `items.length` to max 50 items; added field length boundaries (`name <= 100`, `address <= 500`, `city <= 100`, `email <= 120`); caught JSON syntax errors with HTTP 400.
* **Verification:** Verified 51+ items and oversized address are rejected with HTTP 400; malformed JSON returns HTTP 400.
* **Regression Test:** `INPUT-004`
* **Regression Result:** PASS

---

## FINDING-015 (REDTEAM-005)

* **Category:** Authorization & Information Disclosure
* **Severity:** P2 — MEDIUM
* **Status:** VERIFIED
* **Discovered:** 2026-10-04
* **Resolved:** 2026-10-04
* **Affected Component:** `src/app/api/products/route.ts`
* **Problem:** `GET /api/products?all=true` permitted unauthenticated guest visitors to bypass the `is_active = true` filter and view unlisted, draft, or inactive catalog products.
* **Impact:** Enumeration and exposure of unlaunched or hidden product lines by competitors.
* **Fix:** Restricted `includeInactive` flag strictly to requests carrying a valid admin or staff session.
* **Verification:** Queried `GET /api/products?all=true` as an unauthenticated guest; verified inactive products are omitted.
* **Regression Test:** `PROD-001`
* **Regression Result:** PASS

