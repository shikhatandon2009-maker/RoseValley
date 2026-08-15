-- =============================================================================
-- MIGRATION: ADD OPTIONAL BUSINESS / COMPANY NAME TO ADDRESSES & ORDERS
-- Execute in Supabase SQL Editor:
-- =============================================================================

-- 1. Add company_name and gstin to addresses table (Customer Address Book)
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS gstin VARCHAR(50);

-- 2. Add company_name & business_name to orders table (Checkout & Invoicing)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gstin VARCHAR(50);
