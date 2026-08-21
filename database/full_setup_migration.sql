-- =============================================================================
-- COMPLETE SUPABASE INITIALIZATION & MIGRATION SCRIPT
-- STORE: Maison De L'Essence - Luxury Perfumes & Essential Oils
-- Store ID: essential_oils_perfumes_store_01
-- =============================================================================

-- Step 0: Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    phone VARCHAR(50),
    avatar_url TEXT,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_user_email UNIQUE (store_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_store_email ON users(store_id, email);
CREATE INDEX IF NOT EXISTS idx_users_store_role ON users(store_id, role);

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_category_slug UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_store_slug ON categories(store_id, slug);

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    compare_at_price DECIMAL(12,2),
    stock INT NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    scent_notes JSONB DEFAULT '{"top": [], "heart": [], "base": []}'::jsonb,
    ingredients JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    meta_title VARCHAR(255),
    meta_keywords TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_product_slug UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_store_slug ON products(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_store_featured ON products(store_id, is_featured);

-- -----------------------------------------------------------------------------
-- 4. PRODUCT VARIANTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    stock INT NOT NULL DEFAULT 0,
    size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_variants_store_product ON product_variants(store_id, product_id);

-- -----------------------------------------------------------------------------
-- 5. PRODUCT CATEGORIES (Junction)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (store_id, product_id, category_id)
);

-- -----------------------------------------------------------------------------
-- 6. ORDERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    order_number VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    company_name VARCHAR(255),
    business_name VARCHAR(255),
    gstin VARCHAR(50),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    shipping_label_url TEXT,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_order_number UNIQUE (store_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_store_user ON orders(store_id, user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_number ON orders(store_id, order_number);

-- -----------------------------------------------------------------------------
-- 7. ORDER ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_store_order ON order_items(store_id, order_id);

-- -----------------------------------------------------------------------------
-- 8. CART ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_store_user ON cart_items(store_id, user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_store_session ON cart_items(store_id, session_id);

-- -----------------------------------------------------------------------------
-- 9. WISHLISTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_user_wishlist UNIQUE (store_id, user_id, product_id)
);

-- -----------------------------------------------------------------------------
-- 10. COUPONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(12,2) NOT NULL,
    min_spend DECIMAL(12,2) DEFAULT 0.00,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_coupon_code UNIQUE (store_id, code)
);

-- -----------------------------------------------------------------------------
-- 11. REVIEWS & REVIEW VOTES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_store_product ON reviews(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_store_status ON reviews(store_id, status);

CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_review_vote UNIQUE (store_id, review_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 12. PRODUCT QUESTIONS & ANSWERS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 13. SITE SETTINGS, THEMES & HOMEPAGE SECTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    site_name VARCHAR(255) DEFAULT 'RoseOil.IN',
    tagline VARCHAR(255) DEFAULT 'Kannauj Hydro-Distillates',
    logo_url TEXT,
    favicon_url TEXT,
    use_text_logo BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR(255) DEFAULT 'shikhatandon2009@gmail.com',
    contact_phone VARCHAR(50) DEFAULT '9648678599',
    shipping_rates JSONB DEFAULT '{"standard": 150, "express": 300, "free_threshold": 2500}'::jsonb,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    social_links JSONB DEFAULT '{}'::jsonb,
    hero_video_url TEXT,
    hero_video_play_duration DECIMAL(5,2) DEFAULT 6.00,
    hero_video_pause_duration DECIMAL(5,2) DEFAULT 10.00,
    hero_video_loop_enabled BOOLEAN DEFAULT TRUE,
    store_address_line1 TEXT,
    store_address_line2 TEXT,
    store_city VARCHAR(100),
    store_state VARCHAR(100),
    store_pincode VARCHAR(50),
    store_country VARCHAR(100) DEFAULT 'India',
    whatsapp_number VARCHAR(50),
    support_hours VARCHAR(255),
    google_map_embed TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_site_settings UNIQUE (store_id)
);

CREATE TABLE IF NOT EXISTS site_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    active_theme_id VARCHAR(100) NOT NULL DEFAULT 'burgundy-rose',
    custom_primary VARCHAR(20),
    custom_accent VARCHAR(20),
    custom_bg VARCHAR(20),
    custom_text VARCHAR(20),
    custom_border VARCHAR(20),
    custom_card_bg VARCHAR(20),
    custom_css TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_site_theme UNIQUE (store_id)
);

CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    section_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 14. PAGES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    page_type VARCHAR(50) DEFAULT 'static',
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    meta_title VARCHAR(255),
    meta_keywords TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_page_slug UNIQUE (store_id, slug)
);

-- -----------------------------------------------------------------------------
-- 15. ADDRESSES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    business_name VARCHAR(255),
    gstin VARCHAR(50),
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    phone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 16. CURRENCIES & EXCHANGE RATES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    currency_code VARCHAR(10) NOT NULL REFERENCES currencies(code),
    rate_to_inr DECIMAL(12,6) NOT NULL DEFAULT 1.000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, currency_code)
);

