import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';
import { invalidateStoreCache } from '@/lib/supabase/store-scoped-queries';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const payload = await request.json();

    if (!payload) {
      return NextResponse.json(
        { error: 'Empty backup payload provided.' },
        { status: 400 }
      );
    }

    // Support both wrapper { data: { ... } } and direct format
    let storeData: any = payload.data ? payload.data : payload;
    if (Array.isArray(payload)) {
      storeData = { products: payload };
    }

    const metadata = payload.metadata || null;
    const results = {
      site_settings: 0,
      site_themes: 0,
      countries: 0,
      pages: 0,
      blogs: 0,
      categories: 0,
      products: 0,
      variants: 0,
      coupons: 0,
      customers: 0,
      orders: 0,
      reviews: 0,
      questions: 0,
      inquiries: 0,
    };

    // 1. Restore Site Settings (including all weight slabs, domestic rates, export tiers)
    if (storeData.site_settings) {
      const s = storeData.site_settings;
      const { error: settingsErr } = await supabase
        .from('site_settings')
        .upsert(
          {
            ...s,
            store_id: STORE_ID,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'store_id' }
        );
      if (!settingsErr) results.site_settings = 1;
    }

    // 2. Restore Site Theme
    if (storeData.site_themes) {
      try {
        const { error: themeErr } = await supabase
          .from('site_themes')
          .upsert(
            {
              ...storeData.site_themes,
              store_id: STORE_ID,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'store_id' }
          );
        if (!themeErr) results.site_themes = 1;
      } catch (_) {}
    }

    // 3. Restore Countries
    if (Array.isArray(storeData.countries) && storeData.countries.length > 0) {
      for (const country of storeData.countries) {
        try {
          const { error: cErr } = await supabase
            .from('countries')
            .upsert(country, { onConflict: 'code' });
          if (!cErr) results.countries++;
        } catch (_) {}
      }
    }

    // 4. Restore CMS Pages
    if (Array.isArray(storeData.pages) && storeData.pages.length > 0) {
      for (const p of storeData.pages) {
        try {
          const { error: pErr } = await supabase
            .from('pages')
            .upsert({ ...p, store_id: STORE_ID }, { onConflict: 'id' });
          if (!pErr) results.pages++;
        } catch (_) {}
      }
    }

    // 5. Restore Blogs
    if (Array.isArray(storeData.blogs) && storeData.blogs.length > 0) {
      for (const b of storeData.blogs) {
        try {
          const { error: bErr } = await supabase
            .from('blogs')
            .upsert({ ...b, store_id: STORE_ID }, { onConflict: 'id' });
          if (!bErr) results.blogs++;
        } catch (_) {}
      }
    }

    // 6. Restore Categories
    const categoriesList = storeData.categories || storeData.product_categories;
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      for (const cat of categoriesList) {
        try {
          const { error: catErr } = await supabase
            .from('categories')
            .upsert(
              {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description || '',
                image_url: cat.image_url || null,
                store_id: STORE_ID,
                created_at: cat.created_at || new Date().toISOString(),
              },
              { onConflict: 'id' }
            );
          if (!catErr) results.categories++;
        } catch (_) {}
      }
    }

    // 7. Restore Products (Batch Upsert, always forcing active store_id)
    if (Array.isArray(storeData.products) && storeData.products.length > 0) {
      for (let i = 0; i < storeData.products.length; i += 50) {
        const chunk = storeData.products.slice(i, i + 50).map((prod: any) => ({
          ...prod,
          store_id: STORE_ID,
          updated_at: new Date().toISOString(),
        }));
        const { error: pErr } = await supabase
          .from('products')
          .upsert(chunk, { onConflict: 'id' });
        if (!pErr) {
          results.products += chunk.length;
        } else {
          console.error('Product batch upsert error:', pErr);
        }
      }
    }

    // 8. Restore Product Categories Mapping
    const prodCatList = storeData.product_categories;
    if (Array.isArray(prodCatList) && prodCatList.length > 0) {
      for (let i = 0; i < prodCatList.length; i += 100) {
        const chunk = prodCatList.slice(i, i + 100).map((pc: any) => ({
          ...pc,
          store_id: STORE_ID,
        }));
        try {
          await supabase.from('product_categories').upsert(chunk, { onConflict: 'product_id,category_id' });
        } catch (_) {}
      }
    }

    // 9. Restore Product Variants (Batch Upsert, always forcing active store_id)
    const variantsList = storeData.variants || storeData.product_variants;
    if (Array.isArray(variantsList) && variantsList.length > 0) {
      for (let i = 0; i < variantsList.length; i += 100) {
        const chunk = variantsList.slice(i, i + 100).map((v: any) => ({
          ...v,
          store_id: STORE_ID,
        }));
        const { error: vErr } = await supabase
          .from('product_variants')
          .upsert(chunk, { onConflict: 'id' });
        if (!vErr) {
          results.variants += chunk.length;
        } else {
          console.error('Variant batch upsert error:', vErr);
        }
      }
    }

    // 10. Restore Coupons
    if (Array.isArray(storeData.coupons) && storeData.coupons.length > 0) {
      for (const coupon of storeData.coupons) {
        const { error: coupErr } = await supabase
          .from('coupons')
          .upsert(
            {
              ...coupon,
              store_id: STORE_ID,
            },
            { onConflict: 'id' }
          );
        if (!coupErr) results.coupons++;
      }
    }

    // 11. Invalidate Memory & Next.js ISR Caches
    invalidateStoreCache();
    try {
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/admin/products');
      revalidatePath('/admin/settings');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Full system data backup successfully restored.',
      restored_entities: results,
      metadata: metadata || null,
    });
  } catch (err: any) {
    console.error('Error restoring backup:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
