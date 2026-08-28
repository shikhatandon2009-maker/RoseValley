import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';
import { computeStandardVariants } from '@/lib/pricing-and-slugs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/products/bulk-pricing
 * Returns all products with category info, current price/kg, and variants
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const categoryId = searchParams.get('category_id');

    // 1. Fetch products
    const cols = 'id, store_id, name, slug, price, compare_at_price, images, created_at, updated_at';
    const query = supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .order('name', { ascending: true });

    const { data: products, error: prodErr } = await query;
    if (prodErr) {
      console.error('Error fetching products for bulk pricing:', prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    let filtered = products || [];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(term) ||
          p.slug?.toLowerCase().includes(term)
      );
    }

    // 2. Fetch categories and mappings
    const [{ data: categories }, { data: junctions }] = await Promise.all([
      supabase.from('categories').select('id, name, slug').eq('store_id', STORE_ID),
      supabase.from('product_categories').select('product_id, category_id').eq('store_id', STORE_ID),
    ]);

    const catMap = new Map<string, any>();
    (categories || []).forEach((c: any) => catMap.set(c.id, c));

    const prodCatMap = new Map<string, any[]>();
    (junctions || []).forEach((j: any) => {
      const cat = catMap.get(j.category_id);
      if (cat) {
        const list = prodCatMap.get(j.product_id) || [];
        list.push(cat);
        prodCatMap.set(j.product_id, list);
      }
    });

    if (categoryId && categoryId !== 'all') {
      if (categoryId === 'uncategorized') {
        const withCats = new Set((junctions || []).map((j: any) => j.product_id));
        filtered = filtered.filter((p: any) => !withCats.has(p.id));
      } else {
        const matchingIds = new Set(
          (junctions || [])
            .filter((j: any) => j.category_id === categoryId)
            .map((j: any) => j.product_id)
        );
        filtered = filtered.filter((p: any) => matchingIds.has(p.id));
      }
    }

    // 3. Format product list with auto-calculated variants
    const result = filtered.map((p: any) => {
      const basePrice = Number(p.price) || 1000;
      const calculatedVariants = computeStandardVariants(basePrice);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: basePrice,
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : Math.round(basePrice * 1.2),
        images: Array.isArray(p.images) ? p.images : [],
        categories: prodCatMap.get(p.id) || [],
        variants: calculatedVariants,
      };
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      products: result,
      categories: categories || [],
    });
  } catch (error: any) {
    console.error('Error in bulk-pricing GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products/bulk-pricing
 * Updates products and their variants in batches of 10
 * Payload: { updates: [{ id: string, price: number, sync_variants?: boolean }] }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { updates, batch_size = 10 } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const batchSize = Math.max(1, Math.min(25, Number(batch_size) || 10));
    const totalUpdates = updates.length;
    let successfulCount = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Process updates in chunks of 10 for fast and efficient database interaction
    for (let i = 0; i < totalUpdates; i += batchSize) {
      const currentBatch = updates.slice(i, i + batchSize);

      await Promise.all(
        currentBatch.map(async (item: { id: string; price: number; sync_variants?: boolean }) => {
          const { id, price, sync_variants = true } = item;
          if (!id || price === undefined || price === null || isNaN(Number(price))) {
            errors.push({ id, error: 'Invalid product id or price' });
            return;
          }

          const numPrice = Math.max(1, Math.round(Number(price)));
          const comparePrice = Math.round(numPrice * 1.2);
          const now = new Date().toISOString();

          try {
            // 1. Update product base price
            const { error: pErr } = await supabase
              .from('products')
              .update({
                price: numPrice,
                compare_at_price: comparePrice,
                updated_at: now,
              })
              .eq('store_id', STORE_ID)
              .eq('id', id);

            if (pErr) {
              errors.push({ id, error: pErr.message });
              return;
            }

            // 2. Sync variants if requested (default: true)
            if (sync_variants) {
              const standardVariants = computeStandardVariants(numPrice);

              // Delete old variants
              await supabase
                .from('product_variants')
                .delete()
                .eq('store_id', STORE_ID)
                .eq('product_id', id);

              // Insert updated formula-based variants
              const variantRows = standardVariants.map((v) => ({
                store_id: STORE_ID,
                product_id: id,
                name: v.name,
                sku: v.sku || null,
                price: v.price,
                compare_at_price: v.compare_at_price || null,
                net_weight: v.net_weight,
                weight_unit: v.weight_unit,
                gross_weight: v.gross_weight,
                item_shipping_cost: v.item_shipping_cost,
              }));

              const { error: vErr } = await supabase
                .from('product_variants')
                .insert(variantRows);

              if (vErr) {
                console.warn(`Warning inserting variants for product ${id}:`, vErr);
              }
            }

            successfulCount++;
          } catch (err: any) {
            errors.push({ id, error: err.message || 'Failed to update' });
          }
        })
      );
    }

    // Invalidate the store memory cache so prices update everywhere immediately
    invalidateStoreCache();

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successfulCount} of ${totalUpdates} products across batches of ${batchSize}.`,
      total: totalUpdates,
      updated_count: successfulCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in bulk-pricing POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