-- -----------------------------------------------------------------------------
-- 17. HERO SLIDES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    tagline VARCHAR(255) NOT NULL DEFAULT 'Harvest 2026 • Royal Botanical Reserve',
    title VARCHAR(255) NOT NULL DEFAULT 'Golden Champaca Absolute',
    subtitle TEXT NOT NULL DEFAULT 'Hand-harvested golden Champaca blossoms (Magnolia champaca) hydro-distilled into hydro-botanical elixir.',
    product_name VARCHAR(255) NOT NULL DEFAULT 'Golden Champaca Oil',
    product_link VARCHAR(255) NOT NULL DEFAULT '/products',
    bg_image_url TEXT NOT NULL DEFAULT '/images/hero/champaca-flower-bg.png',
    bottle_image_url TEXT NOT NULL DEFAULT '/images/hero/champaca-bottle.png',
    button_text VARCHAR(100) NOT NULL DEFAULT 'Explore Golden Champaca',
    badge_text VARCHAR(100) NOT NULL DEFAULT '100% Hydro-Distilled • Alcohol-Free',
    glow_color VARCHAR(50) DEFAULT '#FFD700',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_store_active ON hero_slides(store_id, is_active, display_order);

-- -----------------------------------------------------------------------------
-- 18. COUNTRIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    flag VARCHAR(50) NOT NULL,
    phone_code VARCHAR(20) NOT NULL,
    state_label VARCHAR(100) DEFAULT 'State / Region',
    postal_label VARCHAR(100) DEFAULT 'Postal Code',
    postal_placeholder VARCHAR(50) DEFAULT '000000',
    matched_currency VARCHAR(10) DEFAULT 'INR',
    states JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_country_code UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_countries_store_code ON countries(store_id, code);

-- -----------------------------------------------------------------------------
-- 19. CUSTOMER INQUIRIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    inquiry_ref VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'In Review',
    reply TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_inquiries_user ON customer_inquiries(store_id, user_id);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_ref ON customer_inquiries(inquiry_ref);

-- -----------------------------------------------------------------------------
-- 20. PASSWORD RESETS, NOTIFICATIONS & LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    provider_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_store_recipient ON notification_logs(store_id, recipient);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notif_store_recipient ON notifications(store_id, recipient_id);

CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    topic VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 21. ROW LEVEL SECURITY (RLS) POLICIES & GRANTS
-- -----------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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
            'orders', 'order_items', 'addresses', 'hero_slides', 'countries',
            'customer_inquiries', 'notification_logs', 'notifications', 'users'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public Read Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Insert Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Update Policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public Delete Policy" ON %I;', tbl);
    END LOOP;
END $$;

