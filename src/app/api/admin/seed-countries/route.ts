import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

const ALL_COUNTRIES_SEED = [
  { code: 'IN', name: 'India', flag: '🇮🇳', phone_code: '+91', state_label: 'State / Union Territory', postal_label: 'PIN Code', postal_placeholder: '209725', matched_currency: 'INR', display_order: 1, states: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"] },
  { code: 'US', name: 'United States', flag: '🇺🇸', phone_code: '+1', state_label: 'State', postal_label: 'ZIP Code', postal_placeholder: '90210', matched_currency: 'USD', display_order: 2, states: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phone_code: '+44', state_label: 'County / Region', postal_label: 'Postcode', postal_placeholder: 'SW1A 1AA', matched_currency: 'GBP', display_order: 3, states: ["Greater London", "Greater Manchester", "West Midlands", "West Yorkshire", "Surrey", "Essex", "Kent", "Hampshire", "Scotland", "Wales", "Northern Ireland"] },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phone_code: '+971', state_label: 'Emirate', postal_label: 'P.O. Box / Postal Code', postal_placeholder: '00000', matched_currency: 'AED', display_order: 4, states: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] },
  { code: 'FR', name: 'France', flag: '🇫🇷', phone_code: '+33', state_label: 'Region / Department', postal_label: 'Postal Code', postal_placeholder: '75001', matched_currency: 'EUR', display_order: 5, states: ["Île-de-France (Paris)", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie"] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phone_code: '+49', state_label: 'Federal State (Bundesland)', postal_label: 'Postleitzahl (PLZ)', postal_placeholder: '10115', matched_currency: 'EUR', display_order: 6, states: ["Bavaria", "Berlin", "Baden-Württemberg", "North Rhine-Westphalia", "Hesse", "Hamburg", "Saxony"] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phone_code: '+1', state_label: 'Province / Territory', postal_label: 'Postal Code', postal_placeholder: 'M5V 2T6', matched_currency: 'CAD', display_order: 7, states: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Ontario", "Quebec", "Saskatchewan"] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phone_code: '+61', state_label: 'State / Territory', postal_label: 'Postcode', postal_placeholder: '2000', matched_currency: 'AUD', display_order: 8, states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory"] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phone_code: '+966', state_label: 'Province / Region', postal_label: 'Postal Code', postal_placeholder: '12211', matched_currency: 'SAR', display_order: 9, states: ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir"] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phone_code: '+65', state_label: 'Region', postal_label: 'Postal Code', postal_placeholder: '238882', matched_currency: 'SGD', display_order: 10, states: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phone_code: '+81', state_label: 'Prefecture', postal_label: 'Postal Code', postal_placeholder: '100-0001', matched_currency: 'JPY', display_order: 11, states: ["Tokyo", "Osaka", "Kyoto", "Kanagawa", "Aichi", "Hokkaido", "Fukuoka"] },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', phone_code: '+41', state_label: 'Canton', postal_label: 'Postal Code', postal_placeholder: '8001', matched_currency: 'CHF', display_order: 12, states: ["Zurich", "Geneva", "Vaud", "Bern", "Basel-Stadt"] },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', phone_code: '+965', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '13001', matched_currency: 'KWD', display_order: 13, states: ["Al Asimah (Kuwait City)", "Hawalli", "Farwaniya", "Ahmadi", "Jahra"] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', phone_code: '+974', state_label: 'Municipality', postal_label: 'Postal Code', postal_placeholder: '00000', matched_currency: 'QAR', display_order: 14, states: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"] },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', phone_code: '+968', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '100', matched_currency: 'OMR', display_order: 15, states: ["Muscat", "Dhofar", "Musandam", "Al Batinah"] },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', phone_code: '+973', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '301', matched_currency: 'BHD', display_order: 16, states: ["Capital", "Muharraq", "Northern", "Southern"] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phone_code: '+39', state_label: 'Region / Province', postal_label: 'CAP', postal_placeholder: '00100', matched_currency: 'EUR', display_order: 17, states: ["Lombardy (Milan)", "Lazio (Rome)", "Tuscany (Florence)", "Veneto (Venice)"] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phone_code: '+34', state_label: 'Province', postal_label: 'Código Postal', postal_placeholder: '28001', matched_currency: 'EUR', display_order: 18, states: ["Madrid", "Catalonia (Barcelona)", "Andalusia", "Valencia"] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phone_code: '+31', state_label: 'Province', postal_label: 'Postcode', postal_placeholder: '1012 JS', matched_currency: 'EUR', display_order: 19, states: ["North Holland (Amsterdam)", "South Holland (Rotterdam)", "Utrecht"] },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', phone_code: '+32', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '1000', matched_currency: 'EUR', display_order: 20, states: ["Brussels", "Flemish Brabant", "Antwerp"] },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', phone_code: '+43', state_label: 'Federal State', postal_label: 'PLZ', postal_placeholder: '1010', matched_currency: 'EUR', display_order: 21, states: ["Vienna", "Salzburg", "Tyrol", "Styria"] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', phone_code: '+46', state_label: 'County', postal_label: 'Postnummer', postal_placeholder: '111 22', matched_currency: 'SEK', display_order: 22, states: ["Stockholm", "Västra Götaland", "Skåne"] },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', phone_code: '+47', state_label: 'County', postal_label: 'Postnummer', postal_placeholder: '0150', matched_currency: 'NOK', display_order: 23, states: ["Oslo", "Viken", "Vestland"] },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', phone_code: '+45', state_label: 'Region', postal_label: 'Postnummer', postal_placeholder: '1050', matched_currency: 'DKK', display_order: 24, states: ["Capital Region (Copenhagen)", "Zealand", "Southern Denmark"] },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', phone_code: '+358', state_label: 'Region', postal_label: 'Postinumero', postal_placeholder: '00100', matched_currency: 'EUR', display_order: 25, states: ["Uusimaa (Helsinki)", "Pirkanmaa", "Southwest Finland"] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', phone_code: '+353', state_label: 'County', postal_label: 'Eircode', postal_placeholder: 'D02 X285', matched_currency: 'EUR', display_order: 26, states: ["Dublin", "Cork", "Galway", "Limerick"] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', phone_code: '+64', state_label: 'Region', postal_label: 'Postcode', postal_placeholder: '1010', matched_currency: 'NZD', display_order: 27, states: ["Auckland", "Wellington", "Canterbury (Christchurch)"] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', phone_code: '+27', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '8001', matched_currency: 'ZAR', display_order: 28, states: ["Gauteng (Johannesburg)", "Western Cape (Cape Town)", "KwaZulu-Natal (Durban)"] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phone_code: '+60', state_label: 'State / Territory', postal_label: 'Postcode', postal_placeholder: '50000', matched_currency: 'MYR', display_order: 29, states: ["Kuala Lumpur", "Selangor", "Penang", "Johor"] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phone_code: '+66', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '10100', matched_currency: 'THB', display_order: 30, states: ["Bangkok", "Chiang Mai", "Phuket", "Chonburi"] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phone_code: '+62', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '10110', matched_currency: 'IDR', display_order: 31, states: ["DKI Jakarta", "Bali", "West Java", "East Java"] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', phone_code: '+63', state_label: 'Province / Region', postal_label: 'ZIP Code', postal_placeholder: '1000', matched_currency: 'PHP', display_order: 32, states: ["Metro Manila", "Cebu", "Davao"] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', phone_code: '+84', state_label: 'Province / City', postal_label: 'Postal Code', postal_placeholder: '700000', matched_currency: 'VND', display_order: 33, states: ["Ho Chi Minh City", "Hanoi", "Da Nang"] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phone_code: '+82', state_label: 'Province / City', postal_label: 'Postal Code', postal_placeholder: '04524', matched_currency: 'KRW', display_order: 34, states: ["Seoul", "Busan", "Incheon", "Gyeonggi-do"] },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', phone_code: '+852', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '999077', matched_currency: 'HKD', display_order: 35, states: ["Central and Western", "Wan Chai", "Kowloon", "New Territories"] },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', phone_code: '+886', state_label: 'County / City', postal_label: 'Postal Code', postal_placeholder: '100', matched_currency: 'TWD', display_order: 36, states: ["Taipei City", "New Taipei City", "Kaohsiung City", "Taichung City"] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phone_code: '+52', state_label: 'State', postal_label: 'Código Postal', postal_placeholder: '01000', matched_currency: 'MXN', display_order: 37, states: ["Mexico City", "Jalisco (Guadalajara)", "Nuevo León (Monterrey)"] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phone_code: '+55', state_label: 'State', postal_label: 'CEP', postal_placeholder: '01000-000', matched_currency: 'BRL', display_order: 38, states: ["São Paulo", "Rio de Janeiro", "Minas Gerais"] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', phone_code: '+54', state_label: 'Province', postal_label: 'Código Postal', postal_placeholder: 'C1001', matched_currency: 'ARS', display_order: 39, states: ["Buenos Aires", "Córdoba", "Santa Fe"] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', phone_code: '+56', state_label: 'Region', postal_label: 'Código Postal', postal_placeholder: '8320000', matched_currency: 'CLP', display_order: 40, states: ["Santiago Metropolitan", "Valparaíso", "Bío Bío"] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', phone_code: '+57', state_label: 'Department', postal_label: 'Código Postal', postal_placeholder: '110111', matched_currency: 'COP', display_order: 41, states: ["Bogotá D.C.", "Antioquia (Medellín)", "Valle del Cauca (Cali)"] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', phone_code: '+51', state_label: 'Department', postal_label: 'Código Postal', postal_placeholder: '15001', matched_currency: 'PEN', display_order: 42, states: ["Lima", "Arequipa", "Cusco"] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', phone_code: '+90', state_label: 'Province', postal_label: 'Posta Kodu', postal_placeholder: '34000', matched_currency: 'TRY', display_order: 43, states: ["Istanbul", "Ankara", "Izmir", "Antalya"] },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', phone_code: '+20', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '11511', matched_currency: 'EGP', display_order: 44, states: ["Cairo", "Alexandria", "Giza", "Red Sea"] },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', phone_code: '+962', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '11118', matched_currency: 'JOD', display_order: 45, states: ["Amman", "Zarqa", "Irbid", "Aqaba"] },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', phone_code: '+961', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '1107', matched_currency: 'USD', display_order: 46, states: ["Beirut", "Mount Lebanon", "North", "South"] },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', phone_code: '+972', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '6100000', matched_currency: 'ILS', display_order: 47, states: ["Tel Aviv", "Central", "Jerusalem", "Haifa"] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', phone_code: '+880', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '1000', matched_currency: 'BDT', display_order: 48, states: ["Dhaka", "Chittagong", "Sylhet"] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', phone_code: '+92', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '44000', matched_currency: 'PKR', display_order: 49, states: ["Punjab (Lahore)", "Sindh (Karachi)", "Islamabad Capital Territory", "Khyber Pakhtunkhwa"] },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', phone_code: '+94', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '00100', matched_currency: 'LKR', display_order: 50, states: ["Colombo", "Kandy", "Galle"] },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', phone_code: '+977', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '44600', matched_currency: 'NPR', display_order: 51, states: ["Bagmati (Kathmandu)", "Gandaki (Pokhara)"] },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', phone_code: '+212', state_label: 'Region', postal_label: 'Postal Code', postal_placeholder: '10000', matched_currency: 'MAD', display_order: 52, states: ["Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakesh-Safi"] },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', phone_code: '+216', state_label: 'Governorate', postal_label: 'Postal Code', postal_placeholder: '1000', matched_currency: 'TND', display_order: 53, states: ["Tunis", "Ariana", "Sousse"] },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', phone_code: '+213', state_label: 'Province', postal_label: 'Postal Code', postal_placeholder: '16000', matched_currency: 'DZD', display_order: 54, states: ["Algiers", "Oran", "Constantine"] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', phone_code: '+234', state_label: 'State', postal_label: 'Postal Code', postal_placeholder: '100001', matched_currency: 'NGN', display_order: 55, states: ["Lagos", "Abuja FCT", "Rivers (Port Harcourt)"] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', phone_code: '+254', state_label: 'County', postal_label: 'Postal Code', postal_placeholder: '00100', matched_currency: 'KES', display_order: 56, states: ["Nairobi", "Mombasa", "Kisumu"] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', phone_code: '+233', state_label: 'Region', postal_label: 'Digital Address', postal_placeholder: 'GA-183', matched_currency: 'GHS', display_order: 57, states: ["Greater Accra", "Ashanti (Kumasi)"] },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', phone_code: '+230', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '11328', matched_currency: 'MUR', display_order: 58, states: ["Port Louis", "Black River", "Grand Port"] },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', phone_code: '+248', state_label: 'District', postal_label: 'Postal Code', postal_placeholder: '0000', matched_currency: 'SCR', display_order: 59, states: ["Victoria", "Beau Vallon"] },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', phone_code: '+960', state_label: 'Atoll / City', postal_label: 'Postal Code', postal_placeholder: '20002', matched_currency: 'USD', display_order: 60, states: ["Malé", "Hulhumalé"] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', phone_code: '+48', state_label: 'Voivodeship', postal_label: 'Kod Pocztowy', postal_placeholder: '00-001', matched_currency: 'PLN', display_order: 61, states: ["Masovian (Warsaw)", "Lesser Poland (Krakow)"] },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', phone_code: '+420', state_label: 'Region', postal_label: 'PSČ', postal_placeholder: '110 00', matched_currency: 'CZK', display_order: 62, states: ["Prague", "South Moravia (Brno)"] },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', phone_code: '+36', state_label: 'County', postal_label: 'Irányítószám', postal_placeholder: '1011', matched_currency: 'HUF', display_order: 63, states: ["Budapest", "Pest", "Győr-Moson-Sopron"] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', phone_code: '+40', state_label: 'County', postal_label: 'Cod Poștal', postal_placeholder: '010011', matched_currency: 'RON', display_order: 64, states: ["Bucharest", "Cluj", "Timiș"] },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', phone_code: '+30', state_label: 'Region', postal_label: 'Postal Code', postal_placeholder: '104 31', matched_currency: 'EUR', display_order: 65, states: ["Attica (Athens)", "Central Macedonia (Thessaloniki)"] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', phone_code: '+351', state_label: 'District', postal_label: 'Código Postal', postal_placeholder: '1000-001', matched_currency: 'EUR', display_order: 66, states: ["Lisbon", "Porto", "Faro (Algarve)"] },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', phone_code: '+352', state_label: 'Canton', postal_label: 'Postal Code', postal_placeholder: 'L-1111', matched_currency: 'EUR', display_order: 67, states: ["Luxembourg City", "Esch-sur-Alzette"] },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', phone_code: '+377', state_label: 'Quarter', postal_label: 'Postal Code', postal_placeholder: '98000', matched_currency: 'EUR', display_order: 68, states: ["Monte Carlo", "La Condamine"] },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', phone_code: '+354', state_label: 'Region', postal_label: 'Póstnúmer', postal_placeholder: '101', matched_currency: 'ISK', display_order: 69, states: ["Capital Region (Reykjavík)"] },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', phone_code: '+380', state_label: 'Oblast', postal_label: 'Postal Code', postal_placeholder: '01001', matched_currency: 'UAH', display_order: 70, states: ["Kyiv", "Lviv", "Odesa"] }
];

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client unavailable' }, { status: 500 });
    }

    const payload = ALL_COUNTRIES_SEED.map((c) => ({
      store_id: STORE_ID,
      code: c.code,
      name: c.name,
      flag: c.flag,
      phone_code: c.phone_code,
      state_label: c.state_label,
      postal_label: c.postal_label,
      postal_placeholder: c.postal_placeholder,
      matched_currency: c.matched_currency,
      states: c.states,
      is_active: true,
      display_order: c.display_order,
    }));

    const { data, error } = await supabase
      .from('countries')
      .upsert(payload, { onConflict: 'store_id,code' })
      .select();

    if (error) {
      console.error('Error seeding countries in Supabase:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${data?.length || ALL_COUNTRIES_SEED.length} world countries into Supabase database!`,
      count: data?.length || ALL_COUNTRIES_SEED.length,
    });
  } catch (err: any) {
    console.error('Seeding exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
