-- =============================================================================
-- HERO SLIDES / BANNERS TABLE SCHEMA FOR SUPABASE
-- Scoped multi-tenant schema with default Champaca Oil initial record
-- =============================================================================

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

-- Seed initial Golden Champaca Hero Slide
INSERT INTO hero_slides (
    store_id,
    tagline,
    title,
    subtitle,
    product_name,
    product_link,
    bg_image_url,
    bottle_image_url,
    button_text,
    badge_text,
    glow_color,
    display_order,
    is_active
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
