-- ==============================================================================
-- INVEINS FASHION: PROMO CODES / COUPONS TABLE MIGRATION
-- Execute this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Create inveins_coupons table
CREATE TABLE IF NOT EXISTS inveins_coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percent')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  min_order_value NUMERIC NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast status querying and sorting
CREATE INDEX IF NOT EXISTS idx_inveins_coupons_active ON inveins_coupons (is_active);
CREATE INDEX IF NOT EXISTS idx_inveins_coupons_created_at ON inveins_coupons (created_at DESC);

-- 2. Row Level Security (RLS)
ALTER TABLE inveins_coupons ENABLE ROW LEVEL SECURITY;

-- Block direct anon mutations (creates, updates, deletes) completely
DROP POLICY IF EXISTS "Deny public mutations on coupons" ON inveins_coupons;
CREATE POLICY "Deny public mutations on coupons"
  ON inveins_coupons FOR ALL TO anon USING (false);

-- Allow service_role (Next.js server-side API routes) full access
DROP POLICY IF EXISTS "Allow service role full access to coupons" ON inveins_coupons;
CREATE POLICY "Allow service role full access to coupons"
  ON inveins_coupons FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Idempotently Seed Legacy Promo Codes (FIRST10, INVEINS15, HEAVY20)
-- Preserves existing marketing coupons without overwriting customized values
INSERT INTO inveins_coupons (id, code, discount_type, discount_value, min_order_value, is_active)
VALUES
  ('coupon_first10', 'FIRST10', 'percent', 10, 0, true),
  ('coupon_inveins15', 'INVEINS15', 'percent', 15, 0, true),
  ('coupon_heavy20', 'HEAVY20', 'percent', 20, 0, true)
ON CONFLICT (code) DO NOTHING;
