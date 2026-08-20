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
  Newspaper,
  Tag,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageItem {
  id: string;
  store_id: string;
  slug: string;
  title: string;
  page_type: 'static' | 'blog' | 'press';
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
  pressCount?: number;
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    staticPagesCount: 0,
    blogArticlesCount: 0,
    pressCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'press' | 'static'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [deletingPage, setDeletingPage] = useState<PageItem | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    page_type: 'blog' as 'static' | 'blog' | 'press',
    content: '',
    excerpt: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
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

      const allPages: PageItem[] = data.pages || [];
      setPages(allPages);

      const total = allPages.length;
      const blogs = allPages.filter((p) => p.page_type === 'blog').length;
      const press = allPages.filter((p) => p.page_type === 'press').length;
      const statics = allPages.filter((p) => p.page_type === 'static').length;

      setStats({
        totalPages: total,
        blogArticlesCount: blogs,
        pressCount: press,
        staticPagesCount: statics,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading content');
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

  const handleOpenAddModal = (type: 'blog' | 'press' | 'static' = 'blog') => {
    setFormData({
      title: type === 'blog' ? 'Kannauj Distillation Heritage' : type === 'press' ? 'Vogue India Feature' : 'Brand Heritage Story',
      slug: type === 'blog' ? 'kannauj-distillation-heritage' : type === 'press' ? 'press-vogue-feature' : 'brand-heritage-story',
      page_type: type,
      content: 'Enter full rich article or press release content here...',
      excerpt: 'Short executive summary of this published story.',
      featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
      meta_title: '',
      meta_description: '',
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

  const handleSeedContent = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch('/api/admin/pages/seed?reset=true', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to seed content');

      showToast('success', data.message || 'Seeded 9 high-quality articles into database!');
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Seeding failed.');
    } finally {
      setIsSeeding(false);
    }
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
      if (!res.ok) throw new Error(data.error || 'Failed to create item');

      showToast('success', `Created "${formData.title}" successfully!`);
      setIsAddModalOpen(false);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create item.');
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
      if (!res.ok) throw new Error(data.error || 'Failed to update item');

      showToast('success', `Updated "${formData.title}" successfully.`);
      setEditingPage(null);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update item.');
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
      if (!res.ok) throw new Error(data.error || 'Failed to delete item');

      showToast('success', `Deleted "${deletingPage.title}".`);
      setDeletingPage(null);
      fetchPages();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-[#1A0510]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-[#1A0510] border-[#F6A6BB] text-[#F7EEED]'
              : 'bg-rose-950 border-rose-500 text-rose-100'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#F6A6BB]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-extrabold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="rounded-3xl bg-white border border-[#F7D1D8] p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#F6A6BB]" /> Content Management System (CMS)
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A0510] tracking-tight">
              Static Pages & Blog Articles
            </h1>
            <p className="text-[#4A0D25] text-xs sm:text-sm mt-2 max-w-xl font-bold leading-relaxed">
              Publish brand story pages, legal policies, olfactory guides, and artisanal Kannauj heritage blog posts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedContent}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] font-black text-xs transition-all flex items-center gap-2 shadow-xs"
              title="Populate high quality authentic articles"
            >
              <Zap className={`w-4 h-4 text-[#F6A6BB] ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed High-Quality Content'}</span>
            </button>

            <button
              onClick={() => handleOpenAddModal('blog')}
              className="px-5 py-2.5 rounded-2xl bg-[#F6A6BB] text-[#4A0D25] hover:bg-[#F4BBC9] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#4A0D25]" /> Create Page / Article
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold uppercase tracking-wider">Total Published Pages</div>
            <div className="text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.totalPages}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <FileText className="w-5 h-5 text-[#F6A6BB]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold uppercase tracking-wider">Blog Articles</div>
            <div className="text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.blogArticlesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <BookOpen className="w-5 h-5 text-[#F6A6BB]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold uppercase tracking-wider">Press Mentions</div>
            <div className="text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.pressCount || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <Newspaper className="w-5 h-5 text-[#F6A6BB]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold uppercase tracking-wider">Static Pages</div>
            <div className="text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.staticPagesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <Globe className="w-5 h-5 text-[#F6A6BB]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { key: 'all', label: `All Content (${stats.totalPages})`, icon: FileText },
            { key: 'blog', label: `Blog / Journal (${stats.blogArticlesCount})`, icon: BookOpen },
            { key: 'press', label: `Press Releases (${stats.pressCount || 0})`, icon: Newspaper },
            { key: 'static', label: `Static Pages (${stats.staticPagesCount})`, icon: Globe },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                typeFilter === tab.key
                  ? 'bg-[#4A0D25] text-[#F7EEED] shadow-sm'
                  : 'bg-[#FAE6E7]/80 text-[#4A0D25] hover:bg-[#FAE6E7] border border-[#F7D1D8]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 text-[#F6A6BB]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A0D25]" />
          <input
            type="text"
            placeholder="Search title, slug, content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold placeholder-[#4A0D25]/60 focus:outline-none focus:border-[#F6A6BB]"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="rounded-3xl bg-white border border-[#F7D1D8] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
            <p className="text-xs font-black text-[#4A0D25]">Loading editorial articles...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-[#F6A6BB] mx-auto" />
            <h3 className="font-serif font-extrabold text-lg text-[#1A0510]">No Articles Found</h3>
            <p className="text-xs text-[#4A0D25] font-bold max-w-md mx-auto">
              No matching content found for filter "{typeFilter}". Click the seed button to generate authentic Rose Valley articles.
            </p>
            <button
              onClick={handleSeedContent}
              className="px-5 py-2.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-xs hover:bg-[#F4BBC9] transition-all"
            >
              Seed High-Quality Content
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAE6E7] border-b border-[#F7D1D8] text-[11px] font-black uppercase tracking-wider text-[#4A0D25]">
                  <th className="p-4">Cover</th>
                  <th className="p-4">Page Title & Slug</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">SEO Readiness</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8] bg-white">
                {filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7EEED]/60 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] overflow-hidden relative flex-shrink-0">
                        {p.featured_image ? (
                          <img src={p.featured_image} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#F6A6BB]">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="max-w-md space-y-1">
                        <h4 className="font-serif font-extrabold text-sm text-[#1A0510] line-clamp-1">
                          {p.title}
                        </h4>
                        <span className="text-xs font-mono font-bold text-[#4A0D25] block">
                          /{p.slug}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.page_type === 'blog'
                            ? 'bg-[#F6A6BB] text-[#4A0D25] border border-[#F7D1D8]'
                            : p.page_type === 'press'
                            ? 'bg-[#4A0D25] text-[#F7EEED]'
                            : 'bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]'
                        }`}
                      >
                        {p.page_type === 'blog' ? 'Blog Article' : p.page_type === 'press' ? 'Press Release' : 'Static Page'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[10px] font-black text-[#4A0D25] uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F6A6BB]" /> Meta Tags Configured
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-xs font-extrabold text-[#4A0D25]">
                        {new Date(p.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={p.page_type === 'press' ? '/press' : `/journal/${p.slug}`}
                          target="_blank"
                          className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('open_seo_drawer', {
                                detail: { pageId: p.id },
                              })
                            );
                          }}
                          className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#7A1840] hover:bg-[#F6A6BB] transition-colors"
                          title="Quick SEO & OG Studio"
                        >
                          <Sparkles className="w-4 h-4 text-[#D45A7A]" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2.5 rounded-xl bg-[#4A0D25] text-[#F6A6BB] hover:bg-[#1A0510] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingPage(p)}
                          className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 hover:bg-rose-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingPage) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div>
                <h3 className="font-serif font-extrabold text-xl text-[#1A0510]">
                  {editingPage ? 'Edit Content Item' : 'Create Article / Press Item'}
                </h3>
                <p className="text-xs text-[#4A0D25] font-bold">Publish to Journal, Press, or Brand pages</p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPage(null);
                }}
                className="p-2 rounded-xl hover:bg-[#FAE6E7] text-[#4A0D25]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingPage ? handleUpdatePage : handleCreatePage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Type</label>
                  <select
                    value={formData.page_type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, page_type: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510]"
                  >
                    <option value="blog">Blog / Journal Article</option>
                    <option value="press">Press Release / Media Feature</option>
                    <option value="static">Static Page</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Slug</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. art-of-fragrance-layering"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510]"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="px-3 py-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[10px] font-black uppercase text-[#4A0D25]"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Article or Press Release Title..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Featured Image URL</label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured_image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Short Excerpt / Summary</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief 2-sentence summary for card previews..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-bold text-[#1A0510]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#4A0D25] uppercase tracking-wider">Full Content (Markdown / Text)</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter full article or press feature body text..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-semibold text-[#1A0510]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPage(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#F7D1D8] text-xs font-black text-[#1A0510]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] hover:bg-[#F4BBC9] text-xs font-black uppercase tracking-wider shadow-md"
                >
                  {isSubmitting ? 'Saving...' : editingPage ? 'Update Content' : 'Publish Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] p-6 max-w-md w-full space-y-4">
            <h3 className="font-serif font-extrabold text-lg text-[#1A0510]">Confirm Delete</h3>
            <p className="text-xs text-[#4A0D25] font-bold">
              Are you sure you want to delete "{deletingPage.title}"? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingPage(null)}
                className="px-4 py-2 rounded-full border border-stone-300 text-xs font-bold text-[#1A0510]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePage}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-rose-600 text-white font-black text-xs"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
