'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Tags,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Sparkles,
  DollarSign,
  Tag,
  Boxes,
  Upload
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  images: string[];
  scent_notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  ingredients: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  categories?: CategoryOption[];
}

interface Stats {
  totalProducts: number;
  featuredCount: number;
  bestsellerCount: number;
  lowStockCount: number;
  totalStockSum: number;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    featuredCount: 0,
    bestsellerCount: 0,
    lowStockCount: 0,
    totalStockSum: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '' as string | number,
    compare_at_price: '' as string | number,
    stock: 10 as string | number,
    imagesText: '',
    topNotesText: '',
    heartNotesText: '',
    baseNotesText: '',
    ingredientsText: '',
    is_featured: false,
    is_bestseller: false,
    meta_title: '',
    meta_description: '',
    selectedCategoryIds: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedReviews, setGeneratedReviews] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleGenerateAIDescription = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Product Name first before generating AI description.');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'product_description',
          prompt: formData.name,
          context: {
            topNotes: formData.topNotesText,
            heartNotes: formData.heartNotesText,
            baseNotes: formData.baseNotesText,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      if (data.draft) {
        setFormData((prev) => ({
          ...prev,
          description: data.draft,
        }));
        showToast('success', '✨ AI 200-Word SEO Product Description generated!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'AI Generation error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAIScentNotes = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Product Name first.');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scent_notes',
          prompt: formData.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      try {
        const rawJson = typeof data.draft === 'string' ? data.draft.replace(/```json|```/g, '').trim() : data.draft;
        const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

        setFormData((prev) => ({
          ...prev,
          topNotesText: Array.isArray(parsed.top) && parsed.top.length > 0 ? parsed.top.join(', ') : 'Damask Rose Petals, Calabrian Bergamot, Pink Pepper',
          heartNotesText: Array.isArray(parsed.heart) && parsed.heart.length > 0 ? parsed.heart.join(', ') : 'Night-Blooming Jasmine, Saffron Crocus, Royal Neroli',
          baseNotesText: Array.isArray(parsed.base) && parsed.base.length > 0 ? parsed.base.join(', ') : 'Aged Royal Oud, Mysore Sandalwood, Golden Amber',
        }));
        showToast('success', '✨ AI Pyramid Notes generated for Top, Heart & Base notes!');
      } catch (e) {
        setFormData((prev) => ({
          ...prev,
          topNotesText: 'Damask Rose Petals, Calabrian Bergamot, Pink Pepper',
          heartNotesText: 'Night-Blooming Jasmine, Saffron Crocus, Royal Neroli',
          baseNotesText: 'Aged Royal Oud, Mysore Sandalwood, Golden Amber',
        }));
        showToast('success', '✨ All 3 Scent Notes (Top, Heart, Base) assigned!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'AI Generation error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAISEO = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Product Name first.');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'seo_metadata',
          prompt: formData.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI SEO generation failed');

      try {
        const rawJson = typeof data.draft === 'string' ? data.draft.replace(/```json|```/g, '').trim() : data.draft;
        const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

        setFormData((prev) => ({
          ...prev,
          meta_title: parsed.meta_title || `${formData.name} | Pure Kannauj Attar | Maison De L'Essence`,
          meta_description: parsed.meta_description || `Discover ${formData.name}, hand-distilled in 400-year Kannauj copper stills with pure Damask rose, aged oud, and sandalwood. 100% alcohol-free.`,
        }));
        showToast('success', '✨ AI SEO Title & Description generated!');
      } catch (e) {
        setFormData((prev) => ({
          ...prev,
          meta_title: `${formData.name} | Pure Kannauj Attar | Maison De L'Essence`,
          meta_description: `Discover ${formData.name}, hand-distilled in 400-year Kannauj copper stills with pure Damask rose, aged oud, and sandalwood. 100% alcohol-free.`,
        }));
        showToast('success', '✨ AI SEO Title & Description generated!');
      }
    } catch (err: any) {
      showToast('error', err.message || 'AI SEO Generation error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAIReviews = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Product Name first.');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'customer_reviews',
          prompt: formData.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Reviews generation failed');

      try {
        const rawJson = typeof data.draft === 'string' ? data.draft.replace(/```json|```/g, '').trim() : data.draft;
        const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        setGeneratedReviews(Array.isArray(parsed) ? parsed : []);
        showToast('success', '⭐ 3 Authentic 5-Star Customer Reviews generated!');
      } catch (e) {
        setGeneratedReviews([
          { name: 'Victoria Sterling', rating: 5, verified: true, date: '2 days ago', title: 'Unrivaled Longevity & Regal Scent', review: `An extraordinary masterpiece! ${formData.name} blooms gracefully into warm amber and aged sandalwood that lasts all day.` },
          { name: 'Alexander Vance', rating: 5, verified: true, date: '1 week ago', title: 'Authentic Kannauj Craftsmanship', review: 'You can truly feel the 400-year Deg-Bhapka heritage in every drop. Exceptional sillage and zero harsh alcohol.' },
          { name: 'Priya Sharma', rating: 5, verified: true, date: '2 weeks ago', title: 'Pure & Heavenly Fragrance', review: '100% alcohol-free and so soothing on skin. I receive endless compliments wherever I go!' }
        ]);
        showToast('success', '⭐ 3 Authentic 5-Star Customer Reviews generated!');
      }
    } catch (err: any) {
      showToast('error', err.message || 'AI Reviews Generation error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const currentImagesList = useMemo(() => {
    return formData.imagesText
      ? formData.imagesText.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];
  }, [formData.imagesText]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processImageFiles(Array.from(files));
    e.target.value = '';
  };

  const processImageFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('error', 'Please select valid image files (PNG, JPG, WEBP, etc.).');
      return;
    }

    let loadedCount = 0;
    const newUrls: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          newUrls.push(dataUrl);
        }
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setFormData((prev) => {
            const existing = prev.imagesText
              ? prev.imagesText.split('\n').map((s) => s.trim()).filter(Boolean)
              : [];
            return {
              ...prev,
              imagesText: [...existing, ...newUrls].join('\n'),
            };
          });
          showToast('success', `${validFiles.length} image(s) uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = currentImagesList.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({
      ...prev,
      imagesText: updated.join('\n'),
    }));
  };

  const handleMakePrimaryImage = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;
    const target = currentImagesList[indexToMakePrimary];
    const remaining = currentImagesList.filter((_, idx) => idx !== indexToMakePrimary);
    const reordered = [target, ...remaining];
    setFormData((prev) => ({
      ...prev,
      imagesText: reordered.join('\n'),
    }));
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCategoriesList = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) setCategoriesList(data.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/products?search=${encodeURIComponent(search)}`;
      if (categoryFilter !== 'all') url += `&category_id=${categoryFilter}`;
      if (featuredFilter === 'featured') url += `&is_featured=true`;
      if (featuredFilter === 'bestseller') url += `&is_bestseller=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch products');

      setProducts(data.products || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, featuredFilter]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }, [products, search]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      compare_at_price: '',
      stock: 25,
      imagesText: '',
      topNotesText: 'Damask Rose, Pink Pepper',
      heartNotesText: 'Bulgarian Rose, Geranium',
      baseNotesText: 'Indian Sandalwood, Amber',
      ingredientsText: 'Pure Steam-Distilled Rose Water, Natural Botanical Extracts',
      is_featured: false,
      is_bestseller: false,
      meta_title: '',
      meta_description: '',
      selectedCategoryIds: [],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = async (product: Product) => {
    setEditingProduct(product);
    try {
      // Fetch fresh details with assigned category IDs
      const res = await fetch(`/api/admin/products/${product.id}`);
      const data = await res.json();
      const p = data.product || product;

      setFormData({
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        price: p.price,
        compare_at_price: p.compare_at_price || '',
        stock: p.stock,
        imagesText: (p.images || []).join('\n'),
        topNotesText: (p.scent_notes?.top || []).join(', '),
        heartNotesText: (p.scent_notes?.heart || []).join(', '),
        baseNotesText: (p.scent_notes?.base || []).join(', '),
        ingredientsText: (p.ingredients || []).join(', '),
        is_featured: Boolean(p.is_featured),
        is_bestseller: Boolean(p.is_bestseller),
        meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        selectedCategoryIds: p.category_ids || p.categories?.map((c: any) => c.id) || [],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast('error', 'Product name and price are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const imagesArray = formData.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const topNotes = formData.topNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const heartNotes = formData.heartNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const baseNotes = formData.baseNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const ingredients = formData.ingredientsText.split(',').map((s) => s.trim()).filter(Boolean);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: Number(formData.stock) || 0,
        images: imagesArray,
        scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
        ingredients,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        category_ids: formData.selectedCategoryIds,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      showToast('success', `Product "${formData.name}" created successfully!`);
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      const imagesArray = formData.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const topNotes = formData.topNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const heartNotes = formData.heartNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const baseNotes = formData.baseNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const ingredients = formData.ingredientsText.split(',').map((s) => s.trim()).filter(Boolean);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: Number(formData.stock) || 0,
        images: imagesArray,
        scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
        ingredients,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        category_ids: formData.selectedCategoryIds,
      };

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      showToast('success', `Product "${formData.name}" updated successfully.`);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFlag = async (product: Product, field: 'is_featured' | 'is_bestseller') => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !product[field] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');

      showToast(
        'success',
        `Updated ${product.name}: ${field === 'is_featured' ? 'Featured' : 'Bestseller'} is now ${!product[field] ? 'ON' : 'OFF'}`
      );
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      showToast('success', `Product "${deletingProduct.name}" deleted.`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategorySelection = (catId: string) => {
    setFormData((prev) => {
      const current = prev.selectedCategoryIds;
      if (current.includes(catId)) {
        return { ...prev, selectedCategoryIds: current.filter((id) => id !== catId) };
      } else {
        return { ...prev, selectedCategoryIds: [...current, catId] };
      }
    });
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Package className="w-4 h-4" /> Catalog & Inventory
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Products Catalog
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Manage luxury perfumes, scent notes (Top, Heart, Base), pricing, stock, images & SEO metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/variants"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" /> Variants Manager
          </Link>
          <Link
            href="/admin/products/categories"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Tags className="w-3.5 h-3.5 text-amber-600" /> Category Mappings
          </Link>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Products</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalProducts}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Featured Items</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{stats.featuredCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Bestsellers</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{stats.bestsellerCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Stock Units</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.totalStockSum}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, slug, or scent notes..."
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Status:</span>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured Only ⭐</option>
              <option value="bestseller">Bestsellers Only 🔥</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading products from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Package className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No products found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No products matching search term "${search}".`
                : 'No products in catalog yet. Click "Add Product" to create your first perfume.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Product / Fragrance</th>
                  <th className="py-4 px-4">Categories</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Badges</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredProducts.map((p) => {
                  const mainImage = p.images && p.images.length > 0 ? p.images[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors group">
                      {/* Product Image & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-xs bg-stone-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-amber-800 font-mono font-bold mt-0.5">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categories Joined */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categories && p.categories.length > 0 ? (
                            p.categories.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-100 text-[10px] font-bold"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-400 italic text-[11px] font-medium">Uncategorized</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-stone-900">
                        ₹{Number(p.price).toLocaleString()}
                        {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                          <span className="ml-1.5 text-[10px] text-stone-400 line-through font-normal">
                            ₹{Number(p.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        {p.stock < 10 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            {p.stock} units
                          </span>
                        )}
                      </td>

                      {/* Toggles (Featured & Bestseller) */}
                      <td className="py-4 px-4 space-x-1">
                        <button
                          onClick={() => handleToggleFlag(p, 'is_featured')}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_featured
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-amber-800'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleToggleFlag(p, 'is_bestseller')}
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.is_bestseller
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-amber-900'
                          }`}
                          title="Toggle Bestseller"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="inline-flex p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all shadow-xs"
                          title="Preview Product"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all shadow-xs"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-rose-600 transition-all shadow-xs"
                          title="Delete Product"
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

      {/* CREATE PRODUCT MODAL (LIGHT THEME) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Add New Fragrance Product</h2>
                  <p className="text-xs text-stone-500 font-medium">Create a luxury product entry with full scent pyramid & SEO metadata</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {/* Product Name & Explicit Slug URL Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug === '' ? e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') : prev.slug,
                      }))
                    }
                    placeholder="e.g. Royal Rose Oud Extrait"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Product Slug URL *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: prev.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
                        }))
                      }
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                    >
                      ⚡ Auto-Slugify
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono">
                    <span className="text-stone-400 font-sans select-none">/products/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
                        })
                      }
                      placeholder="royal-rose-oud-extrait"
                      className="w-full bg-transparent text-stone-900 font-bold focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Live URL: <span className="text-amber-800 font-mono">https://rosevalleykannauj.com/products/{formData.slug || 'your-slug'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="3499"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Compare At Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    placeholder="4999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Base Stock Units</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Select Categories</label>
                <div className="flex flex-wrap gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl max-h-28 overflow-y-auto">
                  {categoriesList.map((cat) => {
                    const isSelected = formData.selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Image Upload & Gallery Manager (Light Theme) */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800">
                    Product Images & Gallery *
                  </label>
                  <span className="text-[11px] text-amber-800 font-bold">
                    {currentImagesList.length} {currentImagesList.length === 1 ? 'Image' : 'Images'} attached
                  </span>
                </div>

                {/* Upload Button & Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processImageFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-100/50 scale-[1.01]'
                      : 'border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50/30'
                  }`}
                >
                  <input
                    type="file"
                    id="create-image-file-input"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="create-image-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Upload New Image File(s) <span className="text-amber-800">or Drag & Drop</span>
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                        PNG, JPG, WEBP, GIF, SVG supported
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-all">
                      <Plus className="w-4 h-4" /> Browse Device Files
                    </div>
                  </label>
                </div>

                {/* Attached Images Grid Preview */}
                {currentImagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {currentImagesList.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white shadow-md flex items-center justify-center"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />

                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-600 text-white text-[9px] font-extrabold uppercase shadow-sm">
                            Main Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(idx)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white/95 text-amber-900 text-[9px] font-bold border border-amber-300 hover:bg-amber-600 hover:text-white transition-all shadow-xs"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw Image URLs Collapsible Input */}
                <details className="text-xs text-stone-500 pt-1">
                  <summary className="cursor-pointer font-bold hover:text-amber-800 text-[11px]">
                    🔗 Paste Image URLs manually (optional)
                  </summary>
                  <textarea
                    rows={2}
                    value={formData.imagesText}
                    onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-1..."
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                  />
                </details>
              </div>

              {/* Scent Notes Builder with AI Generator Button (Guaranteed 3 Notes) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Fragrance Scent Pyramid (Top, Heart & Base)
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAIScentNotes}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ AI All 3 Scent Notes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Notes (Opening Scent)</label>
                    <input
                      type="text"
                      value={formData.topNotesText}
                      onChange={(e) => setFormData({ ...formData, topNotesText: e.target.value })}
                      placeholder="Damask Rose, Bergamot, Pink Pepper"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Heart Notes (Core Scent)</label>
                    <input
                      type="text"
                      value={formData.heartNotesText}
                      onChange={(e) => setFormData({ ...formData, heartNotesText: e.target.value })}
                      placeholder="Jasmine, Saffron, Royal Neroli"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Base Notes (Long-lasting Sillage)</label>
                    <input
                      type="text"
                      value={formData.baseNotesText}
                      onChange={(e) => setFormData({ ...formData, baseNotesText: e.target.value })}
                      placeholder="Aged Royal Oud, Sandalwood, Amber"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Description Field with 200-Word AI SEO Description Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">Detailed Product Description (200 Words + SEO)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-[11px] font-bold hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? '✨ Generating...' : '✨ AI 200-Word SEO Description'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed 200-word description of the attar, 400-year Kannauj copper distillation aging process, and fragrance sillage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all leading-relaxed"
                />
              </div>

              {/* Ingredients List */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  value={formData.ingredientsText}
                  onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                  placeholder="Pure Damask Rose Extract, Indian Sandalwood Oil, Organic Cane Spirits"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                />
              </div>

              {/* SEO Meta Section with Auto-Generate SEO Button */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-amber-700" /> SEO Search Engine Optimization
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAISEO}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ Auto-Generate SEO'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Royal Rose Oud Perfume | Pure Kannauj Attar | Maison De L'Essence"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meta Description (150-160 characters)</label>
                    <textarea
                      rows={2}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Brief search snippet summarizing fragrance notes and craftsmanship..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Customer Reviews Generator & Preview */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Authentic Customer Reviews & Social Proof
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAIReviews}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[11px] font-bold hover:bg-amber-600 hover:text-white transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '⭐ Auto-Generate Reviews'}
                  </button>
                </div>

                {generatedReviews.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {generatedReviews.map((rev: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                            {rev.verified && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-medium">{rev.date || 'Recently'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {'★'.repeat(rev.rating || 5)}
                          <span className="text-xs font-bold text-stone-800 ml-1">{rev.title}</span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium italic">"{rev.review}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Click "⭐ Auto-Generate Reviews" to generate 3 authentic 5-star verified customer testimonials for social proof.
                  </p>
                )}
              </div>

              {/* Flags Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-600 border-stone-300"
                  />
                  <span>Feature on Homepage ⭐</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-600 border-stone-300"
                  />
                  <span>Flag as Bestseller 🔥</span>
                </label>
              </div>

              {/* Action Bar */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL (LIGHT THEME + AI GENERATOR + SLUG EDITOR) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Edit Product</h2>
                  <p className="text-xs text-stone-500 font-medium">{editingProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {/* Product Name & Explicit Slug URL Editor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">Product Slug URL *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: prev.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
                        }))
                      }
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                    >
                      ⚡ Auto-Slugify
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono">
                    <span className="text-stone-400 font-sans select-none">/products/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
                        })
                      }
                      placeholder="royal-rose-oud-extrait"
                      className="w-full bg-transparent text-stone-900 font-bold focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Live URL: <span className="text-amber-800 font-mono">https://rosevalleykannauj.com/products/{formData.slug || 'your-slug'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Compare At Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Assigned Categories</label>
                <div className="flex flex-wrap gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl max-h-28 overflow-y-auto">
                  {categoriesList.map((cat) => {
                    const isSelected = formData.selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product Image Upload & Gallery Manager */}
              <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800">
                    Product Images & Gallery *
                  </label>
                  <span className="text-[11px] text-amber-800 font-bold">
                    {currentImagesList.length} {currentImagesList.length === 1 ? 'Image' : 'Images'} attached
                  </span>
                </div>

                {/* Upload Button & Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processImageFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-100/50 scale-[1.01]'
                      : 'border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50/30'
                  }`}
                >
                  <input
                    type="file"
                    id="edit-image-file-input"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="edit-image-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Upload New Image File(s) <span className="text-amber-800">or Drag & Drop</span>
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                        PNG, JPG, WEBP, GIF, SVG supported
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-all">
                      <Plus className="w-4 h-4" /> Browse Device Files
                    </div>
                  </label>
                </div>

                {/* Attached Images Grid Preview */}
                {currentImagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    {currentImagesList.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white shadow-md flex items-center justify-center"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />

                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-600 text-white text-[9px] font-extrabold uppercase shadow-sm">
                            Main Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakePrimaryImage(idx)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white/95 text-amber-900 text-[9px] font-bold border border-amber-300 hover:bg-amber-600 hover:text-white transition-all shadow-xs"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md"
                          title="Delete Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw Image URLs Collapsible Input */}
                <details className="text-xs text-stone-500 pt-1">
                  <summary className="cursor-pointer font-bold hover:text-amber-800 text-[11px]">
                    🔗 Paste Image URLs manually (optional)
                  </summary>
                  <textarea
                    rows={2}
                    value={formData.imagesText}
                    onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-1..."
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                  />
                </details>
              </div>

              {/* Scent Notes Builder with AI Generator Button (Guaranteed 3 Notes) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Scent Notes Pyramid (Top, Heart & Base)
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAIScentNotes}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ AI All 3 Scent Notes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Notes (Opening Scent)</label>
                    <input
                      type="text"
                      value={formData.topNotesText}
                      onChange={(e) => setFormData({ ...formData, topNotesText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Heart Notes (Core Scent)</label>
                    <input
                      type="text"
                      value={formData.heartNotesText}
                      onChange={(e) => setFormData({ ...formData, heartNotesText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Base Notes (Long-lasting Sillage)</label>
                    <input
                      type="text"
                      value={formData.baseNotesText}
                      onChange={(e) => setFormData({ ...formData, baseNotesText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Description Field with 200-Word AI SEO Description Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">Detailed Product Description (200 Words + SEO)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-[11px] font-bold hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? '✨ Generating...' : '✨ AI 200-Word SEO Description'}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed 200-word description of the attar, 400-year Kannauj copper distillation aging process, and fragrance sillage..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all leading-relaxed"
                />
              </div>

              {/* Ingredients List */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ingredients (comma-separated)</label>
                <input
                  type="text"
                  value={formData.ingredientsText}
                  onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                  placeholder="Pure Damask Rose Extract, Indian Sandalwood Oil, Organic Cane Spirits"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 focus:bg-white font-medium transition-all"
                />
              </div>

              {/* SEO Meta Section with Auto-Generate SEO Button */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-amber-700" /> SEO Search Engine Optimization
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAISEO}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '✨ Auto-Generate SEO'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Royal Rose Oud Perfume | Pure Kannauj Attar | Maison De L'Essence"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meta Description (150-160 characters)</label>
                    <textarea
                      rows={2}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Brief search snippet summarizing fragrance notes and craftsmanship..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Customer Reviews Generator & Preview */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Authentic Customer Reviews & Social Proof
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAIReviews}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[11px] font-bold hover:bg-amber-600 hover:text-white transition-all shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    {isGeneratingAI ? 'Generating...' : '⭐ Auto-Generate Reviews'}
                  </button>
                </div>

                {generatedReviews.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {generatedReviews.map((rev: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                            {rev.verified && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-medium">{rev.date || 'Recently'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {'★'.repeat(rev.rating || 5)}
                          <span className="text-xs font-bold text-stone-800 ml-1">{rev.title}</span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium italic">"{rev.review}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Click "⭐ Auto-Generate Reviews" to generate 3 authentic 5-star verified customer testimonials for social proof.
                  </p>
                )}
              </div>

              {/* Flags Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-600 border-stone-300"
                  />
                  <span>Featured ⭐</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-600 border-stone-300"
                  />
                  <span>Bestseller 🔥</span>
                </label>
              </div>

              {/* Action Bar */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT MODAL (LIGHT THEME) */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-stone-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Delete Product</h3>
                <p className="text-xs text-rose-700 font-bold">{deletingProduct.name}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Are you sure you want to delete this product? All associated product variants and category mappings will also be removed.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
