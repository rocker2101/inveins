# INVEINS PRODUCTION AUDIT: TEST MATRIX

Permanent test matrix defining all empirical production-readiness test specifications, stable test IDs, expected results, live evidence, and regression requirements.

---

| Test ID | Category | Description | Expected Result | Actual Result | Status | Evidence | Last Run | Regression Req |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **DOM-001** | Routing & DNS | Apex domain (`inveins.in`) redirects to canonical domain | HTTP 308 redirect to `https://www.inveins.in/` | HTTP 308 Location: `https://www.inveins.in/` | **PASS** | `curl -I https://inveins.in` | 2026-10-04 | No |
| **SEC-001** | Security Headers | HSTS header configured for strict transport security | `max-age` >= 31536000, `includeSubDomains`, `preload` | `max-age=63072000; includeSubDomains; preload` | **PASS** | Response header inspection | 2026-10-04 | No |
| **SEC-002** | Security Headers | Clickjacking & MIME-sniffing protection headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` | Present and valid | **PASS** | Live HTTP response headers | 2026-10-04 | No |
| **SEC-003** | Security Headers | CSP, Referrer-Policy, Permissions-Policy | Restricts framing, script execution, sensitive browser APIs | Present and active | **PASS** | Live HTTP response headers | 2026-10-04 | No |
| **SEC-004** | API Security | Rate limiting on sensitive endpoints (`/api/orders/create`, `/api/contact`) | HTTP 429 after threshold | Enforced via in-memory sliding window; HTTP 429 returned | **PASS** | `scripts/production-audit-test.mjs` | 2026-10-04 | Yes (Multi-container) |
| **AUTH-001** | Admin Auth | Admin login with invalid PIN | Rejection with HTTP 401 Unauthorized | HTTP 401 `{"error":"Invalid PIN"}` | **PASS** | `POST /api/admin/login` test | 2026-10-04 | No |
| **AUTH-002** | Admin Auth | Admin timing-safe PIN check | Constant time comparison prevents timing attacks | Implemented via `crypto.timingSafeEqual` | **PASS** | Code inspection `src/lib/admin-auth.ts` | 2026-10-04 | No |
| **AUTH-003** | Admin Auth | Admin session cookie security flags | `HttpOnly`, `SameSite=Strict`, `Secure` | Cookie flags verified on response | **PASS** | Login response header inspection | 2026-10-04 | No |
| **AUTHZ-001** | Authorization | Unauthenticated request to `/api/orders/list` | HTTP 401 Unauthorized | HTTP 401 `{"error":"Unauthorized"}` | **PASS** | `scripts/production-audit-test.mjs` | 2026-10-04 | No |
| **AUTHZ-002** | Authorization | Unauthenticated request to `/api/admin/dashboard` | HTTP 401 Unauthorized | HTTP 401 `{"error":"Unauthorized"}` | **PASS** | `scripts/production-audit-test.mjs` | 2026-10-04 | No |
| **AUTHZ-003** | Authorization | Supabase RLS: Anon key querying `inveins_orders` | 0 rows returned (denied by policy) | 0 rows returned | **PASS** | Anonymous Supabase client query | 2026-10-04 | No |
| **AUTHZ-004** | Authorization | Supabase RLS: Anon key querying `inveins_wholesale_enquiries` | 0 rows returned (denied by policy) | 0 rows returned | **PASS** | Anonymous Supabase client query | 2026-10-04 | No |
| **IDOR-001** | Data Isolation | Accessing `/api/orders/[id]` without matching HMAC token | HTTP 403 or 404 Forbidden | HTTP 403/404 blocked access | **PASS** | `scripts/production-audit-test.mjs` | 2026-10-04 | No |
| **IDOR-002** | Data Isolation | Accessing `/api/orders/[id]` with valid HMAC token | HTTP 200 with order details | HTTP 200 with matching order data | **PASS** | HMAC token query parameter verification | 2026-10-04 | No |
| **PAY-001** | Payment Integrity | Client-submitted price tampering in checkout | Server charges authoritative catalog price | Server charged ₹599 when client submitted `price: 1` | **PASS** | Live order creation payload tampering test | 2026-10-04 | No |
| **PAY-002** | Payment Integrity | Server-side coupon validation (`FIRST10`, `INVEINS15`) | Server validates rules & single-use phone | Server verified discount calculation | **PASS** | `POST /api/orders/create` coupon check | 2026-10-04 | No |
| **PAY-003** | Payment Security | Cryptographic order token verification | Rejects forged or invalid tokens | Rejection verified with HMAC mismatch | **PASS** | `src/lib/payment-security.ts` test | 2026-10-04 | No |
| **WEBHOOK-001**| Webhook Security | Forged Cashfree webhook signature | HTTP 401 Unauthorized | HTTP 401 `{"message":"Invalid Cashfree webhook signature"}` | **PASS** | `POST /api/payment/cashfree-webhook` with fake signature | 2026-10-04 | No |
| **WEBHOOK-002**| Webhook Security | Unsigned Cashfree webhook request | HTTP 401 Unauthorized | HTTP 401 `{"message":"Invalid Cashfree webhook signature"}` | **PASS** | `POST /api/payment/cashfree-webhook` without headers | 2026-10-04 | No |
| **WEBHOOK-003**| Webhook Security | Webhook fail-closed on missing gateway config | HTTP 503 Service Unavailable | HTTP 503 `{"message":"Payment gateway configuration missing"}` | **PASS** | Code verification & simulation | 2026-10-04 | No |
| **WEBHOOK-004**| Order Integrity | Asynchronous webhook preserves line items | Order line items retained from checkout draft | Line items preserved without data loss | **PASS** | `inveins_checkout_drafts` draft restore flow | 2026-10-04 | No |
| **ORDER-001** | Order Integrity | Valid order creation returns HMAC token | HTTP 200 with 64-char hex order token | HTTP 200, token: `e688a173...` | **PASS** | Live API test | 2026-10-04 | No |
| **INPUT-001** | Input Validation | Honeypot field in wholesale submission | HTTP 400 Bad Request (Spambot trap) | HTTP 400 `{"error":"Spam detected"}` | **PASS** | `scripts/production-audit-test.mjs` | 2026-10-04 | No |
| **INPUT-002** | Input Validation | Invalid phone number in checkout | HTTP 400 Bad Request | HTTP 400 phone validation failure | **PASS** | `POST /api/orders/create` with `phone: "123"` | 2026-10-04 | No |
| **INPUT-003** | Input Validation | Invalid 6-digit Indian pincode in checkout | HTTP 400 Bad Request | HTTP 400 pincode validation failure | **PASS** | `POST /api/orders/create` with `pincode: "00000"` | 2026-10-04 | No |
| **PERF-001** | Performance | Catalog API payload size (`/api/products`) | Payload < 50 KB | 10,248 bytes (~10.2 KB) | **PASS** | `curl https://www.inveins.in/api/products` | 2026-10-04 | No |
| **PERF-002** | Performance | Catalog API response latency | Latency < 5.0 seconds | ~2.6 seconds | **PASS** | `curl -w "%{time_total}s"` live test | 2026-10-04 | No |
| **CAT-001** | Data Durability | Homepage category settings persistence | Survives serverless container recycle | Reads from Supabase `inveins_categories` with fallback | **PASS** | Code verification `src/lib/category-settings.ts` | 2026-10-04 | No |
| **SEO-001** | SEO | `robots.txt` disallows admin/API routes | HTTP 200, Disallow: `/admin`, `/api/*` | Valid `robots.txt` returned | **PASS** | `GET https://www.inveins.in/robots.txt` | 2026-10-04 | No |
| **SEO-002** | SEO | `sitemap.xml` dynamically generates catalog URLs | HTTP 200, XML format, canonical URLs | Valid XML with product paths | **PASS** | `GET https://www.inveins.in/sitemap.xml` | 2026-10-04 | No |
| **BUILD-001** | Build & Compilation | Next.js production build (`npm run build`) | Exit Code 0, 0 type errors, 0 lint errors | Exit Code 0, 23/23 routes compiled | **PASS** | `npm run build` execution | 2026-10-04 | No |
| **PAY-004** | Payment Security | Cross-order token ID substitution | Rejection with HTTP 400 Mismatch | HTTP 400 `Invalid order token for the requested order ID` | **PASS** | `POST /api/payment/cashfree-verify` with token for different order ID | 2026-10-04 | No |
| **UPLOAD-001** | Asset Storage | Large binary image upload (>50KB) in serverless without Cloudinary | Rejection with HTTP 502/503 | Rejected; Base64 silent fallback blocked | **PASS** | `POST /api/admin/upload` with unconfigured Cloudinary | 2026-10-04 | No |
| **INPUT-004** | Input Validation | Order creation with >50 items or malformed JSON | HTTP 400 Bad Request | HTTP 400 returned; unbounded loop prevented | **PASS** | `POST /api/orders/create` with 51 items & bad JSON | 2026-10-04 | No |
| **PROD-001** | Authorization | Unauthenticated guest query `GET /api/products?all=true` | Inactive products filtered out for guests | Only active products returned (`is_active = true`) | **PASS** | Unauthenticated `GET /api/products?all=true` | 2026-10-04 | No |
