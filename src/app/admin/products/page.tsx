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
      uncategorizedCount: (!product.categories || product.categories.length === 0)
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
    // Optimistic UI update
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

    const initialVariants = product.variants && product.variants.length > 1
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

    // Limit featured products to max 5 for CinematicHeroV2 Carousel
    if (field === 'is_featured' && newValue) {
      const currentFeaturedCount = products.filter((p) => p.is_featured).length;
      if (currentFeaturedCount >= 5) {
        showToast(
          'error',
          '⚠️ Maximum 5 featured products allowed for the Hero Carousel. Please unfeature another product first.'
        );
        return;
      }
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );
    setStats((prev) => ({
      ...prev,
      featuredCount: field === 'is_featured'
        ? (newValue ? prev.featuredCount + 1 : Math.max(0, prev.featuredCount - 1))
        : prev.featuredCount,
      bestsellerCount: field === 'is_bestseller'
        ? (newValue ? prev.bestsellerCount + 1 : Math.max(0, prev.bestsellerCount - 1))
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
          <p className="text-xs text-stone-500 font-medium">Manage product details, bottle variants, notes pyramid, category assignments, and CSV batch processing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50"
            title="Download complete products CSV sheet"
          >
            <Download className="w-4 h-4 text-amber-700" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Import products from CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            Import CSV
          </button>

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Boxes className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 mt-2">{stats.totalProducts}</p>
        </div>

        <button
          onClick={() => setCategoryFilter(categoryFilter === 'uncategorized' ? 'all' : 'uncategorized')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            categoryFilter === 'uncategorized'
              ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-xs font-bold uppercase tracking-wider">Uncategorized</span>
            <Tag className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-serif font-bold text-amber-950">{stats.uncategorizedCount}</p>
            <span className="text-[10px] text-amber-700 font-bold">Click to filter</span>
          </div>
        </button>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Featured (Hero)</span>
            <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-serif font-bold text-stone-900">{stats.featuredCount} / 5</p>
            <span className="text-[10px] text-amber-700 font-bold">Max 5 Carousel</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Bestsellers</span>
            <Flame className="w-4 h-4 text-rose-600 fill-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-serif font-bold text-stone-900">{stats.bestsellerCount}</p>
            <span className="text-[10px] text-rose-700 font-bold">Top 6 on Home</span>
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar (When items are selected) */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 sticky top-4 z-40 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
              {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">
              (Tip: Hold <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] font-mono text-stone-200">SHIFT</kbd> to select range)
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-stone-400 hover:text-white font-semibold underline underline-offset-2 transition-colors ml-1"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setBulkSelectedCategoryIds([]);
                setBulkAssignMode('append');
                setIsBulkAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Assign Category ({selectedIds.size})
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isBulkDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Selected ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

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
            <option value="uncategorized">⚠️ Uncategorized ({stats.uncategorizedCount})</option>
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
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id))}
                    onChange={handleSelectAll}
                    title="Select All / Deselect All"
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer"
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
            <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-700" />
                    Loading products from Supabase...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-stone-400">
                    No products found matching filters.
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
                        isSelected ? 'bg-amber-50/60' : 'hover:bg-amber-50/20'
                      }`}
                    >
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          onClick={(e) => handleToggleSelect(product.id, idx, e)}
                          className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

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
                        <div className="flex flex-wrap items-center gap-1.5 relative">
                          {hasCategories ? (
                            product.categories!.map((c) => (
                              <span
                                key={c.id}
                                className="group/pill inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200"
                              >
                                {c.name}
                                <button
                                  type="button"
                                  onClick={() => handleQuickRemoveCategory(product, c.id)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors"
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
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                                !hasCategories
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 animate-pulse'
                                  : 'bg-white border-dashed border-stone-300 text-stone-500 hover:border-amber-600 hover:text-amber-800'
                              }`}
                              title="Quick Assign Category"
                            >
                              <FolderPlus className="w-3 h-3 text-amber-700" />
                              {!hasCategories ? 'Assign Category' : '+ Add'}
                            </button>

                            {/* Inline Quick Category Selector Popover */}
                            {quickAssignProductId === product.id && (
                              <div
                                ref={quickAssignRef}
                                className="absolute left-0 top-full mt-1 z-50 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1 animate-fade-in"
                              >
                                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1 border-b border-stone-100">
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
                                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                            isAssigned
                                              ? 'bg-amber-50 text-amber-900 font-bold'
                                              : 'text-stone-700 hover:bg-stone-100'
                                          }`}
                                        >
                                          <span>{cat.name}</span>
                                          {isAssigned && <Check className="w-3.5 h-3.5 text-amber-700" />}
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
                            product.variants.slice(0, 3).map((v, vIdx) => (
                              <span
                                key={vIdx}
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
                            title={
                              product.is_featured
                                ? 'Featured on Hero Carousel (Click to unfeature)'
                                : 'Feature on Hero Carousel (Max 5)'
                            }
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
                            title={
                              product.is_bestseller
                                ? 'Bestseller (Click to remove badge)'
                                : 'Mark as Bestseller (Top 6 on Home Page)'
                            }
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
                            onClick={() => handleImmediateDelete(product)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product Immediately"
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
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-fade-in text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">Assign Categories</h3>
                  <p className="text-xs text-stone-500 font-medium">Apply category tags to {selectedIds.size} selected product(s).</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Select Categories to Apply:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
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
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isChecked && <Check className="w-4 h-4 text-amber-700 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Assignment Mode:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setBulkAssignMode('append')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      bulkAssignMode === 'append'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>+ Add to existing</div>
                    <div className="text-[10px] text-stone-500 font-normal">Keep current categories</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAssignMode('replace')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                      bulkAssignMode === 'replace'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>↺ Replace all</div>
                    <div className="text-[10px] text-stone-500 font-normal">Overwrite categories</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkAssigning || bulkSelectedCategoryIds.length === 0}
                onClick={handleBulkAssignCategory}
                className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isBulkAssigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isBulkAssigning ? 'Applying Categories...' : `Assign to ${selectedIds.size} Products`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-fade-in text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">Import Products CSV</h3>
                  <p className="text-xs text-stone-500 font-medium">Batch create/update products & variants directly in Supabase.</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-700 transition-colors bg-stone-50 flex flex-col items-center justify-center text-center cursor-pointer relative">
                <Upload className="w-8 h-8 text-amber-700 mb-2" />
                <p className="text-xs font-bold text-stone-800">
                  {importFile ? importFile.name : 'Select or drag CSV file here'}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Accepts standard .csv product files</p>
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

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="text-xs text-amber-800 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download current CSV template
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !importFile}
                    className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isImporting ? 'Importing Batch...' : 'Start Import'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Are you sure you want to delete this product from Supabase? All associated variants and categories will be removed immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleImmediateDelete(deletingProduct)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
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
                    Configure product details and exact bottle sizes directly synchronized with Supabase database.
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
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" /> Section 1: Core Details & Base Pricing
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Product Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Rose Oud"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-bold focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700">Slug / URL</label>
                      <button
                        type="button"
                        onClick={handleAutoSlug}
                        className="text-[11px] text-amber-800 hover:underline font-bold"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="royal-rose-oud"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-mono focus:border-amber-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Base Price (₹) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 3200"
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
                      onClick={() => {
                        const vars = getStandardVariantsForKiloPrice(formData.price);
                        setFormData((prev) => ({ ...prev, variants: vars }));
                        showToast('success', `Updated all sizes based on base price ₹${formData.price || 1000}!`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Sync Kilo Price Sizes
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Size / Variant
                    </button>
                  </div>
                </div>

                {formData.variants.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-stone-200 text-center text-stone-500 text-xs">
                    No extra variants. The product will sell at the base price (₹{formData.price || 0}). Click &quot;Add Size / Variant&quot; if you want to offer specific sizes (e.g. 50ml, 100ml, 1Kg).
                  </div>
                ) : (
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
                )}
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
                      className="rounded text-amber-700 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-stone-800">Featured (Hero Carousel - Max 5)</span>
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
