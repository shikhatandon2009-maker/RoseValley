import { cache } from 'react';
import { getSupabaseServerClient } from './server';
import { STORE_ID } from '../constants';

const DEMO_PRODUCTS = [
  {
    id: 'prod-ruh-khus-oil',
    name: 'Ruh Khus Vetiver Extract',
    slug: 'ruh-khus-oil',
    description: 'Wild Vetiver roots distilled in traditional copper vessels over wood fire. Earthy, cooling, and deeply soothing.',
    price: 3200,
    compare_at_price: 3800,
    stock: 40,
    images: [
      '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Wild Vetiver Roots', 'Green Moss'],
      heart: ['Rain-Soaked Earth', 'Bamboo Water'],
      base: ['Copper Still Essence', 'Smoked Amber']
    },
    ingredients: ['100% Pure Vetiveria Zizanioides Root Extract'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'prod-gulab-khas-rose-oil',
    name: 'Gulab Khas Pure Ruh Gulab',
    slug: 'gulab-khas-pure-ruh-gulab',
    description: '100% Pure Damask Rose Oil hydro-distilled in traditional Kannauj copper deg stills from pre-dawn petals.',
    price: 5500,
    compare_at_price: 6200,
    stock: 20,
    images: [
      '/images/hero/champaca-bottle.png',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Fresh Damask Rose Petals', 'Sparkling Pink Pepper'],
      heart: ['Bulgarian Rose Absolute', 'Turkish Rose'],
      base: ['Mysore Sandalwood Base', 'Golden Amber']
    },
    ingredients: ['100% Pure Rosa Damascena Flower Extract'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'prod-shamama-kannauj-attar',
    name: 'Shamama Kannauj Attar',
    slug: 'shamama-kannauj-attar',
    description: 'Traditional heritage attar aged over 40 secret herbs, rare spices, and sandalwood oil in Kannauj.',
    price: 3900,
    compare_at_price: 4500,
    stock: 25,
    images: [
      '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Kashmiri Saffron', 'Black Cardamom'],
      heart: ['Nagarmotha', 'Spiced Rose'],
      base: ['Aged Sandalwood', 'Smoked Vetiver']
    },
    ingredients: ['Pure Botanical Oils', 'Mysore Sandalwood Oil', 'Herbal Extracts'],
    is_featured: true,
    is_bestseller: false,
  },
  {
    id: 'prod-royal-rose-oud-perfume',
    name: 'Royal Rose Oud Perfume',
    slug: 'royal-rose-oud-perfume',
    description: 'An intoxicating bouquet of Damask Rose, Velvet Oud, and warm Golden Amber.',
    price: 4800,
    compare_at_price: 5500,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Bergamot', 'Pink Pepper'],
      heart: ['Bulgarian Rose', 'Turkish Rose'],
      base: ['Velvet Oud', 'Sandalwood']
    },
    ingredients: ['Parfum (Fragrance)', 'Rosa Damascena Extract', 'Oud Resin'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'prod-saffron-crocus-attar',
    name: 'Saffron Crocus Attar',
    slug: 'saffron-crocus-attar',
    description: 'Kashmiri Mogra saffron stamens blended with warm amber and Damask Rose.',
    price: 6400,
    compare_at_price: 7200,
    stock: 15,
    images: [
      '/images/hero/champaca-bottle.png'
    ],
    scent_notes: {
      top: ['Kashmiri Saffron', 'Warm Amber'],
      heart: ['Damask Rose', 'Jasmine'],
      base: ['Golden Amber', 'White Oud']
    },
    ingredients: ['Crocus Sativus Stigma Extract', 'Sandalwood Base'],
    is_featured: true,
    is_bestseller: false,
  },
  {
    id: 'prod-rose-royale-eau-de-parfum',
    name: 'Rose Royale Eau de Parfum',
    slug: 'rose-royale-eau-de-parfum',
    description: 'An intoxicating bouquet of Damask Rose, Velvet Oud, and warm Golden Amber.',
    price: 4800,
    compare_at_price: 5500,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Bergamot', 'Pink Pepper'],
      heart: ['Bulgarian Rose', 'Turkish Rose'],
      base: ['Velvet Oud', 'Golden Amber']
    },
    ingredients: ['Alcohol Denat.', 'Parfum (Fragrance)', 'Rosa Damascena Extract'],
    is_featured: true,
    is_bestseller: true,
  },
  {
    id: 'prod-velvet-amber-vanilla-oil-blend',
    name: 'Velvet Amber & Vanilla Oil Blend',
    slug: 'velvet-amber-vanilla-oil-blend',
    description: 'Rich Madagascar Vanilla harmonized with golden amber and smoked vetiver.',
    price: 3200,
    compare_at_price: 3800,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop'],
    scent_notes: {
      top: ['Sweet Almond', 'Cardamom'],
      heart: ['Madagascar Vanilla', 'Helichrysum'],
      base: ['Golden Amber', 'Smoked Vetiver']
    },
    ingredients: ['Simmondsia Chinensis Seed Oil', 'Vanilla Extract'],
    is_featured: true,
    is_bestseller: false,
  },
  {
    id: 'prod-midnight-jasmine-bergamot-cologne',
    name: 'Midnight Jasmine & Bergamot Cologne',
    slug: 'midnight-jasmine-bergamot-cologne',
    description: 'Night-blooming Jasmine blended with sun-ripened Calabrian Bergamot.',
    price: 4200,
    compare_at_price: 4900,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'],
    scent_notes: {
      top: ['Calabrian Bergamot', 'Neroli'],
      heart: ['Night-Blooming Jasmine', 'Ylang Ylang'],
      base: ['White Musk', 'Cedarwood']
    },
    ingredients: ['Cane Alcohol', 'Jasmine Flower Oil'],
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
    if (error || !data || data.length === 0) {
      return DEMO_PRODUCTS;
    }
    return data;
  } catch (err) {
    return DEMO_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string) {
  const cleanSlug = (slug || '').toLowerCase().trim();
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', STORE_ID)
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // continue
  }

  // Exact or alias matching in DEMO_PRODUCTS
  const match = DEMO_PRODUCTS.find((p) => {
    const s = p.slug.toLowerCase();
    return (
      s === cleanSlug ||
      cleanSlug.includes(s) ||
      s.includes(cleanSlug) ||
      (cleanSlug.includes('khus') && s.includes('khus')) ||
      (cleanSlug.includes('rose') && s.includes('rose')) ||
      (cleanSlug.includes('shamama') && s.includes('shamama'))
    );
  });

  if (match) {
    return match;
  }

  // Fallback product dynamically formatted from the requested slug
  const formattedTitle = cleanSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: `prod-${cleanSlug}`,
    name: formattedTitle || 'Artisanal Perfume',
    slug: cleanSlug,
    description: 'An exquisite artisanal perfume hydro-distilled using authentic copper deg stills in Kannauj.',
    price: 4800,
    compare_at_price: 5500,
    stock: 35,
    images: [
      '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'
    ],
    scent_notes: {
      top: ['Damask Rose', 'Calabrian Bergamot'],
      heart: ['Bulgarian Rose Absolute', 'Kashmiri Saffron'],
      base: ['Velvet Oud', 'Mysore Sandalwood']
    },
    ingredients: ['Rosa Damascena Flower Extract', 'Parfum (Fragrance)', 'Sandalwood Oil'],
    is_featured: true,
    is_bestseller: true,
  };
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


