# INVEINS.IN — NUCLEAR-LEVEL SECURITY & VULNERABILITY FINDINGS

**Target:** `https://inveins.in` / `rocker2101/inveins`  
**Classification:** ADVERSARIAL FINDINGS REGISTRY  
**Standard:** ZERO-TRUST / DEFENSE-IN-DEPTH / CONTINUOUS ASSURANCE  

---

### Finding ID: NUCLEAR-001
* **Severity:** High (CVSS 7.5 - High Integrity & Audit Risk)
* **Attack chain:** Intercepted Network Traffic / Stolen Log -> Valid Signature Header Replay -> Cashfree Webhook Ingestion -> Uncontrolled Order State Transition & Event Retriggering
* **Precondition:** Attacker captures or acquires a previously valid Cashfree webhook payload and its matching `x-webhook-signature` and `x-webhook-timestamp` headers.
* **Reproduction:**
  ```bash
  curl -X POST https://inveins.in/api/payment/cashfree-webhook \
    -H "content-type: application/json" \
    -H "x-webhook-signature: <captured_valid_sig>" \
    -H "x-webhook-timestamp: 1600000000" \
    -d '<captured_payload>'
  ```
* **Expected behavior:** The application must verify that the timestamp is fresh (within 15 minutes) and reject replayed webhook events even if the cryptographic signature is mathematically valid for that body.
* **Actual behavior (Prior to Fix):** Signature verification computed `HMAC_SHA256(timestamp + rawBody, secret)` correctly, but did not check `timestamp` against the current server time `Date.now()`. Past webhooks could be replayed at any time.
* **Impact:** Replayed payment webhooks could re-trigger processing logic, trigger duplicate notification hooks, or create reconciliation anomalies.
* **Evidence:** [`src/lib/cashfree.ts:174-188`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/cashfree.ts#L174-L188)
* **Root cause:** Missing anti-replay timestamp window validation in the webhook verification function.
* **Fix recommendation:** Check timestamp freshness: reject if older than 900 seconds (15 mins) or more than 300 seconds in the future.
* **Regression test:** Send a signature-valid webhook with timestamp set to `Date.now() - 1000 * 60 * 30` (30 minutes ago). Verify response is HTTP 400 (`Webhook timestamp out of acceptable drift window`).

---

### Finding ID: NUCLEAR-002
* **Severity:** High (CVSS 7.2 - High Availability & Financial Integrity Risk)
* **Attack chain:** Successful Customer Payment -> Double-Click Redirect + Concurrently Fired Cashfree Webhook -> Race Condition on Database Primary Key Insertion -> Customer Receives HTTP 500
* **Precondition:** Customer completes payment on Cashfree checkout. Browser fires verification request simultaneously while Cashfree backend pushes asynchronous webhook notification.
* **Reproduction:**
  Send two simultaneous POST requests to `/api/payment/cashfree-verify` with `{ "order_id": "INV-TEST-RACE" }` when the order does not yet exist in `inveins_orders`.
* **Expected behavior:** Both verification requests must handle the database write idempotently without throwing a 500 error or crashing the checkout confirmation page.
* **Actual behavior (Prior to Fix):** The handler executed:
  ```typescript
  const { data: existing } = await supabase.from('inveins_orders').select('*').eq('id', orderId).maybeSingle();
  if (!existing) {
    await supabase.from('inveins_orders').insert(finalOrderPayload);
  }
  ```
  Both threads saw `!existing`, causing the second thread to crash on `inveins_orders_pkey` primary key constraint violation.
* **Impact:** Paying customers experienced a fatal error page upon redirect from payment gateway, creating perceived loss of funds and abandoned cart confusion.
* **Evidence:** [`src/app/api/payment/cashfree-verify/route.ts:140-160`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/payment/cashfree-verify/route.ts#L140-L160)
* **Root cause:** Non-atomic read-then-insert pattern (TOCTOU).
* **Fix recommendation:** Replaced `.insert()` with `.upsert(finalOrderPayload, { onConflict: 'id' })`.
* **Regression test:** Parallel burst of 5 identical `/api/payment/cashfree-verify` requests for an uncommitted order ID. All 5 must return HTTP 200 with `{ verified: true }` and no 500 errors.

---

### Finding ID: NUCLEAR-003
* **Severity:** Medium (CVSS 6.5 - Inventory Integrity Discrepancy)
* **Attack chain:** Order Cancelled (Stock Restored) -> Admin Mistakenly/Deliberately Reactivates Order to `Confirmed` or `Processing` -> Stock is NOT re-decremented -> Ghost Inventory Created
* **Precondition:** Order exists in `Cancelled` or `Refunded` status. Admin changes status back to `Confirmed` or `Processing` via `/api/orders/update-status`.
* **Reproduction:**
  1. Create order for Product X (Initial Stock: 10 -> Decrements to 9).
  2. Admin marks order as `Cancelled` (Stock restored to 10).
  3. Admin updates order to `Confirmed`.
* **Expected behavior:** Stock must be re-decremented back to 9 to match active order fulfillment.
* **Actual behavior (Prior to Fix):** Handler only checked `if (newStatus === 'Cancelled' || newStatus === 'Refunded')` to restore stock, but had no branch to re-decrement stock if an order returned from a cancelled state.
* **Impact:** Physical inventory out-of-sync with warehouse stock; risk of overselling nonexistent units.
* **Evidence:** [`src/app/api/orders/update-status/route.ts:50-65`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/update-status/route.ts#L50-L65)
* **Root cause:** Asymmetric state machine inventory side-effects.
* **Fix recommendation:** Detect transition from `Cancelled`/`Refunded` to active status and invoke `inveins_decrement_stock_atomic`.
* **Regression test:** Transition order `Confirmed` -> `Cancelled` -> `Confirmed` and verify product stock reflects decremented value.

---

### Finding ID: NUCLEAR-004
* **Severity:** Medium (CVSS 5.3 - Store Operations & Business Logic Integrity)
* **Attack chain:** Admin Session Compromised / Misconfiguration -> Extreme or Negative Values Submitted for Shipping Fees -> Loss of Revenue or Unreasonable Charges
* **Precondition:** Access to `/api/settings` endpoint.
* **Reproduction:**
  ```bash
  curl -X POST https://inveins.in/api/settings \
    -H "cookie: inveins_admin_token=..." \
    -d '{"standardShippingFee": -500, "freeShippingThreshold": 99999999}'
  ```
* **Expected behavior:** Backend validation rejects negative values and extreme out-of-range figures with HTTP 400.
* **Actual behavior (Prior to Fix):** Settings parsed values using `parseFloat()` with no boundary or sanity checks, allowing negative shipping rates or exorbitant thresholds.
* **Impact:** Negative shipping charges reducing checkout total or extreme shipping fee disruption.
* **Evidence:** [`src/app/api/settings/route.ts:40-62`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/settings/route.ts#L40-L62)
* **Root cause:** Missing range validation schema on server-side settings updates.
* **Fix recommendation:** Assert `standardShippingFee >= 0 && <= 10000` and `freeShippingThreshold >= 0 && <= 100000`.
* **Regression test:** Send payload with `standardShippingFee: -1`. Verify response is HTTP 400 with descriptive error message.

---

### Finding ID: FINDING-001 (Previously Audited & Remediated)
* **Severity:** Critical (CVSS 9.1 - Direct IDOR Order Exposure)
* **Attack chain:** Attacker probes `/api/orders/[id]` with sequential or known UUIDs -> Extracts customer PII, addresses, and phone numbers.
* **Remediation:** Enforced HMAC SHA-256 order view token requirement (`?token=...`) on public lookup; unauthenticated requests without valid cryptographic signature receive HTTP 401.

---

### Finding ID: FINDING-002 (Previously Audited & Remediated)
* **Severity:** Critical (CVSS 8.9 - Pricing Tampering & Financial Loss)
* **Attack chain:** Attacker submits manipulated `{ items: [...], totalAmount: 1 }` payload to payment gateway order creation route.
* **Remediation:** Full server-side re-computation: catalog price, active coupon discounts, and shipping rules are fetched directly from PostgreSQL database. Client totals are strictly ignored.

---

### Finding ID: FINDING-003 (Previously Audited & Remediated)
* **Severity:** High (CVSS 8.1 - Inventory TOCTOU Race Condition)
* **Attack chain:** 20 concurrent requests for last remaining unit in stock -> Multiple checkouts succeed -> Overselling & negative inventory.
* **Remediation:** Implemented PostgreSQL stored procedure `inveins_decrement_stock_atomic` with explicit `SELECT ... FOR UPDATE` row-level locks.
