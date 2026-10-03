# INVEINS PRODUCTION AUDIT: FIX LOG

Permanent engineering ledger of all architectural fixes, security patches, and optimizations made to `rocker2101/inveins`.

---

## FIX-001: Cryptographic Order Verification Token Initialization
* **Date:** 2026-10-03
* **Finding ID:** `FINDING-001` (P0)
* **Files Changed:** `src/app/api/orders/create/route.ts`, `src/lib/payment-security.ts`
* **Reason:** Orders created without valid HMAC verification tokens were prone to checkout failure or IDOR order inspection.
* **Change Made:** Hardened `getOrderSigningSecret()` and token generation logic to ensure all created orders receive an HMAC-SHA256 token.
* **Risk:** Low (preserves existing order structure while enhancing security).
* **Tests Run:** `ORDER-001`, `PAY-003`
* **Regression Result:** PASS

---

## FIX-002: Supabase PostgreSQL Row-Level Security Enforcement
* **Date:** 2026-10-03
* **Finding ID:** `FINDING-002` (P0)
* **Files Changed:** `supabase-rls.sql`
* **Reason:** Anonymous client key could read customer order data directly from Supabase tables without authentication.
* **Change Made:** Revoked anon SELECT/INSERT permissions on `inveins_orders` and `inveins_wholesale_enquiries`; enforced all database operations through `service_role` on server routes.
* **Risk:** Medium (could lock out unauthenticated legitimate operations if not routed through server APIs).
* **Tests Run:** `AUTHZ-003`, `AUTHZ-004`
* **Regression Result:** PASS

---

## FIX-003: Pre-Payment Checkout Drafts for Webhook Preservation
* **Date:** 2026-10-03
* **Finding ID:** `FINDING-003` (P0)
* **Files Changed:** `src/app/api/payment/cashfree-webhook/route.ts`, `supabase-rls.sql`
* **Reason:** Asynchronous webhook callbacks did not include item arrays, risking order data corruption if orders were updated before creation completed.
* **Change Made:** Created `inveins_checkout_drafts` table to store order items prior to gateway redirection. Webhook checks drafts to restore line items upon payment success.
* **Risk:** Low.
* **Tests Run:** `WEBHOOK-004`
* **Regression Result:** PASS

---

## FIX-004: Timing-Safe Admin PIN & Cookie Session Security
* **Date:** 2026-10-03
* **Finding ID:** `FINDING-004` (P0)
* **Files Changed:** `src/lib/admin-auth.ts`, `src/app/api/admin/*`
* **Reason:** Prevent brute-force timing attacks and unauthenticated access to store management endpoints.
* **Change Made:** Implemented constant-time PIN comparison using `crypto.timingSafeEqual`, added CSRF Origin header verification, and secured cookies with `HttpOnly`, `SameSite=Strict`, `Secure`.
* **Risk:** Low.
* **Tests Run:** `AUTH-001`, `AUTH-002`, `AUTH-003`, `AUTHZ-001`, `AUTHZ-002`
* **Regression Result:** PASS

---

## FIX-005: Purge Inline Base64 Images from Supabase Product Database
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-005` (P1)
* **Files Changed:** Supabase `inveins_products` database table via `scripts/sanitize_supabase_products.mjs`
* **Reason:** Catalog API payload was 3.8 MB and took 106.08 seconds to download due to massive inline base64 JPEG strings in database rows.
* **Change Made:** Sanitized all 9 products in Supabase, replacing inline base64 strings with lightweight high-resolution CDN URLs (`https://5.imimg.com/...`).
* **Risk:** Low (images are verified public high-res CDN assets).
* **Tests Run:** `PERF-001`, `PERF-002`
* **Regression Result:** PASS (Payload: 3.8 MB -> 10.2 KB; Latency: 106.08s -> 2.6s)

---

