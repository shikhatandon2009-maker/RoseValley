import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID, STORE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function safeQuery(queryPromise: PromiseLike<any>) {
  try {
    const res = await queryPromise;
    return res?.data || (res?.error ? null : res);
  } catch (_) {
    return null;
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const timestamp = new Date().toISOString();
    const dateSlug = new Date().toISOString().split('T')[0];

    // Fetch all store datasets, settings, and tables in parallel
    const [
      settingsData,
      themeData,
      countriesData,
      pagesData,
      blogsData,
      productsData,
      categoriesData,
      productCategoriesData,
      variantsData,
      usersData,
      ordersData,
      orderItemsData,
      reviewsData,
      questionsData,
      couponsData,
      inquiriesData,
      wishlistsData,
    ] = await Promise.all([
      safeQuery(supabase.from('site_settings').select('*').eq('store_id', STORE_ID).maybeSingle()),
      safeQuery(supabase.from('site_themes').select('*').eq('store_id', STORE_ID).maybeSingle()),
      safeQuery(supabase.from('countries').select('*')),
      safeQuery(supabase.from('pages').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('blogs').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('products').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('categories').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('product_categories').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('product_variants').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('users').select('id, email, full_name, role, phone, created_at, updated_at')),
      safeQuery(supabase.from('orders').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('order_items').select('*')),
      safeQuery(supabase.from('reviews').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('product_questions').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('coupons').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('inquiries').select('*').eq('store_id', STORE_ID)),
      safeQuery(supabase.from('wishlists').select('*').eq('store_id', STORE_ID)),
    ]);

    const backupData = {
      metadata: {
        store_id: STORE_ID,
        store_name: STORE_NAME,
        export_date: timestamp,
        version: '3.0.0',
        system: 'RoseOil.in Botanical E-Commerce & Weight Freight Engine',
        summary: {
          site_settings_configured: Boolean(settingsData),
          has_weight_shipping_matrix: Boolean(settingsData?.shipping_rates?.india_weight_slabs),
          total_products: Array.isArray(productsData) ? productsData.length : 0,
          total_categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
          total_variants: Array.isArray(variantsData) ? variantsData.length : 0,
          total_pages: Array.isArray(pagesData) ? pagesData.length : 0,
          total_blogs: Array.isArray(blogsData) ? blogsData.length : 0,
          total_countries: Array.isArray(countriesData) ? countriesData.length : 0,
          total_customers: Array.isArray(usersData) ? usersData.length : 0,
          total_orders: Array.isArray(ordersData) ? ordersData.length : 0,
          total_reviews: Array.isArray(reviewsData) ? reviewsData.length : 0,
          total_questions: Array.isArray(questionsData) ? questionsData.length : 0,
          total_coupons: Array.isArray(couponsData) ? couponsData.length : 0,
          total_inquiries: Array.isArray(inquiriesData) ? inquiriesData.length : 0,
        },
      },
      data: {
        // Complete Store & Logistics Configuration
        site_settings: settingsData || null,
        site_themes: themeData || null,
        countries: Array.isArray(countriesData) ? countriesData : [],
        pages: Array.isArray(pagesData) ? pagesData : [],
        blogs: Array.isArray(blogsData) ? blogsData : [],
        
        // Catalog & Inventory
        categories: Array.isArray(categoriesData) ? categoriesData : [],
        products: Array.isArray(productsData) ? productsData : [],
        product_categories: Array.isArray(productCategoriesData) ? productCategoriesData : [],
        product_variants: Array.isArray(variantsData) ? variantsData : [],
        
        // Customer, Sales & Marketing
        customers: Array.isArray(usersData) ? usersData : [],
        orders: Array.isArray(ordersData) ? ordersData : [],
        order_items: Array.isArray(orderItemsData) ? orderItemsData : [],
        reviews: Array.isArray(reviewsData) ? reviewsData : [],
        product_questions: Array.isArray(questionsData) ? questionsData : [],
        coupons: Array.isArray(couponsData) ? couponsData : [],
        inquiries: Array.isArray(inquiriesData) ? inquiriesData : [],
        wishlists: Array.isArray(wishlistsData) ? wishlistsData : [],
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="rose_valley_full_system_backup_${dateSlug}.json"`,
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
