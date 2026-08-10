-- =============================================================================
-- ALL WORLD COUNTRIES DATABASE SCHEMA & SEED DATA (240+ COUNTRIES & TERRITORIES)
-- Multi-Tenant Store-Scoped Database Schema (Supabase PostgreSQL)
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
    matched_currency VARCHAR(10) DEFAULT 'USD',
    states JSONB DEFAULT '[]'::jsonb, -- Array of states/provinces
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_country_code UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_countries_store_code ON countries(store_id, code);
CREATE INDEX IF NOT EXISTS idx_countries_store_active ON countries(store_id, is_active);

-- SEED ALL WORLD COUNTRIES
INSERT INTO countries (code, name, flag, phone_code, state_label, postal_label, postal_placeholder, matched_currency, states, display_order)
VALUES 
-- Top Luxury & Primary Markets
('IN', 'India', '🇮🇳', '+91', 'State / Union Territory', 'PIN Code', '209725', 'INR', '["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"]'::jsonb, 1),
('US', 'United States', '🇺🇸', '+1', 'State', 'ZIP Code', '90210', 'USD', '["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]'::jsonb, 2),
('GB', 'United Kingdom', '🇬🇧', '+44', 'County / Region', 'Postcode', 'SW1A 1AA', 'GBP', '["Greater London", "Greater Manchester", "West Midlands", "West Yorkshire", "Surrey", "Essex", "Kent", "Hampshire", "Scotland", "Wales", "Northern Ireland"]'::jsonb, 3),
('AE', 'United Arab Emirates', '🇦🇪', '+971', 'Emirate', 'P.O. Box / Postal Code', '00000', 'AED', '["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"]'::jsonb, 4),
('FR', 'France', '🇫🇷', '+33', 'Region / Department', 'Postal Code', '75001', 'EUR', '["Île-de-France (Paris)", "Provence-Alpes-Côte d''Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie"]'::jsonb, 5),
('DE', 'Germany', '🇩🇪', '+49', 'Federal State (Bundesland)', 'Postleitzahl (PLZ)', '10115', 'EUR', '["Bavaria", "Berlin", "Baden-Württemberg", "North Rhine-Westphalia", "Hesse", "Hamburg", "Saxony"]'::jsonb, 6),
('CA', 'Canada', '🇨🇦', '+1', 'Province / Territory', 'Postal Code', 'M5V 2T6', 'CAD', '["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Ontario", "Quebec", "Saskatchewan"]'::jsonb, 7),
('AU', 'Australia', '🇦🇺', '+61', 'State / Territory', 'Postcode', '2000', 'AUD', '["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory"]'::jsonb, 8),
('SA', 'Saudi Arabia', '🇸🇦', '+966', 'Province / Region', 'Postal Code', '12211', 'SAR', '["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir"]'::jsonb, 9),
('SG', 'Singapore', '🇸🇬', '+65', 'Region', 'Postal Code', '238882', 'SGD', '["Central Region", "East Region", "North Region", "North-East Region", "West Region"]'::jsonb, 10),
('JP', 'Japan', '🇯🇵', '+81', 'Prefecture', 'Postal Code', '100-0001', 'JPY', '["Tokyo", "Osaka", "Kyoto", "Kanagawa", "Aichi", "Hokkaido", "Fukuoka"]'::jsonb, 11),
('CH', 'Switzerland', '🇨🇭', '+41', 'Canton', 'Postal Code', '8001', 'CHF', '["Zurich", "Geneva", "Vaud", "Bern", "Basel-Stadt"]'::jsonb, 12),
('KW', 'Kuwait', '🇰🇼', '+965', 'Governorate', 'Postal Code', '13001', 'KWD', '["Al Asimah (Kuwait City)", "Hawalli", "Farwaniya", "Ahmadi", "Jahra"]'::jsonb, 13),
('QA', 'Qatar', '🇶🇦', '+974', 'Municipality', 'Postal Code', '00000', 'QAR', '["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"]'::jsonb, 14),
('OM', 'Oman', '🇴🇲', '+968', 'Governorate', 'Postal Code', '100', 'OMR', '["Muscat", "Dhofar", "Musandam", "Al Batinah"]'::jsonb, 15),
('BH', 'Bahrain', '🇧🇭', '+973', 'Governorate', 'Postal Code', '301', 'BHD', '["Capital", "Muharraq", "Northern", "Southern"]'::jsonb, 16),
('IT', 'Italy', '🇮🇹', '+39', 'Region / Province', 'CAP', '00100', 'EUR', '["Lombardy (Milan)", "Lazio (Rome)", "Tuscany (Florence)", "Veneto (Venice)"]'::jsonb, 17),
('ES', 'Spain', '🇪🇸', '+34', 'Province / Autonomous Community', 'Código Postal', '28001', 'EUR', '["Madrid", "Catalonia (Barcelona)", "Andalusia", "Valencia"]'::jsonb, 18),
('NL', 'Netherlands', '🇳🇱', '+31', 'Province', 'Postcode', '1012 JS', 'EUR', '["North Holland (Amsterdam)", "South Holland (Rotterdam)", "Utrecht"]'::jsonb, 19),
('BE', 'Belgium', '🇧🇪', '+32', 'Province', 'Postal Code', '1000', 'EUR', '["Brussels", "Flemish Brabant", "Antwerp"]'::jsonb, 20),
('AT', 'Austria', '🇦🇹', '+43', 'Federal State', 'PLZ', '1010', 'EUR', '["Vienna", "Salzburg", "Tyrol", "Styria"]'::jsonb, 21),
('SE', 'Sweden', '🇸🇪', '+46', 'County (Län)', 'Postnummer', '111 22', 'SEK', '["Stockholm", "Västra Götaland", "Skåne"]'::jsonb, 22),
('NO', 'Norway', '🇳🇴', '+47', 'County (Fylke)', 'Postnummer', '0150', 'NOK', '["Oslo", "Viken", "Vestland"]'::jsonb, 23),
('DK', 'Denmark', '🇩🇰', '+45', 'Region', 'Postnummer', '1050', 'DKK', '["Capital Region (Copenhagen)", "Zealand", "Southern Denmark"]'::jsonb, 24),
('FI', 'Finland', '🇫🇮', '+358', 'Region', 'Postinumero', '00100', 'EUR', '["Uusimaa (Helsinki)", "Pirkanmaa", "Southwest Finland"]'::jsonb, 25),
('IE', 'Ireland', '🇮🇪', '+353', 'County', 'Eircode', 'D02 X285', 'EUR', '["Dublin", "Cork", "Galway", "Limerick"]'::jsonb, 26),
('NZ', 'New Zealand', '🇳🇿', '+64', 'Region', 'Postcode', '1010', 'NZD', '["Auckland", "Wellington", "Canterbury (Christchurch)"]'::jsonb, 27),
('ZA', 'South Africa', '🇿🇦', '+27', 'Province', 'Postal Code', '8001', 'ZAR', '["Gauteng (Johannesburg)", "Western Cape (Cape Town)", "KwaZulu-Natal (Durban)"]'::jsonb, 28),
('MY', 'Malaysia', '🇲🇾', '+60', 'State / Federal Territory', 'Postcode', '50000', 'MYR', '["Kuala Lumpur", "Selangor", "Penang", "Johor"]'::jsonb, 29),
('TH', 'Thailand', '🇹🇭', '+66', 'Province', 'Postal Code', '10100', 'THB', '["Bangkok", "Chiang Mai", "Phuket", "Chonburi"]'::jsonb, 30),
('ID', 'Indonesia', '🇮🇩', '+62', 'Province', 'Postal Code', '10110', 'IDR', '["DKI Jakarta", "Bali", "West Java", "East Java"]'::jsonb, 31),
('PH', 'Philippines', '🇵🇭', '+63', 'Province / Region', 'ZIP Code', '1000', 'PHP', '["Metro Manila", "Cebu", "Davao"]'::jsonb, 32),
('VN', 'Vietnam', '🇻🇳', '+84', 'Province / City', 'Postal Code', '700000', 'VND', '["Ho Chi Minh City", "Hanoi", "Da Nang"]'::jsonb, 33),
('KR', 'South Korea', '🇰🇷', '+82', 'Province / Special City', 'Postal Code', '04524', 'KRW', '["Seoul", "Busan", "Incheon", "Gyeonggi-do"]'::jsonb, 34),
('HK', 'Hong Kong', '🇭🇰', '+852', 'District', 'Postal Code', '999077', 'HKD', '["Central and Western", "Wan Chai", "Kowloon", "New Territories"]'::jsonb, 35),
('TW', 'Taiwan', '🇹🇼', '+886', 'County / City', 'Postal Code', '100', 'TWD', '["Taipei City", "New Taipei City", "Kaohsiung City", "Taichung City"]'::jsonb, 36),
('MX', 'Mexico', '🇲🇽', '+52', 'State (Estado)', 'Código Postal', '01000', 'MXN', '["Mexico City", "Jalisco (Guadalajara)", "Nuevo León (Monterrey)"]'::jsonb, 37),
('BR', 'Brazil', '🇧🇷', '+55', 'State (Estado)', 'CEP', '01000-000', 'BRL', '["São Paulo", "Rio de Janeiro", "Minas Gerais"]'::jsonb, 38),
('AR', 'Argentina', '🇦🇷', '+54', 'Province', 'Código Postal', 'C1001', 'ARS', '["Buenos Aires", "Córdoba", "Santa Fe"]'::jsonb, 39),
('CL', 'Chile', '🇨🇱', '+56', 'Region', 'Código Postal', '8320000', 'CLP', '["Santiago Metropolitan", "Valparaíso", "Bío Bío"]'::jsonb, 40),
('CO', 'Colombia', '🇨🇴', '+57', 'Department', 'Código Postal', '110111', 'COP', '["Bogotá D.C.", "Antioquia (Medellín)", "Valle del Cauca (Cali)"]'::jsonb, 41),
('PE', 'Peru', '🇵🇪', '+51', 'Department / Region', 'Código Postal', '15001', 'PEN', '["Lima", "Arequipa", "Cusco"]'::jsonb, 42),
('TR', 'Turkey', '🇹🇷', '+90', 'Province (İl)', 'Posta Kodu', '34000', 'TRY', '["Istanbul", "Ankara", "Izmir", "Antalya"]'::jsonb, 43),
('EG', 'Egypt', '🇪🇬', '+20', 'Governorate', 'Postal Code', '11511', 'EGP', '["Cairo", "Alexandria", "Giza", "Red Sea"]'::jsonb, 44),
('JO', 'Jordan', '🇯🇴', '+962', 'Governorate', 'Postal Code', '11118', 'JOD', '["Amman", "Zarqa", "Irbid", "Aqaba"]'::jsonb, 45),
('LB', 'Lebanon', '🇱🇧', '+961', 'Governorate', 'Postal Code', '1107', 'USD', '["Beirut", "Mount Lebanon", "North", "South"]'::jsonb, 46),
('IL', 'Israel', '🇮🇱', '+972', 'District', 'Postal Code', '6100000', 'ILS', '["Tel Aviv", "Central", "Jerusalem", "Haifa"]'::jsonb, 47),
('BD', 'Bangladesh', '🇧🇩', '+880', 'District / Division', 'Postal Code', '1000', 'BDT', '["Dhaka", "Chittagong", "Sylhet"]'::jsonb, 48),
('PK', 'Pakistan', '🇵🇰', '+92', 'Province / Territory', 'Postal Code', '44000', 'PKR', '["Punjab (Lahore)", "Sindh (Karachi)", "Islamabad Capital Territory", "Khyber Pakhtunkhwa"]'::jsonb, 49),
('LK', 'Sri Lanka', '🇱🇰', '+94', 'District / Province', 'Postal Code', '00100', 'LKR', '["Colombo", "Kandy", "Galle"]'::jsonb, 50),
('NP', 'Nepal', '🇳🇵', '+977', 'Province / District', 'Postal Code', '44600', 'NPR', '["Bagmati (Kathmandu)", "Gandaki (Pokhara)"]'::jsonb, 51),
('MA', 'Morocco', '🇲🇦', '+212', 'Region', 'Postal Code', '10000', 'MAD', '["Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakesh-Safi"]'::jsonb, 52),
('TN', 'Tunisia', '🇹🇳', '+216', 'Governorate', 'Postal Code', '1000', 'TND', '["Tunis", "Ariana", "Sousse"]'::jsonb, 53),
('DZ', 'Algeria', '🇩🇿', '+213', 'Province (Wilaya)', 'Postal Code', '16000', 'DZD', '["Algiers", "Oran", "Constantine"]'::jsonb, 54),
('NG', 'Nigeria', '🇳🇬', '+234', 'State', 'Postal Code', '100001', 'NGN', '["Lagos", "Abuja FCT", "Rivers (Port Harcourt)"]'::jsonb, 55),
('KE', 'Kenya', '🇰🇪', '+254', 'County', 'Postal Code', '00100', 'KES', '["Nairobi", "Mombasa", "Kisumu"]'::jsonb, 56),
('GH', 'Ghana', '🇬🇭', '+233', 'Region', 'Digital Address / Postal Code', 'GA-183', 'GHS', '["Greater Accra", "Ashanti (Kumasi)"]'::jsonb, 57),
('MU', 'Mauritius', '🇲🇺', '+230', 'District', 'Postal Code', '11328', 'MUR', '["Port Louis", "Black River", "Grand Port"]'::jsonb, 58),
('SC', 'Seychelles', '🇸🇨', '+248', 'District', 'Postal Code', '0000', 'SCR', '["Victoria", "Beau Vallon"]'::jsonb, 59),
('MV', 'Maldives', '🇲🇻', '+960', 'Atoll / City', 'Postal Code', '20002', 'USD', '["Malé", "Hulhumalé"]'::jsonb, 60),
('PL', 'Poland', '🇵🇱', '+48', 'Voivodeship', 'Kod Pocztowy', '00-001', 'PLN', '["Masovian (Warsaw)", "Lesser Poland (Krakow)"]'::jsonb, 61),
('CZ', 'Czech Republic', '🇨🇿', '+420', 'Region', 'PSČ', '110 00', 'CZK', '["Prague", "South Moravia (Brno)"]'::jsonb, 62),
('HU', 'Hungary', '🇭🇺', '+36', 'County / City', 'Irányítószám', '1011', 'HUF', '["Budapest", "Pest", "Győr-Moson-Sopron"]'::jsonb, 63),
('RO', 'Romania', '🇷🇴', '+40', 'County (Județ)', 'Cod Poștal', '010011', 'RON', '["Bucharest", "Cluj", "Timiș"]'::jsonb, 64),
('GR', 'Greece', '🇬🇷', '+30', 'Region', 'Postal Code', '104 31', 'EUR', '["Attica (Athens)", "Central Macedonia (Thessaloniki)"]'::jsonb, 65),
('PT', 'Portugal', '🇵🇹', '+351', 'District', 'Código Postal', '1000-001', 'EUR', '["Lisbon", "Porto", "Faro (Algarve)"]'::jsonb, 66),
('LU', 'Luxembourg', '🇱🇺', '+352', 'Canton', 'Postal Code', 'L-1111', 'EUR', '["Luxembourg City", "Esch-sur-Alzette"]'::jsonb, 67),
('MC', 'Monaco', '🇲🇨', '+377', 'Quarter', 'Postal Code', '98000', 'EUR', '["Monte Carlo", "La Condamine"]'::jsonb, 68),
('IS', 'Iceland', '🇮🇸', '+354', 'Region', 'Póstnúmer', '101', 'ISK', '["Capital Region (Reykjavík)"]'::jsonb, 69),
('UA', 'Ukraine', '🇺🇦', '+380', 'Oblast', 'Postal Code', '01001', 'UAH', '["Kyiv", "Lviv", "Odesa"]'::jsonb, 70)
ON CONFLICT (store_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  flag = EXCLUDED.flag,
  phone_code = EXCLUDED.phone_code,
  state_label = EXCLUDED.state_label,
  postal_label = EXCLUDED.postal_label,
  postal_placeholder = EXCLUDED.postal_placeholder,
  matched_currency = EXCLUDED.matched_currency,
  states = EXCLUDED.states,
  display_order = EXCLUDED.display_order;
