import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get('product_id');
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('product_categories')
      .select('store_id, product_id, category_id, products(id, name, slug, images, price), categories(id, name, slug)')
      .eq('store_id', STORE_ID);

    if (productId) query = query.eq('product_id', productId);
    if (categoryId) query = query.eq('category_id', categoryId);

    const { data: mappings, error } = await query;

    if (error) {
      console.error('Error fetching product categories junction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mappings: mappings || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, category_id } = body;

    if (!product_id || !category_id) {
      return NextResponse.json(
        { error: 'Both Product ID and Category ID are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: existing } = await supabase
      .from('product_categories')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('product_id', product_id)
      .eq('category_id', category_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Product is already mapped to this category.' },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from('product_categories')
      .insert([
        {
          store_id: STORE_ID,
          product_id,
          category_id,
        },
      ]);

    if (insertError) {
      console.error('Error mapping product to category:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product mapped to category successfully' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const categoryId = searchParams.get('category_id');

    if (!productId || !categoryId) {
      return NextResponse.json(
        { error: 'product_id and category_id parameters are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('product_id', productId)
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error deleting product category mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mapping removed successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