-- Policies for public / store frontend
CREATE POLICY "Public Read Policy" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON products FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_variants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON product_variants FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON categories FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON product_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Delete Policy" ON product_categories FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON reviews FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON review_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON review_votes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON product_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Read Policy" ON product_answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON product_answers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Policy" ON site_settings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON site_themes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Update Policy" ON site_themes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON homepage_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON pages FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON currencies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON exchange_rates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read Policy" ON coupons FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON hero_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON hero_slides FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON hero_slides FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Delete Policy" ON hero_slides FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON countries FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON cart_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON cart_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON cart_items FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Delete Policy" ON cart_items FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON wishlists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON wishlists FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Delete Policy" ON wishlists FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON orders FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON addresses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON addresses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON addresses FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public Delete Policy" ON addresses FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON customer_inquiries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON customer_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON notification_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON notification_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public Read Policy" ON notifications FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Public Read Policy" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Insert Policy" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public Update Policy" ON users FOR UPDATE TO anon, authenticated USING (true);

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 22. STORAGE BUCKET CREATION ('images')
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
    DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
    DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
    DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT TO anon, authenticated, service_role USING (bucket_id = 'images');
CREATE POLICY "Public Storage Insert" ON storage.objects FOR INSERT TO anon, authenticated, service_role WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public Storage Update" ON storage.objects FOR UPDATE TO anon, authenticated, service_role USING (bucket_id = 'images');
CREATE POLICY "Public Storage Delete" ON storage.objects FOR DELETE TO anon, authenticated, service_role USING (bucket_id = 'images');

-- -----------------------------------------------------------------------------
-- 23. SEED ESSENTIAL DATA
-- -----------------------------------------------------------------------------
-- Currencies
INSERT INTO currencies (code, name, symbol) VALUES
('INR', 'Indian Rupee', '₹'),
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('AED', 'UAE Dirham', 'AED')
ON CONFLICT (code) DO NOTHING;

-- Exchange Rates
INSERT INTO exchange_rates (store_id, currency_code, rate_to_inr, updated_at) VALUES
('essential_oils_perfumes_store_01', 'INR', 1.000000, NOW()),
('essential_oils_perfumes_store_01', 'USD', 0.012000, NOW()),
('essential_oils_perfumes_store_01', 'EUR', 0.011000, NOW()),
('essential_oils_perfumes_store_01', 'AED', 0.044000, NOW())
ON CONFLICT (store_id, currency_code) DO UPDATE SET rate_to_inr = EXCLUDED.rate_to_inr;

-- Default Admin & Customer Accounts (Password: admin123 / customer123)
INSERT INTO users (id, store_id, email, password_hash, full_name, role, phone, must_change_password) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'essential_oils_perfumes_store_01', 'admin@maisonessence.com', '$2a$10$V3W0x8s2rP23m.V9cR7WmeYJ11VbT.M9o7kHkU9k0sF5O2/b7uO1e', 'Maison Admin', 'admin', '+91 98765 00000', false),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'essential_oils_perfumes_store_01', 'victoria@example.com', '$2a$10$V3W0x8s2rP23m.V9cR7WmeYJ11VbT.M9o7kHkU9k0sF5O2/b7uO1e', 'Victoria Sterling', 'customer', '+91 98765 11111', false)
ON CONFLICT (store_id, email) DO NOTHING;

