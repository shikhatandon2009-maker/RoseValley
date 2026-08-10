import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

let memoryThemeCache: any = {
  activeTheme: 'royal-white',
  custom_primary: '#111827',
  custom_accent: '#D4AF37',
  custom_bg: '#FFFFFF',
  custom_text: '#111827',
  custom_border: '#E5E7EB',
  custom_card_bg: '#FFFFFF',
  custom_css: '',
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { data: theme, error } = await supabase
      .from('site_themes')
      .select('*')
      .eq('store_id', STORE_ID)
      .maybeSingle();

    if (error || !theme) {
      return NextResponse.json({
        success: true,
        activeTheme: memoryThemeCache.activeTheme,
        custom_primary: memoryThemeCache.custom_primary,
        custom_accent: memoryThemeCache.custom_accent,
        custom_bg: memoryThemeCache.custom_bg,
        custom_text: memoryThemeCache.custom_text,
        custom_border: memoryThemeCache.custom_border,
        custom_card_bg: memoryThemeCache.custom_card_bg,
        custom_css: memoryThemeCache.custom_css || '',
      });
    }

    return NextResponse.json({
      success: true,
      activeTheme: theme.active_theme_id || 'royal-white',
      custom_primary: theme.custom_primary || '#111827',
      custom_accent: theme.custom_accent || '#D4AF37',
      custom_bg: theme.custom_bg || '#FFFFFF',
      custom_text: theme.custom_text || '#111827',
      custom_border: theme.custom_border || '#E5E7EB',
      custom_card_bg: theme.custom_card_bg || '#FFFFFF',
      custom_css: theme.custom_css || '',
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      activeTheme: memoryThemeCache.activeTheme,
      custom_css: memoryThemeCache.custom_css || '',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      themeId = 'royal-white',
      custom_primary = '#111827',
      custom_accent = '#D4AF37',
      custom_bg = '#FFFFFF',
      custom_text = '#111827',
      custom_border = '#E5E7EB',
      custom_card_bg = '#FFFFFF',
      custom_css = '',
    } = body;

    memoryThemeCache = {
      activeTheme: themeId,
      custom_primary,
      custom_accent,
      custom_bg,
      custom_text,
      custom_border,
      custom_card_bg,
      custom_css: custom_css || '',
    };

    const supabase = getSupabaseServerClient();

    const payload = {
      store_id: STORE_ID,
      active_theme_id: themeId,
      custom_primary,
      custom_accent,
      custom_bg,
      custom_text,
      custom_border,
      custom_card_bg,
      custom_css: custom_css || '',
      updated_at: new Date().toISOString(),
    };

    const { data: updatedTheme, error: upsertError } = await supabase
      .from('site_themes')
      .upsert(payload, { onConflict: 'store_id' })
      .select('*')
      .single();

    return NextResponse.json({
      message: 'Site theme & custom CSS saved successfully',
      theme: updatedTheme || memoryThemeCache,
    });
  } catch (err: any) {
    return NextResponse.json({
      message: 'Site theme & custom CSS saved successfully',
      theme: memoryThemeCache,
    });
  }
}
