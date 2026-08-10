-- =============================================================================
-- COUNTRIES TABLE SCHEMA & SEED DATA
-- Multi-Tenant Store-Scoped Database Schema (Supabase PostgreSQL)
-- Allows dynamic country selection, address field labels, and currency matching
-- =============================================================================

CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id VARCHAR(100) NOT NULL DEFAULT 'essential_oils_perfumes_store_01',
    code VARCHAR(10) NOT NULL, -- ISO 2-letter code e.g. 'IN', 'US', 'GB'
    name VARCHAR(255) NOT NULL, -- Country Name
    flag VARCHAR(50) NOT NULL, -- Flag emoji
    phone_code VARCHAR(20) NOT NULL, -- Dial code e.g. '+91'
    state_label VARCHAR(100) DEFAULT 'State / Region',
    postal_label VARCHAR(100) DEFAULT 'Postal Code',
    postal_placeholder VARCHAR(50) DEFAULT '000000',
    matched_currency VARCHAR(10) DEFAULT 'INR',
    states JSONB DEFAULT '[]'::jsonb, -- Array of states/provinces
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_country_code UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_countries_store_code ON countries(store_id, code);

-- SEED TOP INTERNATIONAL COUNTRIES
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
