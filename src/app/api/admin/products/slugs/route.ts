import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';
import { sanitizeSlug } from '@/lib/pricing-and-slugs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/products/slugs
 * Scans all store products, identifies duplicate slugs, common prefix collisions, and returns diagnostics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase();
    const filter = searchParams.get('filter'); // 'all' | 'duplicates' | 'collisions'

    const cols = 'id, store_id, name, slug, price, images, created_at, updated_at';
    const { data: products, error } = await supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products for slug management:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allProducts = products || [];

    // 1. Group by exact slug to detect duplicates
    const slugCountMap = new Map<string, any[]>();
    allProducts.forEach((p: any) => {
      const s = (p.slug || '').trim().toLowerCase();
      const list = slugCountMap.get(s) || [];
      list.push(p);
      slugCountMap.set(s, list);
    });

    // 2. Identify prefix/common start name collisions
    const prefixGroupMap = new Map<string, any[]>();
    allProducts.forEach((p: any) => {
      const s = (p.slug || '').trim().toLowerCase();
      const parts = s.split('-');
      const rootPrefix = parts.length > 1 ? parts.slice(0, 2).join('-') : parts[0] || 'item';
      const list = prefixGroupMap.get(rootPrefix) || [];
      list.push(p);
      prefixGroupMap.set(rootPrefix, list);
    });

    // 3. Map diagnostic metadata onto each product
    let analyzedProducts = allProducts.map((p: any) => {
      const s = (p.slug || '').trim().toLowerCase();
      const duplicatesWithSameSlug = slugCountMap.get(s) || [];
      const isDuplicate = duplicatesWithSameSlug.length > 1;

      const parts = s.split('-');
      const rootPrefix = parts.length > 1 ? parts.slice(0, 2).join('-') : parts[0] || 'item';
      const samePrefixProducts = (prefixGroupMap.get(rootPrefix) || []).filter((item: any) => item.id !== p.id);
      const hasPrefixCollision = samePrefixProducts.length > 0;

      // Suggest a clean unique slug if duplicate
      let suggestedSlug = sanitizeSlug(p.name || `product-${p.id.slice(0, 6)}`);
      if (isDuplicate) {
        const dupIdx = duplicatesWithSameSlug.findIndex((d: any) => d.id === p.id);
        if (dupIdx > 0) {
          suggestedSlug = `${suggestedSlug}-${dupIdx + 1}`;
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug || '',
        price: p.price,
        images: Array.isArray(p.images) ? p.images : [],
        is_duplicate: isDuplicate,
        duplicate_count: duplicatesWithSameSlug.length,
        duplicate_with: isDuplicate
          ? duplicatesWithSameSlug
              .filter((d: any) => d.id !== p.id)
              .map((d: any) => ({ id: d.id, name: d.name, slug: d.slug }))
          : [],
        has_prefix_collision: hasPrefixCollision,
        prefix_root: rootPrefix,
        prefix_matches_count: samePrefixProducts.length,
        prefix_clashes_with: samePrefixProducts.slice(0, 3).map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        })),
        suggested_slug: suggestedSlug,
      };
    });

    // Calculate metrics
    const duplicateItems = analyzedProducts.filter((p: any) => p.is_duplicate);
    const prefixClashItems = analyzedProducts.filter((p: any) => p.has_prefix_collision);
    const uniqueSlugsCount = analyzedProducts.filter((p: any) => !p.is_duplicate).length;

    // Apply search filter
    if (search) {
      analyzedProducts = analyzedProducts.filter(
        (p: any) =>
          p.name.toLowerCase().includes(search) ||
          p.slug.toLowerCase().includes(search)
      );
    }

    // Apply tab/category filter
    if (filter === 'duplicates') {
      analyzedProducts = analyzedProducts.filter((p: any) => p.is_duplicate);
    } else if (filter === 'collisions') {
      analyzedProducts = analyzedProducts.filter((p: any) => p.has_prefix_collision);
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: allProducts.length,
        duplicate_slugs_count: Array.from(slugCountMap.entries()).filter(([_, list]) => list.length > 1).length,
        affected_duplicate_products: duplicateItems.length,
        prefix_clashes_count: prefixClashItems.length,
        unique_slugs_count: uniqueSlugsCount,
      },
      products: analyzedProducts,
    });
  } catch (error: any) {
    console.error('Error in slugs GET:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products/slugs
 * Batch updates product slugs with conflict prevention in 10-product batches
 * Payload: { updates: [{ id: string, slug: string }] }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { updates, batch_size = 10 } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No slug updates provided' }, { status: 400 });
    }

    const batchSize = Math.max(1, Math.min(25, Number(batch_size) || 10));
    const totalUpdates = updates.length;
    let successfulCount = 0;
    const errors: Array<{ id: string; slug: string; error: string }> = [];

    // Verify intra-batch duplicate slugs first
    const seenSlugs = new Set<string>();
    for (const item of updates) {
      const clean = sanitizeSlug(item.slug || '');
      if (!clean) {
        return NextResponse.json(
          { error: `Empty or invalid slug for product ${item.id}` },
          { status: 400 }
        );
      }
      if (seenSlugs.has(clean)) {
        return NextResponse.json(
          { error: `Duplicate slug '${clean}' detected within the update payload. Each slug must be unique.` },
          { status: 400 }
        );
      }
      seenSlugs.add(clean);
    }

    // Process in 10-product batches
    for (let i = 0; i < totalUpdates; i += batchSize) {
      const currentBatch = updates.slice(i, i + batchSize);

      await Promise.all(
        currentBatch.map(async (item: { id: string; slug: string }) => {
          const { id, slug } = item;
          const cleanSlug = sanitizeSlug(slug);

          if (!id || !cleanSlug) {
            errors.push({ id, slug, error: 'Invalid product id or slug' });
            return;
          }

          try {
            // Check if slug is used by another product outside this update
            const { data: existingConflict } = await supabase
              .from('products')
              .select('id, name')
              .eq('store_id', STORE_ID)
              .eq('slug', cleanSlug)
              .neq('id', id)
              .maybeSingle();

            if (existingConflict) {
              errors.push({
                id,
                slug: cleanSlug,
                error: `Slug "${cleanSlug}" is already used by "${existingConflict.name}"`,
              });
              return;
            }

            const { error: updateErr } = await supabase
              .from('products')
              .update({
                slug: cleanSlug,
                updated_at: new Date().toISOString(),
              })
              .eq('store_id', STORE_ID)
              .eq('id', id);

            if (updateErr) {
              errors.push({ id, slug: cleanSlug, error: updateErr.message });
              return;
            }

            successfulCount++;
          } catch (err: any) {
            errors.push({ id, slug: cleanSlug, error: err.message || 'Failed to update slug' });
          }
        })
      );
    }

    // Invalidate cache so routes & links work immediately
    invalidateStoreCache();

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${successfulCount} of ${totalUpdates} slugs across batches of ${batchSize}.`,
      total: totalUpdates,
      updated_count: successfulCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error in slugs POST:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
