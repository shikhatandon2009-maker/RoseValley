'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  Star,
  Flame,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Boxes,
  Check,
  Tag,
  Sparkles,
  Layers,
  FileText,
  Upload,
  Info,
  DollarSign,
  Droplets,
} from 'lucide-react';
import { STORE_ID } from '@/lib/constants';

interface ProductVariant {
  id?: string;
  name: string;
  sku?: string;
  price: number | string;
  compare_at_price?: number | string;
}

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
  stock?: number;
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
  meta_keywords?: string;
  created_at: string;
  categories?: CategoryOption[];
  variants?: ProductVariant[];
}

interface Stats {
  totalProducts: number;
  featuredCount: number;
  bestsellerCount: number;
  lowStockCount: number;
}

const PREDEFINED_SIZES = [
  'Sample', '100 ml', '250 ml', '500 ml', '1 Kg', '5 Kg', '10 Kg', '20 Kg'
];

function roundToNearest10(n: number): number {
  return Math.round(n / 10) * 10;
}

function calculateDefaultVariantPrices(base1Kg: number): ProductVariant[] {
  const b = Number(base1Kg) || 1000;
  return [
    { name: 'Sample', sku: '', price: 250, compare_at_price: 300 },
    { name: '100 ml', sku: '', price: roundToNearest10(b / 10 + 200), compare_at_price: roundToNearest10((b / 10 + 200) * 1.2) },
    { name: '250 ml', sku: '', price: roundToNearest10(b / 4 + 200), compare_at_price: roundToNearest10((b / 4 + 200) * 1.2) },
    { name: '500 ml', sku: '', price: roundToNearest10(b / 2 + 200), compare_at_price: roundToNearest10((b / 2 + 200) * 1.2) },
    { name: '1 Kg',   sku: '', price: roundToNearest10(b), compare_at_price: roundToNearest10(b * 1.2) },
    { name: '5 Kg',   sku: '', price: roundToNearest10(b * 5 * 0.98), compare_at_price: roundToNearest10(b * 5 * 1.15) },
    { name: '10 Kg',  sku: '', price: roundToNearest10(b * 10 * 0.96), compare_at_price: roundToNearest10(b * 10 * 1.15) },
    { name: '20 Kg',  sku: '', price: roundToNearest10(b * 20 * 0.93), compare_at_price: roundToNearest10(b * 20 * 1.15) },
  ];
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    featuredCount: 0,
    bestsellerCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State with 6 Structured Sections
  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    name: '',
    slug: '',
    price: '' as string | number,
    compare_at_price: '' as string | number,
    stock: '10' as string | number,
    selectedCategoryIds: [] as string[],

    // Section 2: Product Variants Table
    variants: [] as ProductVariant[],

    // Section 3: Image Gallery
    imagesList: [] as string[],
    imagesText: '',

    // Section 4: Fragrance Notes Pyramid
    topNotesText: '',
    heartNotesText: '',
    baseNotesText: '',

    // Section 5: Product Story & Formulation
    description: '',
    ingredientsText: '',

    // Section 6: SEO & Badges
    is_featured: false,
    is_bestseller: false,
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      const list: Product[] = data.products || [];
      setProducts(list);
      setStats({
        totalProducts: list.length,
        featuredCount: list.filter((p) => p.is_featured).length,
        bestsellerCount: list.filter((p) => p.is_bestseller).length,
        lowStockCount: 0,
      });
    } catch (err: any) {
      showToast('error', 'Error loading products from Supabase.');
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' ||
        (product.categories && product.categories.some((c) => c.id === categoryFilter || c.slug === categoryFilter));

      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && product.is_featured) ||
        (featuredFilter === 'bestseller' && product.is_bestseller);

      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [products, search, categoryFilter, featuredFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      compare_at_price: '',
      stock: '25',
      selectedCategoryIds: [],
      variants: calculateDefaultVariantPrices(1000),
      imagesList: [],
      imagesText: '',
      topNotesText: '',
      heartNotesText: '',
      baseNotesText: '',
      description: '',
      ingredientsText: '',
      is_featured: false,
      is_bestseller: false,
      meta_title: '',
      meta_keywords: '',
      meta_description: '',
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = async (product: Product) => {
    const initialCategoryIds = product.categories?.map((c) => c.id) || [];
    const prodImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];

    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      stock: product.stock !== undefined ? product.stock : 25,
      selectedCategoryIds: initialCategoryIds,
      variants: product.variants && product.variants.length > 0 ? product.variants : calculateDefaultVariantPrices(product.price),
      imagesList: prodImages,
      imagesText: prodImages.join('\n'),
      topNotesText: (product.scent_notes?.top || []).join(', '),
      heartNotesText: (product.scent_notes?.heart || []).join(', '),
      baseNotesText: (product.scent_notes?.base || []).join(', '),
      ingredientsText: (product.ingredients || []).join(', '),
      description: product.description || '',
      is_featured: Boolean(product.is_featured),
      is_bestseller: Boolean(product.is_bestseller),
      meta_title: product.meta_title || '',
      meta_keywords: product.meta_keywords || '',
      meta_description: product.meta_description || '',
    });

    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleAutoSlug = () => {
    const generated = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  // Section 2: Variant Row Actions
  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: '100 ml', sku: '', price: prev.price || 1000, compare_at_price: '' },
      ],
    }));
  };

  const handleUpdateVariantRow = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleAutoCalculateVariants = () => {
    const base = Number(formData.price) || 1000;
    setFormData((prev) => ({
      ...prev,
      variants: calculateDefaultVariantPrices(base),
    }));
    showToast('success', `Calculated standard sizes based on base price ₹${base}!`);
  };

  // Section 3: Image File Upload
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      showToast('success', 'Uploading image file to storage...');

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');

      setFormData((prev) => {
        const updatedList = [...prev.imagesList, data.url];
        return {
          ...prev,
          imagesList: updatedList,
          imagesText: updatedList.join('\n'),
        };
      });
      showToast('success', 'Image uploaded and added to gallery!');
    } catch (err: any) {
      showToast('error', err.message || 'Image upload error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updatedList = prev.imagesList.filter((_, i) => i !== index);
      return {
        ...prev,
        imagesList: updatedList,
        imagesText: updatedList.join('\n'),
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => {
      const target = prev.imagesList[index];
      const rest = prev.imagesList.filter((_, i) => i !== index);
      const updatedList = [target, ...rest];
      return {
        ...prev,
        imagesList: updatedList,
        imagesText: updatedList.join('\n'),
      };
    });
  };

  // Save Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === '') {
      showToast('error', 'Product Name and Price are required.');
      return;
    }

    try {
      setIsSubmitting(true);

      const imagesArray = formData.imagesList.length > 0
        ? formData.imagesList
        : formData.imagesText.split('\n').map((s) => s.trim()).filter(Boolean);

      const topNotes = formData.topNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const heartNotes = formData.heartNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const baseNotes = formData.baseNotesText.split(',').map((s) => s.trim()).filter(Boolean);
      const ingredients = formData.ingredientsText.split(',').map((s) => s.trim()).filter(Boolean);

      const formattedVariants = formData.variants.map((v) => ({
        id: v.id,
        name: v.name.trim(),
        sku: v.sku ? v.sku.trim() : null,
        price: Number(v.price) || 0,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      }));

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
        description: formData.description.trim(),
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: Number(formData.stock) || 0,
        images: imagesArray,
        scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
        ingredients,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        meta_title: formData.meta_title.trim(),
        meta_keywords: formData.meta_keywords.trim(),
        meta_description: formData.meta_description.trim(),
        category_ids: formData.selectedCategoryIds,
        variants: formattedVariants,
      };

      const isEdit = Boolean(editingProduct);
      const url = isEdit ? `/api/admin/products/${editingProduct?.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showToast('success', `✨ Product "${formData.name}" ${isEdit ? 'updated' : 'created'} successfully!`);
      setIsAddModalOpen(false);
      setEditingProduct(null);
      fetchProducts(false);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFlag = async (product: Product, field: 'is_featured' | 'is_bestseller') => {
    const newValue = !product[field];
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast('success', `Updated ${product.name}`);
    } catch {
      fetchProducts(false);
      showToast('error', 'Failed to update status.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    setDeletingProduct(null);

    try {
      const res = await fetch(`/api/admin/products/${target.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('success', `Product "${target.name}" deleted.`);
      fetchProducts(false);
    } catch {
      showToast('error', 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
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
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Package className="w-4 h-4" /> Products & Variants Manager
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">Products Catalog (Supabase)</h1>
          <p className="text-xs text-stone-500 font-medium">Manage product details, bottle variants, notes pyramid, images, and SEO.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchProducts(true)}
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-all shadow-xs"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Boxes className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 mt-2">{stats.totalProducts}</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Featured</span>
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 mt-2">{stats.featuredCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Bestsellers</span>
            <Flame className="w-4 h-4 text-rose-600 fill-rose-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 mt-2">{stats.bestsellerCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, slug, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-700 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 font-bold focus:outline-none focus:border-amber-700"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 font-bold focus:outline-none focus:border-amber-700"
          >
            <option value="all">All Statuses</option>
            <option value="featured">Featured Only</option>
            <option value="bestseller">Bestsellers Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-700" />
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const hasImage = product.images && product.images.length > 0 && product.images[0];
                  return (
                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {hasImage ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-stone-900 text-sm truncate max-w-xs">{product.name}</h3>
                            <p className="text-[11px] text-stone-400 font-mono truncate max-w-xs">/{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Uncategorized</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-stone-900">
                          ₹{Number(product.price).toLocaleString()}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-[11px] text-stone-400 line-through">
                            ₹{Number(product.compare_at_price).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.variants && product.variants.length > 0 ? (
                            product.variants.slice(0, 3).map((v, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold"
                              >
                                {v.name}: ₹{v.price}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Default Size</span>
                          )}
                          {product.variants && product.variants.length > 3 && (
                            <span className="text-[10px] text-stone-500 font-bold">
                              +{product.variants.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFlag(product, 'is_featured')}
                            className={`p-1.5 rounded-lg border transition-all ${
                              product.is_featured
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                            }`}
                            title="Toggle Featured"
                          >
                            <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'fill-amber-600' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleToggleFlag(product, 'is_bestseller')}
                            className={`p-1.5 rounded-lg border transition-all ${
                              product.is_bestseller
                                ? 'bg-rose-100 border-rose-300 text-rose-800'
                                : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-700'
                            }`}
                            title="Toggle Bestseller"
                          >
                            <Flame className={`w-3.5 h-3.5 ${product.is_bestseller ? 'fill-rose-600' : ''}`} />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50"
                            title="Edit Product & Variants"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-fade-in text-stone-900">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">Delete Product</h3>
                <p className="text-xs text-stone-500 font-medium">Permanently delete &quot;{deletingProduct.name}&quot;?</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete this product from Supabase? All associated variants and categories will be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ADD / EDIT PRODUCT MODAL (6 STRUCTURED SECTIONS)                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in text-stone-900">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {editingProduct ? 'Edit Product & Variants' : 'Add New Fragrance'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Configure all 6 product sections directly synchronized with Supabase database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form with 6 Sections */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" /> Section 1: Basic Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ruh Gulab Pure Damask Rose"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">URL Slug</label>
                      <button
                        type="button"
                        onClick={handleAutoSlug}
                        className="text-[10px] text-amber-800 hover:underline font-bold"
                      >
                        Auto-generate from Name
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. ruh-gulab-pure-damask-rose"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-mono focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 3800"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Compare Price / MRP (₹)</label>
                    <input
                      type="number"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                      placeholder="e.g. 4500"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-2">Assigned Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {categoriesList.map((cat) => {
                        const isChecked = formData.selectedCategoryIds.includes(cat.id);
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                selectedCategoryIds: isChecked
                                  ? prev.selectedCategoryIds.filter((id) => id !== cat.id)
                                  : [...prev.selectedCategoryIds, cat.id],
                              }));
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              isChecked
                                ? 'bg-amber-100 border-amber-400 text-amber-900'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '} {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCT VARIANTS TABLE */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <Layers className="w-4 h-4 text-amber-700" /> Section 2: Product Variants & Bottle Sizes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoCalculateVariants}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" /> Auto-Scale Sizes (Sample to 20Kg)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Size
                    </button>
                  </div>
                </div>

                <div className="border border-amber-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-50/80 text-amber-900 uppercase font-bold text-[10px] border-b border-amber-200">
                      <tr>
                        <th className="p-2.5">Size Format / Name</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Price (₹)</th>
                        <th className="p-2.5">Compare (₹)</th>
                        <th className="p-2.5 text-right w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 font-medium">
                      {formData.variants.map((v, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                              placeholder="e.g. 100 ml"
                              className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold text-stone-900"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.sku || ''}
                              onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                              placeholder="e.g. RVK-100ML"
                              className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs text-stone-700 font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold text-stone-900"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={v.compare_at_price || ''}
                              onChange={(e) => handleUpdateVariantRow(idx, 'compare_at_price', e.target.value)}
                              placeholder="MRP"
                              className="w-full px-2 py-1 rounded-lg border border-stone-200 text-xs text-stone-500"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-1 rounded text-stone-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: IMAGE GALLERY */}
              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                    <ImageIcon className="w-4 h-4 text-amber-700" /> Section 3: Product Image Gallery
                  </div>
                  <label className="cursor-pointer px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> {isUploadingImage ? 'Uploading...' : 'Upload Image File'}
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {formData.imagesList.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {formData.imagesList.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs flex items-center justify-center"
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-700 text-white text-[9px] font-extrabold uppercase shadow-xs">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white text-stone-900 text-[9px] font-bold shadow-xs hover:bg-amber-700 hover:text-white transition-all"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Or paste Image URLs (one per line)</label>
                  <textarea
                    rows={2}
                    value={formData.imagesText}
                    onChange={(e) => {
                      const text = e.target.value;
                      const list = text.split('\n').map((s) => s.trim()).filter(Boolean);
                      setFormData({ ...formData, imagesText: text, imagesList: list });
                    }}
                    placeholder="/uploads/products/rose_oil.png"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-mono focus:border-amber-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 4: FRAGRANCE NOTES PYRAMID */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Droplets className="w-4 h-4 text-amber-700" /> Section 4: Fragrance Notes Pyramid (Top, Heart, Base)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Top Notes (Opening Scent)</label>
                    <input
                      type="text"
                      value={formData.topNotesText}
                      onChange={(e) => setFormData({ ...formData, topNotesText: e.target.value })}
                      placeholder="e.g. Damask Rose, Bergamot"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Heart Notes (Core Accord)</label>
                    <input
                      type="text"
                      value={formData.heartNotesText}
                      onChange={(e) => setFormData({ ...formData, heartNotesText: e.target.value })}
                      placeholder="e.g. Bulgarian Rose, Saffron"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Base Notes (Long Sillage)</label>
                    <input
                      type="text"
                      value={formData.baseNotesText}
                      onChange={(e) => setFormData({ ...formData, baseNotesText: e.target.value })}
                      placeholder="e.g. Mysore Sandalwood, Amber"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PRODUCT STORY & FORMULATION */}
              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <FileText className="w-4 h-4 text-amber-700" /> Section 5: Product Story & Formulation
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Artisanal hydro-distilled attar formulation crafted in Kannauj copper stills..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.ingredientsText}
                    onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                    placeholder="Pure Rosa Damascena Extract, Indian Sandalwood Oil"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* SECTION 6: SEO & BADGES */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Tag className="w-4 h-4 text-amber-700" /> Section 6: SEO & Store Badges
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-amber-700 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-stone-800">Featured Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="rounded text-amber-700 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-stone-800">Bestseller Badge</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Meta Title <span className="text-stone-400">({formData.meta_title.length}/60)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Royal Rose Oud | Pure Kannauj Attar"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="rose oil, pure attar, kannauj"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Meta Description <span className="text-stone-400">({formData.meta_description.length}/160)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Short search engine description..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isSubmitting ? 'Saving to Supabase...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
