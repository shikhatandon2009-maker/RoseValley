import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const search = searchParams.get('search')?.trim();

    let query = supabase
      .from('product_variants')
      .select('*, products(name, images, slug)')
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (productId && productId !== 'all') {
      query = query.eq('product_id', productId);
    }

    const { data: variants, error } = await query;

    if (error) {
      console.error('Error fetching variants:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = variants || [];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (v: any) =>
          v.name?.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower) ||
          v.size?.toLowerCase().includes(searchLower) ||
          v.products?.name?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ variants: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, name, sku = '', price = 0, compare_at_price = null, stock = 0, size = '' } = body;

    if (!product_id || !name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Product ID and Variant Name are required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: newVariant, error } = await supabase
      .from('product_variants')
      .insert([
        {
          store_id: STORE_ID,
          product_id,
          name: name.trim(),
          sku: sku.trim(),
          price: Number(price) || 0,
          compare_at_price: compare_at_price ? Number(compare_at_price) : null,
          stock: Number(stock) || 0,
          size: size.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select('*, products(name, images)')
      .single();

    if (error) {
      console.error('Error inserting variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Variant created successfully', variant: newVariant },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
