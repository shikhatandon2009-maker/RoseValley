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

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch product variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('product_id', id);

    // Fetch assigned category IDs
    const { data: junctionRows } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('store_id', STORE_ID)
      .eq('product_id', id);

    const category_ids = (junctionRows || []).map((j: any) => j.category_id);

    return NextResponse.json({
      product: {
        ...product,
        variants: variants || [],
        category_ids,
      },
    });
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

    const {
      name,
      slug,
      description,
      price,
      compare_at_price,
      stock,
      images,
      scent_notes,
      ingredients,
      is_featured,
      is_bestseller,
      meta_title,
      meta_description,
      category_ids,
    } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name.trim();
    if (slug !== undefined && slug.trim() !== '') {
      updates.slug = generateSlug(slug);
    } else if (name !== undefined) {
      updates.slug = generateSlug(name);
    }

    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price);
    if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price ? Number(compare_at_price) : null;
    if (stock !== undefined) updates.stock = Number(stock);
    if (images !== undefined) updates.images = Array.isArray(images) ? images : [];
    if (scent_notes !== undefined) updates.scent_notes = scent_notes;
    if (ingredients !== undefined) updates.ingredients = Array.isArray(ingredients) ? ingredients : [];
    if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
    if (is_bestseller !== undefined) updates.is_bestseller = Boolean(is_bestseller);
    if (meta_title !== undefined) updates.meta_title = meta_title.trim();
    if (meta_description !== undefined) updates.meta_description = meta_description.trim();

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync product_categories if category_ids passed
    if (Array.isArray(category_ids)) {
      // Clear existing junction rows
      await supabase
        .from('product_categories')
        .delete()
        .eq('store_id', STORE_ID)
        .eq('product_id', id);

      if (category_ids.length > 0) {
        const newJunctions = category_ids.map((catId: string) => ({
          store_id: STORE_ID,
          product_id: id,
          category_id: catId,
        }));
        await supabase.from('product_categories').insert(newJunctions);
      }
    }

    return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct });
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
      .from('products')
      .delete()
      .eq('store_id', STORE_ID)
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
