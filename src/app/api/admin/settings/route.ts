import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID, STORE_NAME } from '@/lib/constants';
import { formatImageUrl } from '@/lib/format-image';

async function normalizeAndSaveImageUrl(url: string | undefined | null, defaultName: string): Promise<string> {
  if (!url || typeof url !== 'string') return '/images/logo/logo.png';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) {
    try {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        const header = trimmed.slice(0, commaIdx);
        const base64Data = trimmed.slice(commaIdx + 1).trim();
        const extMatch = header.match(/data:image\/([a-zA-Z0-9+.-]+)/);
        let rawExt = extMatch ? extMatch[1].toLowerCase() : 'png';
        if (rawExt.includes('svg')) rawExt = 'svg';
        else if (rawExt.includes('jpeg') || rawExt.includes('jpg')) rawExt = 'jpg';
        else rawExt = 'png';

        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${defaultName}_${Date.now()}.${rawExt}`;

        // 1. Try Supabase storage
        try {
          const supabase = getSupabaseServerClient();
          const storagePath = `logos/${filename}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('images')
            .upload(storagePath, buffer, {
              contentType: `image/${rawExt === 'jpg' ? 'jpeg' : rawExt}`,
              upsert: true,
            });

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(storagePath);
            if (publicUrlData && publicUrlData.publicUrl) {
              return publicUrlData.publicUrl;
            }
          }
        } catch (_) {}

        // 2. Fallback: Save to local filesystem
        const { writeFile, mkdir } = await import('fs/promises');
        const path = await import('path');
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        return `/uploads/logos/${filename}`;
      }
    } catch (e) {
      console.warn('Error converting base64 logo/favicon:', e);
    }
  }
  return formatImageUrl(trimmed, '/images/logo/logo.png');
}

