-- =============================================================================
-- UPDATE SITE SETTINGS FOR ROSEVALLEY.IN (SUPABASE)
-- =============================================================================

-- 1. Ensure all extended columns exist in site_settings table
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_video_play_duration DECIMAL(5,2) DEFAULT 6.00;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_video_pause_duration DECIMAL(5,2) DEFAULT 10.00;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS hero_video_loop_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_address_line1 TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_address_line2 TEXT;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_city VARCHAR(100);
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_state VARCHAR(100);
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_pincode VARCHAR(50);
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS store_country VARCHAR(100) DEFAULT 'India';
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS support_hours VARCHAR(255);
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS google_map_embed TEXT;

-- 2. Upsert the RoseOil.IN site settings
INSERT INTO site_settings (
    id,
    store_id,
    site_name,
    tagline,
    logo_url,
    favicon_url,
    contact_email,
    contact_phone,
    shipping_rates,
    tax_rate,
    social_links,
    hero_video_url,
    hero_video_play_duration,
    hero_video_pause_duration,
    hero_video_loop_enabled,
    store_address_line1,
    store_address_line2,
    store_city,
    store_state,
    store_pincode,
    store_country,
    whatsapp_number,
    support_hours,
    google_map_embed,
    updated_at
) VALUES (
    '540c2625-27a8-4377-8989-8c298777a1bc',
    'essential_oils_perfumes_store_01',
    'RoseOil.IN',
    'Kannauj Hydro-Distillates',
    '/uploads/logos/site_logo_1787196937647.png',
    '/uploads/logos/site_favicon_1787196938240.jpg',
    'shikhatandon2009@gmail.com',
    '9648678599',
    '{"express": 300, "standard": 150, "free_threshold": 2500}'::jsonb,
    18.00,
    '{"_store_city": "Kannauj", "_store_gstin": "09AAACR1234F1Z5", "_store_state": "Uttar Pradesh", "_store_country": "India", "_store_pincode": "209725", "_support_hours": "Mon - Sat: 9:00 AM - 8:00 PM IST", "_use_text_logo": false, "_whatsapp_number": "+91 96486 78599", "_google_map_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin", "_store_address_line1": "Rose Valley Estate, Deg-Bhapka Heritage Stills", "_store_address_line2": "Kannauj Industrial Area"}'::jsonb,
    'https://cdn.shopify.com/videos/c/o/v/43ca2028a79041179ed82c0ece7718b1.mp4',
    6.00,
    10.00,
    true,
    'Rose Valley Estate, Deg-Bhapka Heritage Stills',
    'Kannauj Industrial Area',
    'Kannauj',
    'Uttar Pradesh',
    '209725',
    'India',
    '+91 96486 78599',
    'Mon - Sat: 9:00 AM - 8:00 PM IST',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    NOW()
)
ON CONFLICT (store_id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    tagline = EXCLUDED.tagline,
    logo_url = EXCLUDED.logo_url,
    favicon_url = EXCLUDED.favicon_url,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    shipping_rates = EXCLUDED.shipping_rates,
    tax_rate = EXCLUDED.tax_rate,
    social_links = EXCLUDED.social_links,
    hero_video_url = EXCLUDED.hero_video_url,
    hero_video_play_duration = EXCLUDED.hero_video_play_duration,
    hero_video_pause_duration = EXCLUDED.hero_video_pause_duration,
    hero_video_loop_enabled = EXCLUDED.hero_video_loop_enabled,
    store_address_line1 = EXCLUDED.store_address_line1,
    store_address_line2 = EXCLUDED.store_address_line2,
    store_city = EXCLUDED.store_city,
    store_state = EXCLUDED.store_state,
    store_pincode = EXCLUDED.store_pincode,
    store_country = EXCLUDED.store_country,
    whatsapp_number = EXCLUDED.whatsapp_number,
    support_hours = EXCLUDED.support_hours,
    google_map_embed = EXCLUDED.google_map_embed,
    updated_at = NOW();
