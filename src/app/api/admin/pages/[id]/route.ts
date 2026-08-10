import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (error || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const body = await request.json();

    const { title, slug, page_type, content, excerpt, featured_image, meta_title, meta_description } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) updates.slug = generateSlug(slug);
    if (page_type !== undefined) updates.page_type = page_type;
    if (content !== undefined) updates.content = content.trim();
    if (excerpt !== undefined) updates.excerpt = excerpt.trim();
    if (featured_image !== undefined) updates.featured_image = featured_image.trim();
    if (meta_title !== undefined) updates.meta_title = meta_title.trim();
    if (meta_description !== undefined) updates.meta_description = meta_description.trim();

    const { data: updatedPage, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating page:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Page updated successfully', page: updatedPage });
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
      .from('pages')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting page:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
