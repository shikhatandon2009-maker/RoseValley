import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const categoryId = searchParams.get('category_id');
    const isFeatured = searchParams.get('is_featured');
    const isBestseller = searchParams.get('is_bestseller');

    const cols = 'id, store_id, name, slug, price, compare_at_price, is_featured, is_bestseller, images, description, scent_notes, ingredients, meta_title, meta_keywords, meta_description, net_weight, weight_unit, gross_weight, item_shipping_cost, is_free_shipping, created_at, updated_at';
    let query = supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (isFeatured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (isBestseller === 'true') {
      query = query.eq('is_bestseller', true);
    }

    const { data: products, error } = await query;
    if (error) {
      console.error('Error querying products:', error);
    }

    let filteredProducts = (products && products.length > 0) ? products : [];

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.slug?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Fetch product_categories junction mappings for category tagging
    const { data: junctions } = await supabase
      .from('product_categories')
      .select('product_id, category_id')
      .eq('store_id', STORE_ID);

    // Fetch all categories for lookup
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', STORE_ID);

    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
    (categories || []).forEach((c: any) => categoryMap.set(c.id, c));

    // Map categories onto products
    const productCategoryLookup = new Map<string, any[]>();
    (junctions || []).forEach((j: any) => {
      const cat = categoryMap.get(j.category_id);
      if (cat) {
        const existing = productCategoryLookup.get(j.product_id) || [];
        existing.push(cat);
        productCategoryLookup.set(j.product_id, existing);
      }
    });

    // Fetch all variants for lookup
    const { data: allVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('store_id', STORE_ID);

    const variantsLookup = new Map<string, any[]>();
    (allVariants || []).forEach((v: any) => {
      const existing = variantsLookup.get(v.product_id) || [];
      existing.push(v);
      variantsLookup.set(v.product_id, existing);
    });

    if (categoryId && categoryId !== 'all') {
      if (categoryId === 'uncategorized') {
        const productIdsWithCategory = new Set(
          (junctions || []).map((j: any) => j.product_id)
        );
        filteredProducts = filteredProducts.filter((p: any) => !productIdsWithCategory.has(p.id));
      } else {
        const productIdsInCategory = new Set(
          (junctions || [])
            .filter((j: any) => j.category_id === categoryId)
            .map((j: any) => j.product_id)
        );
        filteredProducts = filteredProducts.filter((p: any) => productIdsInCategory.has(p.id));
      }
    }

    const getStandardVariantsForKiloPrice = (basePrice: number) => {
      const b = Math.max(100, Number(basePrice) || 1000);
      return [
        { name: 'Sample (2ml)', sku: '', price: 250, compare_at_price: 300 },
        { name: '100 ml', sku: '', price: Math.round(b / 10 + 200), compare_at_price: Math.round((b / 10 + 200) * 1.2) },
        { name: '250 ml', sku: '', price: Math.round(b / 4 + 200), compare_at_price: Math.round((b / 4 + 200) * 1.2) },
        { name: '500 ml', sku: '', price: Math.round(b / 2 + 200), compare_at_price: Math.round((b / 2 + 200) * 1.2) },
        { name: '1 Kg', sku: '', price: b, compare_at_price: Math.round(b * 1.2) },
        { name: '5 Kg', sku: '', price: Math.round(b * 5 * 0.98), compare_at_price: Math.round(b * 5 * 1.15) },
        { name: '10 Kg', sku: '', price: Math.round(b * 10 * 0.96), compare_at_price: Math.round(b * 10 * 1.15) },
        { name: '20 Kg', sku: '', price: Math.round(b * 20 * 0.93), compare_at_price: Math.round(b * 20 * 1.15) },
      ];
    };

    const enrichedProducts = filteredProducts.map((p: any) => {
      const dbVariants = variantsLookup.get(p.id) || [];
      const finalVariants = dbVariants.length > 1 ? dbVariants : getStandardVariantsForKiloPrice(p.price);
      return {
        ...p,
        categories: productCategoryLookup.get(p.id) || [],
        variants: finalVariants,
      };
    });

    // Deduplicate duplicate products of the same name, removing uncategorized duplicates
    const productMap = new Map<string, any>();
    const duplicateIdsToDelete: string[] = [];

    for (const p of enrichedProducts) {
      const normalizedName = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const existing = productMap.get(normalizedName);

      if (!existing) {
        productMap.set(normalizedName, p);
      } else {
        const existingHasCat = existing.categories && existing.categories.length > 0;
        const currentHasCat = p.categories && p.categories.length > 0;

        if (!existingHasCat && currentHasCat) {
          duplicateIdsToDelete.push(existing.id);
          productMap.set(normalizedName, p);
        } else if (existingHasCat && !currentHasCat) {
          duplicateIdsToDelete.push(p.id);
        } else {
          // Both have categories or both don't: prefer hyphenated slug
          if (p.slug.includes('-') && !existing.slug.includes('-')) {
            duplicateIdsToDelete.push(existing.id);
            productMap.set(normalizedName, p);
          } else {
            duplicateIdsToDelete.push(p.id);
          }
        }
      }
    }

    // Clean up duplicate uncategorized entries from Supabase in background
    if (duplicateIdsToDelete.length > 0) {
      (async () => {
        try {
          await supabase.from('product_categories').delete().in('product_id', duplicateIdsToDelete);
          await supabase.from('product_variants').delete().in('product_id', duplicateIdsToDelete);
          await supabase.from('products').delete().in('id', duplicateIdsToDelete);
        } catch (e) {
          console.warn('Background cleanup of duplicate products:', e);
        }
      })();
    }

    const deduplicatedList = Array.from(productMap.values());

    // Aggregate statistics
    const totalProducts = deduplicatedList.length;
    const featuredCount = deduplicatedList.filter((p: any) => p.is_featured).length;
    const bestsellerCount = deduplicatedList.filter((p: any) => p.is_bestseller).length;
    const uncategorizedCount = deduplicatedList.filter((p: any) => !p.categories || p.categories.length === 0).length;
    const lowStockCount = 0;
    const totalStockSum = 0;

    return NextResponse.json({
      products: deduplicatedList,
      stats: {
        totalProducts,
        featuredCount,
        bestsellerCount,
        uncategorizedCount,
        lowStockCount,
        totalStockSum,
      },
    });
  } catch (err: any) {
    console.error('API Error in GET /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description = '',
      price = 0,
      compare_at_price = null,
      images = [],
      scent_notes = { top: [], heart: [], base: [] },
      ingredients = [],
      is_featured = false,
      is_bestseller = false,
      meta_title = '',
      meta_keywords = '',
      meta_description = '',
      category_ids = [],
      variants = [],
      net_weight = 0,
      weight_unit = 'gm',
      gross_weight = 0,
      item_shipping_cost = 0,
      is_free_shipping = false,
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    const finalSlug = slug && slug.trim() !== '' ? generateSlug(slug) : generateSlug(name);
    const supabase = getSupabaseServerClient();

    // Calculate gross weight with 20% packaging buffer if not explicitly passed
    const calculatedGrossWeight =
      gross_weight && Number(gross_weight) > 0
        ? Number(gross_weight)
        : net_weight && Number(net_weight) > 0
        ? Number((Number(net_weight) * 1.2).toFixed(3))
        : 0;

    // Check slug uniqueness
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', STORE_ID)
      .eq('slug', finalSlug)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json(
        { error: `A product with slug "${finalSlug}" already exists.` },
        { status: 409 }
      );
    }

    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          store_id: STORE_ID,
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          price: Number(price) || 0,
          compare_at_price: compare_at_price ? Number(compare_at_price) : null,
          images: Array.isArray(images) ? images : [],
          scent_notes: scent_notes || { top: [], heart: [], base: [] },
          ingredients: Array.isArray(ingredients) ? ingredients : [],
          is_featured: Boolean(is_featured),
          is_bestseller: Boolean(is_bestseller),
          meta_title: meta_title.trim(),
          meta_keywords: meta_keywords ? meta_keywords.trim() : '',
          meta_description: meta_description.trim(),
          net_weight: Number(net_weight) || 0,
          weight_unit: weight_unit || 'gm',
          gross_weight: calculatedGrossWeight,
          item_shipping_cost: Number(item_shipping_cost) || 0,
          is_free_shipping: Boolean(is_free_shipping),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting product:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Insert category mappings if provided
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const junctionRows = category_ids.map((catId: string) => ({
        store_id: STORE_ID,
        product_id: newProduct.id,
        category_id: catId,
      }));

      await supabase.from('product_categories').insert(junctionRows);
    }

    // Insert variants if provided
    let createdVariants: any[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
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
          product_id: newProduct.id,
          name: String(v.name || 'Default Variant').trim(),
          sku: v.sku ? String(v.sku).trim() : null,
          price: Number(v.price) || Number(price) || 0,
          compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
          net_weight: vNetWeight,
          weight_unit: v.weight_unit || weight_unit || 'gm',
          gross_weight: vGrossWeight,
          item_shipping_cost: Number(v.item_shipping_cost) || 0,
        };
      });

      const { data: insertedVariants } = await supabase
        .from('product_variants')
        .insert(variantRows)
        .select('*');
      
      createdVariants = insertedVariants || [];
    }

    invalidateStoreCache();

    return NextResponse.json(
      { message: 'Product created successfully', product: { ...newProduct, variants: createdVariants } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    const idList: string[] = Array.isArray(ids) ? ids.filter(Boolean) : (body.id ? [body.id] : []);

    if (idList.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required for batch deletion' }, { status: 400 });
    }

    // 1. Nullify foreign key references in order_items
    try {
      await supabase
        .from('order_items')
        .update({ product_id: null, variant_id: null })
        .in('product_id', idList);
    } catch (e) {
      console.warn('Error nullifying order_items references in batch delete:', e);
    }

    // 2. Delete review votes & reviews
    try {
      const { data: prodReviews } = await supabase
        .from('reviews')
        .select('id')
        .in('product_id', idList);
      
      if (prodReviews && prodReviews.length > 0) {
        const reviewIds = prodReviews.map((r: any) => r.id);
        await supabase.from('review_votes').delete().in('review_id', reviewIds);
      }
      await supabase.from('reviews').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting reviews in batch delete:', e);
    }

    // 3. Delete questions & answers
    try {
      const { data: prodQuestions } = await supabase
        .from('product_questions')
        .select('id')
        .in('product_id', idList);
      
      if (prodQuestions && prodQuestions.length > 0) {
        const questionIds = prodQuestions.map((q: any) => q.id);
        await supabase.from('product_answers').delete().in('question_id', questionIds);
      }
      await supabase.from('product_questions').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting product questions in batch delete:', e);
    }

    // 4. Delete wishlists & cart items
    try {
      await supabase.from('wishlists').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting wishlists in batch delete:', e);
    }
    try {
      await supabase.from('cart_items').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting cart_items in batch delete:', e);
    }

    // 5. Delete product categories junction
    try {
      await supabase.from('product_categories').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting product_categories in batch delete:', e);
    }

    // 6. Delete product variants
    try {
      await supabase.from('product_variants').delete().in('product_id', idList);
    } catch (e) {
      console.warn('Error deleting product_variants in batch delete:', e);
    }

    // 7. Delete products
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', idList);

    if (error) {
      console.error('Error batch deleting products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateStoreCache();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${idList.length} product(s)`,
      deletedCount: idList.length,
    });
  } catch (err: any) {
    console.error('API Error in batch DELETE /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { action, product_ids, category_ids, category_id, mode = 'append' } = body;

    const prodIds: string[] = Array.isArray(product_ids) ? product_ids.filter(Boolean) : [];

    if (prodIds.length === 0) {
      return NextResponse.json({ error: 'product_ids array is required' }, { status: 400 });
    }

    if (action === 'assign_category') {
      const catIds: string[] = Array.isArray(category_ids)
        ? category_ids.filter(Boolean)
        : (category_id ? [category_id] : []);

      if (catIds.length === 0) {
        return NextResponse.json({ error: 'category_ids array is required' }, { status: 400 });
      }

      if (mode === 'replace') {
        // Remove existing category mappings for these products
        await supabase
          .from('product_categories')
          .delete()
          .in('product_id', prodIds);
      }

      // Fetch existing mappings to prevent duplicate primary key errors
      const { data: existingMappings } = await supabase
        .from('product_categories')
        .select('product_id, category_id')
        .in('product_id', prodIds);

      const existingSet = new Set<string>();
      (existingMappings || []).forEach((m: any) => existingSet.add(`${m.product_id}_${m.category_id}`));

      const rowsToInsert: any[] = [];
      for (const pId of prodIds) {
        for (const cId of catIds) {
          const key = `${pId}_${cId}`;
          if (!existingSet.has(key)) {
            rowsToInsert.push({
              store_id: STORE_ID,
              product_id: pId,
              category_id: cId,
            });
            existingSet.add(key);
          }
        }
      }

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('product_categories')
          .insert(rowsToInsert);

        if (insertError) {
          console.error('Error batch inserting product categories:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }

      invalidateStoreCache();

      return NextResponse.json({
        success: true,
        message: `Assigned categories to ${prodIds.length} product(s)`,
        updatedCount: prodIds.length,
      });
    }

    if (action === 'remove_category') {
      const targetCatId = category_id || (Array.isArray(category_ids) ? category_ids[0] : null);
      if (!targetCatId) {
        return NextResponse.json({ error: 'category_id is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('product_categories')
        .delete()
        .in('product_id', prodIds)
        .eq('category_id', targetCatId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      invalidateStoreCache();

      return NextResponse.json({
        success: true,
        message: `Removed category from ${prodIds.length} product(s)`,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('API Error in PATCH /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
