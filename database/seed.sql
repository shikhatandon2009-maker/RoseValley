-- =============================================================================
-- SEED DATA FOR LUXURY ESSENTIAL OILS & PERFUMES E-COMMERCE PLATFORM
-- Store ID: essential_oils_perfumes_store_01
-- =============================================================================

-- Currencies
INSERT INTO currencies (code, name, symbol) VALUES
('INR', 'Indian Rupee', '₹'),
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('AED', 'UAE Dirham', 'AED')
ON CONFLICT (code) DO NOTHING;

-- Exchange Rates for store_id: essential_oils_perfumes_store_01
INSERT INTO exchange_rates (store_id, currency_code, rate_to_inr, updated_at) VALUES
('essential_oils_perfumes_store_01', 'INR', 1.000000, NOW()),
('essential_oils_perfumes_store_01', 'USD', 0.012000, NOW()),
('essential_oils_perfumes_store_01', 'EUR', 0.011000, NOW()),
('essential_oils_perfumes_store_01', 'AED', 0.044000, NOW())
ON CONFLICT (store_id, currency_code) DO UPDATE SET rate_to_inr = EXCLUDED.rate_to_inr;

-- Users (Admin password: admin123 | Customer password: customer123)
-- bcrypt hashes generated with cost 10
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

-- Products
INSERT INTO products (id, store_id, name, slug, description, price, compare_at_price, stock, images, scent_notes, ingredients, is_featured, is_bestseller, meta_title, meta_description) VALUES
(
    'p1111111-1111-1111-1111-111111111111',
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
    'p2222222-2222-2222-2222-222222222222',
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
    'p3333333-3333-3333-3333-333333333333',
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
('v1111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'p1111111-1111-1111-1111-111111111111', '50ml Eau de Parfum', 'RR-50ML', 4800.00, 25, '50ml'),
('v1111111-1111-1111-1111-222222222222', 'essential_oils_perfumes_store_01', 'p1111111-1111-1111-1111-111111111111', '100ml Eau de Parfum', 'RR-100ML', 7200.00, 20, '100ml'),
('v2222222-2222-2222-2222-111111111111', 'essential_oils_perfumes_store_01', 'p2222222-2222-2222-2222-222222222222', '15ml Roll-On Bottle', 'VA-15ML', 3200.00, 30, '15ml'),
('v3333333-3333-3333-3333-111111111111', 'essential_oils_perfumes_store_01', 'p3333333-3333-3333-3333-333333333333', '50ml Cologne Spray', 'MJ-50ML', 4200.00, 25, '50ml')
ON CONFLICT (id) DO NOTHING;

-- Product Category Links
INSERT INTO product_categories (store_id, product_id, category_id) VALUES
('essential_oils_perfumes_store_01', 'p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
('essential_oils_perfumes_store_01', 'p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
('essential_oils_perfumes_store_01', 'p3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Reviews
INSERT INTO reviews (id, store_id, product_id, user_id, rating, title, comment, status, is_verified_purchase) VALUES
('r1111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'p1111111-1111-1111-1111-111111111111', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 5, 'Exquisite scent that lasts all day!', 'The Damask Rose is divine. People kept asking me what perfume I was wearing at dinner.', 'approved', true)
ON CONFLICT (id) DO NOTHING;

-- Product Questions
INSERT INTO product_questions (id, store_id, product_id, user_id, question, status) VALUES
('q1111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'p1111111-1111-1111-1111-111111111111', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Is this perfume cruelty-free and alcohol-free?', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Product Answers
INSERT INTO product_answers (id, store_id, question_id, user_id, answer, is_official) VALUES
('a1111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'q1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hello Victoria! Yes, all Maison De L''Essence fragrances are 100% cruelty-free and Leaping Bunny certified.', true)
ON CONFLICT (id) DO NOTHING;

-- Site Settings
INSERT INTO site_settings (store_id, site_name, tagline, logo_url, favicon_url, contact_email, contact_phone) VALUES
('essential_oils_perfumes_store_01', 'Rose Valley Kannauj', 'Artisanal Attars & Pure Distillates • Kannauj', '/images/rvk-logo.png', '/images/rvk-logo.png', 'support@rosevalleykannauj.com', '+91 98765 43210')
ON CONFLICT (store_id) DO NOTHING;

-- Coupons
INSERT INTO coupons (id, store_id, code, discount_type, discount_value, min_spend, is_active) VALUES
('cp111111-1111-1111-1111-111111111111', 'essential_oils_perfumes_store_01', 'LUXURY15', 'percentage', 15.00, 2000.00, true)
ON CONFLICT (store_id, code) DO NOTHING;
