'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Search,
  Check,
  RefreshCw,
  Tag,
  Globe,
  FileText,
  Image as ImageIcon,
  Flame,
  Crown,
  Trash2,
  Plus,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  ArrowRight,
  Layers
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  price?: number;
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  page_type?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
}

interface AdminSeoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string | null;
  initialPageId?: string | null;
  onSuccess?: () => void;
}

export default function AdminSeoDrawer({
  isOpen,
  onClose,
  initialProductId,
  initialPageId,
  onSuccess,
}: AdminSeoDrawerProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'pages'>('products');
  const [loadingList, setLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data collections
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item states
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    description: '',
    images: [] as string[],
    is_featured: false,
    is_bestseller: false,
  });

  // Page Form State
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    excerpt: '',
    featured_image: '',
  });

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  // 1-Click Master AI Generator for SEO Metadata + 300-word Luxury Story
  const handleGenerateAllInOneAI = async () => {
    if (!selectedProduct) return;
    setIsGeneratingAI(true);
    setErrorMessage(null);
    setAiGeneratedSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'all_in_one_seo_and_description',
          prompt: selectedProduct.name,
          context: {
            slug: selectedProduct.slug,
            currentDescription: productForm.description,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('AI Generation service request failed. Please try again.');
      }

      const data = await res.json();
      let draft = data.draft;

      if (typeof draft === 'string') {
        try {
          draft = JSON.parse(draft);
        } catch (_) {
          try {
            const firstBrace = draft.indexOf('{');
            const lastBrace = draft.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              draft = JSON.parse(draft.substring(firstBrace, lastBrace + 1));
            }
          } catch (e2) {
            console.warn('Fallback JSON slice parsing error:', e2);
          }
        }
      }

      if (typeof draft === 'object' && draft !== null) {
        setProductForm((prev) => ({
          ...prev,
          meta_title: draft.meta_title ? draft.meta_title.trim() : prev.meta_title,
          meta_description: draft.meta_description ? draft.meta_description.trim() : prev.meta_description,
          meta_keywords: draft.meta_keywords ? draft.meta_keywords.trim() : prev.meta_keywords,
          description: draft.description ? draft.description.trim() : prev.description,
        }));
        setAiGeneratedSuccess(true);
        setTimeout(() => setAiGeneratedSuccess(false), 6000);
      } else {
        throw new Error('AI generation returned an unexpected response. Please try again.');
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      setErrorMessage(err.message || 'Failed to generate content with AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Image input helper
  const [newImageUrl, setNewImageUrl] = useState('');

  // 1. Fetch initial products & pages when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingList(true);
      try {
        const [prodRes, pagesRes] = await Promise.all([
          fetch('/api/admin/products?limit=200').catch(() => null),
          fetch('/api/admin/pages').catch(() => null),
        ]);

        if (prodRes && prodRes.ok) {
          const prodJson = await prodRes.json();
          const list = prodJson.products || [];
          setProducts(list);

          if (initialProductId) {
            const found = list.find((p: ProductItem) => p.id === initialProductId);
            if (found) {
              setActiveTab('products');
              handleSelectProduct(found);
            } else if (list.length > 0) {
              handleSelectProduct(list[0]);
            }
          } else if (list.length > 0 && !selectedProduct) {
            handleSelectProduct(list[0]);
          }
        }

        if (pagesRes && pagesRes.ok) {
          const pageJson = await pagesRes.json();
          const pList = pageJson.pages || [];
          setPages(pList);

          if (initialPageId) {
            const foundP = pList.find((p: PageItem) => p.id === initialPageId);
            if (foundP) {
              setActiveTab('pages');
              handleSelectPage(foundP);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching SEO data in drawer:', err);
      } finally {
        setLoadingList(false);
      }
    };

    fetchData();
  }, [isOpen, initialProductId, initialPageId]);

  // Handle selecting a product
  const handleSelectProduct = (p: ProductItem) => {
    setSelectedProduct(p);
    setProductForm({
      name: p.name || '',
      slug: p.slug || '',
      meta_title: p.meta_title || '',
      meta_keywords: p.meta_keywords || '',
      meta_description: p.meta_description || '',
      description: p.description || '',
      images: Array.isArray(p.images) ? p.images : [],
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
    });
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  // Handle selecting a page
  const handleSelectPage = (p: PageItem) => {
    setSelectedPage(p);
    setPageForm({
      title: p.title || '',
      slug: p.slug || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      excerpt: p.excerpt || '',
      featured_image: p.featured_image || '',
    });
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  // Quick image add
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Reorder image (move left/up)
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= productForm.images.length) return;
    const reordered = [...productForm.images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setProductForm((prev) => ({ ...prev, images: reordered }));
  };

  // Direct Database Save
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      if (activeTab === 'products') {
        if (!selectedProduct) throw new Error('No product selected');

        const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meta_title: productForm.meta_title.trim(),
            meta_keywords: productForm.meta_keywords.trim(),
            meta_description: productForm.meta_description.trim(),
            description: productForm.description.trim(),
            images: productForm.images,
            is_featured: productForm.is_featured,
            is_bestseller: productForm.is_bestseller,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update product SEO in database');
        }

        const data = await res.json();
        
        // Update local list
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? { ...p, ...data.product } : p))
        );
        setSelectedProduct((prev) => (prev ? { ...prev, ...data.product } : null));
      } else {
        if (!selectedPage) throw new Error('No page selected');

        const res = await fetch(`/api/admin/pages/${selectedPage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meta_title: pageForm.meta_title.trim(),
            meta_description: pageForm.meta_description.trim(),
            excerpt: pageForm.excerpt.trim(),
            featured_image: pageForm.featured_image.trim(),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to update page SEO in database');
        }

        const data = await res.json();
        setPages((prev) =>
          prev.map((p) => (p.id === selectedPage.id ? { ...p, ...data.page } : p))
        );
        setSelectedPage((prev) => (prev ? { ...prev, ...data.page } : null));
      }

      setSaveSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Save SEO Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#1A0510]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-[#F7EEED] border-l border-[#F7D1D8] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#F7D1D8] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A0D25] text-[#F6A6BB] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1A0510]">
                SEO & Content Studio
              </h2>
              <p className="text-[11px] text-[#4A0D25]/75 font-medium">
                Live search preview, meta tags, description & media manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#4A0D25] hover:bg-[#FAE6E7] border border-transparent hover:border-[#F7D1D8] transition-all cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Item Selector Bar */}
        <div className="p-3 sm:p-4 bg-white/80 border-b border-[#F7D1D8] space-y-3">
          
          {/* Target Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#F7EEED] rounded-xl border border-[#F7D1D8]">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#4A0D25] text-white shadow-xs'
                  : 'text-[#4A0D25]/70 hover:text-[#4A0D25]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pages'
                  ? 'bg-[#4A0D25] text-white shadow-xs'
                  : 'text-[#4A0D25]/70 hover:text-[#4A0D25]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Pages & Routes ({pages.length})
            </button>
          </div>

          {/* Search / Select Dropdown */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A1840]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'products' ? 'product by name or slug' : 'page title'}...`}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-semibold placeholder-[#7A1840]/50 focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
            />
          </div>

          {/* Quick Select Pill Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {activeTab === 'products'
              ? filteredProducts.slice(0, 15).map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#4A0D25] text-white shadow-xs ring-2 ring-[#F6A6BB]/50'
                          : 'bg-white border border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })
              : filteredPages.map((p) => {
                  const isSelected = selectedPage?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPage(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#4A0D25] text-white shadow-xs ring-2 ring-[#F6A6BB]/50'
                          : 'bg-white border border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7]'
                      }`}
                    >
                      {p.title}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Scrollable Form & Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Status Alerts */}
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Success!</strong> Live database updated. Google SEO metadata, description & media are synchronized.
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'products' && selectedProduct && (
            <div className="space-y-6">
              
              {/* GOOGLE SEARCH SERP LIVE SIMULATION PREVIEW */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A1840] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#D45A7A]" /> Live Google Search Result Preview
                  </span>
                  <a
                    href={`/products/${selectedProduct.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#4A0D25] hover:underline flex items-center gap-1"
                  >
                    <span>View Page</span> <ExternalLink className="w-3 h-3 text-[#D45A7A]" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 font-sans">
                  <div className="text-[11px] text-[#202124] flex items-center gap-1 truncate">
                    <span className="text-stone-500">https://rosevalleykannauj.com &gt; products &gt;</span>
                    <span className="font-medium text-stone-700">{selectedProduct.slug}</span>
                  </div>
                  <h3 className="text-sm sm:text-base text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer">
                    {productForm.meta_title.trim() || `${selectedProduct.name} | Rose Valley Kannauj`}
                  </h3>
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {productForm.meta_description.trim() ||
                      (productForm.description
                        ? productForm.description.slice(0, 155)
                        : `Explore ${selectedProduct.name}, pure hydro-distilled Damask Rose attar and rare botanical oil hand-crafted in Kannauj since 1620.`)}
                  </p>
                </div>
              </div>

              {/* 🌟 1-CLICK MASTER AI STUDIO GENERATOR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#4A0D25] via-[#3D071E] to-[#1A0510] text-white shadow-lg border border-[#F6A6BB]/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#F6A6BB]/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="space-y-1 max-w-md">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#F6A6BB] text-[10px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#F6A6BB]" /> Deep AI Studio (1200 Token Capacity)
                    </div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                      1-Click World-Class SEO & Story
                    </h3>
                    <p className="text-xs text-white/75 leading-relaxed font-normal">
                      Synthesizes 400-year Kannauj Deg-Bhapka heritage, botanical aromatics, and high-intent buyer keywords for <strong>{selectedProduct.name}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAllInOneAI}
                    disabled={isGeneratingAI}
                    className="px-5 py-3 rounded-full bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] hover:from-[#F4BBC9] hover:to-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#4A0D25]" />
                        <span>Deep Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#4A0D25]" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                {aiGeneratedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in relative z-10 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Generated world-class Meta Title, Description, Keywords & 300-word Heritage Story! Review and click Save below.
                    </span>
                  </div>
                )}
              </div>

              {/* PRODUCT SEO FIELDS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F7D1D8]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#D45A7A]" />
                    <h3 className="font-serif font-bold text-base text-[#1A0510]">
                      Meta Tags & SEO Strategy
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A0D25] bg-[#FAE6E7] px-2.5 py-0.5 rounded-full">
                    Slug: {selectedProduct.slug}
                  </span>
                </div>

                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A0510]">
                      Meta Title Tag
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        productForm.meta_title.length > 60
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {productForm.meta_title.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={productForm.meta_title}
                    onChange={(e) =>
                      setProductForm({ ...productForm, meta_title: e.target.value })
                    }
                    placeholder={`e.g. ${selectedProduct.name} | 100% Pure Kannauj Attar | Rose Valley`}
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A0510]">
                      Meta Description Tag
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        productForm.meta_description.length > 160
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {productForm.meta_description.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={productForm.meta_description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, meta_description: e.target.value })
                    }
                    placeholder="Concise, compelling description shown in Google search results and WhatsApp share snippets..."
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-medium focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A0510]">
                    SEO Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.meta_keywords}
                    onChange={(e) =>
                      setProductForm({ ...productForm, meta_keywords: e.target.value })
                    }
                    placeholder="kannauj rose oil, pure damask attar, hydro-distilled, alcohol-free"
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                {/* Store Badges Toggle */}
                <div className="pt-2 border-t border-[#F7D1D8]/60 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productForm.is_bestseller}
                      onChange={(e) =>
                        setProductForm({ ...productForm, is_bestseller: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#4A0D25] focus:ring-[#F6A6BB]"
                    />
                    <span className="text-xs font-bold text-[#1A0510] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#D45A7A]" /> Bestseller Badge
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, is_featured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#4A0D25] focus:ring-[#F6A6BB]"
                    />
                    <span className="text-xs font-bold text-[#1A0510] flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-700" /> Hero Carousel Featured
                    </span>
                  </label>
                </div>
              </div>

              {/* PRODUCT STORY & DESCRIPTION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#F7D1D8]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D45A7A]" />
                    <h3 className="font-serif font-bold text-base text-[#1A0510]">
                      Product Description & Story
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#4A0D25]/70 font-semibold">
                    {productForm.description.length} characters
                  </span>
                </div>

                <textarea
                  rows={5}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Enter the luxurious story, distillation process, notes, and heritage description of this fragrance..."
                  className="w-full p-3 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              {/* PRODUCT IMAGES GALLERY & MEDIA MANAGER */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#F7D1D8]/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D45A7A]" />
                    <h3 className="font-serif font-bold text-base text-[#1A0510]">
                      Product Photography & Images ({productForm.images.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-[#4A0D25] uppercase tracking-wider">
                    First image is Primary
                  </span>
                </div>

                {/* Thumbnails grid with reordering & delete */}
                {productForm.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[#F7D1D8] bg-stone-50 group shadow-2xs flex items-center justify-center p-1"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Image ${idx + 1}`}
                          fill
                          className="object-contain p-2"
                        />
                        
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#4A0D25] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm z-10">
                            Primary
                          </span>
                        )}

                        {/* Controls on hover */}
                        <div className="absolute inset-0 bg-[#1A0510]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              title="Move Left (Make Primary)"
                              className="p-1.5 rounded-lg bg-white text-[#1A0510] hover:bg-[#FAE6E7] text-xs font-bold"
                            >
                              &larr;
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Delete Image"
                            className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-[#F7D1D8] text-center text-xs text-[#4A0D25]/70 font-semibold">
                    No images added yet. Add an image URL below.
                  </div>
                )}

                {/* Add image input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. /Hero/CollectionHero/floral-corner.png or https://...)"
                    className="flex-1 p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-medium focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 rounded-xl bg-[#4A0D25] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1A0510] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Image
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'pages' && selectedPage && (
            <div className="space-y-6">
              
              {/* PAGE SEO PREVIEW */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A1840] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#D45A7A]" /> Live Search Result Preview
                  </span>
                  <a
                    href={`/${selectedPage.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#4A0D25] hover:underline flex items-center gap-1"
                  >
                    <span>View Live Page</span> <ExternalLink className="w-3 h-3 text-[#D45A7A]" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 font-sans">
                  <div className="text-[11px] text-[#202124] flex items-center gap-1 truncate">
                    <span className="text-stone-500">https://rosevalleykannauj.com /</span>
                    <span className="font-medium text-stone-700">{selectedPage.slug}</span>
                  </div>
                  <h3 className="text-sm sm:text-base text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer">
                    {pageForm.meta_title.trim() || `${selectedPage.title} | Rose Valley Kannauj`}
                  </h3>
                  <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                    {pageForm.meta_description.trim() ||
                      (pageForm.excerpt
                        ? pageForm.excerpt.slice(0, 155)
                        : `Discover ${selectedPage.title} from Rose Valley Kannauj, distillers of pure Damask rose attar since 1620.`)}
                  </p>
                </div>
              </div>

              {/* PAGE SEO FIELDS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-4">
                <div className="border-b border-[#F7D1D8]/60 pb-3">
                  <h3 className="font-serif font-bold text-base text-[#1A0510]">
                    {selectedPage.title} Meta Settings
                  </h3>
                  <p className="text-[11px] text-[#4A0D25]/75">
                    Controls the page browser title, search engine ranking and OpenGraph metadata.
                  </p>
                </div>

                {/* Page Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A0510]">
                      Page Meta Title
                    </label>
                    <span className="text-[10px] font-bold text-stone-500">
                      {pageForm.meta_title.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={pageForm.meta_title}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, meta_title: e.target.value })
                    }
                    placeholder={`e.g. ${selectedPage.title} | Rose Valley Kannauj`}
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                {/* Page Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A0510]">
                      Page Meta Description
                    </label>
                    <span className="text-[10px] font-bold text-stone-500">
                      {pageForm.meta_description.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={pageForm.meta_description}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, meta_description: e.target.value })
                    }
                    placeholder="Short description for search engines and social cards..."
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-medium focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                {/* Featured / OG Banner Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A0510]">
                    Featured Social Image URL
                  </label>
                  <input
                    type="text"
                    value={pageForm.featured_image}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, featured_image: e.target.value })
                    }
                    placeholder="/images/deg-bhapka-heritage.jpg"
                    className="w-full p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#F7D1D8] flex items-center justify-between gap-3 shadow-md">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#F7D1D8] text-xs font-bold text-[#4A0D25] hover:bg-[#FAE6E7] transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={isSaving || (activeTab === 'products' ? !selectedProduct : !selectedPage)}
            onClick={handleSaveToDatabase}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#F6A6BB]" />
                <span>Updating Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#F6A6BB]" />
                <span>Save Directly to Database</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
