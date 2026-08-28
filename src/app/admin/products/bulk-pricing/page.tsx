'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  DollarSign,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Sliders,
  Layers,
  HelpCircle,
  Package,
  Boxes,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  CornerDownLeft,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { formatImageUrl } from '@/lib/format-image';
import { computeStandardVariants, StandardVariantItem } from '@/lib/pricing-and-slugs';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductPriceRow {
  id: string;
  name: string;
  slug: string;
  originalPrice: number;
  currentPrice: number;
  compare_at_price?: number;
  images: string[];
  categories: Category[];
  isModified: boolean;
  isSaving?: boolean;
}

export default function BulkPriceUpdatePage() {
  const [products, setProducts] = useState<ProductPriceRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyModifiedFilter, setOnlyModifiedFilter] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'price' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Batch Update Progress State
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    processedCount: number;
    totalCount: number;
    percent: number;
  } | null>(null);

  // Quick Adjustment Tool Drawer / Modal
  const [isAdjustToolbarOpen, setIsAdjustToolbarOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'fixed_add' | 'percent_add' | 'set_fixed'>('percent_add');
  const [adjustValue, setAdjustValue] = useState<number>(10);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch products & categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products/bulk-pricing');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load products');

      const mapped: ProductPriceRow[] = (data.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        originalPrice: Number(p.price) || 1000,
        currentPrice: Number(p.price) || 1000,
        compare_at_price: p.compare_at_price,
        images: p.images || [],
        categories: p.categories || [],
        isModified: false,
      }));

      setProducts(mapped);
      setCategories(data.categories || []);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Error loading bulk pricing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle single price change in input
  const handlePriceChange = (id: string, newPriceVal: number | string) => {
    const parsed = typeof newPriceVal === 'string' ? parseFloat(newPriceVal) || 0 : newPriceVal;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const clamped = Math.max(0, parsed);
        return {
          ...item,
          currentPrice: clamped,
          isModified: clamped !== item.originalPrice,
        };
      })
    );
  };

  // Quick adjust single item by delta (e.g. +100, +500)
  const handleSingleDelta = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newP = Math.max(10, item.currentPrice + delta);
        return {
          ...item,
          currentPrice: newP,
          isModified: newP !== item.originalPrice,
        };
      })
    );
  };

  // Reset single item
  const handleResetRow = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          currentPrice: item.originalPrice,
          isModified: false,
        };
      })
    );
  };

  // Save single item
  const handleSaveSingle = async (row: ProductPriceRow) => {
    try {
      setProducts((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isSaving: true } : item))
      );

      const res = await fetch('/api/admin/products/bulk-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: row.id, price: row.currentPrice, sync_variants: true }],
          batch_size: 1,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save product price');

      setProducts((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, originalPrice: item.currentPrice, isModified: false, isSaving: false }
            : item
        )
      );
      showToast('success', `Updated "${row.name}" to ₹${row.currentPrice.toLocaleString()}/kg & synced 8 variants!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Error updating product price');
      setProducts((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isSaving: false } : item))
      );
    }
  };

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categories.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'uncategorized') {
        list = list.filter((p) => p.categories.length === 0);
      } else {
        list = list.filter((p) => p.categories.some((c) => c.id === selectedCategory));
      }
    }

    if (onlyModifiedFilter) {
      list = list.filter((p) => p.isModified);
    }

    list.sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'price') {
        return sortOrder === 'asc' ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice;
      }
      if (sortField === 'status') {
        return sortOrder === 'asc'
          ? (a.isModified ? 1 : 0) - (b.isModified ? 1 : 0)
          : (b.isModified ? 1 : 0) - (a.isModified ? 1 : 0);
      }
      return 0;
    });

    return list;
  }, [products, search, selectedCategory, onlyModifiedFilter, sortField, sortOrder]);

  const modifiedCount = useMemo(() => products.filter((p) => p.isModified).length, [products]);

  // Keyboard navigation between rows: ENTER / DOWN -> Next Row, UP / SHIFT+ENTER -> Prev Row
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      const nextInput = document.getElementById(`price-input-${nextIndex}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
      e.preventDefault();
      const prevIndex = currentIndex - 1;
      const prevInput = document.getElementById(`price-input-${prevIndex}`) as HTMLInputElement | null;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  // Apply Bulk Adjustment across all filtered items
  const handleApplyGlobalAdjustment = () => {
    if (!adjustValue && adjustValue !== 0) return;

    setProducts((prev) => {
      const filteredIdSet = new Set(filteredProducts.map((p) => p.id));
      return prev.map((item) => {
        if (!filteredIdSet.has(item.id)) return item;

        let newPrice = item.currentPrice;
        if (adjustType === 'fixed_add') {
          newPrice = Math.max(10, Math.round(item.currentPrice + adjustValue));
        } else if (adjustType === 'percent_add') {
          newPrice = Math.max(10, Math.round(item.currentPrice * (1 + adjustValue / 100)));
        } else if (adjustType === 'set_fixed') {
          newPrice = Math.max(10, Math.round(adjustValue));
        }

        return {
          ...item,
          currentPrice: newPrice,
          isModified: newPrice !== item.originalPrice,
        };
      });
    });

    setIsAdjustToolbarOpen(false);
    showToast(
      'info',
      `Applied adjustment to ${filteredProducts.length} items. Review and click "1-Click Fast Update" to save.`
    );
  };

  // Revert all modified items
  const handleRevertAll = () => {
    setProducts((prev) =>
      prev.map((item) => ({
        ...item,
        currentPrice: item.originalPrice,
        isModified: false,
      }))
    );
    showToast('info', 'Reverted all unsaved price changes.');
  };

  // 1-Click Fast Update across 10-Product Batches
  const handleFastBatchUpdate = async () => {
    const itemsToUpdate = products.filter((p) => p.isModified);
    if (itemsToUpdate.length === 0) {
      showToast('info', 'No modified prices to update.');
      return;
    }

    const batchSize = 10;
    const totalCount = itemsToUpdate.length;
    const totalBatches = Math.ceil(totalCount / batchSize);

    setIsBatchUpdating(true);
    setBatchProgress({
      currentBatch: 0,
      totalBatches,
      processedCount: 0,
      totalCount,
      percent: 0,
    });

    let totalSaved = 0;
    const errorsList: string[] = [];

    for (let b = 0; b < totalBatches; b++) {
      const batchItems = itemsToUpdate.slice(b * batchSize, (b + 1) * batchSize);
      const updatesPayload = batchItems.map((item) => ({
        id: item.id,
        price: item.currentPrice,
        sync_variants: true,
      }));

      setBatchProgress({
        currentBatch: b + 1,
        totalBatches,
        processedCount: b * batchSize,
        totalCount,
        percent: Math.round(((b * batchSize) / totalCount) * 100),
      });

      try {
        const res = await fetch('/api/admin/products/bulk-pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: updatesPayload,
            batch_size: 10,
          }),
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || `Batch ${b + 1} failed`);

        totalSaved += batchItems.length;

        // Mark this batch as saved in state
        const savedIds = new Set(batchItems.map((bi) => bi.id));
        setProducts((prev) =>
          prev.map((item) =>
            savedIds.has(item.id)
              ? { ...item, originalPrice: item.currentPrice, isModified: false }
              : item
          )
        );
      } catch (err: any) {
        console.error(`Error in batch ${b + 1}:`, err);
        errorsList.push(`Batch ${b + 1}: ${err.message}`);
      }
    }

    setBatchProgress({
      currentBatch: totalBatches,
      totalBatches,
      processedCount: totalCount,
      totalCount,
      percent: 100,
    });

    setTimeout(() => {
      setIsBatchUpdating(false);
      setBatchProgress(null);
      if (errorsList.length === 0) {
        showToast('success', `⚡ Successfully updated ${totalSaved} products and synced all variants in 10-item batches!`);
      } else {
        showToast('error', `Updated ${totalSaved}/${totalCount} products. Errors: ${errorsList.join('; ')}`);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] pb-32">
      {/* Top Header Breadcrumb & Actions */}
      <div className="bg-white border-b border-[#F7D1D8] sticky top-14 sm:top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Title & Back */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="p-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] transition-all"
              title="Back to Products"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#4A0D25] text-white">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-[#4A0D25]">
                  Bulk Price Update Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
                  Formula Engine
                </span>
              </div>
              <p className="text-xs text-[#4A0D25]/70 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold">ENTER</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold">↓</kbd> to jump to the next price instantly from your numpad.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Adjust Button */}
            <button
              onClick={() => setIsAdjustToolbarOpen(!isAdjustToolbarOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] text-xs font-bold transition-all cursor-pointer border border-[#F7D1D8]"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Bulk Adjust (+ / - %)</span>
            </button>

            {/* Revert Changes */}
            {modifiedCount > 0 && (
              <button
                onClick={handleRevertAll}
                disabled={isBatchUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-300 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert ({modifiedCount})</span>
              </button>
            )}

            {/* 1-Click Fast Update Button (Header Version) */}
            <button
              onClick={handleFastBatchUpdate}
              disabled={isBatchUpdating || modifiedCount === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                modifiedCount > 0
                  ? 'bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] text-white hover:opacity-95 ring-2 ring-[#F6A6BB]/50 animate-pulse'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-[#F6A6BB]" />
              <span>1-Click Fast Update {modifiedCount > 0 ? `(${modifiedCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Adjustment Toolbar Dropdown */}
      {isAdjustToolbarOpen && (
        <div className="bg-[#FAE6E7] border-b border-[#F7D1D8] py-4 px-4 sm:px-8 shadow-inner animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4A0D25]" />
              <span className="text-xs font-bold text-[#4A0D25]">Batch Modify Filtered Items ({filteredProducts.length}):</span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-[#F7D1D8]">
              <button
                type="button"
                onClick={() => setAdjustType('percent_add')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  adjustType === 'percent_add' ? 'bg-[#4A0D25] text-white' : 'text-[#4A0D25] hover:bg-[#FAE6E7]'
                }`}
              >
                % Increase/Decrease
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('fixed_add')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  adjustType === 'fixed_add' ? 'bg-[#4A0D25] text-white' : 'text-[#4A0D25] hover:bg-[#FAE6E7]'
                }`}
              >
                ₹ Fixed Add/Subtract
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('set_fixed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  adjustType === 'set_fixed' ? 'bg-[#4A0D25] text-white' : 'text-[#4A0D25] hover:bg-[#FAE6E7]'
                }`}
              >
                Set Exact ₹ Price
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4A0D25]">Value:</span>
              <input
                type="number"
                value={adjustValue}
                onChange={(e) => setAdjustValue(Number(e.target.value))}
                placeholder={adjustType === 'percent_add' ? 'e.g. 10 or -5' : 'e.g. 500'}
                className="w-28 px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-[#F7D1D8] text-[#1A0510] focus:outline-none focus:border-[#4A0D25]"
              />
              <span className="text-xs text-[#4A0D25] font-bold">
                {adjustType === 'percent_add' ? '%' : '₹'}
              </span>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, -5, -10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAdjustType('percent_add');
                    setAdjustValue(preset);
                  }}
                  className="px-2 py-1 rounded bg-white/80 hover:bg-white text-[11px] font-bold text-[#4A0D25] border border-[#F7D1D8]"
                >
                  {preset > 0 ? `+${preset}%` : `${preset}%`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setIsAdjustToolbarOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyGlobalAdjustment}
                className="px-4 py-1.5 bg-[#4A0D25] hover:bg-[#7A1840] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Apply to Filtered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Formula Explainer Card */}
        <div className="mb-6 bg-gradient-to-r from-[#4A0D25] to-[#7A1840] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#F6A6BB]/20 text-[#F6A6BB] text-[11px] font-bold uppercase tracking-wider">
                  Automated Pricing Matrix
                </span>
                <span className="text-xs text-white/70">10-Products Fast Batch Engine</span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Formula Breakdown for 1 Kg Base Price (<span className="text-[#F6A6BB]">b</span>):
              </h2>
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-medium text-white/90">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">Sample (2ml): <strong>₹250</strong></span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">100ml: <strong>round(b/10 + 200)</strong></span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">250ml: <strong>round(b/4 + 200)</strong></span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">500ml: <strong>round(b/2 + 200)</strong></span>
                <span className="bg-white/20 border border-[#F6A6BB]/40 px-2.5 py-1 rounded-lg font-bold text-[#F6A6BB]">1 Kg: b (Base)</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">5 Kg: <strong>round(b*5*0.98)</strong></span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">10 Kg: <strong>round(b*10*0.96)</strong></span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg">20 Kg: <strong>round(b*20*0.93)</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/10 flex-shrink-0">
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-white/70">Catalog Status</div>
                <div className="text-sm font-bold text-white">
                  {products.length} Products | <span className={modifiedCount > 0 ? 'text-[#F6A6BB] font-black' : 'text-white/80'}>{modifiedCount} Modified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-[#F7D1D8] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#4A0D25]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name or slug..."
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-[#1A0510] focus:outline-none focus:border-[#4A0D25]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#4A0D25]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-[#4A0D25] focus:outline-none focus:border-[#4A0D25] cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                <option value="uncategorized">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Only Modified Toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-[#4A0D25] cursor-pointer bg-[#FAE6E7] px-3 py-2 rounded-xl border border-[#F7D1D8]">
              <input
                type="checkbox"
                checked={onlyModifiedFilter}
                onChange={(e) => setOnlyModifiedFilter(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#4A0D25] accent-[#4A0D25]"
              />
              <span>Modified Only ({modifiedCount})</span>
            </label>
          </div>

          {/* Quick Refresh & Keyboard Hint */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAE6E7] text-[11px] font-bold text-[#4A0D25] border border-[#F7D1D8]">
              <CornerDownLeft className="w-3.5 h-3.5 text-[#4A0D25]" />
              <span>Numpad Enter / ↓ = Next Row</span>
            </span>

            <button
              onClick={fetchData}
              disabled={loading || isBatchUpdating}
              className="p-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] transition-all cursor-pointer"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-[#4A0D25]/70 font-semibold">
              Showing {filteredProducts.length} of {products.length}
            </span>
          </div>
        </div>

        {/* 3-COLUMN BULK PRICING GRID TABLE */}
        <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-[#FAE6E7] border-b border-[#F7D1D8] text-xs font-black tracking-wider text-[#4A0D25] uppercase py-3.5 px-4 sm:px-6 select-none">
            <div className="col-span-12 md:col-span-4 flex items-center gap-2">
              <span>1. Product Name & Info</span>
            </div>
            <div className="col-span-12 md:col-span-3 flex items-center justify-between">
              <span>2. Price / Kg (Base)</span>
              <span className="text-[10px] font-bold text-[#4A0D25]/70 normal-case hidden sm:inline">
                Enter ↵ / ↓ Jump
              </span>
            </div>
            <div className="col-span-12 md:col-span-5 flex items-center justify-between">
              <span>3. Auto-Populated Variant Prices</span>
              <span className="text-[10px] font-medium text-[#4A0D25]/70 normal-case hidden lg:inline">
                Sample → 20 Kg (Sell & Compare)
              </span>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-[#4A0D25] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#4A0D25]">Loading products and price matrix...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-600">No products found matching filters.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setOnlyModifiedFilter(false);
                }}
                className="mt-3 px-4 py-1.5 bg-[#FAE6E7] text-[#4A0D25] rounded-xl text-xs font-bold hover:bg-[#F7D1D8]"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F7D1D8]/60">
              {filteredProducts.map((row, index) => {
                const variants = computeStandardVariants(row.currentPrice);
                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-12 py-4 px-4 sm:px-6 items-center gap-4 transition-colors ${
                      row.isModified ? 'bg-amber-50/70' : 'hover:bg-[#F7EEED]/40'
                    }`}
                  >
                    {/* COLUMN 1: PRODUCT INFO */}
                    <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] overflow-hidden flex-shrink-0 relative">
                        {row.images && row.images[0] ? (
                          <img
                            src={formatImageUrl(row.images[0])}
                            alt={row.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#4A0D25]/40 font-serif font-black text-sm">
                            {row.name.charAt(0)}
                          </div>
                        )}
                        {row.isModified && (
                          <span
                            className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"
                            title="Modified - Unsaved"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/products/${row.slug}`}
                            target="_blank"
                            tabIndex={-1}
                            className="font-bold text-xs sm:text-sm text-[#1A0510] hover:text-[#4A0D25] truncate block group"
                            title={row.name}
                          >
                            <span>{row.name}</span>
                            <ExternalLink className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {row.categories.map((c) => (
                            <span
                              key={c.id}
                              className="px-1.5 py-0.5 rounded bg-[#FAE6E7] text-[#4A0D25] text-[10px] font-bold"
                            >
                              {c.name}
                            </span>
                          ))}
                          <span className="text-[10px] text-neutral-400 font-mono">
                            DB: ₹{row.originalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 2: PRICE / KG (EDITABLE NUMERIC INPUT WITH ENTER NAVIGATION) */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A0D25]">
                              ₹
                            </span>
                            <input
                              id={`price-input-${index}`}
                              type="number"
                              min="1"
                              step="50"
                              value={row.currentPrice}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => handleInputKeyDown(e, index)}
                              onChange={(e) => handlePriceChange(row.id, e.target.value)}
                              className={`w-full pl-7 pr-3 py-2 text-sm font-black rounded-xl border focus:outline-none transition-all ${
                                row.isModified
                                  ? 'bg-amber-100/80 border-amber-400 text-amber-950 ring-2 ring-amber-300/40'
                                  : 'bg-white border-[#F7D1D8] text-[#1A0510] focus:border-[#4A0D25] focus:ring-2 focus:ring-[#4A0D25]/20'
                              }`}
                            />
                          </div>

                          {/* Quick Step Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => handleSingleDelta(row.id, 100)}
                              className="px-1.5 py-1 text-[10px] font-black bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] rounded-md transition-all cursor-pointer"
                              title="Add ₹100"
                            >
                              +100
                            </button>
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => handleSingleDelta(row.id, 500)}
                              className="px-1.5 py-1 text-[10px] font-black bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] rounded-md transition-all cursor-pointer"
                              title="Add ₹500"
                            >
                              +500
                            </button>
                            {row.isModified && (
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => handleResetRow(row.id)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-all"
                                title="Reset to database price"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quick Subtext Info */}
                        <div className="flex items-center justify-between text-[10px] text-neutral-500">
                          <span>
                            Compare: ₹{Math.round(row.currentPrice * 1.2).toLocaleString()}
                          </span>
                          {row.isModified && (
                            <span className="text-amber-700 font-bold">Unsaved Changes</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 3: AUTO-POPULATED VARIANTS BREAKDOWN */}
                    <div className="col-span-12 md:col-span-5">
                      <div className="flex flex-col gap-1.5">
                        {/* 8 Variants Badges Matrix */}
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5">
                          {variants.map((v) => {
                            const isKilo = v.name === '1 Kg';
                            return (
                              <div
                                key={v.name}
                                className={`px-2 py-1.5 rounded-lg text-center flex flex-col justify-center border transition-all ${
                                  isKilo
                                    ? 'bg-[#4A0D25] text-white border-[#4A0D25] shadow-xs'
                                    : 'bg-[#F7EEED] border-[#F7D1D8] text-[#1A0510]'
                                }`}
                              >
                                <span
                                  className={`text-[9px] font-bold uppercase truncate ${
                                    isKilo ? 'text-[#F6A6BB]' : 'text-[#4A0D25]/70'
                                  }`}
                                >
                                  {v.name}
                                </span>
                                <span className="text-xs font-black mt-0.5">
                                  ₹{v.price.toLocaleString()}
                                </span>
                                {v.compare_at_price && (
                                  <span
                                    className={`text-[8px] line-through ${
                                      isKilo ? 'text-white/60' : 'text-neutral-400'
                                    }`}
                                  >
                                    ₹{v.compare_at_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Row Quick Action (Save single) */}
                        {row.isModified && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <button
                              tabIndex={-1}
                              onClick={() => handleSaveSingle(row)}
                              disabled={row.isSaving}
                              className="px-2.5 py-1 rounded-md bg-[#4A0D25] hover:bg-[#7A1840] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              {row.isSaving ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3 text-[#F6A6BB]" />
                              )}
                              <span>Save Row</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ALWAYS VISIBLE STICKY FLOATING FAST UPDATE BAR AT SCREEN BOTTOM */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F7D1D8] shadow-2xl py-3 px-4 sm:px-8 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Live status & keyboard tip */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4A0D25] animate-ping" />
              <span className="text-xs font-black text-[#4A0D25]">
                {modifiedCount > 0
                  ? `⚡ ${modifiedCount} Modified Products Ready to Update`
                  : `All ${products.length} Products in Sync`}
              </span>
            </div>

            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[#7A1840] font-semibold bg-[#FAE6E7] px-2.5 py-1 rounded-lg border border-[#F7D1D8]">
              <span>💡 Press <kbd className="font-mono font-bold text-[#4A0D25]">ENTER</kbd> or <kbd className="font-mono font-bold text-[#4A0D25]">↓</kbd> to jump directly down price rows.</span>
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 ml-auto">
            {modifiedCount > 0 && (
              <button
                type="button"
                onClick={handleRevertAll}
                disabled={isBatchUpdating}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert All</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFastBatchUpdate}
              disabled={isBatchUpdating || modifiedCount === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer ${
                modifiedCount > 0
                  ? 'bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] text-white hover:opacity-95 ring-4 ring-[#F6A6BB]/40 animate-pulse'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-[#F6A6BB]" />
              <span>1-Click Fast Update {modifiedCount > 0 ? `(${modifiedCount} Products)` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* BATCH PROGRESS MODAL OVERLAY */}
      {isBatchUpdating && batchProgress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#F7D1D8] animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#FAE6E7] text-[#4A0D25] flex items-center justify-center mx-auto mb-4 animate-pulse ring-8 ring-[#FAE6E7]/50">
                <Zap className="w-8 h-8 text-[#4A0D25]" />
              </div>
              <h3 className="text-lg font-serif font-black text-[#4A0D25]">
                Fast Batch Updating Database
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Executing 10 products per batch for optimal performance & connection stability.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A0D25] mb-2">
                <span>
                  Batch {batchProgress.currentBatch} of {batchProgress.totalBatches}
                </span>
                <span>{batchProgress.percent}%</span>
              </div>
              <div className="w-full h-3.5 bg-[#FAE6E7] rounded-full overflow-hidden p-0.5 border border-[#F7D1D8]">
                <div
                  className="h-full bg-gradient-to-r from-[#4A0D25] to-[#F6A6BB] rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold">
              <span>Processed: {batchProgress.processedCount} / {batchProgress.totalCount} products</span>
              <span className="flex items-center gap-1 text-[#4A0D25]">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing variants...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success'
              ? 'bg-[#4A0D25] text-white border-[#F6A6BB]/40 shadow-[#4A0D25]/20'
              : toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-500/40 shadow-rose-950/20'
              : 'bg-neutral-900 text-white border-neutral-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#F6A6BB]" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Info className="w-4 h-4 text-blue-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
