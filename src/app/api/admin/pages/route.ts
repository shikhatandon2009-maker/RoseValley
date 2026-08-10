import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const pageType = searchParams.get('page_type');

    let query = supabase
      .from('pages')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('updated_at', { ascending: false });

    if (pageType && pageType !== 'all') {
      query = query.eq('page_type', pageType);
    }

    const { data: pages, error } = await query;

    if (error) {
      console.error('Error fetching pages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = pages || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(searchLower) ||
          p.slug?.toLowerCase().includes(searchLower) ||
          p.excerpt?.toLowerCase().includes(searchLower) ||
          p.content?.toLowerCase().includes(searchLower)
      );
    }

    const totalPages = filtered.length;
    const staticPagesCount = filtered.filter((p: any) => p.page_type === 'static').length;
    const blogArticlesCount = filtered.filter((p: any) => p.page_type === 'blog').length;

    return NextResponse.json({
      pages: filtered,
      stats: {
        totalPages,
        staticPagesCount,
        blogArticlesCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/pages:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      page_type = 'static',
      content,
      excerpt = '',
      featured_image = '',
      meta_title = '',
      meta_description = '',
    } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { error: 'Page title and content are required.' },
        { status: 400 }
      );
    }

    const finalSlug = slug && slug.trim() ? generateSlug(slug) : generateSlug(title);
    const supabase = getSupabaseServerClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('pages')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Page slug "${finalSlug}" already exists.` },
        { status: 409 }
      );
    }

    const { data: newPage, error: insertError } = await supabase
      .from('pages')
      .insert([
        {
          store_id: STORE_ID,
          title: title.trim(),
          slug: finalSlug,
          page_type,
          content: content.trim(),
          excerpt: excerpt.trim(),
          featured_image: featured_image.trim(),
          meta_title: meta_title.trim() || title.trim(),
          meta_description: meta_description.trim() || excerpt.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting page:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Page created successfully', page: newPage },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/pages:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
