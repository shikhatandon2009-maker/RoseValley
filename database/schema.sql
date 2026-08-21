-- =============================================================================
-- LUXURY ESSENTIAL OILS & PERFUMES E-COMMERCE PLATFORM
-- Multi-Tenant Store-Scoped Database Schema (Supabase PostgreSQL)
-- All queries and tables are scoped by `store_id` to prevent data collision.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop pre-existing legacy tables to resolve column mismatch errors (e.g. missing store_id)
DROP TABLE IF EXISTS chatbot_knowledge CASCADE;
DROP TABLE IF EXISTS chat_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS product_answers CASCADE;
DROP TABLE IF EXISTS product_questions CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (Store-Scoped Custom Auth, No Supabase Auth required)
CREATE TABLE users (
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

CREATE INDEX idx_users_store_email ON users(store_id, email);
CREATE INDEX idx_users_store_role ON users(store_id, role);

-- 2. CATEGORIES
CREATE TABLE categories (
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

CREATE INDEX idx_categories_store_slug ON categories(store_id, slug);

-- 3. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    compare_at_price DECIMAL(12,2),
    stock INT NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
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

CREATE INDEX idx_products_store_slug ON products(store_id, slug);
CREATE INDEX idx_products_store_featured ON products(store_id, is_featured);

-- 4. PRODUCT VARIANTS
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "50ml Bottle", "100ml Bottle", "10ml Roll-On"
    sku VARCHAR(100),
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    stock INT NOT NULL DEFAULT 0,
    size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_store_product ON product_variants(store_id, product_id);

-- 5. PRODUCT CATEGORIES (Junction)
CREATE TABLE product_categories (
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (store_id, product_id, category_id)
);

-- 6. ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    order_number VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    shipping_address JSONB NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid', 'failed'
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

CREATE INDEX idx_orders_store_user ON orders(store_id, user_id);
CREATE INDEX idx_orders_store_number ON orders(store_id, order_number);

-- 7. ORDER ITEMS
CREATE TABLE order_items (
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

CREATE INDEX idx_order_items_store_order ON order_items(store_id, order_id);

-- 8. CART ITEMS
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- Guest cart tracking
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cart_items_store_user ON cart_items(store_id, user_id);
CREATE INDEX idx_cart_items_store_session ON cart_items(store_id, session_id);

-- 9. WISHLISTS
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_user_wishlist UNIQUE (store_id, user_id, product_id)
);

-- 10. COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
    discount_value DECIMAL(12,2) NOT NULL,
    min_spend DECIMAL(12,2) DEFAULT 0.00,
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_coupon_code UNIQUE (store_id, code)
);

-- 11. REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_store_product ON reviews(store_id, product_id);
CREATE INDEX idx_reviews_store_status ON reviews(store_id, status);

-- 12. REVIEW VOTES
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_review_vote UNIQUE (store_id, review_id, user_id)
);

-- 13. PRODUCT QUESTIONS & ANSWERS
CREATE TABLE product_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SITE SETTINGS & HOMEPAGE SECTIONS
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    site_name VARCHAR(255) DEFAULT 'Maison De L''Essence',
    tagline VARCHAR(255) DEFAULT 'Luxury Essential Oils & Artisanal Perfumes',
    logo_url TEXT,
    favicon_url TEXT,
    use_text_logo BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR(255) DEFAULT 'support@maisonessence.com',
    contact_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    shipping_rates JSONB DEFAULT '{"standard": 150, "express": 300, "free_threshold": 2500}'::jsonb,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    social_links JSONB DEFAULT '{"instagram": "https://instagram.com", "facebook": "https://facebook.com"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_site_settings UNIQUE (store_id)
);

CREATE TABLE homepage_sections (
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

-- 15. PAGES (Static Content & Blog)
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    page_type VARCHAR(50) DEFAULT 'static', -- 'static' | 'blog'
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

-- 16. ADDRESSES
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    phone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. CURRENCIES & EXCHANGE RATES
CREATE TABLE currencies (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL
);

CREATE TABLE exchange_rates (
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    currency_code VARCHAR(10) NOT NULL REFERENCES currencies(code),
    rate_to_inr DECIMAL(12,6) NOT NULL DEFAULT 1.000000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, currency_code)
);

-- 18. PASSWORD RESETS
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. NOTIFICATION LOGS (Emails sent)
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    provider_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_logs_store_recipient ON notification_logs(store_id, recipient);

-- 20. IN-APP NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for admin broadcasting
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_store_recipient ON notifications(store_id, recipient_id);

-- 21. CHAT LOGS & CHATBOT KNOWLEDGE
CREATE TABLE chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chatbot_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    topic VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. SITE THEMES & CUSTOM CSS
CREATE TABLE site_themes (
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

