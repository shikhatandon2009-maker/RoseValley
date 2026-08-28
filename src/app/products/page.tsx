import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchProducts, fetchCategories } from '@/lib/supabase/store-scoped-queries';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { ProductsClientView } from './ProductsClientView';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const categories = await fetchCategories();
  const categoryParam = searchParams?.category;
  const activeCategory = categoryParam
    ? categories.find((c: any) => c.slug === categoryParam)
    : null;

  const title = activeCategory
    ? `${activeCategory.name} | Pure Botanical Distillates - RoseOil.in`
    : 'Complete Fragrance & Attar Collection | RoseOil.in';

  const description = activeCategory?.description
    ? activeCategory.description
    : 'Explore authentic 100% alcohol-free Kannauj attars, pure Damask Rose oil, hydro-distillates, and rare aged sandalwood elixirs.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: '/Hero/CollectionHero/floral-corner.png', width: 800, height: 600, alt: title }],
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Parallel data fetching for instant response
  const [allProducts, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex flex-col justify-between overflow-x-hidden">
      <LuxuryHeader />

      <Suspense
        fallback={
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#F6A6BB] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-[#4A0D25] uppercase tracking-wider">
              Loading Fragrance Collection...
            </p>
          </div>
        }
      >
        <ProductsClientView
          initialProducts={allProducts || []}
          categories={categories || []}
          initialCategory={searchParams?.category || ''}
          initialSearch={searchParams?.search || ''}
          initialSort={searchParams?.sort || ''}
        />
      </Suspense>

      <LuxuryFooter />
    </div>
  );
}
