import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

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

    const cols = 'id, store_id, name, slug, price, compare_at_price, is_featured, is_bestseller, images, description, scent_notes, ingredients, meta_title, meta_keywords, meta_description, created_at, updated_at';
    let query = supabase
      .from('products')
      .select(cols)
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
      const productIdsInCategory = new Set(
        (junctions || [])
          .filter((j: any) => j.category_id === categoryId)
          .map((j: any) => j.product_id)
      );
      filteredProducts = filteredProducts.filter((p: any) => productIdsInCategory.has(p.id));
    }

    const enrichedProducts = filteredProducts.map((p: any) => ({
      ...p,
      categories: productCategoryLookup.get(p.id) || [],
      variants: variantsLookup.get(p.id) || [],
    }));

    // Aggregate statistics
    const totalProducts = enrichedProducts.length;
    const featuredCount = enrichedProducts.filter((p: any) => p.is_featured).length;
    const bestsellerCount = enrichedProducts.filter((p: any) => p.is_bestseller).length;
    const lowStockCount = 0;
    const totalStockSum = 0;

    return NextResponse.json({
      products: enrichedProducts,
      stats: {
        totalProducts,
        featuredCount,
        bestsellerCount,
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
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }

    const finalSlug = slug && slug.trim() !== '' ? generateSlug(slug) : generateSlug(name);
    const supabase = getSupabaseServerClient();

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
      const variantRows = variants.map((v: any) => ({
        store_id: STORE_ID,
        product_id: newProduct.id,
        name: String(v.name || 'Default Variant').trim(),
        sku: v.sku ? String(v.sku).trim() : null,
        price: Number(v.price) || Number(price) || 0,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      }));

      const { data: insertedVariants } = await supabase
        .from('product_variants')
        .insert(variantRows)
        .select('*');
      
      createdVariants = insertedVariants || [];
    }

    return NextResponse.json(
      { message: 'Product created successfully', product: { ...newProduct, variants: createdVariants } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API Error in POST /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
