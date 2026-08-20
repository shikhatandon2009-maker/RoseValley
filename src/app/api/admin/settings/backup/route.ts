import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID, STORE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const timestamp = new Date().toISOString();
    const dateSlug = new Date().toISOString().split('T')[0];

    // Fetch all store datasets in parallel
    const [
      productsRes,
      categoriesRes,
      productCategoriesRes,
      variantsRes,
      usersRes,
      ordersRes,
      orderItemsRes,
      reviewsRes,
      questionsRes,
      couponsRes,
      settingsRes,
    ] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', STORE_ID),
      supabase.from('categories').select('*').eq('store_id', STORE_ID),
      supabase.from('product_categories').select('*').eq('store_id', STORE_ID),
      supabase.from('product_variants').select('*').eq('store_id', STORE_ID),
      supabase.from('users').select('id, email, full_name, role, phone, created_at, updated_at'),
      supabase.from('orders').select('*').eq('store_id', STORE_ID),
      supabase.from('order_items').select('*'),
      supabase.from('reviews').select('*').eq('store_id', STORE_ID),
      supabase.from('product_questions').select('*').eq('store_id', STORE_ID),
      supabase.from('coupons').select('*').eq('store_id', STORE_ID),
      supabase.from('site_settings').select('*').eq('store_id', STORE_ID).maybeSingle(),
    ]);

    const backupData = {
      metadata: {
        store_id: STORE_ID,
        store_name: STORE_NAME,
        export_date: timestamp,
        version: '2.0.0',
        summary: {
          total_products: productsRes.data?.length || 0,
          total_categories: categoriesRes.data?.length || 0,
          total_variants: variantsRes.data?.length || 0,
          total_customers: usersRes.data?.length || 0,
          total_orders: ordersRes.data?.length || 0,
          total_reviews: reviewsRes.data?.length || 0,
          total_questions: questionsRes.data?.length || 0,
          total_coupons: couponsRes.data?.length || 0,
        },
      },
      data: {
        site_settings: settingsRes.data || null,
        categories: categoriesRes.data || [],
        products: productsRes.data || [],
        product_categories: productCategoriesRes.data || [],
        product_variants: variantsRes.data || [],
        customers: usersRes.data || [],
        orders: ordersRes.data || [],
        order_items: orderItemsRes.data || [],
        reviews: reviewsRes.data || [],
        product_questions: questionsRes.data || [],
        coupons: couponsRes.data || [],
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="rose_valley_backup_${dateSlug}.json"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('API Error in GET /api/admin/settings/backup:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate store backup' },
      { status: 500 }
    );
  }
}
