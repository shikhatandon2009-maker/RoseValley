import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSortSelect } from '@/components/product/ProductSortSelect';
import { fetchProducts, fetchCategories } from '@/lib/supabase/store-scoped-queries';
import { Search, Grid3X3 } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
  };
}

export const revalidate = 60;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Parallel data fetching for performance
  const [allProducts, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  let products = allProducts;

  // Apply search filter
  if (searchParams.search) {
    const query = searchParams.search.toLowerCase();
    products = products.filter(
      (p: any) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
    );
  }

  // Apply sort
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case 'price-asc':
        products = [...products].sort((a: any, b: any) => a.price - b.price);
        break;
      case 'price-desc':
        products = [...products].sort((a: any, b: any) => b.price - a.price);
        break;
      case 'newest':
        products = [...products].reverse();
        break;
      case 'bestseller':
        products = [...products].sort((a: any, b: any) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
        break;
    }
  }

  const activeCategory = searchParams.category
    ? categories.find((c: any) => c.slug === searchParams.category)
    : null;

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510]">
      <LuxuryHeader />

      {/* Hero Banner */}
      <section className="relative py-14 sm:py-20 overflow-hidden bg-gradient-to-b from-[#FAE6E7] via-[#F7EEED] to-[#F7EEED] border-b border-[#F7D1D8]">
        {/* Soft radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 70%)' }} />

        <div className="text-center max-w-3xl mx-auto px-4 relative z-10 space-y-4">
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1A0510] tracking-tight">
            {activeCategory?.name || 'Our Collection'}
          </h1>
          <p className="text-sm sm:text-base text-[#4A0D25] leading-relaxed font-medium max-w-xl mx-auto">
            Pure hydro-distilled Damask Rose attars, aged sandalwood elixirs, and botanical skincare — crafted in Kannauj since 1620.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#4A0D25]/60 font-semibold uppercase tracking-widest">
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Showing {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#F7D1D8] shadow-sm">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                !searchParams.category
                  ? 'bg-[#4A0D25] text-white shadow-sm'
                  : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
              }`}
            >
              All Scents
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  searchParams.category === cat.slug
                    ? 'bg-[#4A0D25] text-white shadow-sm'
                    : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <form action="/products" method="GET" className="relative flex-1 sm:w-56">
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search || ''}
                placeholder="Search fragrances..."
                className="w-full bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2.5 pl-9 pr-4 text-xs text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] focus:border-transparent"
              />
              <Search className="w-3.5 h-3.5 text-[#4A0D25]/60 absolute left-3.5 top-3" />
            </form>

            {/* Sort Dropdown */}
            <ProductSortSelect />
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#F7D1D8] shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAE6E7] flex items-center justify-center">
              <Search className="w-7 h-7 text-[#F6A6BB]" />
            </div>
            <p className="font-serif text-xl text-[#1A0510] font-bold">No fragrances matched your selection</p>
            <p className="text-sm text-[#4A0D25] mt-2 mb-6 font-medium">Try clearing filters or search terms.</p>
            <Link
              href="/products"
              className="inline-block bg-[#F6A6BB] text-[#4A0D25] text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-full shadow-sm hover:bg-[#F4BBC9] transition-all"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any, idx: number) => (
              <div
                key={product.id}
                className="opacity-0 animate-fadeInUp"
                style={{ animationDelay: `${Math.min(idx * 60, 400)}ms`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Results Summary Footer */}
        {products.length > 0 && (
          <div className="text-center py-6">
            <p className="text-xs text-[#4A0D25]/50 font-semibold">
              Showing all {products.length} {products.length === 1 ? 'product' : 'products'}
              {searchParams.search && ` matching "${searchParams.search}"`}
              {activeCategory && ` in ${activeCategory.name}`}
            </p>
          </div>
        )}
      </main>

      <LuxuryFooter />
    </div>
  );
}
