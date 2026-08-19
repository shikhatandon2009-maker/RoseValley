import { cache } from 'react';
import { getSupabaseServerClient } from './server';
import { STORE_ID } from '../constants';
import { CATALOG_150_PRODUCTS, CatalogProduct } from '../catalog-150';

export interface ProductQueryOptions {
  categorySlug?: string;
  featuredOnly?: boolean;
  bestsellerOnly?: boolean;
  limit?: number;
  search?: string;
  sort?: string;
}

export const DEMO_CATEGORIES = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Artisanal Perfumes',
    slug: 'artisanal-perfumes',
    description: 'Hand-crafted fine fragrances created by master perfumers using rare natural extracts and heritage copper stills.',
    image_url: '/images/hero/champaca-bottle.png',
    display_order: 1,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Pure Essential Oils',
    slug: 'pure-essential-oils',
    description: '100% pure, single-origin steam-distilled botanical oils for aromatherapy, wellness, and bespoke perfumery.',
    image_url: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    display_order: 2,
  },
  {
    id: '1814fab7-06bf-41d8-8cf0-25a065af78be',
    name: 'Royal Attars',
    slug: 'royal-attars',
    description: 'Traditional Kannauj deg-bhapka distilled attars aged over pure Mysore sandalwood base for 12+ hour longevity.',
    image_url: '/uploads/hero/ai_bottle_1786262186076.png',
    display_order: 3,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Luxury Elixirs & Blends',
    slug: 'luxury-elixirs-blends',
    description: 'Complex botanical synergy elixirs formulated with rare resins, vanilla absolute, and sacred spices.',
    image_url: '/uploads/hero/champaca_bottle_1786262252250.png',
    display_order: 4,
  },
];

/**
 * Fallback luxury flacon pictures based on scent / category keywords
 */
export function getQualitySinglePicture(product: { name?: string; slug?: string; category_slug?: string; images?: string[] }): string {
  if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    const img = product.images[0].trim();
    if (img.startsWith('http') || img.startsWith('/')) {
      return img;
    }
  }

  const text = `${product.name || ''} ${product.slug || ''} ${product.category_slug || ''}`.toLowerCase();

  if (text.includes('khus') || text.includes('vetiver') || text.includes('eucalyptus') || text.includes('pine') || text.includes('green') || text.includes('mint')) {
    return '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png';
  }
  if (text.includes('shamama') || text.includes('saffron') || text.includes('spiced') || text.includes('amber') || text.includes('cardamom') || text.includes('clove')) {
    return '/uploads/hero/ai_bottle_1786262186076.png';
  }
  if (text.includes('jasmine') || text.includes('sambac') || text.includes('mogra') || text.includes('neroli') || text.includes('white') || text.includes('bergamot')) {
    return '/uploads/hero/image__5__1786261765122.png';
  }
  if (text.includes('oud') || text.includes('oudh') || text.includes('damask') || text.includes('royal') || text.includes('rose royale')) {
    return '/uploads/hero/champaca_bottle_1786262252250.png';
  }
  return '/images/hero/champaca-bottle.png';
}

/**
 * Normalized product record with guaranteed single image and valid fields
 */
