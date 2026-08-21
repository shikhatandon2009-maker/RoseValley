const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

const siteSettingsRecord = {
  id: '540c2625-27a8-4377-8989-8c298777a1bc',
  store_id: 'essential_oils_perfumes_store_01',
  site_name: 'RoseOil.IN',
  tagline: 'Kannauj Hydro-Distillates',
  logo_url: '/uploads/logos/site_logo_1787196937647.png',
  favicon_url: '/uploads/logos/site_favicon_1787196938240.jpg',
  contact_email: 'shikhatandon2009@gmail.com',
  contact_phone: '9648678599',
  shipping_rates: { express: 300, standard: 150, free_threshold: 2500 },
  tax_rate: 18.00,
  social_links: {
    _store_city: "Kannauj",
    _store_gstin: "09AAACR1234F1Z5",
    _store_state: "Uttar Pradesh",
    _store_country: "India",
    _store_pincode: "209725",
    _support_hours: "Mon - Sat: 9:00 AM - 8:00 PM IST",
    _use_text_logo: false,
    _whatsapp_number: "+91 96486 78599",
    _google_map_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    _store_address_line1: "Rose Valley Estate, Deg-Bhapka Heritage Stills",
    _store_address_line2: "Kannauj Industrial Area"
  },
  hero_video_url: 'https://cdn.shopify.com/videos/c/o/v/43ca2028a79041179ed82c0ece7718b1.mp4',
  hero_video_play_duration: 6.00,
  hero_video_pause_duration: 10.00,
  hero_video_loop_enabled: true,
  store_address_line1: 'Rose Valley Estate, Deg-Bhapka Heritage Stills',
  store_address_line2: 'Kannauj Industrial Area',
  store_city: 'Kannauj',
  store_state: 'Uttar Pradesh',
  store_pincode: '209725',
  store_country: 'India',
  whatsapp_number: '+91 96486 78599',
  support_hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
  google_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  updated_at: new Date().toISOString()
};

async function pushSettings() {
  try {
    // 1. Check if site_settings table exists
    const { data: existing, error: fetchErr } = await supabase
      .from('site_settings')
      .select('*')
      .eq('store_id', siteSettingsRecord.store_id);

    console.log('Existing settings query:', { existing, fetchErr });

    // 2. Upsert
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(siteSettingsRecord, { onConflict: 'store_id' })
      .select();

    if (error) {
      console.error('❌ Upsert Error:', error);
    } else {
      console.log('✅ Site settings successfully pushed to Supabase:', data);
    }
  } catch (e) {
    console.error('Fatal error:', e);
  }
}

pushSettings();