-- Categories
INSERT INTO categories (id, store_id, name, slug, description, image_url, display_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'Artisanal Perfumes', 'artisanal-perfumes', 'Hand-crafted fine fragrances created by master perfumers using rare natural extracts.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop', 1),
('c2222222-2222-2222-2222-222222222222', 'essential_oils_perfumes_store_01', 'Pure Essential Oils', 'pure-essential-oils', '100% pure, single-origin steam-distilled botanical oils for aromatherapy and wellness.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop', 2),
('c3333333-3333-3333-3333-333333333333', 'essential_oils_perfumes_store_01', 'Luxury Elixirs & Blends', 'luxury-elixirs-blends', 'Complex botanical synergy elixirs formulated to soothe the mind and elevate energy.', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop', 3)
ON CONFLICT (store_id, slug) DO NOTHING;

-- Initial Products
INSERT INTO products (id, store_id, name, slug, description, price, compare_at_price, stock, images, scent_notes, ingredients, is_featured, is_bestseller, meta_title, meta_description) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'essential_oils_perfumes_store_01',
    'Rose Royale Eau de Parfum',
    'rose-royale-eau-de-parfum',
    'An intoxicating bouquet of Damask Rose, Velvet Oud, and warm Golden Amber. Crafted for moments of pure elegance and mystery.',
    4800.00,
    5500.00,
    45,
    '["https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '{"top": ["Bergamot", "Sparkling Pink Pepper"], "heart": ["Bulgarian Rose", "Turkish Rose Absolute"], "base": ["Velvet Oud", "Sandalwood", "Amber"]}'::jsonb,
    '["Alcohol Denat.", "Parfum (Fragrance)", "Rosa Damascena Flower Extract", "Linalool", "Limonene"]'::jsonb,
    true,
    true,
    'Rose Royale Luxury Perfume | Maison De L''Essence',
    'Shop Rose Royale Eau de Parfum featuring Damask Rose, Velvet Oud, and Golden Amber.'
),
(
    '22222222-2222-2222-2222-222222222222',
    'essential_oils_perfumes_store_01',
    'Velvet Amber & Vanilla Oil Blend',
    'velvet-amber-vanilla-oil-blend',
    'Rich Madagascar Vanilla harmonized with golden amber and smoked vetiver. A calming elixir for deep relaxation.',
    3200.00,
    3800.00,
    30,
    '["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '{"top": ["Sweet Almond", "Cardamom"], "heart": ["Madagascar Vanilla Bean", "Helichrysum"], "base": ["Golden Amber", "Smoked Vetiver"]}'::jsonb,
    '["Simmondsia Chinensis (Jojoba) Seed Oil", "Vanilla Planifolia Fruit Extract", "Amber Resin Extract"]'::jsonb,
    true,
    false,
    'Velvet Amber & Vanilla Oil | Maison De L''Essence',
    'Discover Velvet Amber & Vanilla essential oil elixir for relaxation.'
),
(
    '33333333-3333-3333-3333-333333333333',
    'essential_oils_perfumes_store_01',
    'Midnight Jasmine & Bergamot Cologne',
    'midnight-jasmine-bergamot-cologne',
    'Night-blooming Jasmine blended with sun-ripened Calabrian Bergamot and soft Musk.',
    4200.00,
    4900.00,
    25,
    '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop"]'::jsonb,
    '{"top": ["Calabrian Bergamot", "Neroli"], "heart": ["Night-Blooming Jasmine", "Ylang Ylang"], "base": ["White Musk", "Cedarwood"]}'::jsonb,
    '["Organic Cane Alcohol", "Jasminum Officinale Flower Oil", "Citrus Aurantium Bergamia Peel Oil"]'::jsonb,
    true,
    true,
    'Midnight Jasmine & Bergamot Cologne | Maison De L''Essence',
    'Luxury floral cologne infused with organic night-blooming jasmine.'
)
ON CONFLICT (store_id, slug) DO NOTHING;

-- Product Variants
INSERT INTO product_variants (id, store_id, product_id, name, sku, price, stock, size) VALUES
('41111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', '11111111-1111-1111-1111-111111111111', '50ml Eau de Parfum', 'RR-50ML', 4800.00, 25, '50ml'),
('41111111-1111-1111-1111-222222222222', 'essential_oils_perfumes_store_01', '11111111-1111-1111-1111-111111111111', '100ml Eau de Parfum', 'RR-100ML', 7200.00, 20, '100ml'),
('42222222-2222-2222-2222-111111111111', 'essential_oils_perfumes_store_01', '22222222-2222-2222-2222-222222222222', '15ml Roll-On Bottle', 'VA-15ML', 3200.00, 30, '15ml'),
('43333333-3333-3333-3333-111111111111', 'essential_oils_perfumes_store_01', '33333333-3333-3333-3333-333333333333', '50ml Cologne Spray', 'MJ-50ML', 4200.00, 25, '50ml')
ON CONFLICT (id) DO NOTHING;