function normalizeProduct(p: any): CatalogProduct {
  const singlePic = getQualitySinglePicture(p);
  const images = (p.images && Array.isArray(p.images) && p.images.length > 0 && p.images[0])
    ? [p.images[0]]
    : [singlePic];

  return {
    id: String(p.id || `prod-${p.slug}`),
    store_id: p.store_id || STORE_ID,
    name: p.name || 'Artisanal Fragrance',
    slug: p.slug || 'fragrance',
    category_slug: p.category_slug || (p.categories?.[0]?.slug) || 'pure-essential-oils',
    category_id: p.category_id || (p.categories?.[0]?.id),
    description: p.description || '100% Pure botanical fragrance hydro-distilled in traditional Kannauj copper deg stills.',
    price: Number(p.price) || 1200,
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : undefined,
    stock: p.stock !== undefined ? Number(p.stock) : 30,
    images: images,
    scent_notes: p.scent_notes || {
      top: ['Damask Petals', 'Sparkling Bergamot'],
      heart: ['Botanical Heart', 'Rose Absolute'],
      base: ['Mysore Sandalwood Base', 'Golden Amber']
    },
    ingredients: Array.isArray(p.ingredients) && p.ingredients.length > 0
      ? p.ingredients
      : ['100% Pure Botanical Extracts', 'Mysore Sandalwood Carrier'],
    is_featured: Boolean(p.is_featured),
    is_bestseller: Boolean(p.is_bestseller),
    created_at: p.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch products from Supabase with robust fallback to all 150 products
 */
export async function fetchProducts(options?: ProductQueryOptions): Promise<CatalogProduct[]> {
  try {
    const supabase = getSupabaseServerClient();
    const cols = 'id, name, slug, price, compare_at_price, stock, images, is_featured, is_bestseller, description, scent_notes, ingredients';
    let query = supabase.from('products').select(cols).order('id').limit(150);

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

    let productList: CatalogProduct[] = [];

    if (!error && dbProducts && dbProducts.length > 0) {
      productList = dbProducts.map(normalizeProduct);
    } else {
      // Use full 150 catalog
      productList = CATALOG_150_PRODUCTS.map(normalizeProduct);
    }

    // Apply filtering if provided
    if (options?.categorySlug) {
      const cSlug = options.categorySlug.toLowerCase().trim();
      productList = productList.filter((p) => {
        if (p.category_slug && p.category_slug.toLowerCase() === cSlug) return true;
        const text = `${p.name} ${p.slug} ${p.description}`.toLowerCase();
        if (cSlug === 'artisanal-perfumes') {
          return text.includes('perfume') || text.includes('concentrate') || text.includes('cologne') || text.includes('parfum');
        }
        if (cSlug === 'pure-essential-oils') {
          return text.includes('oil') || text.includes('extract') || text.includes('absolute');
        }
        if (cSlug === 'royal-attars') {
          return text.includes('attar') || text.includes('shamama') || text.includes('gulab') || text.includes('oud');
        }
        if (cSlug === 'luxury-elixirs-blends') {
          return text.includes('blend') || text.includes('elixir') || text.includes('vanilla') || text.includes('amber');
        }
        return true;
      });
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      productList = productList.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
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

    return productList;
  } catch (err) {
    console.error('Error in fetchProducts:', err);
    let fallback = CATALOG_150_PRODUCTS.map(normalizeProduct);
    if (options?.limit) {
      fallback = fallback.slice(0, options.limit);
    }
    return fallback;
  }
}

/**
 * Fetch a single product by slug with complete metadata and single picture
 */
export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const cleanSlug = (slug || '').toLowerCase().trim();
  if (!cleanSlug) return null;

  try {
    const supabase = getSupabaseServerClient();
    const cols = 'id, name, slug, price, compare_at_price, stock, images, is_featured, is_bestseller, description, scent_notes, ingredients';
    const { data, error } = await supabase
      .from('products')
      .select(cols)
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (!error && data) {
      return normalizeProduct(data);
    }
  } catch (err) {
    // fallback to catalog
  }



  // Exact or fuzzy match in 150 catalog
  const catalogMatch = CATALOG_150_PRODUCTS.find((p) => {
    const s = p.slug.toLowerCase();
    return s === cleanSlug || cleanSlug.includes(s) || s.includes(cleanSlug);
  });

  if (catalogMatch) {
    return normalizeProduct(catalogMatch);
  }

  // Dynamic fallback product from slug
  const title = cleanSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return normalizeProduct({
    id: `prod-${cleanSlug}`,
    name: title || 'Artisanal Perfume',
    slug: cleanSlug,
    category_slug: 'pure-essential-oils',
    description: `An exquisite artisanal fragrance hydro-distilled using authentic copper deg stills in Kannauj. Crafted for connoisseurs of pure botanicals.`,
    price: 3200,
    compare_at_price: 3800,
    stock: 35,
    images: [],
    is_featured: true,
    is_bestseller: true,
  });
}

/**
 * Fetch variants for a product
 */
export async function fetchProductVariants(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  return [
    { id: `v1-${productId}`, name: '10ml Pure Extrait', price: 3200, size: '10ml', stock: 25 },
    { id: `v2-${productId}`, name: '50ml Royal Flacon', price: 6400, size: '50ml', stock: 20 },
  ];
}

/**
 * Fetch categories
 */
export async function fetchCategories() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // fallback
  }

  return DEMO_CATEGORIES;
}

/**
 * Fetch reviews
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
    // fallback
  }

  return [
    {
      id: 'r1',
      name: 'Victoria Sterling',
      rating: 5,
      title: 'Unrivaled Longevity & Regal Scent Profile',
      comment: 'An extraordinary masterpiece! Opens with vivid freshness that gently evolves into warm sandalwood. The sillage is mesmerizing without ever feeling synthetic.',
      review: 'An extraordinary masterpiece! Opens with vivid freshness that gently evolves into warm sandalwood. The sillage is mesmerizing without ever feeling synthetic.',
      status: 'approved',
      is_verified_purchase: true,
      verified: true,
      date: '2 days ago',
      users: { full_name: 'Victoria Sterling' },
      created_at: new Date().toISOString(),
    },
    {
      id: 'r2',
      name: 'Alexander Vance',
      rating: 5,
      title: 'Authentic 400-Year Kannauj Craftsmanship',
      comment: 'You can truly feel the Deg-Bhapka copper still heritage in every drop. Exceptional sillage and zero harsh alcohol!',
      review: 'You can truly feel the Deg-Bhapka copper still heritage in every drop. Exceptional sillage and zero harsh alcohol!',
      status: 'approved',
      is_verified_purchase: true,
      verified: true,
      date: '1 week ago',
      users: { full_name: 'Alexander Vance' },
      created_at: new Date().toISOString(),
    },
  ];
}

/**
 * Fetch questions
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
    // fallback
  }

  return [
    {
      id: 'q1',
      question: 'Is this perfume cruelty-free and alcohol-free?',
      users: { full_name: 'Victoria Sterling' },
      product_answers: [
        {
          id: 'a1',
          answer: 'Hello Victoria! Yes, all our fragrances are 100% cruelty-free, steam hydro-distilled, and free of synthetic alcohol.',
          is_official: true,
          users: { full_name: 'Master Perfumer' },
        },
      ],
    },
  ];
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

