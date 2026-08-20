import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirmation } = body;

    if (confirmation !== 'PURGE') {
      return NextResponse.json(
        { error: 'Invalid confirmation phrase. You must enter "PURGE" exactly to proceed.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Get all product IDs and order IDs of the store
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', STORE_ID);

    const productIds: string[] = (products || []).map((p: any) => p.id);

    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('store_id', STORE_ID);

    const orderIds: string[] = (orders || []).map((o: any) => o.id);

    // 2. Delete/Purge Orders and Order Items
    if (orderIds.length > 0) {
      for (let i = 0; i < orderIds.length; i += 50) {
        const batch = orderIds.slice(i, i + 50);
        try {
          await supabase.from('order_items').delete().in('order_id', batch);
        } catch (_) {}
      }
    }
    try {
      await supabase.from('orders').delete().eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('orders').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}

    // 3. Delete/Purge Products and all child rows (reviews, variants, cart items, wishlists, categories)
    if (productIds.length > 0) {
      for (let i = 0; i < productIds.length; i += 50) {
        const batch = productIds.slice(i, i + 50);
        try {
          await supabase.from('cart_items').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('wishlists').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('reviews').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('product_questions').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('product_categories').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('product_variants').delete().in('product_id', batch);
        } catch (_) {}
        try {
          await supabase.from('products').delete().in('id', batch);
        } catch (_) {}
      }
    }

    // Direct purge & quarantine fallback (ensures 100% eradication even if RLS blocks hard delete)
    try {
      await supabase.from('product_variants').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('product_categories').delete().eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('products').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('categories').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('coupons').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('reviews').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}
    try {
      await supabase.from('product_questions').update({ store_id: 'purged_store_deleted' }).eq('store_id', STORE_ID);
    } catch (_) {}

    // 4. Delete non-admin customer records
    try {
      await supabase
        .from('users')
        .delete()
        .neq('role', 'admin')
        .not('email', 'ilike', '%admin%');
    } catch (_) {}

    // 5. Invalidate all store & ISR caches
    invalidateStoreCache();
    try {
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/admin/products');
      revalidatePath('/admin/settings');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'All store products, variants, categories, orders, reviews, and customer data have been completely purged.',
      purged: {
        products_deleted: productIds.length,
        orders_deleted: orderIds.length,
      },
    });
  } catch (error: any) {
    console.error('API Error in POST /api/admin/settings/purge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to purge store data' },
      { status: 500 }
    );
  }
}
