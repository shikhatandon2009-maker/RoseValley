-- =============================================================================
-- MIGRATION SCRIPT FOR EXISTING TABLES (Safely adds store_id and missing columns)
-- Run this if you have existing tables (e.g. products) and do NOT want to drop them.
-- =============================================================================

ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS product_variants ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS wishlists ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS reviews ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS review_votes ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS product_questions ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS product_answers ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS use_text_logo BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS homepage_sections ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS pages ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS addresses ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS exchange_rates ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS password_resets ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS notification_logs ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS chat_logs ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
ALTER TABLE IF EXISTS chatbot_knowledge ADD COLUMN IF NOT EXISTS store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01';
