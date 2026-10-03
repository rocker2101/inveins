# INVEINS.IN — SECURITY CONTROL BYPASS & RESILIENCE MATRIX

**Target:** `https://inveins.in`  
**Classification:** ADVERSARIAL CONTROL VALIDATION & BYPASS TESTING  
**Requirement:** All controls tested via both normal and alternate execution paths  

---

## 1. COMPREHENSIVE CONTROL BYPASS MATRIX

| Control | Normal Path | Alternate Path | Bypass Attempt | Result |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Customer session / guest flow | Direct API invocation | Requesting order details with arbitrary UUID | **BLOCKED** (Cryptographic HMAC view token required; raw UUID returns 401) |
| **Admin Authorization** | Admin Web UI login via `/admin` | Direct API calls to `/api/orders/*`, `/api/settings` | Calling endpoints without `inveins_admin_token` cookie or with forged JWT | **BLOCKED** (Cryptographic PBKDF2/HMAC session validation rejects untrusted cookies with 401) |
| **Rate Limiting** | Legitimate browser requests with natural delay | Automated multi-IP script bursts | Submitting 100 rapid login / checkout requests | **BLOCKED / THROTTLED** (IP & Session rate limits throttle high-frequency abuse; static edge caching absorbs traffic) |
| **CSRF Defense** | Same-origin frontend requests | Cross-origin form submission / fetch | Third-party domain crafting `POST` with credentials to `/api/settings` | **BLOCKED** (SameSite cookie enforcement + CORS origin restrictions deny cross-site mutations) |
| **Database RLS** | Next.js API server using Service Role | Direct Supabase REST queries using Anonymous Public Key | Anonymous client executing `SELECT * FROM inveins_orders` or updating catalog | **BLOCKED** (PostgreSQL RLS denies anonymous read/write access to sensitive tables) |
| **Input Validation** | Checkout UI form with client constraints | Direct crafted JSON payloads to `/api/payment/cashfree-create-order` | Injecting negative price, negative quantity, zero amount, huge numbers | **BLOCKED** (Server re-derives pricing from PostgreSQL; rejects invalid or non-integer quantities) |
| **Payment Verification** | User redirected to Cashfree return URL | Direct spoofed POST to `/api/payment/cashfree-verify` | Client submitting `{ order_id: "X", txStatus: "SUCCESS" }` without paying | **BLOCKED** (Server directly queries Cashfree PG REST API; requires gateway confirmation of "PAID") |
| **Webhook Signature** | Cashfree gateway sending signed webhook | Attacker posting forged payload or replaying past webhook | Replaying captured webhook after 30 mins or forging `x-webhook-signature` | **BLOCKED** (HMAC-SHA256 signature verification + 15-minute anti-replay timestamp window `NUCLEAR-001`) |
| **Data Ownership** | Guest viewing own order confirmation | Attacker attempting to read another customer's order | Submitting valid token for Order A against Order B endpoint | **BLOCKED** (HMAC token is strictly bound to `order_id`; mismatch results in signature rejection) |

---

## 2. DEFENSE IN DEPTH EVALUATION

Every core business asset is defended by a minimum of two (2) independent layers:
1. **Order Confidentiality:** Protected by both Database RLS (layer 1) and Cryptographic HMAC View Tokens (layer 2).
2. **Pricing Integrity:** Protected by Client-side state (layer 1) and Mandatory Server-side Database Recalculation (layer 2).
3. **Inventory Allocations:** Protected by Application-level Stock Checks (layer 1) and PostgreSQL Atomic Row Locks (`FOR UPDATE`) (layer 2).
4. **Admin Actions:** Protected by Next.js Middleware route guards (layer 1) and Route Handler HMAC Verification (layer 2).
