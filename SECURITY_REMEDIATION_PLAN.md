# SECURITY REMEDIATION PLAN: INVEINS.IN

This document provides exact technical remediation instructions, code diffs, configuration commands, and verification procedures to resolve all findings identified during the Final Production Release Gate Audit.

---

## 1. P0-01 & P0-04: CONFIGURE HOSTING SECRETS IN VERCEL

### Problem:
Missing `ORDER_SIGNING_SECRET`, `ADMIN_SESSION_SECRET`, and `ADMIN_PIN` in production causes uncaught exceptions during checkout (`/api/orders/create`) and locks administrators out of the admin panel (`/api/admin/login`).

### Step-by-Step Remediation:

1. Generate strong cryptographic keys using Node.js:
   ```bash
   node -e "console.log('ORDER_SIGNING_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   node -e "console.log('ADMIN_SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Choose a strong, non-guessable administrative PIN (e.g., 14 characters alphanumeric):
   ```text
   ADMIN_PIN=InVe1ns#Kanpur2026!
   ```

3. In your Vercel Dashboard:
   - Navigate to **Project Settings** -> **Environment Variables**.
   - Add the following variables for **Production** and **Preview**:
     - `ORDER_SIGNING_SECRET`: `<64-hex-characters>`
     - `ADMIN_SESSION_SECRET`: `<64-hex-characters>`
     - `ADMIN_PIN`: `<your-admin-pin>`

4. Trigger a production redeployment on Vercel so the runtime picks up the new environment variables.

### Verification Procedure:
Run curl against production to verify checkout no longer throws HTTP 500:
```bash
curl.exe -s -X POST https://www.inveins.in/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"Verification","phone":"9876543210","address":"Civil Lines","city":"Kanpur","pincode":"208001"},"items":[{"productId":"rakshak-heavyweight-tshirt-996","selectedSize":"M","quantity":1}],"paymentMethod":"cod"}'
```
Expected output: HTTP 200 OK with `{"success":true,"message":"COD order confirmed and recorded successfully."}`.

---

## 2. P0-02: CONFIGURE SUPABASE SERVICE ROLE KEY

### Problem:
Under PostgreSQL Row-Level Security, direct anonymous client access to `inveins_orders` is blocked. Because `SUPABASE_SERVICE_ROLE_KEY` is missing, `supabaseAdmin` uses the unprivileged `anon` key, causing all server-side database writes to fail with error `42501 (insufficient privilege)`.

### Step-by-Step Remediation:

1. Open [Supabase Dashboard](https://supabase.com/dashboard).
2. Select the `inveins` project (`jpbotzytaekgvewyxljl`).
3. Navigate to **Project Settings** -> **API**.
4. Under **Project API keys**, locate the `service_role` key (labelled *"Secret, reveals all data"*).
5. Copy the JWT token.
6. In Vercel Project Settings -> **Environment Variables**, add:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `<your-service-role-jwt-token>`
   - Target: Production, Preview

### Verification Procedure:
Check that server-side order insertion succeeds and queries to `inveins_orders` execute without RLS rejection.

---

## 3. P0-03: WEBHOOK ORDER ITEM PRESERVATION (AVOID `items: []`)

### Problem:
In [`src/app/api/payment/cashfree-webhook/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/payment/cashfree-webhook/route.ts#L130), when an order was not previously persisted to Supabase and in-memory cache is empty, fallback reconstruction inserts `items: []`, discarding customer purchase data.

### Code Patch in [`src/app/api/orders/create/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/orders/create/route.ts):

Ensure online pending orders are reliably stored in Supabase with explicit error logging before initiating the payment gateway:

```typescript
// Replace lines 262-274 of src/app/api/orders/create/route.ts with:
const onlineOrderPayload = {
  ...orderPayload,
  status: 'Payment Pending',
  payment_method: 'cashfree_upi',
};

const { error: preSaveError } = await supabaseAdmin
  .from('inveins_orders')
  .upsert(onlineOrderPayload);

if (preSaveError) {
  console.error('[CRITICAL] Failed to persist pending order in Supabase:', preSaveError);
  // Continue cautiously but log security event
}
```

