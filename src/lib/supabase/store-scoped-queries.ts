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
  category_id?: string;
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
  created_at?: string;
  categories?: any[];
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
    const cols = 'id, store_id, name, slug, price, compare_at_price, images, description, scent_notes, ingredients, is_featured, is_bestseller, created_at, updated_at';
    
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

    const { data: dbProducts, error } = await query;

    if (error || !dbProducts) {
      console.error('Error fetching products from Supabase:', error);
      return cached ? cached.data : [];
    }

    let productList: CatalogProduct[] = dbProducts.map((p: any) => ({
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
      created_at: p.created_at || new Date().toISOString(),
    }));

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
    const cols = 'id, store_id, name, slug, price, compare_at_price, images, description, scent_notes, ingredients, is_featured, is_bestseller, created_at, updated_at';
    
    const { data, error } = await supabase
      .from('products')
      .select(cols)
      .eq('store_id', STORE_ID)
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

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
      created_at: data.created_at || new Date().toISOString(),
    };

    MEMORY_CACHE.set(cacheKey, { data: product, timestamp: now });
    return product;
  } catch (err) {
    console.error('Database connection error in fetchProductBySlug:', err);
    return cached ? cached.data : null;
  }
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

    if (!error && data && data.length > 0) {
      MEMORY_CACHE.set(cacheKey, { data, timestamp: now });
      return data;
    }
  } catch (err) {
    console.error('Error fetching product variants:', err);
  }

  return [];
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
