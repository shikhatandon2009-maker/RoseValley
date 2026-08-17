import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'productIds must be a non-empty array of product IDs' },
        { status: 400 }
      );
    }

    // Sanitize IDs
    const idsToDelete = productIds.filter((id) => typeof id === 'string' && id.trim().length > 0);

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'No valid product IDs provided' }, { status: 400 });
    }

    // 1. Explicitly clean up junction & variant records to prevent any orphan data
    await Promise.allSettled([
      supabase
        .from('product_categories')
        .delete()
        .eq('store_id', STORE_ID)
        .in('product_id', idsToDelete),
      supabase
        .from('product_variants')
        .delete()
        .eq('store_id', STORE_ID)
        .in('product_id', idsToDelete),
      supabase
        .from('cart_items')
        .delete()
        .eq('store_id', STORE_ID)
        .in('product_id', idsToDelete),
      supabase
        .from('wishlists')
        .delete()
        .eq('store_id', STORE_ID)
        .in('product_id', idsToDelete),
      supabase
        .from('reviews')
        .delete()
        .eq('store_id', STORE_ID)
        .in('product_id', idsToDelete),
    ]);

    // 2. Delete products in batch
    const { error: deleteError, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('store_id', STORE_ID)
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Bulk delete products error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const deletedCount = count !== null ? count : idsToDelete.length;

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} product(s).`,
    });
  } catch (err: any) {
    console.error('Bulk delete route error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to execute bulk delete' },
      { status: 500 }
    );
  }
}
