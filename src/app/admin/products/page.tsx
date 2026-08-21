'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Download,
  FileSpreadsheet,
  Droplets,
  FolderPlus,
  ChevronDown,
} from 'lucide-react';

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
  uncategorizedCount: number;
  lowStockCount: number;
}

function getStandardVariantsForKiloPrice(basePrice: number | string): ProductVariant[] {
  const b = Math.max(100, Number(basePrice) || 1000);
  return [
    { name: 'Sample (2ml)', sku: '', price: 250, compare_at_price: 300 },
    { name: '100 ml', sku: '', price: Math.round(b / 10 + 200), compare_at_price: Math.round((b / 10 + 200) * 1.2) },
    { name: '250 ml', sku: '', price: Math.round(b / 4 + 200), compare_at_price: Math.round((b / 4 + 200) * 1.2) },
    { name: '500 ml', sku: '', price: Math.round(b / 2 + 200), compare_at_price: Math.round((b / 2 + 200) * 1.2) },
    { name: '1 Kg', sku: '', price: b, compare_at_price: Math.round(b * 1.2) },
    { name: '5 Kg', sku: '', price: Math.round(b * 5 * 0.98), compare_at_price: Math.round(b * 5 * 1.15) },
    { name: '10 Kg', sku: '', price: Math.round(b * 10 * 0.96), compare_at_price: Math.round(b * 10 * 1.15) },
    { name: '20 Kg', sku: '', price: Math.round(b * 20 * 0.93), compare_at_price: Math.round(b * 20 * 1.15) },
  ];
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    featuredCount: 0,
    bestsellerCount: 0,
    uncategorizedCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Multi-select & Shift-click
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Bulk Category Assign Modal
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [bulkSelectedCategoryIds, setBulkSelectedCategoryIds] = useState<string[]>([]);
  const [bulkAssignMode, setBulkAssignMode] = useState<'append' | 'replace'>('append');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Quick inline category popover per product
  const [quickAssignProductId, setQuickAssignProductId] = useState<string | null>(null);
  const quickAssignRef = useRef<HTMLDivElement | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CSV Import / Export States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<{ message: string; stats?: any } | null>(null);

  // Form State with 6 Structured Sections
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '' as string | number,
    compare_at_price: '' as string | number,
    stock: '10' as string | number,
    selectedCategoryIds: [] as string[],
    variants: [] as ProductVariant[],
    imagesList: [] as string[],
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

  // Close quick category popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickAssignRef.current && !quickAssignRef.current.contains(event.target as Node)) {
        setQuickAssignProductId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        uncategorizedCount: list.filter((p) => !p.categories || p.categories.length === 0).length,
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

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      showToast('success', 'Preparing CSV export file...');
      const res = await fetch('/api/admin/products/export');
      if (!res.ok) throw new Error('Failed to export CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rose_valley_products_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'CSV export downloaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Export error');
    } finally {
      setIsExporting(false);
    }
  };

  // Import CSV Handler
  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      showToast('error', 'Please select a CSV file to upload.');
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);

      const form = new FormData();
      form.append('file', importFile);

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult({ message: data.message, stats: data.stats });
      showToast('success', 'CSV imported successfully!');
      fetchProducts(false);
    } catch (err: any) {
      showToast('error', err.message || 'CSV Import error');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const isUncategorized = !product.categories || product.categories.length === 0;

      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'uncategorized'
          ? isUncategorized
          : product.categories && product.categories.some((c) => c.id === categoryFilter || c.slug === categoryFilter));

      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && product.is_featured) ||
        (featuredFilter === 'bestseller' && product.is_bestseller);

      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [products, search, categoryFilter, featuredFilter]);

  // Checkbox Selection with Shift + Click support
  const handleToggleSelect = (productId: string, index: number, e: React.MouseEvent) => {
    const isShift = e.shiftKey;
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (isShift && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeProducts = filteredProducts.slice(start, end + 1);
        const shouldSelect = !prev.has(productId) || prev.size === 0;

        rangeProducts.forEach((p) => {
          if (shouldSelect) {
            next.add(p.id);
          } else {
            next.delete(p.id);
          }
        });
      } else {
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
      }
      return next;
    });

    setLastSelectedIndex(index);
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredProducts.map((p) => p.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  };

  // Immediate Single Product Delete with Optimistic UI
  const handleImmediateDelete = async (product: Product) => {
    const previousProducts = [...products];
    const previousStats = { ...stats };

    // Optimistically remove immediately from UI
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
    setStats((prev) => ({
      ...prev,
      totalProducts: Math.max(0, prev.totalProducts - 1),
      featuredCount: product.is_featured ? Math.max(0, prev.featuredCount - 1) : prev.featuredCount,
      bestsellerCount: product.is_bestseller ? Math.max(0, prev.bestsellerCount - 1) : prev.bestsellerCount,
      uncategorizedCount:
        !product.categories || product.categories.length === 0
          ? Math.max(0, prev.uncategorizedCount - 1)
          : prev.uncategorizedCount,
    }));
    setDeletingProduct(null);
    showToast('success', `Deleted "${product.name}"`);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product from database');
      }
    } catch (err: any) {
      // Revert optimistic update if API failed
      setProducts(previousProducts);
      setStats(previousStats);
      showToast('error', err.message || 'Failed to delete product. Restored.');
    }
  };

  // Batch Delete Selected Products
  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    const count = idsToDelete.length;
    const previousProducts = [...products];
    const previousStats = { ...stats };
    const idSet = new Set(idsToDelete);

    // Optimistically remove all from UI
    setProducts((prev) => prev.filter((p) => !idSet.has(p.id)));
    setSelectedIds(new Set());
    setStats((prev) => ({
      ...prev,
      totalProducts: Math.max(0, prev.totalProducts - count),
    }));
    showToast('success', `Deleted ${count} selected product(s)`);

    try {
      setIsBulkDeleting(true);
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Batch deletion failed');
      }
      fetchProducts(false);
    } catch (err: any) {
      setProducts(previousProducts);
      setStats(previousStats);
      showToast('error', err.message || 'Batch delete failed. Restored.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Batch Category Assignment
  const handleBulkAssignCategory = async () => {
    const targetProductIds = Array.from(selectedIds);
    if (targetProductIds.length === 0 || bulkSelectedCategoryIds.length === 0) {
      showToast('error', 'Please select at least one category.');
      return;
    }

    try {
      setIsBulkAssigning(true);

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_category',
          product_ids: targetProductIds,
          category_ids: bulkSelectedCategoryIds,
          mode: bulkAssignMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign categories');

      // Optimistically update categories in state
      const newlyAssignedCategories = categoriesList.filter((c) => bulkSelectedCategoryIds.includes(c.id));
      setProducts((prev) =>
        prev.map((p) => {
          if (!targetProductIds.includes(p.id)) return p;
          if (bulkAssignMode === 'replace') {
            return { ...p, categories: newlyAssignedCategories };
          } else {
            const existingCatMap = new Map((p.categories || []).map((c) => [c.id, c]));
            newlyAssignedCategories.forEach((c) => existingCatMap.set(c.id, c));
            return { ...p, categories: Array.from(existingCatMap.values()) };
          }
        })
      );

      showToast('success', `Assigned category to ${targetProductIds.length} product(s)!`);
      setIsBulkAssignModalOpen(false);
      setBulkSelectedCategoryIds([]);
      setSelectedIds(new Set());
      fetchProducts(false);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to assign category.');
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Quick 1-Click Inline Category Assignment
  const handleQuickAssignCategory = async (product: Product, category: CategoryOption) => {
    const alreadyHas = product.categories?.some((c) => c.id === category.id);
    if (alreadyHas) {
      setQuickAssignProductId(null);
      return;
    }

    const updatedCategories = [...(product.categories || []), category];
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, categories: updatedCategories } : p))
    );
    setQuickAssignProductId(null);
    showToast('success', `Added "${category.name}" to ${product.name}`);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_category',
          product_ids: [product.id],
          category_ids: [category.id],
          mode: 'append',
        }),
      });
      if (!res.ok) throw new Error('Failed to update category in database');
    } catch (err: any) {
      showToast('error', 'Error syncing category with Supabase.');
      fetchProducts(false);
    }
  };

  const handleQuickRemoveCategory = async (product: Product, categoryId: string) => {
    const updatedCategories = (product.categories || []).filter((c) => c.id !== categoryId);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, categories: updatedCategories } : p))
    );
    showToast('success', `Removed category tag`);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_category',
          product_ids: [product.id],
          category_id: categoryId,
        }),
      });
      if (!res.ok) throw new Error('Failed to remove category tag');
    } catch (err: any) {
      showToast('error', 'Error syncing category removal.');
      fetchProducts(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      compare_at_price: '',
      stock: '25',
      selectedCategoryIds: [],
      variants: [],
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

    const initialVariants =
      product.variants && product.variants.length > 1
        ? product.variants
        : getStandardVariantsForKiloPrice(product.price);

    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      stock: product.stock !== undefined ? product.stock : 25,
      selectedCategoryIds: initialCategoryIds,
      variants: initialVariants,
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

  // 1-Click Master AI Generator
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateProductAI = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Please enter a Product Name first in Section 1.');
      return;
    }

    setIsGeneratingAI(true);
    showToast('success', '🧠 AI Deep Thinking: Analyzing Kannauj botanicals & luxury SEO...');

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'all_in_one_seo_and_description',
          prompt: formData.name.trim(),
          context: {
            currentDescription: formData.description,
          },
        }),
      });

      if (!res.ok) throw new Error('AI Generation service failed.');
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
            console.warn('Fallback JSON slice parsing error in modal:', e2);
          }
        }
      }

      if (typeof draft === 'object' && draft !== null) {
        setFormData((prev) => ({
          ...prev,
          meta_title: draft.meta_title ? draft.meta_title.trim() : prev.meta_title,
          meta_description: draft.meta_description ? draft.meta_description.trim() : prev.meta_description,
          meta_keywords: draft.meta_keywords ? draft.meta_keywords.trim() : prev.meta_keywords,
          description: draft.description ? draft.description.trim() : prev.description,
          topNotesText: draft.scent_notes?.top ? draft.scent_notes.top.join(', ') : prev.topNotesText,
          heartNotesText: draft.scent_notes?.heart ? draft.scent_notes.heart.join(', ') : prev.heartNotesText,
          baseNotesText: draft.scent_notes?.base ? draft.scent_notes.base.join(', ') : prev.baseNotesText,
        }));
        showToast('success', '✨ AI generated bespoke SEO metadata & luxury perfume story!');
      } else {
        throw new Error('AI generation returned an unexpected response. Please try again.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate with AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Section 2: Variant Row Actions
  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: '', sku: '', price: prev.price || '', compare_at_price: '' },
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

      const imagesArray =
        formData.imagesList.length > 0
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
        slug:
          formData.slug ||
          formData.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-'),
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

    // Limit featured products to max 5 for Cinematic Hero Carousel
    if (field === 'is_featured' && newValue) {
      const currentFeaturedCount = products.filter((p) => p.is_featured).length;
      if (currentFeaturedCount >= 5) {
        showToast(
          'error',
          '⚠️ Maximum 5 featured products allowed for the Hero Carousel. Please uncheck another featured product first.'
        );
        return;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );
    setStats((prev) => ({
      ...prev,
      featuredCount:
        field === 'is_featured'
          ? newValue
            ? prev.featuredCount + 1
            : Math.max(0, prev.featuredCount - 1)
          : prev.featuredCount,
      bestsellerCount:
        field === 'is_bestseller'
          ? newValue
            ? prev.bestsellerCount + 1
            : Math.max(0, prev.bestsellerCount - 1)
          : prev.bestsellerCount,
    }));

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(
        'success',
        `${newValue ? 'Marked' : 'Unmarked'} ${product.name} as ${
          field === 'is_featured' ? 'Hero Featured (5 Max)' : 'Bestseller'
        }`
      );
    } catch {
      fetchProducts(false);
      showToast('error', 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all max-w-[90vw] sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-[#1A0510]/95 border-[#F6A6BB]/50 text-white shadow-[#4A0D25]/20'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <div className="w-7 h-7 rounded-xl bg-[#4A0D25] border border-[#F6A6BB]/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#F6A6BB]" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-rose-900 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-300" />
            </div>
          )}
          <span className="text-xs font-semibold leading-snug flex-1">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col gap-4 border-b border-[#F7D1D8] pb-5 sm:pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[11px] font-black text-[#4A0D25] uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5 text-[#D45A7A]" /> Products & Variants Studio
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black text-[#1A0510] tracking-tight">
              Products Catalog
            </h1>
            <p className="text-xs sm:text-sm text-[#7A1840]/80 font-medium mt-1">
              Synchronized with Supabase database • Manage perfumes, bottle sizes, scent pyramid, & SEO.
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#F7D1D8] bg-white hover:bg-[#FAE6E7] text-[#4A0D25] text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download products CSV sheet"
            >
              <Download className="w-4 h-4 text-[#D45A7A]" />
              <span className="hidden xs:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
              <span className="xs:hidden">Export</span>
            </button>

            <button
              onClick={() => {
                setImportFile(null);
                setImportResult(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#F7D1D8] bg-white hover:bg-[#FAE6E7] text-[#4A0D25] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Import products from CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D45A7A]" />
              <span className="hidden xs:inline">Import CSV</span>
              <span className="xs:hidden">Import</span>
            </button>

            <button
              onClick={() => fetchProducts(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-[#F7D1D8] bg-white hover:bg-[#FAE6E7] text-[#4A0D25] transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Refresh Catalog"
              aria-label="Refresh catalog"
            >
              <RefreshCw className={`w-4 h-4 text-[#7A1840] ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] hover:from-[#7A1840] hover:to-[#4A0D25] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F6A6BB]" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards (Luxury rose & burgundy palette, mobile 2x2 grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#7A1840]/70">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-7 h-7 rounded-xl bg-[#FAE6E7] flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5 text-[#4A0D25]" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-serif font-black text-[#1A0510] mt-2 sm:mt-3">
            {stats.totalProducts}
          </p>
          <div className="text-[10px] text-[#7A1840] font-semibold mt-0.5">Active Catalog</div>
        </div>

        {/* Uncategorized (Clickable Filter Card) */}
        <button
          onClick={() => setCategoryFilter(categoryFilter === 'uncategorized' ? 'all' : 'uncategorized')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden shadow-xs cursor-pointer ${
            categoryFilter === 'uncategorized'
              ? 'bg-[#FAE6E7] border-[#4A0D25] ring-2 ring-[#F6A6BB]'
              : 'bg-white border-[#F7D1D8] hover:bg-[#FDF8F8]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7A1840]">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Uncategorized</span>
            <div className="w-7 h-7 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
              <Tag className="w-3.5 h-3.5 text-amber-700" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl font-serif font-black text-[#1A0510]">{stats.uncategorizedCount}</p>
            <span className="text-[10px] text-[#D45A7A] font-bold">
              {categoryFilter === 'uncategorized' ? '• Filter active' : 'Click filter'}
            </span>
          </div>
        </button>

        {/* Hero Carousel Featured */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#7A1840]/70">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Hero Featured</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl font-serif font-black text-[#1A0510]">{stats.featuredCount} / 5</p>
            <span className="text-[10px] text-amber-800 font-bold">5 Max Hero</span>
          </div>
        </div>

        {/* Bestsellers */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[#7A1840]/70">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Bestsellers</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl font-serif font-black text-[#1A0510]">{stats.bestsellerCount}</p>
            <span className="text-[10px] text-[#D45A7A] font-bold">Top 6 on Home</span>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar (Responsive Mobile + Desktop) */}
      {selectedIds.size > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-[#1A0510] text-white shadow-2xl border border-[#F6A6BB]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 sm:top-20 z-40 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-[#4A0D25] text-[#F6A6BB] font-mono font-bold text-xs border border-[#F6A6BB]/40">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-stone-300 hover:text-white font-semibold underline underline-offset-2 transition-colors"
            >
              Deselect all
            </button>
            <span className="text-[11px] text-stone-400 hidden md:inline ml-2">
              (Tip: Hold <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] font-mono text-stone-200">SHIFT</kbd> to select range)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkSelectedCategoryIds([]);
                setBulkAssignMode('append');
                setIsBulkAssignModalOpen(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Assign Category</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBulkDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls (Mobile Full-Width Stacking) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#F7D1D8] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#7A1840]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search perfumes, SKU, notes, formula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 sm:py-2.5 rounded-xl bg-[#F7EEED]/60 border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:border-[#4A0D25] focus:bg-white font-medium transition-all placeholder-[#7A1840]/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative flex-1 sm:flex-initial min-w-[140px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 sm:py-2.5 rounded-xl bg-[#F7EEED]/60 border border-[#F7D1D8] text-xs text-[#4A0D25] font-bold focus:outline-none focus:border-[#4A0D25] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="uncategorized">⚠️ Uncategorized ({stats.uncategorizedCount})</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A1840] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-initial min-w-[130px]">
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 sm:py-2.5 rounded-xl bg-[#F7EEED]/60 border border-[#F7D1D8] text-xs text-[#4A0D25] font-bold focus:outline-none focus:border-[#4A0D25] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Badges</option>
              <option value="featured">Hero Featured Only</option>
              <option value="bestseller">Bestsellers Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#7A1840] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Select All for Mobile view */}
          <button
            onClick={handleSelectAll}
            className="md:hidden px-3 py-2 rounded-xl border border-[#F7D1D8] bg-[#FAE6E7] text-[#4A0D25] text-xs font-bold active:scale-95"
          >
            {filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id))
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS VIEW (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-12 text-center text-[#7A1840]/70 bg-white border border-[#F7D1D8] rounded-2xl shadow-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4A0D25]" />
            <span className="text-xs font-bold">Loading products from Supabase...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500 bg-white border border-[#F7D1D8] rounded-2xl shadow-xs">
            <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-serif font-bold text-stone-700">No products found</p>
            <p className="text-xs text-stone-400 mt-1">Try adjusting search query or active filters.</p>
          </div>
        ) : (
          filteredProducts.map((product, idx) => {
            const isSelected = selectedIds.has(product.id);
            const hasImage = product.images && product.images.length > 0 && product.images[0];
            const hasCategories = product.categories && product.categories.length > 0;

            return (
              <div
                key={product.id}
                className={`p-4 rounded-2xl border transition-all shadow-xs relative bg-white ${
                  isSelected ? 'border-[#4A0D25] bg-[#FAE6E7]/40 ring-2 ring-[#F6A6BB]/50' : 'border-[#F7D1D8]'
                }`}
              >
                {/* Card Top: Checkbox, Thumbnail, Title, Slug, & Quick Actions */}
                <div className="flex items-start gap-3">
                  <div className="pt-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => handleToggleSelect(product.id, idx, e)}
                      className="w-4 h-4 rounded text-[#4A0D25] focus:ring-[#F6A6BB] cursor-pointer accent-[#4A0D25]"
                    />
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {hasImage ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#7A1840]/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-bold text-[#1A0510] text-sm leading-snug line-clamp-1">{product.name}</h3>
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono truncate mt-0.5">/{product.slug}</p>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-black text-[#1A0510]">
                        ₹{Number(product.price).toLocaleString()}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-[10px] text-stone-400 line-through">
                          ₹{Number(product.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories Row */}
                <div className="mt-3 pt-3 border-t border-[#F7EEED] flex flex-wrap items-center gap-1.5 relative">
                  <span className="text-[10px] font-bold text-stone-400 mr-1 uppercase">Tags:</span>
                  {hasCategories ? (
                    product.categories!.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAE6E7] text-[#4A0D25] text-[10px] font-bold border border-[#F7D1D8]"
                      >
                        {c.name}
                        <button
                          type="button"
                          onClick={() => handleQuickRemoveCategory(product, c.id)}
                          className="text-[#7A1840]/60 hover:text-rose-600 transition-colors ml-0.5"
                          title="Remove category"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : null}

                  {/* Inline Category Popover Button on Mobile */}
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() =>
                        setQuickAssignProductId(quickAssignProductId === product.id ? null : product.id)
                      }
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                        !hasCategories
                          ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                          : 'bg-white border-dashed border-[#F7D1D8] text-[#7A1840] hover:bg-[#FAE6E7]'
                      }`}
                    >
                      <FolderPlus className="w-3 h-3 text-[#D45A7A]" />
                      {!hasCategories ? 'Assign Category' : '+ Tag'}
                    </button>

                    {/* Popover */}
                    {quickAssignProductId === product.id && (
                      <div
                        ref={quickAssignRef}
                        className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white border border-[#F7D1D8] rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A1840] px-2 py-1 border-b border-[#F7EEED]">
                          Assign Category
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5">
                          {categoriesList.length === 0 ? (
                            <div className="text-[11px] text-stone-400 p-2 text-center">No categories found</div>
                          ) : (
                            categoriesList.map((cat) => {
                              const isAssigned = product.categories?.some((c) => c.id === cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => handleQuickAssignCategory(product, cat)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                    isAssigned ? 'bg-[#FAE6E7] text-[#4A0D25] font-bold' : 'text-stone-700 hover:bg-[#F7EEED]'
                                  }`}
                                >
                                  <span>{cat.name}</span>
                                  {isAssigned && <Check className="w-3.5 h-3.5 text-[#4A0D25]" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants Row Preview */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-400 mr-1 uppercase">Sizes:</span>
                    {product.variants.slice(0, 3).map((v, vIdx) => (
                      <span
                        key={vIdx}
                        className="px-1.5 py-0.5 rounded-md bg-[#F7EEED] text-[#4A0D25] border border-[#F7D1D8] text-[10px] font-bold"
                      >
                        {v.name}: ₹{v.price}
                      </span>
                    ))}
                    {product.variants.length > 3 && (
                      <span className="text-[10px] text-[#7A1840] font-bold">
                        +{product.variants.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Card Bottom: Badges & Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-[#F7EEED] flex items-center justify-between gap-2">
                  {/* Badges Toggle */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFlag(product, 'is_featured')}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                        product.is_featured
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-[#F7EEED] border-[#F7D1D8] text-stone-400'
                      }`}
                      title={
                        product.is_featured
                          ? 'Featured on Hero (Click to unfeature)'
                          : 'Feature on Hero Carousel (Max 5)'
                      }
                    >
                      <Star className={`w-3 h-3 ${product.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{product.is_featured ? 'Hero' : 'Feature'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleFlag(product, 'is_bestseller')}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                        product.is_bestseller
                          ? 'bg-rose-100 border-rose-300 text-rose-900'
                          : 'bg-[#F7EEED] border-[#F7D1D8] text-stone-400'
                      }`}
                      title="Toggle Bestseller Badge"
                    >
                      <Flame className={`w-3 h-3 ${product.is_bestseller ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{product.is_bestseller ? 'Top' : 'Bestseller'}</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-[#4A0D25] hover:bg-[#FAE6E7] transition-colors"
                      title="View on Storefront"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('open_seo_drawer', {
                            detail: { productId: product.id },
                          })
                        );
                      }}
                      className="p-1.5 rounded-lg text-[#7A1840] hover:text-[#4A0D25] hover:bg-[#FAE6E7] border border-[#F7D1D8]/60 transition-all shadow-2xs"
                      title="Quick SEO & Media Studio"
                    >
                      <Sparkles className="w-4 h-4 text-[#D45A7A]" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 rounded-lg text-[#4A0D25] hover:bg-[#FAE6E7] border border-[#F7D1D8]/60 transition-all"
                      title="Edit Product & Variants"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleImmediateDelete(product)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP PRODUCTS TABLE (md+) */}
      <div className="hidden md:block bg-white border border-[#F7D1D8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAE6E7]/50 border-b border-[#F7D1D8] text-[#4A0D25] uppercase font-bold text-[10px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id))}
                    onChange={handleSelectAll}
                    title="Select All / Deselect All"
                    className="w-4 h-4 rounded text-[#4A0D25] focus:ring-[#F6A6BB] cursor-pointer accent-[#4A0D25]"
                  />
                </th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7EEED] font-medium text-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-[#7A1840]/70">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#4A0D25]" />
                    <span className="text-xs font-bold">Loading products from Supabase...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-stone-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                    <p className="text-sm font-serif font-bold text-stone-700">No products found matching filters.</p>
                    <p className="text-xs text-stone-400 mt-1">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => {
                  const isSelected = selectedIds.has(product.id);
                  const hasImage = product.images && product.images.length > 0 && product.images[0];
                  const hasCategories = product.categories && product.categories.length > 0;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#FAE6E7]/60' : 'hover:bg-[#FDF8F8]'
                      }`}
                    >
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => handleToggleSelect(product.id, idx, e)}
                          className="w-4 h-4 rounded text-[#4A0D25] focus:ring-[#F6A6BB] cursor-pointer accent-[#4A0D25]"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                            {hasImage ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-[#7A1840]/40" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-[#1A0510] text-sm truncate max-w-xs">{product.name}</h3>
                            <p className="text-[11px] text-stone-400 font-mono truncate max-w-xs">/{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1.5 relative">
                          {hasCategories ? (
                            product.categories!.map((c) => (
                              <span
                                key={c.id}
                                className="group/pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAE6E7] text-[#4A0D25] text-[10px] font-bold border border-[#F7D1D8]"
                              >
                                {c.name}
                                <button
                                  type="button"
                                  onClick={() => handleQuickRemoveCategory(product, c.id)}
                                  className="text-[#7A1840]/60 hover:text-rose-600 transition-colors"
                                  title="Remove category"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : null}

                          {/* Quick Inline Add/Assign Category Button */}
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setQuickAssignProductId(
                                  quickAssignProductId === product.id ? null : product.id
                                )
                              }
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                !hasCategories
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 animate-pulse'
                                  : 'bg-white border-dashed border-[#F7D1D8] text-[#7A1840] hover:border-[#4A0D25] hover:bg-[#FAE6E7]'
                              }`}
                              title="Quick Assign Category"
                            >
                              <FolderPlus className="w-3 h-3 text-[#D45A7A]" />
                              {!hasCategories ? 'Assign Category' : '+ Tag'}
                            </button>

                            {/* Inline Quick Category Selector Popover */}
                            {quickAssignProductId === product.id && (
                              <div
                                ref={quickAssignRef}
                                className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white border border-[#F7D1D8] rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                              >
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A1840] px-2 py-1 border-b border-[#F7EEED]">
                                  Assign Category
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-0.5">
                                  {categoriesList.length === 0 ? (
                                    <div className="text-[11px] text-stone-400 p-2 text-center">No categories found</div>
                                  ) : (
                                    categoriesList.map((cat) => {
                                      const isAssigned = product.categories?.some((c) => c.id === cat.id);
                                      return (
                                        <button
                                          key={cat.id}
                                          type="button"
                                          onClick={() => handleQuickAssignCategory(product, cat)}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            isAssigned
                                              ? 'bg-[#FAE6E7] text-[#4A0D25] font-bold'
                                              : 'text-stone-700 hover:bg-[#F7EEED]'
                                          }`}
                                        >
                                          <span>{cat.name}</span>
                                          {isAssigned && <Check className="w-3.5 h-3.5 text-[#4A0D25]" />}
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-black text-[#1A0510]">
                          ₹{Number(product.price).toLocaleString()}
                        </div>
                        {product.compare_at_price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            ₹{Number(product.compare_at_price).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.variants && product.variants.length > 0 ? (
                            product.variants.slice(0, 3).map((v, vIdx) => (
                              <span
                                key={vIdx}
                                className="px-1.5 py-0.5 rounded-md bg-[#F7EEED] text-[#4A0D25] border border-[#F7D1D8] text-[10px] font-bold"
                              >
                                {v.name}: ₹{v.price}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Default Size</span>
                          )}
                          {product.variants && product.variants.length > 3 && (
                            <span className="text-[10px] text-[#7A1840] font-bold">
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
                                : 'bg-[#F7EEED] border-[#F7D1D8] text-stone-400 hover:text-stone-700'
                            }`}
                            title={
                              product.is_featured
                                ? 'Featured on Hero Carousel (Click to unfeature)'
                                : 'Feature on Hero Carousel (Max 5)'
                            }
                          >
                            <Star className={`w-3.5 h-3.5 ${product.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleToggleFlag(product, 'is_bestseller')}
                            className={`p-1.5 rounded-lg border transition-all ${
                              product.is_bestseller
                                ? 'bg-rose-100 border-rose-300 text-rose-800'
                                : 'bg-[#F7EEED] border-[#F7D1D8] text-stone-400 hover:text-stone-700'
                            }`}
                            title={
                              product.is_bestseller
                                ? 'Bestseller (Click to remove badge)'
                                : 'Mark as Bestseller (Top 6 on Home Page)'
                            }
                          >
                            <Flame className={`w-3.5 h-3.5 ${product.is_bestseller ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#4A0D25] hover:bg-[#FAE6E7] transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent('open_seo_drawer', {
                                  detail: { productId: product.id },
                                })
                              );
                            }}
                            className="p-1.5 rounded-lg text-[#7A1840] hover:text-[#4A0D25] hover:bg-[#FAE6E7] border border-[#F7D1D8]/60 transition-all shadow-2xs"
                            title="Quick SEO & Media Studio"
                          >
                            <Sparkles className="w-4 h-4 text-[#D45A7A]" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-[#4A0D25] hover:bg-[#FAE6E7] border border-[#F7D1D8]/60 transition-all"
                            title="Edit Product & Variants"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleImmediateDelete(product)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* BULK ASSIGN CATEGORY MODAL */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A0510]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7EEED] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A0510]">Assign Categories</h3>
                  <p className="text-xs text-[#7A1840]/70 font-medium">Apply category tags to {selectedIds.size} selected product(s).</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-[#1A0510] hover:bg-[#F7EEED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A0D25] mb-2">Select Categories to Apply:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                  {categoriesList.map((cat) => {
                    const isChecked = bulkSelectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setBulkSelectedCategoryIds((prev) =>
                            isChecked ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-[#FAE6E7] border-[#4A0D25] text-[#4A0D25] shadow-2xs'
                            : 'bg-[#F7EEED]/50 border-[#F7D1D8] text-stone-700 hover:bg-[#FAE6E7]/50'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isChecked && <Check className="w-4 h-4 text-[#4A0D25] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A0D25] mb-2">Assignment Mode:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBulkAssignMode('append')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      bulkAssignMode === 'append'
                        ? 'bg-[#FAE6E7] border-[#4A0D25] text-[#4A0D25]'
                        : 'bg-[#F7EEED]/50 border-[#F7D1D8] text-stone-600 hover:bg-[#FAE6E7]/40'
                    }`}
                  >
                    <div>+ Add to existing</div>
                    <div className="text-[10px] text-stone-500 font-normal">Keep current tags</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAssignMode('replace')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      bulkAssignMode === 'replace'
                        ? 'bg-[#FAE6E7] border-[#4A0D25] text-[#4A0D25]'
                        : 'bg-[#F7EEED]/50 border-[#F7D1D8] text-stone-600 hover:bg-[#FAE6E7]/40'
                    }`}
                  >
                    <div>↺ Replace all</div>
                    <div className="text-[10px] text-stone-500 font-normal">Overwrite categories</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F7EEED]">
              <button
                type="button"
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-[#1A0510] font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkAssigning || bulkSelectedCategoryIds.length === 0}
                onClick={handleBulkAssignCategory}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isBulkAssigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isBulkAssigning ? 'Applying...' : `Assign (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A0510]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7EEED] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A0510]">Import Products CSV</h3>
                  <p className="text-xs text-[#7A1840]/70 font-medium">Batch create/update products & variants directly in Supabase.</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-[#1A0510] hover:bg-[#F7EEED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-[#F7D1D8] hover:border-[#4A0D25] transition-colors bg-[#F7EEED]/40 flex flex-col items-center justify-center text-center cursor-pointer relative">
                <Upload className="w-8 h-8 text-[#D45A7A] mb-2" />
                <p className="text-xs font-bold text-[#1A0510]">
                  {importFile ? importFile.name : 'Select or drag CSV file here'}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Accepts standard .csv product catalog files</p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {importResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {importResult.message}
                  </div>
                  {importResult.stats && (
                    <p className="text-[11px] text-emerald-700">
                      Processed: {importResult.stats.processedCount} | New: {importResult.stats.insertedCount} | Updated: {importResult.stats.updatedCount}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-xs text-[#7A1840] hover:underline font-bold flex items-center justify-center sm:justify-start gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download sample CSV template
                </button>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:text-[#1A0510] font-bold text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !importFile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isImporting ? 'Importing...' : 'Start Import'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-[#1A0510]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#1A0510]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A0510]">Delete Product</h3>
                <p className="text-xs text-stone-500 font-medium">Permanently delete &quot;{deletingProduct.name}&quot;?</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete this product from Supabase? All associated variants and categories will be removed immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F7EEED]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-[#1A0510] font-bold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleImmediateDelete(deletingProduct)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL (High quality, mobile-responsive sheet with 6 luxury sections) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A0510]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 text-[#1A0510]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#F7D1D8] flex items-center justify-between bg-[#FDF8F8] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] flex-shrink-0">
                  <Package className="w-5 h-5 text-[#D45A7A]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-[#1A0510]">
                    {editingProduct ? 'Edit Product & Variants' : 'Add New Fragrance'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#7A1840]/70 font-medium line-clamp-1">
                    Manage details, notes pyramid, bottle sizes, and SEO metadata.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-[#1A0510] hover:bg-[#FAE6E7]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form with 6 Sections */}
            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs">

              {/* SECTION 1: CORE DETAILS & PRICING */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF8F8] border border-[#F7D1D8] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                  <Info className="w-4 h-4 text-[#D45A7A]" /> Section 1: Core Details & Base Pricing
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A0D25] mb-1">
                      Product Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Rose Oud"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-bold focus:border-[#4A0D25] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#4A0D25]">Slug / URL</label>
                      <button
                        type="button"
                        onClick={handleAutoSlug}
                        className="text-[11px] text-[#7A1840] hover:underline font-bold"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="royal-rose-oud"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-mono focus:border-[#4A0D25] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A0D25] mb-1">
                      Base Price (₹) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 3200"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-bold focus:border-[#4A0D25] focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A0D25] mb-1">Compare Price / MRP (₹)</label>
                    <input
                      type="number"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                      placeholder="e.g. 4500"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#4A0D25] mb-2">Assigned Categories</label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#FAE6E7] border-[#4A0D25] text-[#4A0D25]'
                                : 'bg-white border-[#F7D1D8] text-stone-600 hover:border-[#4A0D25]/50'
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

              {/* SECTION 2: PRODUCT VARIANTS & BOTTLE SIZES (Responsive Mobile Card + Desktop Table) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                    <Layers className="w-4 h-4 text-[#D45A7A]" /> Section 2: Product Variants & Bottle Sizes
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const vars = getStandardVariantsForKiloPrice(formData.price);
                        setFormData((prev) => ({ ...prev, variants: vars }));
                        showToast('success', `Updated all sizes based on base price ₹${formData.price || 1000}!`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAE6E7] hover:bg-[#F7D1D8] border border-[#F7D1D8] text-[#4A0D25] text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D45A7A]" /> Sync Standard Sizes
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Size
                    </button>
                  </div>
                </div>

                {formData.variants.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-[#F7D1D8] text-center text-stone-500 text-xs">
                    No extra variants. The product will sell at the base price (₹{formData.price || 0}). Click &quot;Add Size&quot; or &quot;Sync Standard Sizes&quot; to offer specific options (e.g. 100ml, 500ml, 1Kg).
                  </div>
                ) : (
                  <>
                    {/* Mobile Variant Cards (< sm) */}
                    <div className="sm:hidden space-y-3">
                      {formData.variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-[#F7D1D8] space-y-2 shadow-2xs relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase text-[#7A1840]">Size #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-1 rounded text-stone-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Size / Name</label>
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                                placeholder="e.g. 100 ml"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#F7D1D8] text-xs font-bold text-[#1A0510]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">SKU (Optional)</label>
                              <input
                                type="text"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                                placeholder="RVK-100ML"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#F7D1D8] text-xs text-stone-700 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">Price (₹)</label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#F7D1D8] text-xs font-bold text-[#1A0510]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-500 mb-0.5">MRP / Compare (₹)</label>
                              <input
                                type="number"
                                value={v.compare_at_price || ''}
                                onChange={(e) => handleUpdateVariantRow(idx, 'compare_at_price', e.target.value)}
                                placeholder="MRP"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-[#F7D1D8] text-xs text-stone-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Variant Table (sm+) */}
                    <div className="hidden sm:block border border-[#F7D1D8] rounded-xl overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAE6E7]/60 text-[#4A0D25] uppercase font-bold text-[10px] border-b border-[#F7D1D8]">
                          <tr>
                            <th className="p-2.5">Size Format / Name</th>
                            <th className="p-2.5">SKU</th>
                            <th className="p-2.5">Price (₹)</th>
                            <th className="p-2.5">Compare (₹)</th>
                            <th className="p-2.5 text-right w-12">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F7EEED] font-medium">
                          {formData.variants.map((v, idx) => (
                            <tr key={idx}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.name}
                                  onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                                  placeholder="e.g. 100 ml"
                                  className="w-full px-2 py-1 rounded-lg border border-[#F7D1D8] text-xs font-bold text-[#1A0510]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.sku || ''}
                                  onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                                  placeholder="e.g. RVK-100ML"
                                  className="w-full px-2 py-1 rounded-lg border border-[#F7D1D8] text-xs text-stone-700 font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                                  className="w-full px-2 py-1 rounded-lg border border-[#F7D1D8] text-xs font-bold text-[#1A0510]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={v.compare_at_price || ''}
                                  onChange={(e) => handleUpdateVariantRow(idx, 'compare_at_price', e.target.value)}
                                  placeholder="MRP"
                                  className="w-full px-2 py-1 rounded-lg border border-[#F7D1D8] text-xs text-stone-500"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantRow(idx)}
                                  className="p-1 rounded text-stone-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* SECTION 3: IMAGE GALLERY */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF8F8] border border-[#F7D1D8] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                    <ImageIcon className="w-4 h-4 text-[#D45A7A]" /> Section 3: Product Image Gallery
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>

                {formData.imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
                    {formData.imagesList.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-[#F7D1D8] bg-white shadow-2xs flex items-center justify-center"
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        {idx === 0 ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#4A0D25] text-white text-[9px] font-extrabold uppercase shadow-xs">
                            Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-1 left-1 opacity-90 sm:opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-white text-[#1A0510] text-[9px] font-bold shadow-xs hover:bg-[#4A0D25] hover:text-white transition-all"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 opacity-90 sm:opacity-0 group-hover:opacity-100 p-1 rounded bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xs"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Or paste Image URLs (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.imagesText}
                    onChange={(e) => {
                      const text = e.target.value;
                      const list = text.split('\n').map((s) => s.trim()).filter(Boolean);
                      setFormData({ ...formData, imagesText: text, imagesList: list });
                    }}
                    placeholder="/uploads/products/rose_oil.png"
                    className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-mono focus:border-[#4A0D25] focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 4: FRAGRANCE NOTES PYRAMID */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                  <Droplets className="w-4 h-4 text-[#D45A7A]" /> Section 4: Fragrance Notes Pyramid (Top, Heart, Base)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">Top Notes (Opening Accord)</label>
                    <input
                      type="text"
                      value={formData.topNotesText}
                      onChange={(e) => setFormData({ ...formData, topNotesText: e.target.value })}
                      placeholder="e.g. Damask Rose, Bergamot"
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">Heart Notes (Core Scent)</label>
                    <input
                      type="text"
                      value={formData.heartNotesText}
                      onChange={(e) => setFormData({ ...formData, heartNotesText: e.target.value })}
                      placeholder="e.g. Bulgarian Rose, Saffron"
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">Base Notes (Long Sillage)</label>
                    <input
                      type="text"
                      value={formData.baseNotesText}
                      onChange={(e) => setFormData({ ...formData, baseNotesText: e.target.value })}
                      placeholder="e.g. Mysore Sandalwood, Amber"
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: PRODUCT STORY & FORMULATION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF8F8] border border-[#F7D1D8] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                  <FileText className="w-4 h-4 text-[#D45A7A]" /> Section 5: Product Story & Formulation
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A0D25] mb-1">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Artisanal hydro-distilled attar formulation crafted in Kannauj copper stills..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium leading-relaxed focus:border-[#4A0D25] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A0D25] mb-1">Ingredients (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.ingredientsText}
                    onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                    placeholder="Pure Rosa Damascena Extract, Indian Sandalwood Oil"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 6: SEO & BADGES */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#F7D1D8] pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A0D25]">
                    <Tag className="w-4 h-4 text-[#D45A7A]" /> Section 6: SEO & Store Badges
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateProductAI}
                    disabled={isGeneratingAI}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer self-start sm:self-auto active:scale-95"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Deep Thinking AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB] animate-pulse" />
                        <span>1-Click AI: Generate SEO & Story</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          const currentFeaturedCount = products.filter(
                            (p) => p.is_featured && p.id !== editingProduct?.id
                          ).length;
                          if (currentFeaturedCount >= 5) {
                            showToast(
                              'error',
                              '⚠️ Maximum 5 featured products allowed for the Hero Carousel. Please uncheck another featured product first.'
                            );
                            return;
                          }
                        }
                        setFormData({ ...formData, is_featured: checked });
                      }}
                      className="rounded text-[#4A0D25] w-4 h-4 accent-[#4A0D25]"
                    />
                    <span className="text-xs font-bold text-[#1A0510]">Featured (Hero Carousel - Max 5)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="rounded text-[#4A0D25] w-4 h-4 accent-[#4A0D25]"
                    />
                    <span className="text-xs font-bold text-[#1A0510]">Bestseller Badge</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">
                      Meta Title <span className="text-stone-400">({formData.meta_title.length}/60)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="e.g. Royal Rose Oud | Pure Kannauj Attar"
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="rose oil, pure attar, kannauj"
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#4A0D25] mb-1">
                      Meta Description <span className="text-stone-400">({formData.meta_description.length}/160)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Short search engine description..."
                      className="w-full px-3 py-2 rounded-xl border border-[#F7D1D8] bg-white text-xs text-[#1A0510] font-medium focus:border-[#4A0D25] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md py-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-[#1A0510] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0D25] via-[#7A1840] to-[#4A0D25] hover:from-[#7A1840] hover:to-[#4A0D25] text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
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
