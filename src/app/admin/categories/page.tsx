'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Tag,
  ArrowUpDown,
  Sparkles,
  Layers,
  Upload,
} from 'lucide-react';

interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateAICategoryDescription = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Category Name first.');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category_description',
          prompt: formData.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      if (data.draft) {
        setFormData((prev) => ({ ...prev, description: data.draft }));
        showToast('success', '✨ Generated 100-Word SEO Description!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'AI generation failed');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAIBannerImage = () => {
    const name = formData.name.toLowerCase().trim() || 'attars';

    let bannerUrl = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80';

    if (name.includes('attar') || name.includes('ruh') || name.includes('gulab')) {
      bannerUrl = 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80';
    } else if (name.includes('essential') || name.includes('oil') || name.includes('pure')) {
      bannerUrl = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80';
    } else if (name.includes('elixir') || name.includes('oud') || name.includes('sandal')) {
      bannerUrl = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80';
    } else if (name.includes('rose')) {
      bannerUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80';
    } else if (name.includes('jasmine') || name.includes('mogra')) {
      bannerUrl = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80';
    }

    setFormData((prev) => ({ ...prev, image_url: bannerUrl }));
    showToast('success', `✨ Generated AI Banner for "${formData.name || 'Category'}"!`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const data = new FormData();
      data.append('file', file);
      data.append('folder', 'category-banners');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData((prev) => ({ ...prev, image_url: result.url }));
        showToast('success', 'Banner image uploaded successfully!');
      } else {
        showToast('error', result.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error uploading image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const fetchCategories = async (showSpinner?: boolean | any) => {
    if (typeof window !== 'undefined' && categories.length === 0) {
      try {
        const cached = localStorage.getItem('cached_categories_list');
        if (cached) setCategories(JSON.parse(cached));
      } catch (e) {}
    }

    try {
      const isSpinnerAllowed = typeof showSpinner === 'boolean' ? showSpinner : true;
      if (isSpinnerAllowed && categories.length === 0) setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/categories?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
      setCategories(data.categories || []);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cached_categories_list', JSON.stringify(data.categories || []));
      }
    } catch (err: any) {
      console.error(err);
      if (categories.length === 0) setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
    );
  }, [categories, search]);

  const handleOpenAddModal = () => {
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.display_order || 0)) + 1 : 0;
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: nextOrder,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order || 0,
    });
  };

  const handleNameChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === generateSlugFromText(prev.name) ? slugified : prev.slug,
    }));
  };

  const generateSlugFromText = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }

    const tempId = `temp-cat-${Date.now()}`;
    const optimisticCategory: Category = {
      id: tempId,
      store_id: 'essential_oils_perfumes_store_01',
      name: formData.name.trim(),
      slug: formData.slug || generateSlugFromText(formData.name),
      description: formData.description,
      image_url: formData.image_url,
      display_order: Number(formData.display_order) || 0,
      created_at: new Date().toISOString(),
    };

    // INSTANT UI UPDATE (0ms)
    setIsAddModalOpen(false);
    setCategories((prev) => [optimisticCategory, ...prev]);
    showToast('success', `Category "${formData.name}" created!`);

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== tempId));
        throw new Error(data.error || 'Failed to create category');
      }

      if (data.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === tempId ? data.category : c))
        );
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updatedCat: Category = {
      ...editingCategory,
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image_url: formData.image_url,
      display_order: Number(formData.display_order) || 0,
    };

    // INSTANT UI UPDATE (0ms)
    setEditingCategory(null);
    setCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? updatedCat : c))
    );
    showToast('success', `Category "${formData.name}" updated.`);

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update category');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    const target = deletingCategory;

    // INSTANT UI UPDATE (0ms)
    setDeletingCategory(null);
    setCategories((prev) => prev.filter((c) => c.id !== target.id));
    showToast('success', `Category "${target.name}" deleted.`);

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/categories/${target.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }
    } catch (err: any) {
      setCategories((prev) => [target, ...prev]);
      showToast('error', err.message || 'Failed to delete category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <FolderTree className="w-4 h-4" /> Core Management
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Categories & Fragrance Taxonomy
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Manage scent collections, attars, luxury perfume families, display order, and category banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Categories</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{categories.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">With Banner Images</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">
              {categories.filter((c) => Boolean(c.image_url)).length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Storefront Active</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">Active</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category name, slug, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-stone-500 font-medium hidden sm:block">
          Sorted by <span className="text-amber-700 font-bold">Display Order</span>
        </span>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading categories from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchCategories}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FolderTree className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No categories found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No category records matching search term "${search}".`
                : 'No categories created yet. Click "Create Category" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A0510]">
              <thead className="bg-[#FAE6E7]/80 text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                <tr>
                  <th className="py-4 px-6">Banner / Category</th>
                  <th className="py-4 px-4">URL Slug</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4">Display Order</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8]">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAE6E7]/40 transition-colors group">
                    {/* Image & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt={c.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#F7D1D8] shadow-xs bg-[#FAE6E7]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-[#1A0510] text-xs sm:text-sm">
                            {c.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] font-mono text-xs font-black shadow-xs">
                        /{c.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-[#4A0D25] font-bold max-w-xs truncate">
                      {c.description || <span className="text-stone-400 italic font-normal">No description</span>}
                    </td>

                    {/* Display Order */}
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8] font-black text-xs">
                        Order #{c.display_order}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/products?category=${c.slug}`}
                        target="_blank"
                        className="inline-flex p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                        title="Preview on Storefront"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(c)}
                        className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all shadow-xs"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE CATEGORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <FolderTree className="w-5 h-5 text-[#F6A6BB]" />
                </div>
                <h2 className="text-xl font-serif font-extrabold text-[#1A0510]">Create New Category</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Royal Attars & Mukhallats"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">URL Slug</label>
                <div className="flex items-center">
                  <span className="px-3.5 py-3 bg-[#FAE6E7] border border-r-0 border-[#F7D1D8] rounded-l-xl text-xs text-[#4A0D25] font-mono font-bold">
                    /products?category=
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="royal-attars"
                    className="w-full px-4 py-3 rounded-r-xl bg-white border border-[#F7D1D8] text-xs text-[#4A0D25] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>
              </div>

              {/* Banner Image URL (Generate, Upload, Preview) */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-black text-[#4A0D25]">Banner Image URL</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAIBannerImage}
                      className="px-2.5 py-1 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-[11px] hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-[#4A0D25]" /> ✨ AI Banner
                    </button>
                    <label className="px-2.5 py-1 rounded-full bg-white border border-[#F7D1D8] text-[#4A0D25] font-black text-[11px] hover:bg-[#FAE6E7] transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95">
                      <Upload className={`w-3 h-3 text-[#4A0D25] ${isUploadingImage ? 'animate-spin' : ''}`} />
                      {isUploadingImage ? 'Uploading...' : 'Upload File'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />

                {/* Banner Live Preview */}
                {formData.image_url ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#F7D1D8] bg-white h-28 shadow-sm group">
                    <img
                      src={formData.image_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[#4A0D25]/90 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Live Banner Preview
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md"
                      title="Clear Banner Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-[#F7D1D8] bg-white/60">
                    <p className="text-[11px] text-[#4A0D25] font-semibold">
                      No banner image attached. Click <span className="font-extrabold text-[#4A0D25]">✨ AI Banner</span> or <span className="font-extrabold">Upload File</span> above.
                    </p>
                  </div>
                )}
              </div>

              {/* Category Description with AI 100-Word SEO Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#4A0D25]">Category Description (100-Word SEO)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAICategoryDescription}
                    disabled={isGeneratingAI}
                    className="px-3 py-1 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-[11px] hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ AI 100-Word SEO Description'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted using ancient Kannauj copper Deg-Bhapka distillation..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Display Order Index</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-32 px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-black focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <Edit2 className="w-5 h-5 text-[#F6A6BB]" />
                </div>
                <h2 className="text-xl font-serif font-extrabold text-[#1A0510]">Edit Category</h2>
              </div>
              <button onClick={() => setEditingCategory(null)} className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#4A0D25] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              {/* Banner Image URL (Generate, Upload, Preview) */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-black text-[#4A0D25]">Banner Image URL</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAIBannerImage}
                      className="px-2.5 py-1 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-[11px] hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <Sparkles className="w-3 h-3 text-[#4A0D25]" /> ✨ AI Banner
                    </button>
                    <label className="px-2.5 py-1 rounded-full bg-white border border-[#F7D1D8] text-[#4A0D25] font-black text-[11px] hover:bg-[#FAE6E7] transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95">
                      <Upload className={`w-3 h-3 text-[#4A0D25] ${isUploadingImage ? 'animate-spin' : ''}`} />
                      {isUploadingImage ? 'Uploading...' : 'Upload File'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />

                {/* Banner Live Preview */}
                {formData.image_url ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#F7D1D8] bg-white h-28 shadow-sm group">
                    <img
                      src={formData.image_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[#4A0D25]/90 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Live Banner Preview
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-md"
                      title="Clear Banner Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center rounded-xl border border-dashed border-[#F7D1D8] bg-white/60">
                    <p className="text-[11px] text-[#4A0D25] font-semibold">
                      No banner image attached. Click <span className="font-extrabold text-[#4A0D25]">✨ AI Banner</span> or <span className="font-extrabold">Upload File</span> above.
                    </p>
                  </div>
                )}
              </div>

              {/* Category Description with AI 100-Word SEO Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#4A0D25]">Category Description (100-Word SEO)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAICategoryDescription}
                    disabled={isGeneratingAI}
                    className="px-3 py-1 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-[11px] hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ AI 100-Word SEO Description'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted using ancient Kannauj copper Deg-Bhapka distillation..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Display Order Index</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-32 px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-black focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 text-[#1A0510]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-extrabold text-rose-950">Delete Category</h3>
                <p className="text-xs text-rose-800 font-mono font-bold">{deletingCategory.name} (/{deletingCategory.slug})</p>
              </div>
            </div>

            <p className="text-xs text-[#4A0D25] font-semibold leading-relaxed">
              Are you sure you want to delete this category? Products currently assigned to this category will not be deleted, but will no longer appear in this category grouping.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-rose-200">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
