import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { data: sections, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching homepage sections:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sections: sections || [] });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/homepage-sections:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      section_type = 'hero_banner',
      title = '',
      subtitle = '',
      content = {},
      display_order = 0,
      is_active = true,
    } = body;

    const safeType = String(section_type || 'hero_banner').trim();
    if (!safeType) {
      return NextResponse.json({ error: 'Section type is required.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: newSection, error: insertError } = await supabase
      .from('homepage_sections')
      .insert([
        {
          store_id: STORE_ID,
          section_type: safeType,
          title: String(title || '').trim(),
          subtitle: String(subtitle || '').trim(),
          content: content || {},
          display_order: Number(display_order) || 0,
          is_active: Boolean(is_active),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting homepage section:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Homepage section created successfully', section: newSection },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/homepage-sections:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