In [`src/app/api/payment/cashfree-webhook/route.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/app/api/payment/cashfree-webhook/route.ts):
Ensure the webhook handler queries Supabase by `orderId` and updates status to `'Confirmed'` without ever wiping `items`.

---

## 4. P1-01: MIGRATE INLINE BASE64 IMAGES TO CLOUDINARY CDN

### Problem:
`inveins_products` contains 3.7MB of raw Base64 JPEG data strings. This bloats every catalog API call to 3.71 MB, causing extreme bandwidth waste and risking serverless payload crashes.

### Step-by-Step Remediation:

1. Obtain Cloudinary credentials from [Cloudinary Console](https://cloudinary.com/console).
2. Set the following in Vercel Environment Variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Update `inveins_products` database rows to replace `data:image/jpeg;base64,...` strings with Cloudinary image URLs (`https://res.cloudinary.com/...`).
4. Re-test `GET /api/products`:
   ```bash
   curl.exe -s -w "\nSize: %{size_download} bytes\n" https://www.inveins.in/api/products -o nul
   ```
   Confirm download size drops from 3.7MB to under 100 KB.

---

## 5. P1-02: ATOMIC INVENTORY DECREMENT USING POSTGRESQL RPC

### Problem:
`decrementOrderStock` in `src/lib/payment-security.ts` uses non-atomic `select` followed by `update`, allowing overselling when concurrent checkouts happen.

### Code Patch in [`src/lib/payment-security.ts`](file:///c:/Users/ritik/OneDrive/Documents/Cothesis/src/lib/payment-security.ts):

Update `decrementOrderStock` to invoke the stored procedure `decrement_product_stock`:

```typescript
export async function decrementOrderStock(items: any): Promise<void> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const rawItems = typeof items === 'string' ? JSON.parse(items) : items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    for (const item of rawItems) {
      const prodId = item?.product?.id;
      const qty = Math.max(1, Number(item?.quantity) || 1);
      if (!prodId) continue;

      // Invoke atomic stored procedure with row-level locking (FOR UPDATE)
      const { data: success, error: rpcErr } = await supabaseAdmin.rpc('decrement_product_stock', {
        product_id: prodId,
        qty: qty,
      });

      if (rpcErr) {
        console.warn(`[STOCK DECREMENT RPC ERROR for ${prodId}]:`, rpcErr.message);
      }
    }
  } catch (stockErr) {
    console.warn('[STOCK DECREMENT NOTICE]', stockErr);
  }
}
```

---

## 6. P1-03: PERSISTENT DISTRIBUTED RATE LIMITING

### Problem:
Local JavaScript `Map` resets upon container cold starts and can be flushed by flooding keys.

### Remediation:
1. Create a free Redis instance on [Upstash](https://upstash.com).
2. Install `@upstash/ratelimit` and `@upstash/redis`:
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
3. Initialize the rate limiter with sliding window:
   ```typescript
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, "15 m"),
   });
   ```
4. Bind this to `/api/admin/login` and `/api/orders/create`.

---

## 7. P2-01: STORE SHIPPING SETTINGS IN SUPABASE

### Problem:
`src/lib/store-settings.ts` writes to `src/data/settings.json`, which fails with `EROFS: read-only file system` on Vercel.

### Remediation:
Create an `inveins_store_settings` table in Supabase:
```sql
CREATE TABLE IF NOT EXISTS inveins_store_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  standard_shipping_fee NUMERIC NOT NULL DEFAULT 70,
  free_shipping_threshold NUMERIC NOT NULL DEFAULT 999,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO inveins_store_settings (id, standard_shipping_fee, free_shipping_threshold)
VALUES ('global', 70, 999)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE inveins_store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to store settings"
  ON inveins_store_settings FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to store settings"
  ON inveins_store_settings FOR ALL TO service_role USING (true);
```
Update `src/lib/store-settings.ts` to read and write from `inveins_store_settings` via `supabaseAdmin`.

---

## 8. REMEDIATION TIMELINE & VERIFICATION SUMMARY

| Phase | Finding IDs | Estimated Time | Verifier Action |
| :--- | :--- | :--- | :--- |
| **Phase 1 (Immediate Blockers)** | P0-01, P0-02, P0-04 | 15 minutes | Add 4 environment variables to Vercel and redeploy |
| **Phase 2 (Data Integrity)** | P0-03, P1-02 | 30 minutes | Apply atomic RPC patch and pending order persistence |
| **Phase 3 (Performance & CDN)**| P1-01, P2-04 | 45 minutes | Configure Cloudinary and sanitize catalog base64 images |
| **Phase 4 (Abuse & Storage)** | P1-03, P1-05, P2-01 | 1-2 hours | Integrate Upstash rate limiting and Supabase settings table |

Once Phase 1 and Phase 2 are deployed and validated with a live test transaction, the platform may transition from **BLOCKED** to **GO FOR RELEASE**.
