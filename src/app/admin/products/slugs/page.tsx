'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Link2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Save,
  Wand2,
  ExternalLink,
  ShieldAlert,
  Layers,
  Copy,
  Check,
  Zap,
  Info,
  Filter,
  Sparkles,
  RotateCcw,
  Tag,
  CornerDownLeft
} from 'lucide-react';
import { formatImageUrl } from '@/lib/format-image';
import { sanitizeSlug } from '@/lib/pricing-and-slugs';

interface ConflictItem {
  id: string;
  name: string;
  slug: string;
}

interface SlugProductRow {
  id: string;
  name: string;
  slug: string;
  originalSlug: string;
  price: number;
  images: string[];
  is_duplicate: boolean;
  duplicate_count: number;
  duplicate_with: ConflictItem[];
  has_prefix_collision: boolean;
  prefix_root: string;
  prefix_matches_count: number;
  prefix_clashes_with: ConflictItem[];
  suggested_slug: string;
  isModified: boolean;
  isSaving?: boolean;
}

interface SlugStats {
  total: number;
  duplicate_slugs_count: number;
  affected_duplicate_products: number;
  prefix_clashes_count: number;
  unique_slugs_count: number;
}

export default function SlugManagementPage() {
  const [products, setProducts] = useState<SlugProductRow[]>([]);
  const [stats, setStats] = useState<SlugStats>({
    total: 0,
    duplicate_slugs_count: 0,
    affected_duplicate_products: 0,
    prefix_clashes_count: 0,
    unique_slugs_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'duplicates' | 'collisions' | 'modified'>('all');

  // Batch Update State
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    processedCount: number;
    totalCount: number;
    percent: number;
  } | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch Slugs Data & Diagnostics
  const fetchSlugsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products/slugs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load slug data');

      const mapped: SlugProductRow[] = (data.products || []).map((p: any) => ({
        ...p,
        originalSlug: p.slug,
        isModified: false,
      }));

      setProducts(mapped);
      setStats(data.stats || {
        total: mapped.length,
        duplicate_slugs_count: 0,
        affected_duplicate_products: 0,
        prefix_clashes_count: 0,
        unique_slugs_count: mapped.length,
      });
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Error loading slug diagnostics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlugsData();
  }, [fetchSlugsData]);

  // Handle single slug text edit
  const handleSlugChange = (id: string, newRawText: string) => {
    const formatted = newRawText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-');

    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          slug: formatted,
          isModified: formatted !== item.originalSlug,
        };
      })
    );
  };

  // Keyboard navigation between slug rows
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      const nextInput = document.getElementById(`slug-input-${nextIndex}`) as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    } else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) {
      e.preventDefault();
      const prevIndex = currentIndex - 1;
      const prevInput = document.getElementById(`slug-input-${prevIndex}`) as HTMLInputElement | null;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  // Auto-generate slug from name
  const handleGenerateFromName = (id: string, name: string) => {
    const clean = sanitizeSlug(name);
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          slug: clean,
          isModified: clean !== item.originalSlug,
        };
      })
    );
  };

  // Auto-deduplicate single row
  const handleAutoDeduplicateSingle = (row: SlugProductRow) => {
    const newSlug = row.suggested_slug || `${sanitizeSlug(row.name)}-${Date.now().toString().slice(-4)}`;
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== row.id) return item;
        return {
          ...item,
          slug: newSlug,
          isModified: newSlug !== item.originalSlug,
        };
      })
    );
  };

  // Revert single row
  const handleResetRow = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          slug: item.originalSlug,
          isModified: false,
        };
      })
    );
  };

  // Save single row slug
  const handleSaveSingle = async (row: SlugProductRow) => {
    const clean = sanitizeSlug(row.slug);
    if (!clean) {
      showToast('error', 'Slug cannot be empty.');
      return;
    }

    try {
      setProducts((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isSaving: true } : item))
      );

      const res = await fetch('/api/admin/products/slugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: row.id, slug: clean }],
          batch_size: 1,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update slug');

      showToast('success', `Updated slug for "${row.name}" to "${clean}"!`);
      await fetchSlugsData();
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Error updating slug');
      setProducts((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isSaving: false } : item))
      );
    }
  };

  // 1-Click Auto-Fix All Duplicates across all products
  const handleAutoFixAllDuplicates = () => {
    const seen = new Map<string, number>();

    setProducts((prev) =>
      prev.map((item) => {
        const base = sanitizeSlug(item.name || 'product');
        const count = seen.get(base) || 0;
        seen.set(base, count + 1);

        const disambiguatedSlug = count === 0 ? base : `${base}-${count + 1}`;
        const isMod = disambiguatedSlug !== item.originalSlug;

        return {
          ...item,
          slug: disambiguatedSlug,
          isModified: isMod,
        };
      })
    );

    showToast(
      'info',
      'Auto-disambiguated duplicate slugs! Review the table and click "Save Slugs" to apply to database.'
    );
  };

  // Revert all modified
  const handleRevertAll = () => {
    setProducts((prev) =>
      prev.map((item) => ({
        ...item,
        slug: item.originalSlug,
        isModified: false,
      }))
    );
    showToast('info', 'Reverted all unsaved slug changes.');
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.originalSlug.toLowerCase().includes(q)
      );
    }

    if (activeTab === 'duplicates') {
      list = list.filter((p) => p.is_duplicate);
    } else if (activeTab === 'collisions') {
      list = list.filter((p) => p.has_prefix_collision);
    } else if (activeTab === 'modified') {
      list = list.filter((p) => p.isModified);
    }

    return list;
  }, [products, search, activeTab]);

  const modifiedCount = useMemo(() => products.filter((p) => p.isModified).length, [products]);

  // Check current local duplicate status in real time
  const currentSlugCountMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const s = sanitizeSlug(p.slug);
      map.set(s, (map.get(s) || 0) + 1);
    });
    return map;
  }, [products]);

  // Fast Batch Update across 10-Product Batches
  const handleFastBatchUpdate = async () => {
    const itemsToUpdate = products.filter((p) => p.isModified);
    if (itemsToUpdate.length === 0) {
      showToast('info', 'No modified slugs to update.');
      return;
    }

    // Check for local duplicate clashes among modified items
    const duplicatesInUpdates = new Set<string>();
    const usedSlugs = new Set<string>();
    for (const item of itemsToUpdate) {
      const clean = sanitizeSlug(item.slug);
      if (usedSlugs.has(clean)) {
        duplicatesInUpdates.add(clean);
      }
      usedSlugs.add(clean);
    }

    if (duplicatesInUpdates.size > 0) {
      showToast(
        'error',
        `Duplicate slug "${Array.from(duplicatesInUpdates)[0]}" detected in your updates. Please fix before saving.`
      );
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
        slug: sanitizeSlug(item.slug),
      }));

      setBatchProgress({
        currentBatch: b + 1,
        totalBatches,
        processedCount: b * batchSize,
        totalCount,
        percent: Math.round(((b * batchSize) / totalCount) * 100),
      });

      try {
        const res = await fetch('/api/admin/products/slugs', {
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
      } catch (err: any) {
        console.error(`Error in slug batch ${b + 1}:`, err);
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

    setTimeout(async () => {
      setIsBatchUpdating(false);
      setBatchProgress(null);
      if (errorsList.length === 0) {
        showToast('success', `⚡ Successfully updated ${totalSaved} product slugs in 10-item batches!`);
        await fetchSlugsData();
      } else {
        showToast('error', `Updated ${totalSaved}/${totalCount} slugs. Errors: ${errorsList.join('; ')}`);
        await fetchSlugsData();
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
                  <Link2 className="w-3.5 h-3.5" />
                </span>
                <h1 className="text-lg sm:text-xl font-serif font-black tracking-tight text-[#4A0D25]">
                  URL Slug Management & Updation
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
                  SEO URLs
                </span>
              </div>
              <p className="text-xs text-[#4A0D25]/70 hidden sm:block">
                Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold">ENTER</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold">↓</kbd> to jump directly to the next slug row.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Auto Fix All Duplicates */}
            <button
              onClick={handleAutoFixAllDuplicates}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] text-xs font-bold transition-all cursor-pointer border border-[#F7D1D8]"
              title="Disambiguate all duplicate slugs"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#4A0D25]" />
              <span>Auto-Deduplicate All</span>
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

            {/* 1-Click Fast Save (Header Button) */}
            <button
              onClick={handleFastBatchUpdate}
              disabled={isBatchUpdating || modifiedCount === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                modifiedCount > 0
                  ? 'bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] text-white hover:opacity-95 ring-2 ring-[#F6A6BB]/50 animate-pulse'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 text-[#F6A6BB]" />
              <span>Save Slugs {modifiedCount > 0 ? `(${modifiedCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Diagnostic Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
          {/* Card 1: Total */}
          <div className="bg-white p-4 rounded-2xl border border-[#F7D1D8] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#4A0D25]/70 uppercase tracking-wider">
                Total Products
              </span>
              <span className="p-1 rounded-md bg-[#FAE6E7] text-[#4A0D25]">
                <Layers className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-[#1A0510]">
              {stats.total}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Catalog items tracked</p>
          </div>

          {/* Card 2: Duplicate Slugs (Alert) */}
          <div
            onClick={() => setActiveTab('duplicates')}
            className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              stats.affected_duplicate_products > 0
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200/50 hover:bg-rose-100/70'
                : 'bg-white border-[#F7D1D8]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  stats.affected_duplicate_products > 0 ? 'text-rose-900' : 'text-[#4A0D25]/70'
                }`}
              >
                Duplicate Slugs
              </span>
              <span
                className={`p-1 rounded-md ${
                  stats.affected_duplicate_products > 0
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-[#FAE6E7] text-[#4A0D25]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div
              className={`text-2xl font-serif font-black ${
                stats.affected_duplicate_products > 0 ? 'text-rose-700' : 'text-[#1A0510]'
              }`}
            >
              {stats.affected_duplicate_products}
            </div>
            <p className="text-[11px] text-rose-700 font-semibold mt-1">
              {stats.affected_duplicate_products > 0
                ? `⚠️ ${stats.duplicate_slugs_count} collision groups`
                : 'All slugs are distinct'}
            </p>
          </div>

          {/* Card 3: Prefix / Common Start Name Clashes */}
          <div
            onClick={() => setActiveTab('collisions')}
            className="bg-white p-4 rounded-2xl border border-[#F7D1D8] shadow-xs cursor-pointer hover:bg-[#FAE6E7]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#4A0D25]/70 uppercase tracking-wider">
                Common Start Names
              </span>
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <Tag className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-amber-900">
              {stats.prefix_clashes_count}
            </div>
            <p className="text-[11px] text-amber-800 font-semibold mt-1">
              Shared prefix clusters
            </p>
          </div>

          {/* Card 4: Unique & Active */}
          <div className="bg-white p-4 rounded-2xl border border-[#F7D1D8] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#4A0D25]/70 uppercase tracking-wider">
                Unique Slugs
              </span>
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-emerald-900">
              {stats.unique_slugs_count}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              {Math.round((stats.unique_slugs_count / (stats.total || 1)) * 100)}% unique URLs
            </p>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-[#F7D1D8] shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F7EEED] p-1 rounded-xl border border-[#F7D1D8] overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all' ? 'bg-[#4A0D25] text-white shadow-xs' : 'text-[#4A0D25] hover:bg-[#FAE6E7]'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'duplicates'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-800 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Duplicate Slugs ({stats.affected_duplicate_products})</span>
            </button>
            <button
              onClick={() => setActiveTab('collisions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'collisions'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Common Start Names ({stats.prefix_clashes_count})</span>
            </button>
            <button
              onClick={() => setActiveTab('modified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'modified'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-blue-800 hover:bg-blue-50'
              }`}
            >
              <span>Modified ({modifiedCount})</span>
            </button>
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#4A0D25]/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by product name or slug..."
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

            <button
              onClick={fetchSlugsData}
              disabled={loading || isBatchUpdating}
              className="p-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] transition-all cursor-pointer"
              title="Refresh Diagnositcs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* SLUGS TABLE */}
        <div className="bg-white rounded-2xl border border-[#F7D1D8] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 bg-[#FAE6E7] border-b border-[#F7D1D8] text-xs font-black tracking-wider text-[#4A0D25] uppercase py-3.5 px-4 sm:px-6 select-none">
            <div className="col-span-12 md:col-span-4">
              <span>Product Info</span>
            </div>
            <div className="col-span-12 md:col-span-5">
              <span>URL Slug & Diagnostics (Enter ↵ / ↓ Jump)</span>
            </div>
            <div className="col-span-12 md:col-span-3 text-right">
              <span>Actions</span>
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-[#4A0D25] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-[#4A0D25]">Analyzing slugs and conflicts...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-700">No products match the selected filter.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveTab('all');
                }}
                className="mt-3 px-4 py-1.5 bg-[#FAE6E7] text-[#4A0D25] rounded-xl text-xs font-bold hover:bg-[#F7D1D8]"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F7D1D8]/60">
              {filteredProducts.map((row, index) => {
                const currentOccurrences = currentSlugCountMap.get(sanitizeSlug(row.slug)) || 0;
                const isCurrentlyDuplicate = currentOccurrences > 1;

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-12 py-4 px-4 sm:px-6 items-center gap-4 transition-colors ${
                      isCurrentlyDuplicate
                        ? 'bg-rose-50/70 hover:bg-rose-100/50'
                        : row.isModified
                        ? 'bg-amber-50/70 hover:bg-amber-100/50'
                        : 'hover:bg-[#F7EEED]/40'
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
                        {isCurrentlyDuplicate && (
                          <span
                            className="absolute top-1 right-1 w-3 h-3 bg-rose-600 rounded-full ring-2 ring-white"
                            title="Duplicate Slug Collision!"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs sm:text-sm text-[#1A0510] block truncate">
                          {row.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-[#4A0D25]">
                            ₹{Number(row.price || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            ID: {row.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 2: URL SLUG & CONFLICT DIAGNOSTICS */}
                    <div className="col-span-12 md:col-span-5">
                      <div className="flex flex-col gap-2">
                        {/* Editable Slug Input */}
                        <div className="relative">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-[#4A0D25]/70 font-mono hidden sm:inline">
                              /products/
                            </span>
                            <div className="relative flex-1">
                              <input
                                id={`slug-input-${index}`}
                                type="text"
                                value={row.slug}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => handleInputKeyDown(e, index)}
                                onChange={(e) => handleSlugChange(row.id, e.target.value)}
                                className={`w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border focus:outline-none transition-all ${
                                  isCurrentlyDuplicate
                                    ? 'bg-rose-100/90 border-rose-400 text-rose-950 ring-2 ring-rose-300/50'
                                    : row.isModified
                                    ? 'bg-amber-100/80 border-amber-400 text-amber-950 ring-2 ring-amber-300/40'
                                    : 'bg-white border-[#F7D1D8] text-[#1A0510] focus:border-[#4A0D25]'
                                }`}
                              />
                            </div>

                            {/* External Live Preview Link */}
                            <Link
                              href={`/products/${row.originalSlug}`}
                              target="_blank"
                              tabIndex={-1}
                              className="p-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] transition-all flex-shrink-0"
                              title="Preview product page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Diagnostics Badges & Alerts */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isCurrentlyDuplicate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-700" />
                              <span>DUPLICATE SLUG ({currentOccurrences} products)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Unique Slug</span>
                            </span>
                          )}

                          {row.has_prefix_collision && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-semibold">
                              <span>Prefix &ldquo;{row.prefix_root}&rdquo; shared</span>
                            </span>
                          )}

                          {row.isModified && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">
                              Modified (Unsaved)
                            </span>
                          )}
                        </div>

                        {/* Duplicate Collision List if applicable */}
                        {row.is_duplicate && row.duplicate_with.length > 0 && (
                          <div className="text-[10px] text-rose-800 bg-rose-100/60 p-2 rounded-lg border border-rose-200">
                            <strong>Collides with:</strong>{' '}
                            {row.duplicate_with.map((d) => d.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 3: ACTIONS */}
                    <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Auto Disambiguate */}
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => handleAutoDeduplicateSingle(row)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] text-[#4A0D25] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Auto-generate clean unique slug"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Auto-Fix</span>
                      </button>

                      {/* Generate from Name */}
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => handleGenerateFromName(row.id, row.name)}
                        className="px-2 py-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-[#F7D1D8] text-neutral-700 text-[11px] font-bold transition-all cursor-pointer"
                        title="Reset to formatted name slug"
                      >
                        <Sparkles className="w-3 h-3 text-[#4A0D25]" />
                      </button>

                      {/* Reset Row */}
                      {row.isModified && (
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => handleResetRow(row.id)}
                          className="p-1.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-600 transition-all cursor-pointer"
                          title="Reset to database slug"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Save Single Row */}
                      {row.isModified && (
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => handleSaveSingle(row)}
                          disabled={row.isSaving}
                          className="px-3 py-1.5 rounded-xl bg-[#4A0D25] hover:bg-[#7A1840] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                        >
                          {row.isSaving ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3 text-[#F6A6BB]" />
                          )}
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ALWAYS VISIBLE STICKY FLOATING SAVE SLUGS BAR AT SCREEN BOTTOM */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F7D1D8] shadow-2xl py-3 px-4 sm:px-8 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Status & Navigation hint */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4A0D25] animate-ping" />
              <span className="text-xs font-black text-[#4A0D25]">
                {modifiedCount > 0
                  ? `⚡ ${modifiedCount} Modified Slugs Ready to Save`
                  : `All ${products.length} Slugs in Sync`}
              </span>
            </div>

            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-[#7A1840] font-semibold bg-[#FAE6E7] px-2.5 py-1 rounded-lg border border-[#F7D1D8]">
              <span>💡 Press <kbd className="font-mono font-bold text-[#4A0D25]">ENTER</kbd> or <kbd className="font-mono font-bold text-[#4A0D25]">↓</kbd> to jump directly down slug rows.</span>
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
              <Save className="w-4 h-4 text-[#F6A6BB]" />
              <span>Save Slugs {modifiedCount > 0 ? `(${modifiedCount} Modified)` : ''}</span>
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
                <Link2 className="w-8 h-8 text-[#4A0D25]" />
              </div>
              <h3 className="text-lg font-serif font-black text-[#4A0D25]">
                Updating Slugs in Database
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Executing 10 products per batch with collision validation.
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
                <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
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
