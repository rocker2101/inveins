-- ==============================================================================
-- INVEINS FASHION: ENTERPRISE SUPABASE SECURITY & RLS HARDENING MIGRATION
-- Execute this entire script once in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- This blocks any unauthenticated or unauthorized direct access using the anon key.
ALTER TABLE IF EXISTS inveins_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inveins_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inveins_wholesale_enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure clean idempotent migration
DROP POLICY IF EXISTS "Allow public read access to active products" ON inveins_products;
DROP POLICY IF EXISTS "Allow service role full access to products" ON inveins_products;
DROP POLICY IF EXISTS "Allow service role full access to orders" ON inveins_orders;
DROP POLICY IF EXISTS "Deny direct anon access to orders" ON inveins_orders;
DROP POLICY IF EXISTS "Allow public read access to orders" ON inveins_orders;
DROP POLICY IF EXISTS "Allow public submission of wholesale enquiries" ON inveins_wholesale_enquiries;
DROP POLICY IF EXISTS "Deny public reading of wholesale enquiries" ON inveins_wholesale_enquiries;
DROP POLICY IF EXISTS "Allow service role full access to wholesale enquiries" ON inveins_wholesale_enquiries;

-- ==============================================================================
-- 2. PRODUCTS TABLE (inveins_products)
-- Customers can view active catalog items; only authorized backend/admin can modify.
-- ==============================================================================

-- Public can SELECT active products only
CREATE POLICY "Allow public read access to active products"
  ON inveins_products
  FOR SELECT
  USING (is_active = true);

-- Next.js API with service_role or authenticated admin can perform all operations
CREATE POLICY "Allow service role full access to products"
  ON inveins_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 3. ORDERS TABLE (inveins_orders)
-- Direct client access via anon key is COMPLETELY BLOCKED to protect Customer PII.
-- All operations are securely routed through Next.js server-side API routes.
-- Purge ANY existing legacy or GUI policies that might permit public read access:
-- ==============================================================================
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'inveins_orders' 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON inveins_orders', pol.policyname); 
    END LOOP; 
END $$;

ALTER TABLE IF EXISTS inveins_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inveins_orders FORCE ROW LEVEL SECURITY;

-- Allow service_role (and authenticated backend) full access
CREATE POLICY "Allow service role full access to orders"
  ON inveins_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 4. WHOLESALE ENQUIRIES TABLE (inveins_wholesale_enquiries)
-- Anyone can submit a B2B enquiry, but NO ONE can read or delete via public anon key.
-- ==============================================================================

-- Public can INSERT wholesale enquiries only
CREATE POLICY "Allow public submission of wholesale enquiries"
  ON inveins_wholesale_enquiries
  FOR INSERT
  WITH CHECK (true);

-- Service role has full access for admin dashboard querying and deletion
CREATE POLICY "Allow service role full access to wholesale enquiries"
  ON inveins_wholesale_enquiries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. ATOMIC INVENTORY DECREMENT RPC FUNCTION
-- Eliminates race conditions and negative overselling at the database level.
-- ==============================================================================
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id TEXT, qty INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  SELECT available_stock INTO current_stock
  FROM inveins_products
  WHERE id = product_id
  FOR UPDATE; -- Row-level lock to prevent concurrent race conditions

  IF current_stock IS NOT NULL AND current_stock >= qty THEN
    UPDATE inveins_products
    SET 
      available_stock = available_stock - qty,
      badge = CASE WHEN (available_stock - qty) <= 0 THEN 'SOLD OUT' ELSE badge END,
      updated_at = NOW()
    WHERE id = product_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. STORE SETTINGS TABLE (inveins_store_settings)
-- Manages delivery charges & free shipping thresholds persistently
-- ==============================================================================
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

DROP POLICY IF EXISTS "Allow public read access to store settings" ON inveins_store_settings;
CREATE POLICY "Allow public read access to store settings"
  ON inveins_store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access to store settings" ON inveins_store_settings;
CREATE POLICY "Allow service role full access to store settings"
  ON inveins_store_settings FOR ALL TO service_role USING (true);

-- ==============================================================================
-- 7. CHECKOUT DRAFTS TABLE (inveins_checkout_drafts)
-- Holds pending online payment sessions during Cashfree checkout.
-- When payment succeeds, the order is moved to inveins_orders.
-- Keeps inveins_orders 100% clean with ONLY COD and successful Paid orders!
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inveins_checkout_drafts (
  id TEXT PRIMARY KEY,
  customer JSONB,
  items JSONB,
  subtotal NUMERIC,
  discount NUMERIC,
  shipping_fee NUMERIC,
  grand_total NUMERIC,
  payment_method TEXT,
  status TEXT DEFAULT 'Payment Pending',
  tracking_number TEXT,
  verification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inveins_checkout_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny direct anon access to checkout drafts" ON inveins_checkout_drafts;
CREATE POLICY "Deny direct anon access to checkout drafts"
  ON inveins_checkout_drafts FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "Allow service role full access to checkout drafts" ON inveins_checkout_drafts;
CREATE POLICY "Allow service role full access to checkout drafts"
  ON inveins_checkout_drafts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. CATEGORIES TABLE (inveins_categories)
-- Manages homepage shop-by-category cards persistently
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inveins_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  desc_text TEXT,
  image TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inveins_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON inveins_categories;
CREATE POLICY "Allow public read access to categories"
  ON inveins_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access to categories" ON inveins_categories;
CREATE POLICY "Allow service role full access to categories"
  ON inveins_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. CONTACT ENQUIRIES TABLE (inveins_contact_enquiries)
-- Public can submit customer contact enquiries; only backend service_role can read
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inveins_contact_enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inveins_contact_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public submission of contact enquiries" ON inveins_contact_enquiries;
CREATE POLICY "Allow public submission of contact enquiries"
  ON inveins_contact_enquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Deny direct anon reading of contact enquiries" ON inveins_contact_enquiries;
CREATE POLICY "Deny direct anon reading of contact enquiries"
  ON inveins_contact_enquiries FOR SELECT TO anon USING (false);

-- ==============================================================================
-- 10. WHOLESALE PRODUCTS TABLE (inveins_wholesale_products)
-- Catalog for bulk B2B merchandise and factory manufacturing.
-- STRICTLY NO PRICE FIELD: Customers browse and request custom volume estimates.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inveins_wholesale_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Tees & Blanks',
  moq TEXT NOT NULL DEFAULT '50 Pieces',
  gsm TEXT,
  tagline TEXT,
  description TEXT,
  available_sizes TEXT[] DEFAULT ARRAY['S','M','L','XL','XXL'],
  customization_options TEXT[] DEFAULT ARRAY['DTF Printing','Embroidery','Screen Print','Blanks'],
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  badge TEXT DEFAULT 'BULK READY',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inveins_wholesale_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active wholesale products" ON inveins_wholesale_products;
CREATE POLICY "Allow public read access to active wholesale products"
  ON inveins_wholesale_products
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow service role full access to wholesale products" ON inveins_wholesale_products;
CREATE POLICY "Allow service role full access to wholesale products"
  ON inveins_wholesale_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);



