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

    let query = supabase
      .from('categories')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filteredCategories = categories || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCategories = filteredCategories.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(searchLower) ||
          c.slug?.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      );
    }

    const totalCategories = filteredCategories.length;
    const hasImageCount = filteredCategories.filter((c: any) => Boolean(c.image_url)).length;

    return NextResponse.json({
      categories: filteredCategories,
      stats: {
        totalCategories,
        hasImageCount,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/categories:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description = '', image_url = '', display_order = 0 } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const finalSlug = slug && slug.trim() !== '' ? generateSlug(slug) : generateSlug(name);

    const supabase = getSupabaseServerClient();

    // Check slug uniqueness
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingCategory) {
      return NextResponse.json(
        { error: `A category with slug "${finalSlug}" already exists.` },
        { status: 409 }
      );
    }

    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert([
        {
          store_id: STORE_ID,
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          image_url: image_url.trim(),
          display_order: Number(display_order) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting category:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Category created successfully', category: newCategory },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/categories:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
