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
  Upload,
  Copy,
  Download,
  FileSpreadsheet,
  UploadCloud,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface ProductVariant {
  id?: string;
  name: string;
  sku?: string;
  price: number | string;
  compare_at_price?: number | string;
  stock: number | string;
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
  variants?: ProductVariant[];
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
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Multi-Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // CSV Import State
  const [importCsvText, setImportCsvText] = useState('');
  const [importCsvFileName, setImportCsvFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [lastImportSummary, setLastImportSummary] = useState<{
    updatedCount: number;
    createdCount: number;
    totalProcessed: number;
  } | null>(null);

  // Bulk Image Assign State
  const [bulkImageUrl, setBulkImageUrl] = useState('');
  const [bulkImageTarget, setBulkImageTarget] = useState<'all' | 'missing_only'>('missing_only');
  const [isApplyingBulkImage, setIsApplyingBulkImage] = useState(false);
  const [isGeneratingBulkAIImage, setIsGeneratingBulkAIImage] = useState(false);

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
    variants: [] as ProductVariant[],
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
          topNotesText: Array.isArray(parsed.top) ? parsed.top.join(', ') : '',
          heartNotesText: Array.isArray(parsed.heart) ? parsed.heart.join(', ') : '',
          baseNotesText: Array.isArray(parsed.base) ? parsed.base.join(', ') : '',
        }));
        showToast('success', '✨ AI Pyramid Notes generated for Top, Heart & Base notes!');
      } catch (e) {
        showToast('error', 'Could not parse AI Scent Notes response.');
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
          meta_title: parsed.meta_title || '',
          meta_description: parsed.meta_description || '',
        }));
        showToast('success', '✨ AI SEO Title & Description generated!');
      } catch (e) {
        showToast('error', 'Could not parse AI SEO response.');
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
        showToast('error', 'Could not parse AI Reviews response.');
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

  const compressImageFile = (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.size < 80 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
        return;
      }

      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(compressedDataUrl);
        } else {
          const fallbackReader = new FileReader();
          fallbackReader.onload = (ev) => resolve(ev.target?.result as string);
          fallbackReader.readAsDataURL(file);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processImageFiles(Array.from(files));
    e.target.value = '';
  };

  const processImageFiles = async (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('error', 'Please select valid image files (PNG, JPG, WEBP, etc.).');
      return;
    }

    try {
      showToast('success', `Uploading ${validFiles.length} image(s)...`);
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('folder', 'products');

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Upload failed');
      }

      setFormData((prev) => {
        const existing = prev.imagesText
          ? prev.imagesText.split('\n').map((s) => s.trim()).filter(Boolean)
          : [];
        return {
          ...prev,
          imagesText: [...existing, ...uploadedUrls].join('\n'),
        };
      });
      showToast('success', `${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Failed to upload images.');
    }
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

  // Variant Drag-and-Drop & Reordering State
  const [draggedVariantIndex, setDraggedVariantIndex] = useState<number | null>(null);
  const [dragOverVariantIndex, setDragOverVariantIndex] = useState<number | null>(null);

  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { name: '', sku: '', price: prev.price || 1200, compare_at_price: '', stock: 25 },
      ],
    }));
  };

  const handleUpdateVariantRow = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      updated.splice(index, 1);
      return { ...prev, variants: updated };
    });
  };

  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const list = [...(prev.variants || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(targetIndex, 0, item);
      return { ...prev, variants: list };
    });
  };

  const handleVariantDragStart = (e: React.DragEvent, index: number) => {
    setDraggedVariantIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleVariantDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverVariantIndex !== index) {
      setDragOverVariantIndex(index);
    }
  };

  const handleVariantDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedVariantIndex === null || draggedVariantIndex === targetIndex) {
      setDraggedVariantIndex(null);
      setDragOverVariantIndex(null);
      return;
    }

    setFormData((prev) => {
      const list = [...(prev.variants || [])];
      const [draggedItem] = list.splice(draggedVariantIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return { ...prev, variants: list };
    });

    setDraggedVariantIndex(null);
    setDragOverVariantIndex(null);
    showToast('success', 'Variant order changed successfully!');
  };

  // Product Table Drag-and-Drop & Reordering State
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);

  const handleProductDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProductIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleProductDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProductIndex !== index) {
      setDragOverProductIndex(index);
    }
  };

  const handleProductDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedProductIndex === null || draggedProductIndex === targetIndex) {
      setDraggedProductIndex(null);
      setDragOverProductIndex(null);
      return;
    }

    setProducts((prev) => {
      const list = [...prev];
      const [draggedItem] = list.splice(draggedProductIndex, 1);
      list.splice(targetIndex, 0, draggedItem);
      return list;
    });

    setDraggedProductIndex(null);
    setDragOverProductIndex(null);
    showToast('success', 'Product order updated in catalog view!');
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    setProducts((prev) => {
      const list = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(targetIndex, 0, item);
      return list;
    });
  };

  const fetchCategoriesList = async () => {
    // Instant hydration from cache if available
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cached_categories_list');
        if (cached) setCategoriesList(JSON.parse(cached));
      } catch (e) { }
    }

    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategoriesList(data.categories);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_categories_list', JSON.stringify(data.categories));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async (showSpinnerIfEmpty?: boolean | any) => {
    try {
      const isSpinnerAllowed = typeof showSpinnerIfEmpty === 'boolean' ? showSpinnerIfEmpty : true;
      if (isSpinnerAllowed && products.length === 0) {
        setLoading(true);
      }
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
      if (products.length === 0) setError(err.message || 'Error loading products');
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
      variants: [
        { name: '10ml Attar Bottle', sku: '', price: 1200, compare_at_price: 1500, stock: 25 },
      ],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    // 1. INSTANT (0ms) UI OPEN: Populate form from memory object immediately
    const initialCategoryIds = product.categories?.map((c) => c.id) || [];
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      stock: product.stock,
      imagesText: (product.images || []).join('\n'),
      topNotesText: (product.scent_notes?.top || []).join(', '),
      heartNotesText: (product.scent_notes?.heart || []).join(', '),
      baseNotesText: (product.scent_notes?.base || []).join(', '),
      ingredientsText: (product.ingredients || []).join(', '),
      is_featured: Boolean(product.is_featured),
      is_bestseller: Boolean(product.is_bestseller),
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      selectedCategoryIds: initialCategoryIds,
      variants: (product.variants || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || '',
        price: v.price,
        compare_at_price: v.compare_at_price || '',
        stock: v.stock,
      })),
    });

    setEditingProduct(product);

    // 2. BACKGROUND REVALIDATION: Asynchronously fetch latest details without blocking UI
    fetch(`/api/admin/products/${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const p = data.product;
          setFormData((prev) => ({
            ...prev,
            selectedCategoryIds: p.category_ids || prev.selectedCategoryIds,
            variants: (p.variants || prev.variants || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.sku || '',
              price: v.price,
              compare_at_price: v.compare_at_price || '',
              stock: v.stock,
            })),
          }));
        }
      })
      .catch((e) => console.error('Background product detail revalidation error:', e));
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
      const selectedCats = categoriesList.filter((c) => formData.selectedCategoryIds.includes(c.id));
      const formattedVariants = (formData.variants || []).map((v) => ({
        id: v.id,
        name: v.name.trim(),
        sku: v.sku ? v.sku.trim() : undefined,
        price: Number(v.price) || 0,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
        stock: Number(v.stock) || 0,
      }));

      const tempId = `temp-${Date.now()}`;
      const optimisticProduct: Product = {
        id: tempId,
        store_id: 'rose-valley-kannauj',
        name: formData.name.trim(),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
        description: formData.description,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : undefined,
        stock: Number(formData.stock) || 0,
        images: imagesArray,
        scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
        ingredients,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        categories: selectedCats,
        variants: formattedVariants,
        created_at: new Date().toISOString(),
      };

      // INSTANT UI UPDATE (0ms)
      setIsAddModalOpen(false);
      setProducts((prev) => [optimisticProduct, ...prev]);
      showToast('success', `Product "${formData.name}" created!`);

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
        variants: formattedVariants,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        throw new Error(data.error || 'Failed to create product');
      }

      if (data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...data.product, categories: selectedCats } : p))
        );
      }
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
      const selectedCats = categoriesList.filter((c) => formData.selectedCategoryIds.includes(c.id));
      const formattedVariants = (formData.variants || []).map((v) => ({
        id: v.id,
        name: v.name.trim(),
        sku: v.sku ? v.sku.trim() : undefined,
        price: Number(v.price) || 0,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : undefined,
        stock: Number(v.stock) || 0,
      }));

      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : undefined,
        stock: Number(formData.stock) || 0,
        images: imagesArray,
        scent_notes: { top: topNotes, heart: heartNotes, base: baseNotes },
        ingredients,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        categories: selectedCats,
        variants: formattedVariants,
      };

      // INSTANT UI UPDATE (0ms)
      setEditingProduct(null);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      showToast('success', `Product "${formData.name}" updated!`);

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
        variants: formattedVariants,
      };

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFlag = async (product: Product, field: 'is_featured' | 'is_bestseller') => {
    const newValue = !product[field];

    // INSTANT UI UPDATE (0ms)
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: newValue } : p))
    );
    showToast(
      'success',
      `Updated ${product.name}: ${field === 'is_featured' ? 'Featured' : 'Bestseller'} is now ${newValue ? 'ON' : 'OFF'}`
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle status');
      }
    } catch (err: any) {
      // Revert state on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [field]: !newValue } : p))
      );
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    const target = deletingProduct;
    setDeletingProduct(null);

    // INSTANT UI UPDATE (0ms)
    setProducts((prev) => prev.filter((p) => p.id !== target.id));
    showToast('success', `Product "${target.name}" deleted.`);

    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      // Revert on error
      setProducts((prev) => [target, ...prev]);
      showToast('error', err.message || 'Failed to delete product.');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    const timestamp = Date.now().toString().slice(-4);
    const duplicateName = `${product.name} (Copy)`;
    const duplicateSlug = `${product.slug}-copy-${timestamp}`;
    const tempId = `temp-${Date.now()}`;

    const optimisticProduct: Product = {
      ...product,
      id: tempId,
      name: duplicateName,
      slug: duplicateSlug,
      is_featured: false,
      is_bestseller: false,
      created_at: new Date().toISOString(),
    };

    // INSTANT UI UPDATE (0ms)
    setProducts((prev) => [optimisticProduct, ...prev]);
    showToast('success', `Product "${duplicateName}" duplicated!`);

    try {
      const payload = {
        name: duplicateName,
        slug: duplicateSlug,
        description: product.description || '',
        price: Number(product.price) || 0,
        compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
        stock: Number(product.stock) || 0,
        images: product.images || [],
        scent_notes: product.scent_notes || { top: [], heart: [], base: [] },
        ingredients: product.ingredients || [],
        is_featured: false,
        is_bestseller: false,
        meta_title: product.meta_title ? `${product.meta_title} (Copy)` : '',
        meta_description: product.meta_description || '',
        category_ids: product.categories ? product.categories.map((c) => c.id) : [],
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        throw new Error(data.error || 'Failed to duplicate product');
      }

      if (data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...data.product, categories: product.categories || [] } : p))
        );
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to duplicate product.');
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

  // CSV Export
  const handleExportCsv = () => {
    window.open('/api/admin/products/export', '_blank');
  };

  // Sample CSV Template Downloader
  const handleDownloadSampleCsv = () => {
    const headers = [
      'name',
      'slug',
      'price',
      'compare_at_price',
      'stock',
      'categories',
      'top_notes',
      'heart_notes',
      'base_notes',
      'ingredients',
      'description',
      'is_featured',
      'is_bestseller',
      'meta_title',
      'meta_description',
      'variants'
    ];

    const sampleRows = [
      [
        'Ruh Gulab (Pure Damask Rose)',
        'ruh-gulab-pure-rose',
        '3800',
        '4500',
        '40',
        'Pure Essential Oils; Artisanal Perfumes',
        'Kannauj Damask Rose, Morning Dew',
        'Bulgarian Rose Petals, Saffron',
        'Sandalwood, Ambergris',
        'Pure Rosa Damascena Extract, Indian Sandalwood Oil',
        'Authentic hydro-distilled Ruh Gulab from 400-year copper Degs in Kannauj.',
        'TRUE',
        'TRUE',
        'Ruh Gulab Pure Damask Rose | Kannauj Hydro-Distillate',
        'Experience authentic 100% pure alcohol-free Ruh Gulab oil from Kannauj.',
        '10ml Attar Bottle|RG-10ML|3800|4500|20; 50ml Luxury Flacon|RG-50ML|14500|16000|10; 100ml Collector Bottle|RG-100ML|27000|30000|5'
      ],
      [
        'Royal Assam Oud & Amber',
        'royal-assam-oud-amber',
        '4999',
        '5999',
        '25',
        'Artisanal Perfumes',
        'Cardamom, Bergamot',
        'Aged Assam Agarwood, Saffron',
        'Smoky Amber, Vetiver, Mysore Sandalwood',
        'Aquilaria Agallocha Wood Extract, Sandalwood Essential Oil',
        'Exquisite 12-year aged wild Assam Agarwood steeped with golden fossilized amber.',
        'TRUE',
        'FALSE',
        'Royal Assam Oud & Amber | Pure Luxury Attar',
        'A rich woody and amber fragrance handcrafted with rare aged Assam Agarwood.',
        '10ml Roll-On|RAO-10ML|4999|5999|15; 30ml Crystal Decanter|RAO-30ML|12500|14000|10'
      ]
    ];

    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_products_with_variants_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Sample CSV template downloaded!');
  };

  // CSV Import File Handler
  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImportCsvText((ev.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Multi-select helpers
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));
  const isSomeSelected =
    filteredProducts.some((p) => selectedProductIds.includes(p.id)) && !isAllSelected;

  const handleToggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const combined = new Set([...selectedProductIds, ...filteredProducts.map((p) => p.id)]);
      setSelectedProductIds(Array.from(combined));
    }
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  // Bulk Delete Submit Handler
  const handleBulkDeleteSubmit = async () => {
    if (selectedProductIds.length === 0) return;
    const countToDelete = selectedProductIds.length;
    const idsToDelete = [...selectedProductIds];
    setIsBulkDeleting(true);

    // Optimistic instant UI update
    const deletedSet = new Set(idsToDelete);
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => !deletedSet.has(p.id)));
    setSelectedProductIds([]);
    setIsBulkDeleteModalOpen(false);

    showToast('success', `Deleting ${countToDelete} selected product(s)...`);

    try {
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: idsToDelete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete selected products');
      showToast('success', `✨ Successfully deleted ${data.deletedCount || countToDelete} product(s)!`);
      fetchProducts(false);
    } catch (err: any) {
      // Revert state on error
      setProducts(previousProducts);
      setSelectedProductIds(idsToDelete);
      showToast('error', err.message || 'Failed to delete selected products');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // CSV Import Submit
  const handleImportCsvSubmit = async () => {
    if (!importCsvText.trim()) {
      showToast('error', 'Please upload a CSV file or paste CSV content.');
      return;
    }
    try {
      setIsImporting(true);
      setImportErrors([]);
      setLastImportSummary(null);
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: importCsvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import CSV');

      const updated = data.updatedCount ?? 0;
      const created = data.createdCount ?? 0;
      const total = data.totalProcessed ?? data.count ?? (updated + created);

      setLastImportSummary({
        updatedCount: updated,
        createdCount: created,
        totalProcessed: total,
      });

      showToast(
        'success',
        `✨ Import completed: ${updated} updated, ${created} created (${total} total processed)!`
      );

      if (data.errors && data.errors.length > 0) {
        setImportErrors(data.errors);
      } else {
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportCsvText('');
          setImportCsvFileName('');
        }, 2200);
      }
      fetchProducts(false);
    } catch (err: any) {
      showToast('error', err.message || 'CSV Import Error');
    } finally {
      setIsImporting(false);
    }
  };

  // Bulk Image Assign Handlers
  const handleBulkImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('success', 'Uploading and processing image...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }

      setBulkImageUrl(data.url);
      showToast('success', 'Single image uploaded and ready for bulk assignment!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload image file.');
    }
  };


  const handleGenerateBulkAIImage = async () => {
    try {
      setIsGeneratingBulkAIImage(true);
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'banner_image',
          prompt: 'Luxury Rose Valley Kannauj pure botanical perfume and attar crystal bottle with golden cap on silk background',
        }),
      });
      const data = await res.json();
      if (data.url) {
        setBulkImageUrl(data.url);
        showToast('success', '✨ AI Luxury Perfume placeholder image generated!');
      } else {
        throw new Error(data.error || 'AI Generation failed');
      }
    } catch (err: any) {
      setBulkImageUrl('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80');
      showToast('success', '✨ Assigned High-Definition Luxury Attar Image!');
    } finally {
      setIsGeneratingBulkAIImage(false);
    }
  };

  const handleBulkImageSubmit = async () => {
    if (!bulkImageUrl.trim()) {
      showToast('error', 'Please enter or upload an Image URL first.');
      return;
    }
    try {
      setIsApplyingBulkImage(true);
      const res = await fetch('/api/admin/products/bulk-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: bulkImageUrl.trim(),
          target: bulkImageTarget,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply bulk image');

      // 0ms instant optimistic update
      setProducts((prev) =>
        prev.map((p) => {
          if (bulkImageTarget === 'all' || !p.images || p.images.length === 0 || !p.images[0]) {
            return { ...p, images: [bulkImageUrl.trim()] };
          }
          return p;
        })
      );

      showToast('success', `Bulk image assigned to ${data.count} product(s)!`);
      setIsBulkImageModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Bulk Image Error');
    } finally {
      setIsApplyingBulkImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${toastMessage.type === 'success'
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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-all shadow-xs flex items-center gap-2 hover:border-amber-400"
            title="Export Products Catalog to CSV"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setImportErrors([]);
              setImportCsvText('');
              setImportCsvFileName('');
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-all shadow-xs flex items-center gap-2 hover:border-amber-400"
            title="Import Products from CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => {
              setBulkImageUrl('');
              setIsBulkImageModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-all shadow-xs flex items-center gap-2 hover:border-amber-400"
            title="Assign Single Image to All Products"
          >
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Bulk Set Image</span>
          </button>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-xs"
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
        {!mounted || loading ? (
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
                  <th className="py-4 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                      title={isAllSelected ? 'Deselect all products' : 'Select all products'}
                    />
                  </th>
                  <th className="py-4 px-3 w-12 text-center">Order</th>
                  <th className="py-4 px-4">Product / Fragrance</th>
                  <th className="py-4 px-4">Categories</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Badges</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredProducts.map((p, idx) => {
                  const mainImage = p.images && p.images.length > 0 ? p.images[0] : null;
                  const isBeingDragged = draggedProductIndex === idx;
                  const isOver = dragOverProductIndex === idx && !isBeingDragged;
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleProductDragStart(e, idx)}
                      onDragOver={(e) => handleProductDragOver(e, idx)}
                      onDrop={(e) => handleProductDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedProductIndex(null);
                        setDragOverProductIndex(null);
                      }}
                      className={`transition-all duration-200 group ${isSelected
                          ? 'bg-amber-50/70 hover:bg-amber-50'
                          : isBeingDragged
                            ? 'opacity-30 bg-amber-50/50 border-y-2 border-dashed border-amber-600'
                            : isOver
                              ? 'bg-amber-100/60 border-y-2 border-amber-600'
                              : 'hover:bg-stone-50'
                        }`}
                    >
                      {/* Select Checkbox Column */}
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(p.id)}
                          className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                      </td>

                      {/* Drag & Reorder Column */}
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-stone-400">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-stone-200 hover:text-amber-800 transition-colors"
                            title="Drag to change catalog order"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col -space-y-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveProduct(idx, 'up')}
                              className="p-0.5 rounded hover:bg-stone-200 hover:text-amber-800 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === filteredProducts.length - 1}
                              onClick={() => handleMoveProduct(idx, 'down')}
                              className="p-0.5 rounded hover:bg-stone-200 hover:text-amber-800 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Product Image & Name */}
                      <td className="py-4 px-4">
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
                          className={`p-1.5 rounded-lg border transition-all ${p.is_featured
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-amber-800'
                            }`}
                          title="Toggle Featured"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleToggleFlag(p, 'is_bestseller')}
                          className={`p-1.5 rounded-lg border transition-all ${p.is_bestseller
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
                          onClick={() => handleDuplicateProduct(p)}
                          className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300 transition-all shadow-xs"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
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
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isSelected
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

              {/* Product Variants & Sizes Manager Section */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Tags className="w-4 h-4 text-amber-700" /> Product Variants & Sizes
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Add / Edit variants for this product (e.g. 10ml Attar Bottle, 50ml Flacon, 100ml Tester).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {formData.variants.map((v, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-xs"
                      >
                        {/* Variant Name */}
                        <div className="col-span-4 sm:col-span-3">
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Variant Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 10ml Bottle"
                            value={v.name}
                            onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* SKU */}
                        <div className="col-span-3 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">SKU Code</label>
                          <input
                            type="text"
                            placeholder="RVK-10ML"
                            value={v.sku || ''}
                            onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* Price */}
                        <div className="col-span-2 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Price (₹) *</label>
                          <input
                            type="number"
                            required
                            value={v.price}
                            onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* Compare Price */}
                        <div className="col-span-2 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Original (₹)</label>
                          <input
                            type="number"
                            value={v.compare_at_price || ''}
                            onChange={(e) => handleUpdateVariantRow(idx, 'compare_at_price', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* Stock */}
                        <div className="col-span-2 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Stock *</label>
                          <input
                            type="number"
                            required
                            value={v.stock}
                            onChange={(e) => handleUpdateVariantRow(idx, 'stock', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                          />
                        </div>

                        {/* Delete Variant Button */}
                        <div className="col-span-1 flex justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white/80 rounded-xl border border-dashed border-amber-300">
                    <p className="text-xs text-stone-500 font-medium">No variants added yet for this fragrance.</p>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="mt-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
                    >
                      + Add first size variant (e.g. 10ml Bottle)
                    </button>
                  </div>
                )}
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
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${isDragging
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
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isSelected
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

              {/* Product Variants & Sizes Manager Section */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Tags className="w-4 h-4 text-amber-700" /> Product Variants & Sizes
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Add / Edit variants for this product (e.g. 10ml Attar Bottle, 50ml Flacon, 100ml Tester).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {formData.variants.map((v, idx) => {
                      const isBeingDragged = draggedVariantIndex === idx;
                      const isOver = dragOverVariantIndex === idx && !isBeingDragged;

                      return (
                        <div
                          key={idx}
                          draggable
                          onDragStart={(e) => handleVariantDragStart(e, idx)}
                          onDragOver={(e) => handleVariantDragOver(e, idx)}
                          onDrop={(e) => handleVariantDrop(e, idx)}
                          onDragEnd={() => {
                            setDraggedVariantIndex(null);
                            setDragOverVariantIndex(null);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl bg-white border transition-all duration-200 ${isBeingDragged
                              ? 'opacity-40 border-dashed border-amber-600 scale-[0.98]'
                              : isOver
                                ? 'border-2 border-amber-600 shadow-md bg-amber-50/40'
                                : 'border-amber-200/80 shadow-xs hover:border-amber-300'
                            }`}
                        >
                          {/* Drag Handle & Reorder Arrows */}
                          <div className="flex items-center gap-1 text-stone-400 select-none">
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-stone-100 hover:text-amber-700 transition-colors"
                              title="Drag to change order"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col -space-y-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveVariant(idx, 'up')}
                                className="p-0.5 rounded hover:bg-stone-100 hover:text-amber-800 disabled:opacity-20 disabled:hover:bg-transparent"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (formData.variants?.length || 1) - 1}
                                onClick={() => handleMoveVariant(idx, 'down')}
                                className="p-0.5 rounded hover:bg-stone-100 hover:text-amber-800 disabled:opacity-20 disabled:hover:bg-transparent"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-stone-400 w-3 text-center">
                              {idx + 1}
                            </span>
                          </div>

                          {/* Variant Input Grid */}
                          <div className="grid grid-cols-12 gap-2 flex-1 items-center">
                            {/* Variant Name */}
                            <div className="col-span-4 sm:col-span-3">
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Variant Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. 10ml Bottle"
                                value={v.name}
                                onChange={(e) => handleUpdateVariantRow(idx, 'name', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>

                            {/* SKU */}
                            <div className="col-span-3 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">SKU Code</label>
                              <input
                                type="text"
                                placeholder="RVK-10ML"
                                value={v.sku || ''}
                                onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                              />
                            </div>

                            {/* Price */}
                            <div className="col-span-2 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Price (₹) *</label>
                              <input
                                type="number"
                                required
                                value={v.price}
                                onChange={(e) => handleUpdateVariantRow(idx, 'price', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>

                            {/* Compare Price */}
                            <div className="col-span-2 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Original (₹)</label>
                              <input
                                type="number"
                                value={v.compare_at_price || ''}
                                onChange={(e) => handleUpdateVariantRow(idx, 'compare_at_price', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>

                            {/* Stock */}
                            <div className="col-span-2 sm:col-span-2">
                              <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Stock *</label>
                              <input
                                type="number"
                                required
                                value={v.stock}
                                onChange={(e) => handleUpdateVariantRow(idx, 'stock', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                              />
                            </div>

                            {/* Delete Variant Button */}
                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantRow(idx)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                                title="Remove Variant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white/80 rounded-xl border border-dashed border-amber-300">
                    <p className="text-xs text-stone-500 font-medium">No variants added yet for this fragrance.</p>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="mt-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
                    >
                      + Add first size variant (e.g. 10ml Bottle)
                    </button>
                  </div>
                )}
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
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${isDragging
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

      {/* BULK SELECTION FLOATING ACTION BAR */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 text-white border border-stone-700 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-4 backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-xs font-black">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-bold text-stone-200">
              {selectedProductIds.length === 1 ? '1 product selected' : `${selectedProductIds.length} products selected`}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-300 transition-all hidden sm:block"
            >
              {isAllSelected ? 'Deselect All' : `Select All (${filteredProducts.length})`}
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-400 hover:text-stone-200 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedProductIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 text-stone-900 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Delete {selectedProductIds.length} Products
                </h3>
                <p className="text-xs text-rose-700 font-bold">This action is permanent.</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 max-h-40 overflow-y-auto space-y-1">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Selected items ({selectedProductIds.length}):
              </p>
              {products
                .filter((p) => selectedProductIds.includes(p.id))
                .slice(0, 10)
                .map((p) => (
                  <div key={p.id} className="text-xs text-stone-800 font-medium truncate flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
              {selectedProductIds.length > 10 && (
                <p className="text-[11px] text-stone-500 font-bold italic pt-1">
                  ...and {selectedProductIds.length - 10} more items
                </p>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Are you sure you want to delete these {selectedProductIds.length} products? All variants, price configurations, and category associations will be permanently removed.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteSubmit}
                disabled={isBulkDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isBulkDeleting ? 'Deleting...' : `Yes, Delete (${selectedProductIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT MODAL (SINGLE ITEM) */}
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

      {/* BULK IMPORT CSV MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-stone-900 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">Fast Bulk Import Products</h3>
                  <p className="text-xs text-stone-500 font-medium">Upload or paste CSV with pricing, categories, scent notes & variants.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setLastImportSummary(null);
                }}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real-time Import Results Summary */}
            {lastImportSummary && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Import Completed Successfully!</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Updated</div>
                    <div className="text-xl font-extrabold text-amber-700 mt-0.5">{lastImportSummary.updatedCount}</div>
                    <div className="text-[10px] text-stone-400">Existing products</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">New Created</div>
                    <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{lastImportSummary.createdCount}</div>
                    <div className="text-[10px] text-stone-400">Fresh products</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Total Processed</div>
                    <div className="text-xl font-extrabold text-stone-900 mt-0.5">{lastImportSummary.totalProcessed}</div>
                    <div className="text-[10px] text-stone-400">Catalog entries</div>
                  </div>
                </div>
              </div>
            )}

            {/* Template Download Banner */}
            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-[#4A0D25]">Need the standard CSV layout?</h4>
                <p className="text-[11px] text-stone-600 font-medium">Download sample template with Kannauj perfume rows and multiple variant sizes.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB]/40 font-black text-xs flex items-center gap-1.5 shadow-2xs transition-all whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample CSV
              </button>
            </div>

            {/* CSV File Upload Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Select CSV File from Computer</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#F7D1D8] hover:border-[#F6A6BB] rounded-2xl p-6 cursor-pointer bg-[#FAE6E7]/30 hover:bg-[#FAE6E7]/60 transition-all group">
                <UploadCloud className="w-8 h-8 text-[#F6A6BB] group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs font-bold text-stone-800">
                  {importCsvFileName ? importCsvFileName : 'Click or Drag & Drop .CSV file here'}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-0.5">High-speed parallel batch processing enabled</span>
                <input type="file" accept=".csv" onChange={handleCsvFileSelect} className="hidden" />
              </label>
            </div>

            {/* Direct Paste Raw CSV Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">Or Paste Raw CSV Data</label>
                {importCsvText && (
                  <span className="text-[11px] text-emerald-700 font-bold">
                    {importCsvText.split('\n').filter(Boolean).length} rows ready
                  </span>
                )}
              </div>
              <textarea
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder="name,slug,price,compare_at_price,stock,categories,top_notes,heart_notes,base_notes,ingredients,description,is_featured,is_bestseller,meta_title,meta_description,variants&#10;Ruh Gulab,ruh-gulab,3800,4500,40,Pure Essential Oils,Damask Rose,Bulgarian Rose,Sandalwood,Rosa Damascena,Pure Kannauj Ruh Gulab,TRUE,TRUE,Ruh Gulab,Best pure rose oil,10ml Bottle|RG-10ML|3800|4500|20; 50ml Flacon|RG-50ML|14500|16000|10"
                rows={5}
                className="w-full p-3 rounded-2xl border border-stone-300 font-mono text-[11px] text-stone-900 focus:ring-2 focus:ring-[#F6A6BB] focus:outline-none"
              />
            </div>

            {/* Import Errors if any */}
            {importErrors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                  <AlertCircle className="w-4 h-4" /> Import Warnings ({importErrors.length}):
                </div>
                <ul className="text-[11px] text-rose-600 list-disc list-inside max-h-24 overflow-y-auto space-y-0.5 font-medium">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setLastImportSummary(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleImportCsvSubmit}
                disabled={isImporting || !importCsvText.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {isImporting ? 'Importing Products (Fast Mode)...' : 'Execute Fast Bulk Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ASSIGN SINGLE IMAGE MODAL */}
      {isBulkImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-stone-900 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">Bulk Assign Product Image</h3>
                  <p className="text-xs text-stone-500 font-medium">Assign a single image to all products to resolve missing images at once.</p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkImageModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">Apply Scope</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setBulkImageTarget('missing_only')}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${bulkImageTarget === 'missing_only'
                      ? 'border-[#F6A6BB] bg-[#FAE6E7]/50 text-[#1A0510]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                >
                  <input
                    type="radio"
                    name="bulkImageTarget"
                    checked={bulkImageTarget === 'missing_only'}
                    onChange={() => setBulkImageTarget('missing_only')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold block text-stone-900">Only Missing Images</span>
                    <span className="text-[11px] text-stone-500 font-medium">Leaves existing product photos intact</span>
                  </div>
                </label>

                <label
                  onClick={() => setBulkImageTarget('all')}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${bulkImageTarget === 'all'
                      ? 'border-[#F6A6BB] bg-[#FAE6E7]/50 text-[#1A0510]'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                >
                  <input
                    type="radio"
                    name="bulkImageTarget"
                    checked={bulkImageTarget === 'all'}
                    onChange={() => setBulkImageTarget('all')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <span className="text-xs font-bold block text-stone-900">All Products</span>
                    <span className="text-[11px] text-stone-500 font-medium">Overwrites image across all {products.length} products</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Image Input Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-700 block">Select or Paste Image</label>

              <div className="flex flex-wrap gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5" /> Upload from Computer
                  <input type="file" accept="image/*" onChange={handleBulkImageFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleGenerateBulkAIImage}
                  disabled={isGeneratingBulkAIImage}
                  className="px-3.5 py-2 rounded-xl bg-[#FAE6E7] hover:bg-[#F6A6BB]/40 border border-[#F7D1D8] text-[#4A0D25] text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-[#F6A6BB] ${isGeneratingBulkAIImage ? 'animate-spin' : ''}`} />
                  {isGeneratingBulkAIImage ? 'Generating AI Image...' : '✨ AI Luxury Image'}
                </button>
              </div>

              <input
                type="text"
                value={bulkImageUrl}
                onChange={(e) => setBulkImageUrl(e.target.value)}
                placeholder="Or paste image URL (e.g. /images/rvk-logo.png or https://...)"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#F6A6BB] focus:outline-none font-medium"
              />
            </div>

            {/* Live Image Preview */}
            {bulkImageUrl && (
              <div className="p-3 rounded-2xl bg-[#FAE6E7]/40 border border-[#F7D1D8] flex items-center gap-4">
                <img
                  src={bulkImageUrl}
                  alt="Bulk Assign Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-[#F7D1D8] shadow-xs flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#4A0D25]">Image Preview Ready</p>
                  <p className="text-[11px] text-stone-500 truncate font-mono">{bulkImageUrl.slice(0, 60)}...</p>
                </div>
                <button
                  onClick={() => setBulkImageUrl('')}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  title="Clear Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsBulkImageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImageSubmit}
                disabled={isApplyingBulkImage || !bulkImageUrl.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                {isApplyingBulkImage ? 'Assigning Images...' : 'Apply Image to Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
