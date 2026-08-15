import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID, STORE_NAME } from '@/lib/constants';
import { formatImageUrl } from '@/lib/format-image';

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
      logo_url: '/images/rvk-logo.png',
      favicon_url: '/images/rvk-logo.png',
      use_text_logo: false,
      contact_email: 'support@rosevalleykannauj.com',
      contact_phone: '+91 98765 43210',
      shipping_rates: { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate: 18.00,
      store_gstin: '09AAACR1234F1Z5',
      social_links: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
      },
    };

    const resultSettings = settings ? { ...defaultSettings, ...settings } : defaultSettings;

    // Resolve store_gstin if stored in social_links
    if ((resultSettings.social_links as any)?._store_gstin && !resultSettings.store_gstin) {
      resultSettings.store_gstin = (resultSettings.social_links as any)._store_gstin;
    }

    // Resolve use_text_logo: check social_links._use_text_logo fallback first if set, or column value
    let useTextLogo = false;
    if (typeof (resultSettings.social_links as any)?._use_text_logo === 'boolean') {
      useTextLogo = Boolean((resultSettings.social_links as any)._use_text_logo);
    } else if (resultSettings.use_text_logo !== undefined && resultSettings.use_text_logo !== null) {
      useTextLogo = Boolean(resultSettings.use_text_logo);
    }
    resultSettings.use_text_logo = useTextLogo;

    if (resultSettings.logo_url) {
      resultSettings.logo_url = formatImageUrl(resultSettings.logo_url, '/images/rvk-logo.png');
    }
    if (resultSettings.favicon_url) {
      resultSettings.favicon_url = formatImageUrl(resultSettings.favicon_url, '/images/rvk-logo.png');
    }

    return NextResponse.json({ settings: resultSettings });
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
      use_text_logo = false,
      contact_email,
      contact_phone,
      shipping_rates = { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate = 18.00,
      store_gstin = '09AAACR1234F1Z5',
      social_links = {},
    } = body;

    const formattedLogoUrl = formatImageUrl(logo_url, '/images/rvk-logo.png');
    const formattedFaviconUrl = formatImageUrl(favicon_url, '/images/rvk-logo.png');

    const supabase = getSupabaseServerClient();

    const mergedSocialLinks = {
      ...(typeof social_links === 'object' && social_links ? social_links : {}),
      _use_text_logo: Boolean(use_text_logo),
      _store_gstin: String(store_gstin || '09AAACR1234F1Z5').trim(),
    };

    const payload = {
      store_id: STORE_ID,
      site_name: String(site_name || STORE_NAME).trim(),
      tagline: String(tagline || '').trim(),
      logo_url: formattedLogoUrl,
      favicon_url: formattedFaviconUrl,
      use_text_logo: Boolean(use_text_logo),
      contact_email: String(contact_email || '').trim(),
      contact_phone: String(contact_phone || '').trim(),
      shipping_rates,
      tax_rate: Number(tax_rate) || 0,
      social_links: mergedSocialLinks,
      updated_at: new Date().toISOString(),
    };

    let { data: updatedSettings, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'store_id' })
      .select('*')
      .single();

    if (error) {
      console.warn('Supabase site_settings upsert with use_text_logo column failed. Retrying without column:', error.message);
      const { use_text_logo: _, ...fallbackPayload } = payload;
      const { data: fallbackSettings, error: fallbackError } = await supabase
        .from('site_settings')
        .upsert(fallbackPayload, { onConflict: 'store_id' })
        .select('*')
        .single();

      if (!fallbackError && fallbackSettings) {
        updatedSettings = { ...fallbackSettings, use_text_logo: Boolean(use_text_logo), store_gstin: String(store_gstin) };
        error = null;
      } else {
        error = fallbackError;
      }
    } else if (updatedSettings) {
      updatedSettings.use_text_logo = Boolean(use_text_logo);
      updatedSettings.store_gstin = String(store_gstin);
    }

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


