import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID, STORE_NAME } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('store_id', STORE_ID)
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default fallback settings
    const defaultSettings = {
      store_id: STORE_ID,
      site_name: STORE_NAME,
      tagline: 'Artisanal Attars & Pure Distillates • Kannauj',
      logo_url: '',
      favicon_url: '',
      contact_email: 'support@maisonessence.com',
      contact_phone: '+91 98765 43210',
      shipping_rates: { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate: 18.00,
      social_links: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
      },
    };

    return NextResponse.json({ settings: settings || defaultSettings });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/settings:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      site_name,
      tagline,
      logo_url,
      favicon_url,
      contact_email,
      contact_phone,
      shipping_rates = { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate = 18.00,
      social_links = {},
    } = body;

    const supabase = getSupabaseServerClient();

    const payload = {
      store_id: STORE_ID,
      site_name: String(site_name || STORE_NAME).trim(),
      tagline: String(tagline || '').trim(),
      logo_url: String(logo_url || '').trim(),
      favicon_url: String(favicon_url || '').trim(),
      contact_email: String(contact_email || '').trim(),
      contact_phone: String(contact_phone || '').trim(),
      shipping_rates,
      tax_rate: Number(tax_rate) || 0,
      social_links: social_links || {},
      updated_at: new Date().toISOString(),
    };

    const { data: updatedSettings, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'store_id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error saving site settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Site settings updated successfully',
      settings: updatedSettings,
    });
  } catch (err: any) {
    console.error('API Error in PUT /api/admin/settings:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