-- Link Categories to Products
INSERT INTO product_categories (store_id, product_id, category_id) VALUES
('essential_oils_perfumes_store_01', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
('essential_oils_perfumes_store_01', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
('essential_oils_perfumes_store_01', '33333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111')
ON CONFLICT (store_id, product_id, category_id) DO NOTHING;

-- Seed Hero Slides
INSERT INTO hero_slides (
    store_id, tagline, title, subtitle, product_name, product_link,
    bg_image_url, bottle_image_url, button_text, badge_text, glow_color, display_order, is_active
) VALUES (
    'essential_oils_perfumes_store_01',
    'Harvest 2026 • Royal Botanical Reserve',
    'Golden Champaca Absolute',
    'Extracted from dawn-harvested golden Champaca blossoms (Magnolia champaca). Steam distilled into a pure sandalwood base for an extraordinary divine floral sillage.',
    'Golden Champaca Oil',
    '/products',
    '/images/hero/champaca-flower-bg.png',
    '/images/hero/champaca-bottle.png',
    'Explore Golden Champaca',
    '100% Hydro-Distilled • Alcohol-Free',
    '#FFD700',
    0,
    TRUE
);

-- Seed Countries
INSERT INTO countries (code, name, flag, phone_code, state_label, postal_label, postal_placeholder, matched_currency, states, display_order)
VALUES 
(
  'IN', 'India', '🇮🇳', '+91', 'State / Union Territory', 'PIN Code', '209725', 'INR',
  '["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"]'::jsonb,
  1
),
(
  'US', 'United States', '🇺🇸', '+1', 'State', 'ZIP Code', '90210', 'USD',
  '["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]'::jsonb,
  2
),
(
  'GB', 'United Kingdom', '🇬🇧', '+44', 'County / Region', 'Postcode', 'SW1A 1AA', 'GBP',
  '["Greater London", "Greater Manchester", "West Midlands", "West Yorkshire", "Surrey", "Essex", "Kent", "Hampshire", "Scotland", "Wales", "Northern Ireland"]'::jsonb,
  3
),
(
  'AE', 'United Arab Emirates', '🇦🇪', '+971', 'Emirate', 'P.O. Box / Postal Code', '00000', 'AED',
  '["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"]'::jsonb,
  4
),
(
  'FR', 'France', '🇫🇷', '+33', 'Region / Department', 'Postal Code', '75001', 'EUR',
  '["Île-de-France (Paris)", "Provence-Alpes-Côte d''Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie"]'::jsonb,
  5
),
(
  'DE', 'Germany', '🇩🇪', '+49', 'Federal State (Bundesland)', 'Postleitzahl (PLZ)', '10115', 'EUR',
  '["Bavaria", "Berlin", "Baden-Württemberg", "North Rhine-Westphalia", "Hesse", "Hamburg", "Saxony"]'::jsonb,
  6
),
(
  'CA', 'Canada', '🇨🇦', '+1', 'Province / Territory', 'Postal Code', 'M5V 2T6', 'CAD',
  '["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Ontario", "Quebec", "Saskatchewan"]'::jsonb,
  7
),
(
  'AU', 'Australia', '🇦🇺', '+61', 'State / Territory', 'Postcode', '2000', 'AUD',
  '["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory"]'::jsonb,
  8
),
(
  'SA', 'Saudi Arabia', '🇸🇦', '+966', 'Province / Region', 'Postal Code', '12211', 'SAR',
  '["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir"]'::jsonb,
  9
),
(
  'SG', 'Singapore', '🇸🇬', '+65', 'Region', 'Postal Code', '238882', 'SGD',
  '["Central Region", "East Region", "North Region", "North-East Region", "West Region"]'::jsonb,
  10
)
ON CONFLICT (store_id, code) DO NOTHING;

-- Seed Default Site Settings
INSERT INTO site_settings (
    store_id, site_name, tagline, contact_email, contact_phone, shipping_rates, tax_rate, social_links
) VALUES (
    'essential_oils_perfumes_store_01',
    'Maison De L''Essence',
    'Luxury Essential Oils & Artisanal Perfumes',
    'support@maisonessence.com',
    '+91 98765 43210',
    '{"standard": 150, "express": 300, "free_threshold": 2500}'::jsonb,
    18.00,
    '{"instagram": "https://instagram.com", "facebook": "https://facebook.com"}'::jsonb
) ON CONFLICT (store_id) DO NOTHING;

-- Seed Default Theme
INSERT INTO site_themes (
    store_id, active_theme_id
) VALUES (
    'essential_oils_perfumes_store_01',
    'burgundy-rose'
) ON CONFLICT (store_id) DO NOTHING;
