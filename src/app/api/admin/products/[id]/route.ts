import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';

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
      images,
      scent_notes,
      ingredients,
      is_featured,
      is_bestseller,
      meta_title,
      meta_keywords,
      meta_description,
      category_ids,
      variants,
      net_weight,
      weight_unit,
      gross_weight,
      item_shipping_cost,
      is_free_shipping,
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
    if (images !== undefined) updates.images = Array.isArray(images) ? images : [];
    if (scent_notes !== undefined) updates.scent_notes = scent_notes;
    if (ingredients !== undefined) updates.ingredients = Array.isArray(ingredients) ? ingredients : [];
    if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
    if (is_bestseller !== undefined) updates.is_bestseller = Boolean(is_bestseller);
    if (meta_title !== undefined) updates.meta_title = meta_title.trim();
    if (meta_keywords !== undefined) updates.meta_keywords = meta_keywords.trim();
    if (meta_description !== undefined) updates.meta_description = meta_description.trim();

    if (net_weight !== undefined) updates.net_weight = Number(net_weight) || 0;
    if (weight_unit !== undefined) updates.weight_unit = weight_unit || 'gm';
    if (gross_weight !== undefined) {
      updates.gross_weight = Number(gross_weight) || 0;
    } else if (net_weight !== undefined && Number(net_weight) > 0) {
      updates.gross_weight = Number((Number(net_weight) * 1.2).toFixed(3));
    }
    if (item_shipping_cost !== undefined) updates.item_shipping_cost = Number(item_shipping_cost) || 0;
    if (is_free_shipping !== undefined) updates.is_free_shipping = Boolean(is_free_shipping);

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

    // Sync product_variants if variants passed
    let updatedVariants: any[] = [];
    if (Array.isArray(variants)) {
      await supabase
        .from('product_variants')
        .delete()
        .eq('store_id', STORE_ID)
        .eq('product_id', id);

      if (variants.length > 0) {
        const variantRows = variants.map((v: any) => {
          const vNetWeight = Number(v.net_weight) || 0;
          const vGrossWeight =
            v.gross_weight && Number(v.gross_weight) > 0
              ? Number(v.gross_weight)
              : vNetWeight > 0
              ? Number((vNetWeight * 1.2).toFixed(3))
              : 0;

          return {
            store_id: STORE_ID,
            product_id: id,
            name: String(v.name || 'Default Variant').trim(),
            sku: v.sku ? String(v.sku).trim() : null,
            price: Number(v.price) || Number(price || 0),
            compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
            net_weight: vNetWeight,
            weight_unit: v.weight_unit || (weight_unit || 'gm'),
            gross_weight: vGrossWeight,
            item_shipping_cost: Number(v.item_shipping_cost) || 0,
          };
        });

        const { data: insertedVariants } = await supabase
          .from('product_variants')
          .insert(variantRows)
          .select('*');

        updatedVariants = insertedVariants || [];
      }
    } else {
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('product_id', id);
      updatedVariants = existingVariants || [];
    }

    invalidateStoreCache();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: { ...updatedProduct, variants: updatedVariants },
    });
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

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Nullify foreign key references in order_items so historical orders remain valid
    try {
      await supabase
        .from('order_items')
        .update({ product_id: null, variant_id: null })
        .eq('product_id', id);
    } catch (e) {
      console.warn('Error nullifying order_items references:', e);
    }

    // 2. Delete review votes for this product's reviews
    try {
      const { data: prodReviews } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', id);
      
      if (prodReviews && prodReviews.length > 0) {
        const reviewIds = prodReviews.map((r: any) => r.id);
        await supabase.from('review_votes').delete().in('review_id', reviewIds);
      }
    } catch (e) {
      console.warn('Error deleting review_votes:', e);
    }

    // 3. Delete reviews
    try {
      await supabase.from('reviews').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting reviews:', e);
    }

    // 4. Delete product answers & questions
    try {
      const { data: prodQuestions } = await supabase
        .from('product_questions')
        .select('id')
        .eq('product_id', id);
      
      if (prodQuestions && prodQuestions.length > 0) {
        const questionIds = prodQuestions.map((q: any) => q.id);
        await supabase.from('product_answers').delete().in('question_id', questionIds);
      }
      await supabase.from('product_questions').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting product_questions:', e);
    }

    // 5. Delete wishlists & cart items
    try {
      await supabase.from('wishlists').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting wishlists:', e);
    }
    try {
      await supabase.from('cart_items').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting cart_items:', e);
    }

    // 6. Delete product categories junction
    try {
      await supabase.from('product_categories').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting product_categories:', e);
    }

    // 7. Delete product variants
    try {
      await supabase.from('product_variants').delete().eq('product_id', id);
    } catch (e) {
      console.warn('Error deleting product_variants:', e);
    }

    // 8. Delete product itself
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear store cache
    invalidateStoreCache();

    return NextResponse.json({ success: true, message: 'Product and all associated data deleted successfully' });
  } catch (err: any) {
    console.error('Error in DELETE product route:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
