-- ==============================================================================
-- INVEINS FASHION: RAZORPAY PAYMENT & ORDER HARDENING MIGRATION
-- Run this in your Supabase Project -> SQL Editor
-- Non-destructive: Uses IF NOT EXISTS to preserve all existing tables and data.
-- ==============================================================================

-- 1. ADD DEDICATED PAYMENT & CORRELATION COLUMNS TO inveins_orders
ALTER TABLE IF EXISTS inveins_orders 
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. CREATE FAST LOOKUP INDEXES FOR WEBHOOKS & VERIFICATION
CREATE INDEX IF NOT EXISTS idx_inveins_orders_payment_id 
  ON inveins_orders (payment_id);

CREATE INDEX IF NOT EXISTS idx_inveins_orders_razorpay_order_id 
  ON inveins_orders (razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_inveins_orders_status 
  ON inveins_orders (status);

CREATE INDEX IF NOT EXISTS idx_inveins_orders_created_at 
  ON inveins_orders (created_at DESC);

-- 3. ENSURE ATOMIC INVENTORY DECREMENT RPC STORED PROCEDURE EXISTS
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id TEXT, qty INT)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INT;
BEGIN
  -- Row-level lock to prevent concurrent checkout overselling race conditions
  SELECT available_stock INTO current_stock
  FROM inveins_products
  WHERE id = product_id
  FOR UPDATE;

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
