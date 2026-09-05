'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Grid3X3,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import type { CatalogProduct } from '@/lib/supabase/store-scoped-queries';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductsClientViewProps {
  initialProducts: CatalogProduct[];
  categories: CategoryItem[];
  initialCategory?: string;
  initialSearch?: string;
  initialSort?: string;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const SORT_OPTIONS = [
  { id: '', label: 'Default Sorting' },
  { id: 'bestseller', label: 'Bestsellers First' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'newest', label: 'Newest First' },
  { id: 'name-asc', label: 'Alphabetical: A → Z' },
];

const SEARCH_SUGGESTIONS = [
  'Ruh Gulab',
  'Pure Rose Oil',
  'Kannauj Attar',
  'Mysore Sandalwood',
  'Oud',
  'Vetiver / Khus',
  'Jasmine Absolute',
];

export function ProductsClientView({
  initialProducts,
  categories,
  initialCategory = '',
  initialSearch = '',
  initialSort = '',
}: ProductsClientViewProps) {
  const searchParams = useSearchParams();

  // Primary filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get('category') || initialCategory
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams?.get('search') || initialSearch
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string>(
    searchParams?.get('search') || initialSearch
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams?.get('sort') || initialSort
  );

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(() => {
    const p = searchParams?.get('limit');
    const parsed = p ? parseInt(p, 10) : 24;
    return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : 24;
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const page = searchParams?.get('page');
    const parsed = page ? parseInt(page, 10) : 1;
    return parsed > 0 ? parsed : 1;
  });

  // UI Dropdown states
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query for ultra-smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 120);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state with URL without full page reload
  const updateUrl = useCallback(
    (cat: string, search: string, sort: string, page: number, limit: number) => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams();
      if (cat) params.set('category', cat);
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);
      if (page > 1) params.set('page', page.toString());
      if (limit !== 24) params.set('limit', limit.toString());

      const queryStr = params.toString();
      const newUrl = queryStr ? `/products?${queryStr}` : '/products';
      window.history.replaceState(null, '', newUrl);
    },
    []
  );

  // Listen to browser forward/back button popstate
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setSelectedCategory(sp.get('category') || '');
      setSearchQuery(sp.get('search') || '');
      setDebouncedSearch(sp.get('search') || '');
      setSortBy(sp.get('sort') || '');
      const p = parseInt(sp.get('page') || '1', 10);
      setCurrentPage(p > 0 ? p : 1);
      const l = parseInt(sp.get('limit') || '24', 10);
      setPageSize(PAGE_SIZE_OPTIONS.includes(l) ? l : 24);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) {
        setPageSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category change handler (instant 0ms filtering)
  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setCurrentPage(1);
    updateUrl(catSlug, debouncedSearch, sortBy, 1, pageSize);
  };

  // Search input change handler
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // When debounced search changes, update URL
  useEffect(() => {
    updateUrl(selectedCategory, debouncedSearch, sortBy, currentPage, pageSize);
  }, [debouncedSearch, selectedCategory, sortBy, currentPage, pageSize, updateUrl]);

  // Sort change handler
  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
    setSortDropdownOpen(false);
    setCurrentPage(1);
    updateUrl(selectedCategory, debouncedSearch, sortId, 1, pageSize);
  };

  // Page size change handler
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageSizeDropdownOpen(false);
    setCurrentPage(1);
    updateUrl(selectedCategory, debouncedSearch, sortBy, 1, size);
  };

  // Page change handler with smooth scroll to top of grid
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(selectedCategory, debouncedSearch, sortBy, page, pageSize);
    if (gridTopRef.current) {
      const topOffset = gridTopRef.current.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setDebouncedSearch('');
    setSortBy('');
    setCurrentPage(1);
    updateUrl('', '', '', 1, pageSize);
  };

  // Helper to match a product against category
  const matchesCategory = useCallback(
    (p: CatalogProduct, catSlug: string): boolean => {
      if (!catSlug) return true;
      const target = catSlug.toLowerCase().trim();

      // 1. Direct slug match
      if (p.category_slug && p.category_slug.toLowerCase() === target) return true;

      // 2. Multi-category slugs array match
      if (p.category_slugs && Array.isArray(p.category_slugs)) {
        if (p.category_slugs.some((s) => s.toLowerCase() === target)) return true;
      }

      // 3. Category ID match
      if (p.category_id) {
        const cat = categories.find((c) => c.id === p.category_id);
        if (cat && cat.slug.toLowerCase() === target) return true;
      }

      // 4. Embedded categories array match
      if (p.categories && Array.isArray(p.categories)) {
        if (p.categories.some((c: any) => (c.slug || '').toLowerCase() === target)) {
          return true;
        }
      }

      // 5. Intelligent keyword / slug matching fallback
      const nameLower = (p.name || '').toLowerCase();
      const slugLower = (p.slug || '').toLowerCase();
      const descLower = (p.description || '').toLowerCase();

      if (target === 'artisanal-perfumes') {
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
      } else if (target === 'pure-essential-oils') {
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
      } else if (target === 'luxury-elixirs-blends') {
        return (
          slugLower.includes('blend') ||
          slugLower.includes('elixir') ||
          descLower.includes('blend') ||
          descLower.includes('elixir') ||
          nameLower.includes('vanilla') ||
          nameLower.includes('amber')
        );
      }

      return false;
    },
    [categories]
  );

  // Compute category counts for pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: initialProducts.length,
    };
    categories.forEach((cat) => {
      counts[cat.slug] = initialProducts.filter((p) => matchesCategory(p, cat.slug)).length;
    });
    return counts;
  }, [initialProducts, categories, matchesCategory]);

  // Master Filter & Sort Memoization (Blazing fast 0ms client-side execution)
  const filteredAndSortedProducts = useMemo(() => {
    let result = initialProducts;

    // 1. Category Filter
    if (selectedCategory) {
      result = result.filter((p) => matchesCategory(p, selectedCategory));
    }

    // 2. Search Filter (Multi-field instant search)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const slugMatch = (p.slug || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.category_name || '').toLowerCase().includes(q);

        // Check scent notes
        const notes = p.scent_notes || {};
        const notesStr = [
          ...(notes.top || []),
          ...(notes.heart || []),
          ...(notes.base || []),
        ]
          .join(' ')
          .toLowerCase();
        const notesMatch = notesStr.includes(q);

        // Check ingredients
        const ingredientsStr = (p.ingredients || []).join(' ').toLowerCase();
        const ingredientsMatch = ingredientsStr.includes(q);

        return (
          nameMatch ||
          slugMatch ||
          descMatch ||
          catMatch ||
          notesMatch ||
          ingredientsMatch
        );
      });
    }

    // 3. Sorting
    if (sortBy) {
      const copy = [...result];
      switch (sortBy) {
        case 'price-asc':
          copy.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
          return copy;
        case 'price-desc':
          copy.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
          return copy;
        case 'newest':
          copy.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          return copy;
        case 'bestseller':
          copy.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
          return copy;
        case 'name-asc':
          copy.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          return copy;
        default:
          return copy;
      }
    }

    return result;
  }, [initialProducts, selectedCategory, debouncedSearch, sortBy, matchesCategory]);

  // Pagination calculations
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPaginatedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, startIndex, endIndex]);

  // Active Category Details
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory) || null;
  }, [selectedCategory, categories]);

  const activeSortOption = useMemo(() => {
    return SORT_OPTIONS.find((o) => o.id === sortBy) || SORT_OPTIONS[0];
  }, [sortBy]);

  // Generate pagination range with smart ellipsis
  const paginationRange = useMemo(() => {
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, safeCurrentPage - delta);
      i <= Math.min(totalPages - 1, safeCurrentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (safeCurrentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (safeCurrentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return Array.from(new Set(rangeWithDots));
  }, [safeCurrentPage, totalPages]);

  return (
    <div className="w-full">
      {/* =========================================================================
          HERO BANNER & PROMINENT LARGE SEARCH BAR
          ========================================================================= */}
      <section className="relative py-8 sm:py-14 overflow-hidden bg-gradient-to-b from-[#FAE6E7] via-[#F7EEED] to-[#F7EEED] border-b border-[#F7D1D8]">
        {/* Soft radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] sm:w-[680px] h-[240px] sm:h-[420px] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 70%)' }}
        />

        {/* Left floral accent */}
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt=""
          className="absolute left-0 bottom-0 w-36 sm:w-64 md:w-80 opacity-30 pointer-events-none select-none -translate-x-[15%] translate-y-[10%] rotate-[-6deg]"
        />

        {/* Right floral accent (flipped) */}
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt=""
          className="absolute right-0 bottom-0 w-36 sm:w-64 md:w-80 opacity-30 pointer-events-none select-none translate-x-[15%] translate-y-[10%] rotate-[6deg] scale-x-[-1]"
        />

        <div className="text-center max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#F7D1D8] text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#4A0D25] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" />
            <span>Artisanal Kannauj Fragrance Vault</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#1A0510] tracking-tight">
            {activeCategoryObj?.name || ''}
          </h1>

          <p className="text-xs sm:text-base text-[#4A0D25] leading-relaxed font-medium max-w-2xl mx-auto">
            {activeCategoryObj?.description ||
              'Pure hydro-distilled Damask Rose attars, aged sandalwood elixirs, and botanical distillates — crafted in Kannauj copper stills since 1620.'}
          </p>

          {/* =========================================================================
              LARGE LUXURY SEARCH BAR
              ========================================================================= */}
          <div className="pt-2 sm:pt-4 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F6A6BB] via-[#F4BBC9] to-[#F6A6BB] rounded-full blur-xs opacity-60 group-hover:opacity-100 transition duration-300" />
              <div className="relative flex items-center bg-white rounded-full border-2 border-[#F7D1D8] shadow-luxury pl-4 sm:pl-5 pr-2 py-1.5 sm:py-2">
                <Search className="w-5 h-5 text-[#F6A6BB] shrink-0 mr-2 sm:mr-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search fragrances, attars, rose oil, oud, sandalwood notes..."
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="p-1.5 text-stone-400 hover:text-[#4A0D25] transition-colors mr-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[11px] font-extrabold text-[#4A0D25] shrink-0">
                  <span>{totalItems} {totalItems === 1 ? 'result' : 'results'}</span>
                </div>
              </div>
            </div>

            {/* Quick Keyword Suggestion Tags */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-3 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4A0D25]/60 mr-1 hidden sm:inline">
                Quick Search:
              </span>
              {SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchChange(term)}
                  className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#4A0D25] text-white shadow-xs'
                    : 'bg-white/90 text-[#4A0D25] border border-[#F7D1D8] hover:bg-[#FAE6E7]'
                    }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTROLS & PRODUCT GRID CONTAINER
          ========================================================================= */}
      <main
        ref={gridTopRef}
        className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6"
      >
        {/* Category Pills, Sort & Per-Page Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-[#F7D1D8] shadow-sm">
          {/* Category Filter Pills (Instant 0ms Filtering) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto pb-1.5 lg:pb-0 scrollbar-none touch-pan-x -mx-0.5 px-0.5">
            <button
              type="button"
              onClick={() => handleCategoryChange('')}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${!selectedCategory
                ? 'bg-[#4A0D25] text-white shadow-md'
                : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
                }`}
            >
              <span>All Scents</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${!selectedCategory
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FAE6E7] text-[#4A0D25]'
                  }`}
              >
                {categoryCounts.all || initialProducts.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = categoryCounts[cat.slug] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${isSelected
                    ? 'bg-[#4A0D25] text-white shadow-md'
                    : 'bg-[#F7EEED] text-[#1A0510] hover:bg-[#F7D1D8] border border-[#F7D1D8]'
                    }`}
                >
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAE6E7] text-[#4A0D25]'
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Sort & Products-Per-Page Dropdown */}
          <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F7D1D8]/60">
            {/* Products Per Page Dropdown */}
            <div className="relative" ref={pageSizeRef}>
              <button
                type="button"
                onClick={() => setPageSizeDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F7EEED] hover:bg-[#FAE6E7] border border-[#F7D1D8] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-[#1A0510] transition-all shadow-xs cursor-pointer whitespace-nowrap"
                title="Select number of products displayed per page"
              >
                <Layers className="w-3.5 h-3.5 text-[#F6A6BB] shrink-0" />
                <span>
                  <strong className="text-[#4A0D25]">{pageSize}</strong> per page
                </span>
              </button>

              {pageSizeDropdownOpen && (
                <div className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-44 bg-white rounded-2xl border border-[#F7D1D8] shadow-luxury p-1.5 z-50 animate-fadeInUp">
                  <div className="text-[10px] font-extrabold text-[#4A0D25]/50 uppercase tracking-widest px-3 py-1.5 border-b border-[#F7D1D8]/60">
                    Products Per Page
                  </div>
                  {PAGE_SIZE_OPTIONS.map((opt) => {
                    const isSelected = pageSize === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handlePageSizeChange(opt)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${isSelected
                          ? 'bg-[#FAE6E7] text-[#4A0D25] font-bold'
                          : 'text-[#1A0510] hover:bg-[#F7EEED]'
                          }`}
                      >
                        <span>{opt} products</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F6A6BB]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F7EEED] hover:bg-[#FAE6E7] border border-[#F7D1D8] rounded-full py-2 sm:py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-[#1A0510] transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#F6A6BB] shrink-0" />
                <span className="hidden sm:inline">{activeSortOption.label}</span>
                <span className="sm:hidden">
                  {sortBy ? activeSortOption.label.split(':')[0] : 'Sort'}
                </span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-2xl border border-[#F7D1D8] shadow-luxury p-1.5 z-50 animate-fadeInUp">
                  <div className="text-[10px] font-extrabold text-[#4A0D25]/50 uppercase tracking-widest px-3 py-1.5 border-b border-[#F7D1D8]/60">
                    Sort Products
                  </div>
                  {SORT_OPTIONS.map((option) => {
                    const isSelected = option.id === sortBy;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSortChange(option.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${isSelected
                          ? 'bg-[#FAE6E7] text-[#4A0D25] font-bold'
                          : 'text-[#1A0510] hover:bg-[#F7EEED]'
                          }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#F6A6BB]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-[#4A0D25]/70 font-semibold">
          <div>
            {totalItems > 0 ? (
              <span>
                Showing <strong className="text-[#1A0510]">{startIndex + 1}–{endIndex}</strong> of{' '}
                <strong className="text-[#1A0510]">{totalItems}</strong> fragrances
                {selectedCategory && (
                  <span> in <strong className="text-[#4A0D25]">{activeCategoryObj?.name || selectedCategory}</strong></span>
                )}
                {debouncedSearch && (
                  <span> matching &ldquo;<strong className="text-[#4A0D25]">{debouncedSearch}</strong>&rdquo;</span>
                )}
              </span>
            ) : (
              <span>No fragrances found</span>
            )}
          </div>

          {(selectedCategory || debouncedSearch || sortBy) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4A0D25] hover:text-[#F6A6BB] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* =========================================================================
            PRODUCT GRID OR EMPTY STATE
            ========================================================================= */}
        {totalItems === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-[#F7D1D8] shadow-sm px-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center shadow-xs">
              <Search className="w-7 h-7 text-[#F6A6BB]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl sm:text-2xl text-[#1A0510] font-bold">
                No Fragrances Matched Your Selection
              </h3>
              <p className="text-xs sm:text-sm text-[#4A0D25] font-medium max-w-md mx-auto">
                We couldn&apos;t find any distillates matching your current search or category filter.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 bg-[#4A0D25] text-white text-xs font-extrabold uppercase tracking-wider py-3 px-6 rounded-full shadow-md hover:bg-[#6B0F34] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F6A6BB]" />
                <span>View All Fragrances</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {currentPaginatedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-fadeInUp h-full"
                  style={{
                    animationDelay: `${Math.min(idx * 30, 240)}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <ProductCard product={product as any} />
                </div>
              ))}
            </div>

            {/* =========================================================================
                BOTTOM PAGINATION BAR
                ========================================================================= */}
            {totalPages > 1 && (
              <div className="pt-6 sm:pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#F7D1D8]">
                {/* Page info & selector */}
                <div className="text-xs text-[#4A0D25] font-semibold flex items-center gap-2">
                  <span>
                    Page <strong className="text-[#1A0510]">{safeCurrentPage}</strong> of{' '}
                    <strong className="text-[#1A0510]">{totalPages}</strong>
                  </span>
                  <span className="text-[#F7D1D8]">•</span>
                  <span>({totalItems} total products)</span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${safeCurrentPage <= 1
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                      : 'bg-white hover:bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8] shadow-xs'
                      }`}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Numbered Page Buttons with Ellipsis */}
                  {paginationRange.map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-1 text-xs font-bold text-stone-400 select-none"
                        >
                          ...
                        </span>
                      );
                    }

                    const pageNum = Number(p);
                    const isActive = pageNum === safeCurrentPage;

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isActive
                          ? 'bg-[#4A0D25] text-white shadow-md scale-105'
                          : 'bg-white hover:bg-[#FAE6E7] text-[#1A0510] border border-[#F7D1D8] shadow-xs'
                          }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${safeCurrentPage >= totalPages
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                      : 'bg-white hover:bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8] shadow-xs'
                      }`}
                    aria-label="Next Page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
