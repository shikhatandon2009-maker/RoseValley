import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    const { section_type, title, subtitle, content, display_order, is_active } = body;

    const updates: Record<string, any> = {};

    if (section_type !== undefined) updates.section_type = String(section_type || '').trim();
    if (title !== undefined) updates.title = String(title || '').trim();
    if (subtitle !== undefined) updates.subtitle = String(subtitle || '').trim();
    if (content !== undefined) updates.content = content || {};
    if (display_order !== undefined) updates.display_order = Number(display_order) || 0;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { data: updatedSection, error } = await supabase
      .from('homepage_sections')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating homepage section:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Homepage section updated successfully', section: updatedSection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting homepage section:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Homepage section deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
