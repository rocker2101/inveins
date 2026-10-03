# INVEINS PRODUCTION AUDIT: REGRESSION TESTS SUITE

Every serious defect or vulnerability identified during the production readiness audit is registered here as a permanent regression test.

---

## 1. AUTOMATED TEST SUITE RUNNER

The automated regression test suite is maintained in [`scripts/production-audit-test.mjs`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/scripts/production-audit-test.mjs) and can be executed anytime against any environment:

```bash
# Execute against live production
node scripts/production-audit-test.mjs

# Or against local dev server
TARGET_URL=http://localhost:3000 node scripts/production-audit-test.mjs
```

---

## 2. REGRESSION TEST DEFINITIONS

### REG-001: Order Creation Cryptographic Signing (FINDING-001)
* **Test ID:** `ORDER-001`
* **Trigger:** `POST /api/orders/create` with valid order items, customer phone, and shipping details.
* **Expected Result:** HTTP 200 with non-empty order ID and valid 64-char HMAC-SHA256 verification token.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-002: Supabase RLS Public Lockdown (FINDING-002)
* **Test ID:** `AUTHZ-003` & `AUTHZ-004`
* **Trigger:** Query `inveins_orders` and `inveins_wholesale_enquiries` using `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* **Expected Result:** 0 rows returned (SELECT denied by Row-Level Security policy).
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-003: Webhook Draft Item Restoration (FINDING-003)
* **Test ID:** `WEBHOOK-004`
* **Trigger:** Process asynchronous payment confirmation webhook for a draft checkout order.
* **Expected Result:** Order line items are preserved and populated from `inveins_checkout_drafts`.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-004: Admin Endpoint Authentication & Timing-Safe PIN (FINDING-004)
* **Test ID:** `AUTH-001`, `AUTH-002`, `AUTHZ-001`, `AUTHZ-002`
* **Trigger:** Attempt unauthenticated calls to `/api/orders/list`, `/api/admin/dashboard`, `/api/wholesale/list` and invalid PIN to `/api/admin/login`.
* **Expected Result:** HTTP 401 Unauthorized across all calls; timing attack resistance via `crypto.timingSafeEqual`.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-005: Catalog API Payload Size & Latency Gate (FINDING-005)
* **Test ID:** `PERF-001` & `PERF-002`
* **Trigger:** Execute `GET /api/products` and measure downloaded bytes and total elapsed time.
* **Expected Result:** Payload size < 50 KB (must not contain inline base64 blobs); response latency < 5.0 seconds.
* **Current Status:** **PASS** (10,248 bytes, ~2.6s)
* **Last Verified:** 2026-10-04

---

### REG-006: Webhook Fail-Closed Enforcement (FINDING-006)
* **Test ID:** `WEBHOOK-001`, `WEBHOOK-002`, `WEBHOOK-003`
* **Trigger:** Call `POST /api/payment/cashfree-webhook` with forged signature, no signature, and simulate unconfigured gateway credentials.
* **Expected Result:** Forged or unsigned calls return HTTP 401; unconfigured gateway returns HTTP 503. Never falls through to execute webhook payload.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-007: Category Persistence Resilience (FINDING-007)
* **Test ID:** `CAT-001`
* **Trigger:** Call `getCategories()` and `saveCategories()` in serverless environment with read-only filesystem.
* **Expected Result:** Does not throw `EROFS`; synchronizes with Supabase table or in-memory fallback.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-008: IDOR Customer Order Protection
* **Test ID:** `IDOR-001`
* **Trigger:** Attempt to access `/api/orders/[id]` without providing the matching HMAC token.
* **Expected Result:** HTTP 403 or 404 Forbidden.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-009: Authoritative Pricing & Coupon Validation (PAY-001, PAY-002)
* **Test ID:** `PAY-001`, `PAY-002`
* **Trigger:** Submit checkout order payload with client-tampered price (`price: 1`).
* **Expected Result:** Server rejects client price and charges authoritative database price of ₹599.
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04

---

### REG-010: Form Spambot Honeypot Trap (INPUT-001)
* **Test ID:** `INPUT-001`
* **Trigger:** Submit wholesale enquiry form with hidden honeypot field filled.
* **Expected Result:** HTTP 400 Bad Request (`{"error":"Spam detected"}`).
* **Current Status:** **PASS**
* **Last Verified:** 2026-10-04
