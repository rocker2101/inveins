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
DROP POLICY IF EXISTS "Deny direct anon access to orders" ON inveins_orders;
DROP POLICY IF EXISTS "Allow public submission of wholesale enquiries" ON inveins_wholesale_enquiries;
DROP POLICY IF EXISTS "Deny public reading of wholesale enquiries" ON inveins_wholesale_enquiries;

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
-- ==============================================================================

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
