import { MetadataRoute } from 'next';
import { fetchProducts, fetchCategories } from '@/lib/supabase/store-scoped-queries';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const revalidate = 60; // Auto-revalidate every 60 seconds (or on-demand)
export const dynamic = 'force-dynamic';

const DEFAULT_BASE_URL = 'https://roseoil.in';

const FALLBACK_JOURNAL_SLUGS = [
  'art-of-fragrance-layering',
  'harvesting-damask-roses',
  'copper-deg-bhapka-legacy',
  'ruh-khus-cooling-elixir',
  'alcohol-free-attar-purity',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, '');

  const now = new Date();

  // 1. Core Static Website Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/press`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/shipping-delivery-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/return-refund-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // 2. Fetch Live Products from Supabase (Always in sync: automatically adds new products and removes deleted products)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchProducts();
    productRoutes = (products || [])
      .filter((p) => Boolean(p.slug))
      .map((p) => {
        let lastModDate = now;
        if (p.created_at) {
          const parsed = new Date(p.created_at);
          if (!isNaN(parsed.getTime())) {
            lastModDate = parsed;
          }
        }

        return {
          url: `${baseUrl}/products/${encodeURIComponent(p.slug)}`,
          lastModified: lastModDate,
          changeFrequency: 'weekly',
          priority: p.is_bestseller ? 0.9 : p.is_featured ? 0.85 : 0.8,
        };
      });
  } catch (err) {
    console.error('Error generating product sitemap entries:', err);
  }

  // 3. Fetch Live Categories from Supabase
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await fetchCategories();
    categoryRoutes = (categories || [])
      .filter((c: any) => Boolean(c.slug))
      .map((c: any) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(c.slug)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
  } catch (err) {
    console.error('Error generating category sitemap entries:', err);
  }

  // 4. Fetch Live Journal Articles
  let journalRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabaseServerClient();
    let journalSlugs: { slug: string; updated_at?: string }[] = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('pages')
        .select('slug, updated_at, created_at')
        .eq('store_id', STORE_ID)
        .eq('page_type', 'blog');

      if (!error && data && data.length > 0) {
        journalSlugs = data;
      }
    }

    if (journalSlugs.length === 0) {
      journalSlugs = FALLBACK_JOURNAL_SLUGS.map((slug) => ({ slug }));
    }

    journalRoutes = journalSlugs
      .filter((item) => Boolean(item.slug))
      .map((item) => ({
        url: `${baseUrl}/journal/${encodeURIComponent(item.slug)}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
  } catch (err) {
    console.error('Error generating journal sitemap entries:', err);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...journalRoutes,
  ];
}
