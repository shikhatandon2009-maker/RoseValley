import { getSupabaseServerClient } from './server';
import { STORE_ID } from '../constants';

const DEMO_PRODUCTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: 'Rose Royale Eau de Parfum',
    slug: 'rose-royale-eau-de-parfum',
    description: 'An intoxicating bouquet of Damask Rose, Velvet Oud, and warm Golden Amber. Crafted for moments of pure elegance and mystery.',
    price: 4800,
    compare_at_price: 5500,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Bergamot', 'Sparkling Pink Pepper'],
      heart: ['Bulgarian Rose', 'Turkish Rose Absolute'],
      base: ['Velvet Oud', 'Sandalwood', 'Golden Amber']
    },
    ingredients: ['Alcohol Denat.', 'Parfum (Fragrance)', 'Rosa Damascena Flower Extract', 'Linalool', 'Limonene'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: 'Velvet Amber & Vanilla Oil Blend',
    slug: 'velvet-amber-vanilla-oil-blend',
    description: 'Rich Madagascar Vanilla harmonized with golden amber and smoked vetiver. A calming elixir for deep relaxation.',
    price: 3200,
    compare_at_price: 3800,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop'],
    scent_notes: {
      top: ['Sweet Almond', 'Cardamom'],
      heart: ['Madagascar Vanilla Bean', 'Helichrysum'],
      base: ['Golden Amber', 'Smoked Vetiver']
    },
    ingredients: ['Simmondsia Chinensis Seed Oil', 'Vanilla Planifolia Extract', 'Amber Resin'],
    is_featured: true,
    is_bestseller: false,
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    name: 'Midnight Jasmine & Bergamot Cologne',
    slug: 'midnight-jasmine-bergamot-cologne',
    description: 'Night-blooming Jasmine blended with sun-ripened Calabrian Bergamot and soft White Musk.',
    price: 4200,
    compare_at_price: 4900,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'],
    scent_notes: {
      top: ['Calabrian Bergamot', 'Neroli'],
      heart: ['Night-Blooming Jasmine', 'Ylang Ylang'],
      base: ['White Musk', 'Cedarwood']
    },
    ingredients: ['Organic Cane Alcohol', 'Jasminum Officinale Flower Oil', 'Citrus Bergamia Peel Oil'],
    is_featured: true,
    is_bestseller: true,
  },
];

const DEMO_CATEGORIES = [
  { id: 'c1', name: 'Artisanal Perfumes', slug: 'artisanal-perfumes', description: 'Hand-crafted fine fragrances created by master perfumers using rare natural extracts.', image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop', display_order: 1 },
  { id: 'c2', name: 'Pure Essential Oils', slug: 'pure-essential-oils', description: '100% pure, single-origin steam-distilled botanical oils for aromatherapy and wellness.', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop', display_order: 2 },
  { id: 'c3', name: 'Luxury Elixirs & Blends', slug: 'luxury-elixirs-blends', description: 'Complex botanical synergy elixirs formulated to soothe the mind and elevate energy.', image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop', display_order: 3 }
];

export async function fetchProducts(options?: { categorySlug?: string; featuredOnly?: boolean; limit?: number }) {
  try {
    const supabase = getSupabaseServerClient();
    let query = supabase.from('products').select('*');

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Database fetchProducts error:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Database fetchProducts catch error:', err);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      return DEMO_PRODUCTS.find((p) => p.slug === slug) || DEMO_PRODUCTS[0];
    }
    return data;
  } catch (err) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) || DEMO_PRODUCTS[0];
  }
}

export async function fetchProductVariants(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('product_id', productId);

    if (error || !data || data.length === 0) {
      return [
        { id: 'v1', name: '50ml Eau de Parfum', price: 4800, size: '50ml', stock: 25 },
        { id: 'v2', name: '100ml Eau de Parfum', price: 7200, size: '100ml', stock: 20 },
      ];
    }
    return data;
  } catch (err) {
    return [
      { id: 'v1', name: '50ml Eau de Parfum', price: 4800, size: '50ml', stock: 25 },
      { id: 'v2', name: '100ml Eau de Parfum', price: 7200, size: '100ml', stock: 20 },
    ];
  }
}

export async function fetchCategories() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', STORE_ID)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEMO_CATEGORIES;
    }
    return data;
  } catch (err) {
    return DEMO_CATEGORIES;
  }
}

export async function fetchReviews(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(full_name, avatar_url)')
      .eq('store_id', STORE_ID)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'r1',
          rating: 5,
          title: 'Exquisite scent',
          comment: 'The Damask Rose is divine. People kept asking me what perfume I was wearing at dinner.',
          status: 'approved',
          is_verified_purchase: true,
          users: { full_name: 'Victoria Sterling' },
          created_at: new Date().toISOString(),
        },
      ];
    }
    return data;
  } catch (err) {
    return [];
  }
}

export async function fetchQuestions(productId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('product_questions')
      .select('*, users(full_name), product_answers(*, users(full_name, role))')
      .eq('store_id', STORE_ID)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 'q1',
          question: 'Is this perfume cruelty-free and alcohol-free?',
          users: { full_name: 'Victoria Sterling' },
          product_answers: [
            {
              id: 'a1',
              answer: 'Hello Victoria! Yes, all Maison De L\'Essence fragrances are 100% cruelty-free.',
              is_official: true,
              users: { full_name: 'Master Perfumer' },
            },
          ],
        },
      ];
    }
    return data;
  } catch (err) {
    return [];
  }
}

export async function fetchUserByEmail(email: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('email', email)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchUserById(id: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function fetchExchangeRates() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('store_id', STORE_ID);

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
