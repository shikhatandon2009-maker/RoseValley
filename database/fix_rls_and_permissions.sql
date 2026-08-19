-- =============================================================================
-- LUXURY PERFUMES & ESSENTIAL OILS - RLS & PERMISSIONS FIX
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/dqqmlafioxmjhjpgaurg/sql)
-- Store ID: essential_oils_perfumes_store_01
-- =============================================================================

-- 1. DISABLE OR CONFIGURE ROW LEVEL SECURITY (RLS) FOR PUBLIC ACCESS
-- Enable RLS on all tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- 2. DROP PRE-EXISTING RESTRICTIVE POLICIES TO AVOID DUPLICATES
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'products', 'product_variants', 'categories', 'product_categories',
            'reviews', 'review_votes', 'product_questions', 'product_answers',
            'site_settings', 'homepage_sections', 'pages', 'site_themes',
            'currencies', 'exchange_rates', 'coupons', 'cart_items', 'wishlists',
            'orders', 'order_items', 'addresses', 'customer_inquiries', 'notification_logs', 'notifications'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public Read Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Select Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Insert Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Update Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Delete Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow All" ON %I;', tbl);
    END LOOP;
END $$;

-- 3. CREATE PERMISSIVE POLICIES FOR STORE FRONTEND (ANON & AUTHENTICATED)

-- PRODUCTS
CREATE POLICY "Public Read Policy" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON products FOR UPDATE TO anon, authenticated USING (true);

-- PRODUCT VARIANTS
CREATE POLICY "Public Read Policy" ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_variants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON product_variants FOR UPDATE TO anon, authenticated USING (true);

-- CATEGORIES
CREATE POLICY "Public Read Policy" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON categories FOR UPDATE TO anon, authenticated USING (true);

-- PRODUCT CATEGORIES JUNCTION
CREATE POLICY "Public Read Policy" ON product_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Delete Policy" ON product_categories FOR DELETE TO anon, authenticated USING (true);

-- REVIEWS & VOTES
CREATE POLICY "Public Read Policy" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON reviews FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON review_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON review_votes FOR INSERT TO anon, authenticated WITH CHECK (true);

-- PRODUCT QUESTIONS & ANSWERS
CREATE POLICY "Public Read Policy" ON product_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Read Policy" ON product_answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_answers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- SITE SETTINGS & THEMES & HOMEPAGE
CREATE POLICY "Public Read Policy" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Policy" ON site_settings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON site_themes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Policy" ON site_themes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON homepage_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON pages FOR SELECT TO anon, authenticated USING (true);

-- CURRENCIES & EXCHANGE RATES & COUPONS
CREATE POLICY "Public Read Policy" ON currencies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON exchange_rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON coupons FOR SELECT TO anon, authenticated USING (true);

-- CART & WISHLIST (Guest + User Operations)
CREATE POLICY "Public Read Policy" ON cart_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON cart_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON cart_items FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Delete Policy" ON cart_items FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON wishlists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Delete Policy" ON wishlists FOR DELETE TO anon, authenticated USING (true);

-- ORDERS & ORDER ITEMS & INQUIRIES
CREATE POLICY "Public Read Policy" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON orders FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON customer_inquiries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON customer_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON notification_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON notification_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON notifications FOR SELECT TO anon, authenticated USING (true);

-- 4. GRANT TABLE PERMISSIONS TO POSTGRES ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

SELECT 'RLS and Permissions successfully fixed! Public and store queries are now enabled.' as status;
