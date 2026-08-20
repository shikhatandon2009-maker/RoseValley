import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSortSelect } from '@/components/product/ProductSortSelect';
import { fetchProducts, fetchCategories } from '@/lib/supabase/store-scoped-queries';
import { Search, Grid3X3, ArrowUpDown } from 'lucide-react';
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

  // Apply Category filter
  if (searchParams.category) {
    const catSlug = searchParams.category.toLowerCase().trim();
    products = products.filter((p: any) => {
      if (p.category_slug) {
        return p.category_slug.toLowerCase() === catSlug;
      }
      if (p.category_id) {
        const cat = categories.find((c: any) => c.id === p.category_id);
        if (cat) return cat.slug.toLowerCase() === catSlug;
      }

      // Keyword / slug matching fallback
      const nameLower = (p.name || '').toLowerCase();
      const slugLower = (p.slug || '').toLowerCase();
      const descLower = (p.description || '').toLowerCase();

      if (catSlug === 'artisanal-perfumes') {
        return (
          slugLower.includes('perfume') ||
          slugLower.includes('attar') ||
          slugLower.includes('cologne') ||
          descLower.includes('attar') ||
          descLower.includes('perfume') ||
          nameLower.includes('gulab') ||
          nameLower.includes('shamama') ||
          nameLower.includes('saffron') ||
          nameLower.includes('rose') ||
          nameLower.includes('oud')
        );
      } else if (catSlug === 'pure-essential-oils') {
        return (
          slugLower.includes('oil') ||
          slugLower.includes('extract') ||
          slugLower.includes('absolute') ||
          descLower.includes('essential') ||
          descLower.includes('absolute') ||
          nameLower.includes('vetiver') ||
          nameLower.includes('khus') ||
          nameLower.includes('jasmine')
        );
      } else if (catSlug === 'luxury-elixirs-blends') {
        return (
          slugLower.includes('blend') ||
          slugLower.includes('elixir') ||
          descLower.includes('blend') ||
          descLower.includes('elixir') ||
          nameLower.includes('vanilla') ||
          nameLower.includes('amber')
        );
      }
      return true;
    });
  }

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
      case 'name-asc':
        products = [...products].sort((a: any, b: any) => a.name.localeCompare(b.name));
        break;
    }
  }

  const activeCategory = searchParams.category
    ? categories.find((c: any) => c.slug === searchParams.category)
    : null;

  // Preserve existing sort and search when selecting category
  const buildCategoryUrl = (catSlug?: string) => {
    const params = new URLSearchParams();
    if (catSlug) params.set('category', catSlug);
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510]">
      <LuxuryHeader />

      {/* Hero Banner */}
      <section className="relative py-8 sm:py-20 overflow-hidden bg-gradient-to-b from-[#FAE6E7] via-[#F7EEED] to-[#F7EEED] border-b border-[#F7D1D8]">

        {/* Soft radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[220px] sm:h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 70%)' }}
        />

        {/* Left floral accent */}
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt="Floral corner decoration"
          className="absolute left-0 bottom-0 w-40 sm:w-64 md:w-80 opacity-40 pointer-events-none select-none 
               -translate-x-[15%] translate-y-[10%] rotate-[-6deg]"
        />

        {/* Right floral accent (flipped) */}
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt="Floral corner decoration"
          className="absolute right-0 bottom-0 w-40 sm:w-64 md:w-80 opacity-40 pointer-events-none select-none 
               translate-x-[15%] translate-y-[10%] rotate-[6deg] scale-x-[-1]"
        />

        <div className="text-center max-w-3xl mx-auto px-4 relative z-10 space-y-2 sm:space-y-4">
          <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold text-[#1A0510] tracking-tight">
            {activeCategory?.name || 'Our Collection'}
          </h1>
          <p className="text-xs sm:text-base text-[#4A0D25] leading-relaxed font-medium max-w-xl mx-auto line-clamp-2 sm:line-clamp-none">
            {activeCategory?.description || 'Pure hydro-distilled Damask Rose attars, aged sandalwood elixirs, and botanical skincare — crafted in Kannauj since 1620.'}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#4A0D25]/70 font-semibold uppercase tracking-widest pt-0.5">
            <Grid3X3 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span suppressHydrationWarning>
              Showing {products.length} {products.length === 1 ? 'fragrance' : 'fragrances'}
            </span>
          </div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">

        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-4 bg-white rounded-2xl border border-[#F7D1D8] shadow-sm">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x -mx-0.5 px-0.5">
            <Link
              href={buildCategoryUrl()}
              scroll={false}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${!searchParams.category
                ? 'bg-[#4A0D25] text-white shadow-md'
                : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
                }`}
            >
              All Scents
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={buildCategoryUrl(cat.slug)}
                scroll={false}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${searchParams.category === cat.slug
                  ? 'bg-[#4A0D25] text-white shadow-md'
                  : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
                  }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <form action="/products" method="GET" className="relative flex-1 sm:w-56">
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search || ''}
                placeholder="Search fragrances..."
                className="w-full bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2 sm:py-2.5 pl-8 sm:pl-9 pr-3 sm:pr-4 text-[11px] sm:text-xs text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] focus:border-transparent"
              />
              <Search className="w-3.5 h-3.5 text-[#4A0D25]/60 absolute left-2.5 sm:left-3.5 top-2.5 sm:top-3" />
            </form>

            {/* Sort Dropdown */}
            <React.Suspense fallback={
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-[#1A0510] opacity-80 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#F6A6BB]" />
                <span>Sort</span>
              </div>
            }>
              <ProductSortSelect />
            </React.Suspense>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-[#F7D1D8] shadow-sm px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-[#FAE6E7] flex items-center justify-center">
              <Search className="w-6 h-6 sm:w-7 sm:h-7 text-[#F6A6BB]" />
            </div>
            <p className="font-serif text-lg sm:text-xl text-[#1A0510] font-bold">No fragrances matched your selection</p>
            <p className="text-xs sm:text-sm text-[#4A0D25] mt-1.5 mb-6 font-medium">Try clearing filters or search terms.</p>
            <Link
              href="/products"
              className="inline-block bg-[#F6A6BB] text-[#4A0D25] text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-sm hover:bg-[#F4BBC9] transition-all"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {products.map((product: any, idx: number) => (
              <div
                key={product.id}
                className="opacity-0 animate-fadeInUp h-full"
                style={{ animationDelay: `${Math.min(idx * 50, 350)}ms`, animationFillMode: 'forwards' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Results Summary Footer */}
        {products.length > 0 && (
          <div className="text-center py-4 sm:py-6">
            <p className="text-[11px] sm:text-xs text-[#4A0D25]/60 font-semibold" suppressHydrationWarning>
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