## FIX-006: Cashfree Webhook Fail-Closed Guard
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-006` (P1)
* **Files Changed:** `src/app/api/payment/cashfree-webhook/route.ts`
* **Reason:** If gateway environment variables were missing or malformed, the handler skipped signature verification instead of failing safely.
* **Change Made:** Added early-abort check: if `!isCashfreeConfigured()`, log critical security event and return HTTP 503 (`Payment gateway configuration missing`).
* **Risk:** Low.
* **Tests Run:** `WEBHOOK-001`, `WEBHOOK-002`, `WEBHOOK-003`
* **Regression Result:** PASS

---

## FIX-007: Resilient Category Storage & Supabase Schema Sync
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-007` (P2)
* **Files Changed:** `src/lib/category-settings.ts`, `supabase-rls.sql`
* **Reason:** Serverless container filesystem on Vercel is read-only (`EROFS`), losing category edits on container recycles.
* **Change Made:** Added hierarchical persistence pattern (`In-Memory -> Supabase inveins_categories -> Disk JSON -> Defaults`). Added table definition and RLS policies to `supabase-rls.sql`.
* **Risk:** Low.
* **Tests Run:** `CAT-001`
* **Regression Result:** PASS

---

## FIX-008: Aligned Payment Security Secret Default
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-009` (P3)
* **Files Changed:** `src/lib/payment-security.ts`
* **Reason:** `verifyOrderToken` parameter fallback directly checked `process.env.ORDER_SIGNING_SECRET` rather than calling the centralized helper function `getOrderSigningSecret()`.
* **Change Made:** Updated parameter default to `secret: string = getOrderSigningSecret()`.
* **Risk:** Very low.
* **Tests Run:** `PAY-003`
* **Regression Result:** PASS

---

## FIX-009: Strict Order ID Binding in Cashfree Payment Verification
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-011` (P1)
* **Files Changed:** `src/app/api/payment/cashfree-verify/route.ts`
* **Reason:** Attacker could pass a valid `order_token` from another order having the same amount to substitute customer details and items.
* **Change Made:** Added assertion `if (parsedToken.id !== cleanOrderId)` returning HTTP 400 and logging security event.
* **Risk:** Low.
* **Tests Run:** `PAY-004`
* **Regression Result:** PASS

---

## FIX-010: Block Silent Base64 Catalog Bloat on Serverless Upload
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-012` (P1)
* **Files Changed:** `src/app/api/admin/upload/route.ts`
* **Reason:** In serverless mode without Cloudinary, uploads silently generated multi-megabyte Base64 strings that poisoned the database.
* **Change Made:** Blocked generating inline Base64 strings >50KB in serverless mode; returns HTTP 502/503 requiring Cloudinary.
* **Risk:** Low.
* **Tests Run:** `UPLOAD-001`
* **Regression Result:** PASS

---

## FIX-011: Enforce Input Length Boundaries and Safe JSON Parsing on Orders
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-014` (P2)
* **Files Changed:** `src/app/api/orders/create/route.ts`
* **Reason:** Prevent denial of service via unbounded `items` arrays, oversized customer string payloads, and 500 exceptions on invalid JSON.
* **Change Made:** Capped `items.length <= 50`, added string length bounds, and wrapped `req.json()` with safe HTTP 400 return.
* **Risk:** Low.
* **Tests Run:** `INPUT-004`
* **Regression Result:** PASS

---

## FIX-012: Restrict Inactive Product Enumeration
* **Date:** 2026-10-04
* **Finding ID:** `FINDING-015` (P2)
* **Files Changed:** `src/app/api/products/route.ts`
* **Reason:** Any unauthenticated guest could pass `?all=true` and see unlaunched/draft products.
* **Change Made:** Evaluated `getSessionFromRequest(req)` and required `isAdmin` to honor `includeInactive`.
* **Risk:** Low.
* **Tests Run:** `PROD-001`
* **Regression Result:** PASS

---

## FIX-013: Add Contact Enquiries Schema & RLS Lockdown
* **Date:** 2026-10-04
* **Finding ID:** `None (Hardening)`
* **Files Changed:** `supabase-rls.sql`
* **Reason:** Ensure `inveins_contact_enquiries` is protected by Row-Level Security if created in Supabase.
* **Change Made:** Added Section 9 to `supabase-rls.sql` with public INSERT and denied anon SELECT.
* **Risk:** Low.
* **Tests Run:** `BUILD-001`
* **Regression Result:** PASS

