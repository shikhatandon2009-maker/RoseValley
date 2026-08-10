'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Zap,
  Search as SearchIcon
} from 'lucide-react';

interface PageItem {
  id: string;
  store_id: string;
  slug: string;
  title: string;
  page_type: 'static' | 'blog';
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalPages: number;
  staticPagesCount: number;
  blogArticlesCount: number;
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    staticPagesCount: 0,
    blogArticlesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [deletingPage, setDeletingPage] = useState<PageItem | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    page_type: 'static' as 'static' | 'blog',
    content: '',
    excerpt: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/pages?search=${encodeURIComponent(search)}`;
      if (typeFilter !== 'all') url += `&page_type=${typeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch pages');

      setPages(data.pages || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [typeFilter]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const term = search.toLowerCase().trim();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(term))
    );
  }, [pages, search]);

  const handleGenerateSlug = () => {
    if (!formData.title.trim()) return;
    const slugified = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: slugified }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: 'Kannauj Distillation Heritage',
      slug: 'kannauj-distillation-heritage',
      page_type: 'blog',
      content:
        'Kannauj, often called the Grasse of the East, has been distilling rare attars using copper Deg-Bhapka apparatus for over 400 years...',
      excerpt: 'Explore the 400-year artisanal history of hydro-distilling natural attars in Kannauj.',
      featured_image: '',
      meta_title: 'Kannauj Distillation Heritage | Maison De L\'Essence',
      meta_description: 'Discover the ancient hydro-distillation craftsmanship of Kannauj attars.',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: PageItem) => {
    setEditingPage(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      page_type: p.page_type,
      content: p.content,
      excerpt: p.excerpt || '',
      featured_image: p.featured_image || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
    });
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('error', 'Title and content body are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create page');

      showToast('success', `Page "${formData.title}" created successfully!`);
      setIsAddModalOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create page.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update page');

      showToast('success', `Page "${formData.title}" updated successfully.`);
      setEditingPage(null);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update page.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePage = async () => {
    if (!deletingPage) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/pages/${deletingPage.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete page');

      showToast('success', `Page "${deletingPage.title}" deleted.`);
      setDeletingPage(null);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete page.');
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
            <FileText className="w-4 h-4" /> Content Management System (CMS)
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Static Pages & Blog Articles
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Publish brand story pages, legal policies, olfactory guides, and artisanal Kannauj heritage blog posts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPages}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Pages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Page / Article
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Published Pages</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalPages}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Static Policy & Brand Pages</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.staticPagesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Blog & Olfactory Guides</div>
            <div className="text-2xl font-bold font-serif text-purple-700 mt-1">{stats.blogArticlesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, or content..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-stone-600 font-bold">Content Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
          >
            <option value="all">All Content ({stats.totalPages})</option>
            <option value="static">Static Info Pages ({stats.staticPagesCount})</option>
            <option value="blog">Blog Articles ({stats.blogArticlesCount})</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading CMS pages from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchPages}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FileText className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No pages or blog articles found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No pages matching search term "${search}".`
                : 'Click "Create Page / Article" to publish your first content page.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Page Title & Slug</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">SEO Readiness</th>
                  <th className="py-4 px-4">Last Updated</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredPages.map((p) => {
                  const hasSeo = Boolean(p.meta_title && p.meta_description);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors group">
                      {/* Title & Slug */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {p.featured_image ? (
                            <img
                              src={p.featured_image}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-amber-500/20 bg-neutral-950"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400/50">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-neutral-100 group-hover:text-amber-200 text-sm">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-amber-500 font-mono">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4">
                        {p.page_type === 'blog' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <BookOpen className="w-3 h-3" /> Blog Article
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <Globe className="w-3 h-3" /> Static Page
                          </span>
                        )}
                      </td>

                      {/* SEO Indicator */}
                      <td className="py-4 px-4">
                        {hasSeo ? (
                          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Meta Tags Configured
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400/80 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Needs SEO Optimization
                          </span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 px-4 text-neutral-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/${p.page_type === 'blog' ? 'blog' : 'pages'}/${p.slug}`}
                          target="_blank"
                          className="inline-flex p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                          title="Preview Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                          title="Edit Page"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPage(p)}
                          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PAGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900">Create Page / Blog Article</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. History of Kannauj Rose Attar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Content Type *</label>
                  <select
                    value={formData.page_type}
                    onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                  >
                    <option value="blog">Blog Article</option>
                    <option value="static">Static Info Page</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-800">URL Slug *</label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] text-amber-800 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Zap className="w-3 h-3" /> Auto Slug
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="history-of-kannauj-rose-attar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-amber-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Featured Header Image URL</label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Excerpt Summary</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short summary for card previews..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Full Content Body *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full article markdown/HTML text content..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Page Title | Maison De L'Essence"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Meta description snippet..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PAGE MODAL */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Edit Page Content</h2>
              </div>
              <button onClick={() => setEditingPage(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Content Type *</label>
                  <select
                    value={formData.page_type}
                    onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="blog">Blog Article</option>
                    <option value="static">Static Info Page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Featured Header Image URL</label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Excerpt Summary</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Content Body *</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PAGE MODAL */}
      {deletingPage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Page</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingPage.title}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this page? Visitors accessing <strong>/{deletingPage.slug}</strong> will receive a 404 page.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingPage(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePage}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
