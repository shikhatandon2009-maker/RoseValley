-- =============================================================================
-- LUXURY ESSENTIAL OILS & PERFUMES E-COMMERCE PLATFORM
-- Weight-Based and Item-Based Taxable Shipping System Schema Migration
-- =============================================================================

-- 1. PRODUCTS TABLE
-- Add net weight, unit, gross weight (with +20% packaging buffer), item shipping cost, and free shipping flag
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS net_weight DECIMAL(10, 3) DEFAULT 0.000,
  ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(20) DEFAULT 'gm', -- 'gm', 'ml', 'kg', 'L'
  ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10, 3) DEFAULT 0.000, -- e.g. net_weight * 1.20
  ADD COLUMN IF NOT EXISTS item_shipping_cost DECIMAL(10, 2) DEFAULT 0.00, -- Optional flat shipping per item
  ADD COLUMN IF NOT EXISTS is_free_shipping BOOLEAN DEFAULT FALSE;

-- 2. PRODUCT VARIANTS TABLE
-- Add weight and item shipping cost columns to variants
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS net_weight DECIMAL(10, 3) DEFAULT 0.000,
  ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(20) DEFAULT 'gm',
  ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10, 3) DEFAULT 0.000,
  ADD COLUMN IF NOT EXISTS item_shipping_cost DECIMAL(10, 2) DEFAULT 0.00;

-- 3. ORDERS TABLE
-- Add shipping fee, shipping tax, total gross weight, and shipping method
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS shipping_tax DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_weight_grams DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50) DEFAULT 'standard';

-- 4. ORDER ITEMS TABLE
-- Record gross weight and item shipping cost at time of purchase
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS gross_weight DECIMAL(10, 3) DEFAULT 0.000,
  ADD COLUMN IF NOT EXISTS item_shipping_cost DECIMAL(10, 2) DEFAULT 0.00;

-- 5. UPDATE DEFAULT SITE SETTINGS WITH EXPANDED LOGISTICS PARAMETERS
UPDATE site_settings
SET shipping_rates = jsonb_build_object(
    'calculation_mode', 'hybrid',
    'standard', 150,
    'express', 300,
    'free_threshold', 2500,
    'weight_rate_per_kg', 100,
    'packaging_overhead_percent', 20,
    'min_shipping_fee', 100,
    'express_rate_per_kg', 180
)
WHERE shipping_rates IS NOT NULL AND (shipping_rates->>'weight_rate_per_kg') IS NULL;

-- 6. Backfill existing sample products if weights are missing
UPDATE products
SET 
  net_weight = 100.000,
  weight_unit = 'ml',
  gross_weight = 120.000,
  item_shipping_cost = 0.00
WHERE net_weight IS NULL OR net_weight = 0;