export const dynamic = 'force-dynamic';

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
      logo_url: '/images/logo/logo.png',
      favicon_url: '/images/logo/favicon.png',
      use_text_logo: false,
      contact_email: 'shikhatandon2009@gmail.com',
      contact_phone: '+91 96486 78599',
      whatsapp_number: '+91 96486 78599',
      store_address_line1: 'Rose Valley Estate, Deg-Bhapka Heritage Stills',
      store_address_line2: 'Kannauj Industrial Area',
      store_city: 'Kannauj',
      store_state: 'Uttar Pradesh',
      store_pincode: '209725',
      store_country: 'India',
      support_hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
      google_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      shipping_rates: { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate: 18.00,
      store_gstin: '09AAACR1234F1Z5',
      social_links: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
      },
    };

    const resultSettings = settings ? { ...defaultSettings, ...settings } : defaultSettings;

    // Resolve store address fields from social_links JSONB fallback if columns not present in DB table
    const sLinks = (resultSettings.social_links as any) || {};
    if (sLinks._store_address_line1 && !settings?.store_address_line1) {
      resultSettings.store_address_line1 = sLinks._store_address_line1;
    }
    if (sLinks._store_address_line2 && !settings?.store_address_line2) {
      resultSettings.store_address_line2 = sLinks._store_address_line2;
    }
    if (sLinks._store_city && !settings?.store_city) {
      resultSettings.store_city = sLinks._store_city;
    }
    if (sLinks._store_state && !settings?.store_state) {
      resultSettings.store_state = sLinks._store_state;
    }
    if (sLinks._store_pincode && !settings?.store_pincode) {
      resultSettings.store_pincode = sLinks._store_pincode;
    }
    if (sLinks._store_country && !settings?.store_country) {
      resultSettings.store_country = sLinks._store_country;
    }
    if (sLinks._whatsapp_number && !settings?.whatsapp_number) {
      resultSettings.whatsapp_number = sLinks._whatsapp_number;
    }
    if (sLinks._support_hours && !settings?.support_hours) {
      resultSettings.support_hours = sLinks._support_hours;
    }
    if (sLinks._google_map_embed && !settings?.google_map_embed) {
      resultSettings.google_map_embed = sLinks._google_map_embed;
    }
    if (sLinks._store_gstin && !resultSettings.store_gstin) {
      resultSettings.store_gstin = sLinks._store_gstin;
    }

    // Resolve use_text_logo
    let useTextLogo = false;
    if (typeof sLinks._use_text_logo === 'boolean') {
      useTextLogo = Boolean(sLinks._use_text_logo);
    } else if (resultSettings.use_text_logo !== undefined && resultSettings.use_text_logo !== null) {
      useTextLogo = Boolean(resultSettings.use_text_logo);
    }
    resultSettings.use_text_logo = useTextLogo;

    // Convert base64 URLs to clean files if present
    let needsDbClean = false;
    if (resultSettings.logo_url && resultSettings.logo_url.startsWith('data:image/')) {
      resultSettings.logo_url = await normalizeAndSaveImageUrl(resultSettings.logo_url, 'site_logo');
      needsDbClean = true;
    } else if (resultSettings.logo_url) {
      resultSettings.logo_url = formatImageUrl(resultSettings.logo_url, '/images/logo/logo.png');
    }

    if (resultSettings.favicon_url && resultSettings.favicon_url.startsWith('data:image/')) {
      resultSettings.favicon_url = await normalizeAndSaveImageUrl(resultSettings.favicon_url, 'site_favicon');
      needsDbClean = true;
    } else if (resultSettings.favicon_url) {
      resultSettings.favicon_url = formatImageUrl(resultSettings.favicon_url, '/images/logo/favicon.png');
    }

    if (needsDbClean) {
      try {
        await supabase
          .from('site_settings')
          .update({
            logo_url: resultSettings.logo_url,
            favicon_url: resultSettings.favicon_url,
          })
          .eq('store_id', STORE_ID);
      } catch (_) {}
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
      whatsapp_number = '+91 96486 78599',
      store_address_line1 = 'Rose Valley Estate, Deg-Bhapka Heritage Stills',
      store_address_line2 = 'Kannauj Industrial Area',
      store_city = 'Kannauj',
      store_state = 'Uttar Pradesh',
      store_pincode = '209725',
      store_country = 'India',
      support_hours = 'Mon - Sat: 9:00 AM - 8:00 PM IST',
      google_map_embed = '',
      shipping_rates = { standard: 150, express: 300, free_threshold: 2500 },
      tax_rate = 18.00,
      store_gstin = '09AAACR1234F1Z5',
      social_links = {},
    } = body;

    const formattedLogoUrl = await normalizeAndSaveImageUrl(logo_url, 'site_logo');
    const formattedFaviconUrl = await normalizeAndSaveImageUrl(favicon_url, 'site_favicon');

    const supabase = getSupabaseServerClient();

    // Store address and extra parameters inside social_links JSONB as guaranteed storage
    const mergedSocialLinks = {
      ...(typeof social_links === 'object' && social_links ? social_links : {}),
      _use_text_logo: Boolean(use_text_logo),
      _store_gstin: String(store_gstin || '09AAACR1234F1Z5').trim(),
      _store_address_line1: String(store_address_line1 || '').trim(),
      _store_address_line2: String(store_address_line2 || '').trim(),
      _store_city: String(store_city || '').trim(),
      _store_state: String(store_state || '').trim(),
      _store_pincode: String(store_pincode || '').trim(),
      _store_country: String(store_country || '').trim(),
      _whatsapp_number: String(whatsapp_number || '').trim(),
      _support_hours: String(support_hours || '').trim(),
      _google_map_embed: String(google_map_embed || '').trim(),
    };

    const payload: Record<string, any> = {
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

    // Include explicit columns if they exist in schema
    payload.store_address_line1 = String(store_address_line1 || '').trim();
    payload.store_address_line2 = String(store_address_line2 || '').trim();
    payload.store_city = String(store_city || '').trim();
    payload.store_state = String(store_state || '').trim();
    payload.store_pincode = String(store_pincode || '').trim();
    payload.store_country = String(store_country || '').trim();
    payload.whatsapp_number = String(whatsapp_number || '').trim();
    payload.support_hours = String(support_hours || '').trim();
    if (google_map_embed) payload.google_map_embed = String(google_map_embed || '').trim();

    let { data: updatedSettings, error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'store_id' })
      .select('*')
      .single();

    if (error) {
      console.warn('Supabase site_settings upsert with address columns failed. Retrying with JSONB storage:', error.message);
      
      // Fallback payload without optional new columns
      const fallbackPayload = {
        store_id: STORE_ID,
        site_name: String(site_name || STORE_NAME).trim(),
        tagline: String(tagline || '').trim(),
        logo_url: formattedLogoUrl,
        favicon_url: formattedFaviconUrl,
        contact_email: String(contact_email || '').trim(),
        contact_phone: String(contact_phone || '').trim(),
        shipping_rates,
        tax_rate: Number(tax_rate) || 0,
        social_links: mergedSocialLinks,
        updated_at: new Date().toISOString(),
      };

      const { data: fallbackSettings, error: fallbackError } = await supabase
        .from('site_settings')
        .upsert(fallbackPayload, { onConflict: 'store_id' })
        .select('*')
        .single();

      if (!fallbackError && fallbackSettings) {
        updatedSettings = {
          ...fallbackSettings,
          use_text_logo: Boolean(use_text_logo),
          store_gstin: String(store_gstin),
          store_address_line1,
          store_address_line2,
          store_city,
          store_state,
          store_pincode,
          store_country,
          whatsapp_number,
          support_hours,
          google_map_embed,
        };
        error = null;
      } else {
        error = fallbackError;
      }
    } else if (updatedSettings) {
      updatedSettings.use_text_logo = Boolean(use_text_logo);
      updatedSettings.store_gstin = String(store_gstin);
      updatedSettings.store_address_line1 = store_address_line1;
      updatedSettings.store_address_line2 = store_address_line2;
      updatedSettings.store_city = store_city;
      updatedSettings.store_state = store_state;
      updatedSettings.store_pincode = store_pincode;
      updatedSettings.store_country = store_country;
      updatedSettings.whatsapp_number = whatsapp_number;
      updatedSettings.support_hours = support_hours;
      updatedSettings.google_map_embed = google_map_embed;
    }

    if (error) {
      console.error('Error saving site settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Site and Store Address settings updated successfully',
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
