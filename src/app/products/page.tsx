import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts, fetchCategories } from '@/lib/supabase/store-scoped-queries';
import { Search, Sparkles } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const allProducts = await fetchProducts();
  const categories = await fetchCategories();

  let products = allProducts;

  // Apply search filter if present
  if (searchParams.search) {
    const query = searchParams.search.toLowerCase();
    products = products.filter(
      (p: any) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-bold flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> 400-Year Kannauj Copper Distillates
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510]">
            {searchParams.category
              ? categories.find((c: any) => c.slug === searchParams.category)?.name || 'Fragrance Collection'
              : 'All Essential Oils & Perfumes'}
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed font-medium">
            Discover pure hydro-distilled Damask Rose attars, aged sandalwood elixirs, and botanical skincare.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#FAE6E7]/60 rounded-2xl border border-[#F7D1D8] shadow-sm">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                !searchParams.category
                  ? 'bg-[#F6A6BB] text-[#4A0D25] shadow-sm'
                  : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8]'
              }`}
            >
              All Scents
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  searchParams.category === cat.slug
                    ? 'bg-[#F6A6BB] text-[#4A0D25] shadow-sm'
                    : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search Input */}
          <form action="/products" method="GET" className="relative w-full sm:w-72">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search || ''}
              placeholder="Search notes, ingredients..."
              className="w-full bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2 pl-9 pr-4 text-xs text-[#1A0510] placeholder-[#4A0D25]/60 focus:outline-none focus:ring-1 focus:ring-[#F6A6BB]"
            />
            <Search className="w-3.5 h-3.5 text-[#4A0D25] absolute left-3.5 top-3" />
          </form>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-[#FAE6E7]/40 rounded-2xl border border-[#F7D1D8]">
            <p className="font-serif text-lg text-[#1A0510] font-bold">No fragrances matched your selection.</p>
            <p className="text-xs text-[#4A0D25] mt-1 mb-4">Try clearing filters or search terms.</p>
            <Link
              href="/products"
              className="inline-block bg-[#F6A6BB] text-[#4A0D25] text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-sm"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <LuxuryFooter />
    </div>
  );
}
