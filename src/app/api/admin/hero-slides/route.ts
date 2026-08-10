import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || 'essential_oils_perfumes_store_01';

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const DEFAULT_SLIDES = [
  {
    id: 'default-champaca-1',
    store_id: STORE_ID,
    tagline: 'Harvest 2026 • Royal Botanical Reserve',
    title: 'Golden Champaca',
    subtitle: 'Extracted from dawn-harvested golden Champaca blossoms (Magnolia champaca). Steam distilled into a pure sandalwood base for an extraordinary divine floral sillage.',
    product_name: 'Golden Champaca Absolute Oil',
    product_link: '/products',
    bg_image_url: '/images/hero/champaca-flower-bg.png',
    bottle_image_url: '/images/hero/champaca-bottle.png',
    button_text: 'Explore Golden Champaca',
    badge_text: '100% Hydro-Distilled • Alcohol-Free',
    glow_color: '#FFD700',
    display_order: 0,
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, slides: DEFAULT_SLIDES });
    }

    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, slides: DEFAULT_SLIDES });
    }

    return NextResponse.json({ success: true, slides: data });
  } catch (err) {
    return NextResponse.json({ success: true, slides: DEFAULT_SLIDES });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Supabase client not configured in environment variables' },
        { status: 400 }
      );
    }

    const {
      id,
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
      is_active,
    } = body;

    const payload = {
      store_id: STORE_ID,
      tagline,
      title,
      subtitle,
      product_name,
      product_link,
      bg_image_url,
      bottle_image_url,
      button_text,
      badge_text,
      glow_color: glow_color || '#FFD700',
      is_active: is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id && !id.startsWith('default-')) {
      result = await supabase
        .from('hero_slides')
        .update(payload)
        .eq('id', id)
        .eq('store_id', STORE_ID)
        .select();
    } else {
      result = await supabase
        .from('hero_slides')
        .insert([payload])
        .select();
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slide: result.data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
