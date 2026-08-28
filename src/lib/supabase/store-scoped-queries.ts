import { getSupabaseServerClient } from './server';
import { STORE_ID } from '../constants';

export interface ProductQueryOptions {
  categorySlug?: string;
  featuredOnly?: boolean;
  bestsellerOnly?: boolean;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface CatalogProduct {
  id: string;
  store_id?: string;
  name: string;
  slug: string;
  category_slug?: string;
  category_slugs?: string[];
  category_id?: string;
  category_name?: string;
  categories?: any[];
  category?: any;
  description: string;
  price: number;
  compare_at_price?: number;
  stock?: number;
  images: string[];
  scent_notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  ingredients?: string[];
  is_featured?: boolean;
  is_bestseller?: boolean;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  created_at?: string;
  variants?: any[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-SPEED IN-MEMORY CACHE (Instant frontend response + Background revalidation)
// ─────────────────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const MEMORY_CACHE = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 20000; // 20 seconds

export function invalidateStoreCache() {
  MEMORY_CACHE.clear();
}

/**
 * Fetch all products dynamically from Supabase with instant memory cache
 */
export async function fetchProducts(options?: ProductQueryOptions): Promise<CatalogProduct[]> {
  const cacheKey = `products_${JSON.stringify(options || {})}`;
  const cached = MEMORY_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const supabase = getSupabaseServerClient();
    const cols = 'id, store_id, name, slug, price, compare_at_price, images, description, scent_notes, ingredients, is_featured, is_bestseller, meta_title, meta_keywords, meta_description, created_at, updated_at';
    
    let query = supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .order('created_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.bestsellerOnly) {
      query = query.eq('is_bestseller', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const [{ data: dbProducts, error }, { data: junctions }, { data: dbCategories }] = await Promise.all([
      query,
      supabase.from('product_categories').select('product_id, category_id').eq('store_id', STORE_ID),
      supabase.from('categories').select('id, name, slug').eq('store_id', STORE_ID),
    ]);

    if (error || !dbProducts) {
      console.error('Error fetching products from Supabase:', error);
      return cached ? cached.data : [];
    }

    const catMap = new Map<string, { id: string; name: string; slug: string }>();
    (dbCategories || []).forEach((c: any) => catMap.set(String(c.id), c));

    const prodCatMap = new Map<string, any[]>();
    (junctions || []).forEach((j: any) => {
      const cat = catMap.get(String(j.category_id));
      if (cat) {
        const list = prodCatMap.get(String(j.product_id)) || [];
        list.push(cat);
        prodCatMap.set(String(j.product_id), list);
      }
    });

    let productList: CatalogProduct[] = dbProducts.map((p: any) => {
      const assignedCats = prodCatMap.get(String(p.id)) || [];
      const primaryCat = assignedCats[0];
      return {
        id: String(p.id),
        store_id: p.store_id || STORE_ID,
        name: p.name || 'Artisanal Fragrance',
        slug: p.slug || '',
        description: p.description || '',
        price: Number(p.price) || 0,
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
        scent_notes: p.scent_notes || { top: [], heart: [], base: [] },
        ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
        is_featured: Boolean(p.is_featured),
        is_bestseller: Boolean(p.is_bestseller),
        meta_title: p.meta_title || '',
        meta_keywords: p.meta_keywords || '',
        meta_description: p.meta_description || '',
        created_at: p.created_at || new Date().toISOString(),
        categories: assignedCats,
        category: primaryCat,
        category_id: primaryCat?.id,
        category_name: primaryCat?.name,
        category_slug: primaryCat?.slug,
        category_slugs: assignedCats.map((c: any) => c.slug),
      };
    });

    // Deduplicate duplicate products of the same name (prefer cleaner hyphenated slug)
    const dedupMap = new Map<string, CatalogProduct>();
    for (const p of productList) {
      const norm = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const existing = dedupMap.get(norm);
      if (!existing) {
        dedupMap.set(norm, p);
      } else if (p.slug.includes('-') && !existing.slug.includes('-')) {
        dedupMap.set(norm, p);
      }
    }
    productList = Array.from(dedupMap.values());

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      productList = productList.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (options?.sort) {
      switch (options.sort) {
        case 'price-asc':
          productList.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          productList.sort((a, b) => b.price - a.price);
          break;
        case 'bestseller':
          productList.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
          break;
        case 'name-asc':
          productList.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    if (options?.limit && productList.length > options.limit) {
      productList = productList.slice(0, options.limit);
    }

    MEMORY_CACHE.set(cacheKey, { data: productList, timestamp: now });
    return productList;
  } catch (err) {
    console.error('Database connection error in fetchProducts:', err);
    return cached ? cached.data : [];
  }
}

/**
 * Fetch a single product dynamically from Supabase by slug with memory caching
 */
export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const cleanSlug = (slug || '').toLowerCase().trim();
  if (!cleanSlug) return null;

  const cacheKey = `product_slug_${cleanSlug}`;
  const cached = MEMORY_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const supabase = getSupabaseServerClient();
    const cols = 'id, store_id, name, slug, price, compare_at_price, images, description, scent_notes, ingredients, is_featured, is_bestseller, meta_title, meta_keywords, meta_description, created_at, updated_at';
    
    const { data, error } = await supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Fetch assigned category for breadcrumb navigation
    let category: { id: string; name: string; slug: string } | null = null;
    try {
      const { data: junction } = await supabase
        .from('product_categories')
        .select('category_id, categories(id, name, slug)')
        .eq('product_id', data.id)
        .limit(1)
        .maybeSingle();

      if (junction && (junction as any).categories) {
        category = (junction as any).categories;
      }
    } catch (_) {}

    const product: CatalogProduct = {
      id: String(data.id),
      store_id: data.store_id || STORE_ID,
      name: data.name || 'Artisanal Fragrance',
      slug: data.slug || cleanSlug,
      description: data.description || '',
      price: Number(data.price) || 0,
      compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : undefined,
      images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
      scent_notes: data.scent_notes || { top: [], heart: [], base: [] },
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      is_featured: Boolean(data.is_featured),
      is_bestseller: Boolean(data.is_bestseller),
      meta_title: data.meta_title || '',
      meta_keywords: data.meta_keywords || '',
      meta_description: data.meta_description || '',
      created_at: data.created_at || new Date().toISOString(),
      category,
      category_name: category?.name,
      category_slug: category?.slug,
    };

    MEMORY_CACHE.set(cacheKey, { data: product, timestamp: now });
    return product;
  } catch (err) {
    console.error('Database connection error in fetchProductBySlug:', err);
    return cached ? cached.data : null;
  }
}

export function getStandardVariantsForKiloPrice(basePrice?: number) {
  const b = Math.max(100, Number(basePrice) || 1000);
  return [
    { id: 'sample', name: 'Sample (2ml)', price: 250, compare_at_price: 300 },
    { id: '100ml', name: '100 ml', price: Math.round(b / 10 + 200), compare_at_price: Math.round((b / 10 + 200) * 1.2) },
    { id: '250ml', name: '250 ml', price: Math.round(b / 4 + 200), compare_at_price: Math.round((b / 4 + 200) * 1.2) },
    { id: '500ml', name: '500 ml', price: Math.round(b / 2 + 200), compare_at_price: Math.round((b / 2 + 200) * 1.2) },
    { id: '1kg', name: '1 Kg', price: b, compare_at_price: Math.round(b * 1.2) },
    { id: '5kg', name: '5 Kg', price: Math.round(b * 5 * 0.98), compare_at_price: Math.round(b * 5 * 1.15) },
    { id: '10kg', name: '10 Kg', price: Math.round(b * 10 * 0.96), compare_at_price: Math.round(b * 10 * 1.15) },
    { id: '20kg', name: '20 Kg', price: Math.round(b * 20 * 0.93), compare_at_price: Math.round(b * 20 * 1.15) },
  ];
}

/**
 * Fetch product variants dynamically from Supabase
 */
export async function fetchProductVariants(productId: string, basePrice?: number) {
  const cacheKey = `variants_${productId}`;
  const cached = MEMORY_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('product_id', productId)
      .order('price', { ascending: true });

    if (!error && data && data.length > 1) {
      // Deduplicate variants by name and price
      const seen = new Set<string>();
      const uniqueVariants: any[] = [];
      for (const v of data) {
        const key = `${(v.name || '').trim().toLowerCase()}_${Number(v.price)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVariants.push(v);
        }
      }
      if (uniqueVariants.length > 1) {
        MEMORY_CACHE.set(cacheKey, { data: uniqueVariants, timestamp: now });
        return uniqueVariants;
      }
    }
  } catch (err) {
    console.error('Error fetching product variants:', err);
  }

  const standard = getStandardVariantsForKiloPrice(basePrice);
  MEMORY_CACHE.set(cacheKey, { data: standard, timestamp: now });
  return standard;
}

/**
 * Fetch categories dynamically from Supabase
 */
export async function fetchCategories() {
  const cacheKey = 'store_categories';
  const cached = MEMORY_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS * 2) {
    return cached.data;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      MEMORY_CACHE.set(cacheKey, { data, timestamp: now });
      return data;
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  return [];
}

/**
 * Fetch reviews dynamically from Supabase
 */
export async function fetchReviews(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(full_name, avatar_url)')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  return [];
}

/**
 * Fetch questions dynamically from Supabase
 */
export async function fetchQuestions(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('product_questions')
      .select('*, users(full_name), product_answers(*, users(full_name, role))')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching questions:', err);
  }

  return [];
}

/**
 * Fetch user by email
 */
export async function fetchUserByEmail(email: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch user by id
 */
export async function fetchUserById(id: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch exchange rates
 */
export async function fetchExchangeRates() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*');

    if (error || !data || data.length === 0) {
      return [
        { currency_code: 'INR', rate_to_inr: 1.0 },
        { currency_code: 'USD', rate_to_inr: 0.012 },
        { currency_code: 'EUR', rate_to_inr: 0.011 },
        { currency_code: 'AED', rate_to_inr: 0.044 },
      ];
    }
    return data;
  } catch (err) {
    return [
      { currency_code: 'INR', rate_to_inr: 1.0 },
      { currency_code: 'USD', rate_to_inr: 0.012 },
      { currency_code: 'EUR', rate_to_inr: 0.011 },
      { currency_code: 'AED', rate_to_inr: 0.044 },
    ];
  }
}
