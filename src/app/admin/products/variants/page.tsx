'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Tag,
  Boxes
} from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  images?: string[];
}

interface Variant {
  id: string;
  store_id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  size?: string;
  created_at: string;
  products?: ProductOption;
}

export default function ProductVariantsAdminPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null);

  // Form
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    sku: '',
    price: '' as string | number,
    compare_at_price: '' as string | number,
    stock: 10 as string | number,
    size: '50ml',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProductsList = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (res.ok) setProductsList(data.products || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/products/variants?search=${encodeURIComponent(search)}`;
      if (productFilter !== 'all') url += `&product_id=${productFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch variants');

      setVariants(data.variants || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [productFilter]);

  const filteredVariants = useMemo(() => {
    if (!search.trim()) return variants;
    const term = search.toLowerCase().trim();
    return variants.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        (v.sku && v.sku.toLowerCase().includes(term)) ||
        (v.size && v.size.toLowerCase().includes(term)) ||
        (v.products?.name && v.products.name.toLowerCase().includes(term))
    );
  }, [variants, search]);

  const handleOpenAddModal = () => {
    setFormData({
      product_id: productsList.length > 0 ? productsList[0].id : '',
      name: '50ml Eau de Parfum Bottle',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      price: '3499',
      compare_at_price: '4499',
      stock: 25,
      size: '50ml',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (v: Variant) => {
    setEditingVariant(v);
    setFormData({
      product_id: v.product_id,
      name: v.name,
      sku: v.sku || '',
      price: v.price,
      compare_at_price: v.compare_at_price || '',
      stock: v.stock,
      size: v.size || '',
    });
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.name || !formData.price) {
      showToast('error', 'Product selection, Variant Name, and Price are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/products/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create variant');

      showToast('success', `Variant "${formData.name}" created successfully!`);
      setIsAddModalOpen(false);
      fetchVariants();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create variant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/products/variants/${editingVariant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update variant');

      showToast('success', `Variant "${formData.name}" updated successfully.`);
      setEditingVariant(null);
      fetchVariants();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update variant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!deletingVariant) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/products/variants/${deletingVariant.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete variant');

      showToast('success', `Variant "${deletingVariant.name}" deleted.`);
      setDeletingVariant(null);
      fetchVariants();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete variant.');
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
            <Link href="/admin/products" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Products
            </Link>
            <span>/</span>
            <span>Variants</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Product Variants & Volume Sizes
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Manage volume sizes (10ml Roll-On, 50ml Eau de Parfum, 100ml Extrait), SKUs, prices & stock per variant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchVariants}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Variants"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by variant name, SKU, or size..."
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
          <span className="text-xs text-stone-600 font-bold">Filter Product:</span>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
          >
            <option value="all">All Products</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-[#F7D1D8] bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
            <p className="text-xs text-[#4A0D25] font-bold">Loading product variants...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <button
              onClick={fetchVariants}
              className="px-4 py-2 rounded-xl bg-[#FAE6E7] text-xs text-[#4A0D25] font-black hover:bg-[#F6A6BB]"
            >
              Retry
            </button>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Layers className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-extrabold text-[#1A0510]">No variants found</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto font-bold">
              {search
                ? `No variants matching search term "${search}".`
                : 'No product variants created yet. Click "Add Variant" to create bottle sizes.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A0510]">
              <thead className="bg-[#FAE6E7]/80 text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                <tr>
                  <th className="py-4 px-6">Parent Fragrance Product</th>
                  <th className="py-4 px-4">Variant Name</th>
                  <th className="py-4 px-4">SKU / Code</th>
                  <th className="py-4 px-4">Size</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8]">
                {filteredVariants.map((v) => (
                  <tr key={v.id} className="hover:bg-[#FAE6E7]/40 transition-colors group">
                    {/* Parent Product */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#F6A6BB]" />
                        <span className="font-extrabold text-[#1A0510]">
                          {v.products?.name || 'Unknown Product'}
                        </span>
                      </div>
                    </td>

                    {/* Variant Name */}
                    <td className="py-4 px-4 font-extrabold text-[#4A0D25]">{v.name}</td>

                    {/* SKU */}
                    <td className="py-4 px-4 font-mono text-xs text-stone-600 font-bold">
                      {v.sku || <span className="text-stone-400 italic">No SKU</span>}
                    </td>

                    {/* Size */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] font-black text-[#4A0D25] text-xs shadow-xs">
                        {v.size || 'N/A'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-extrabold text-[#1A0510] text-xs sm:text-sm">
                      ₹{Number(v.price).toLocaleString()}
                      {v.compare_at_price && Number(v.compare_at_price) > Number(v.price) && (
                        <span className="ml-1.5 text-xs text-stone-500 line-through font-normal">
                          ₹{Number(v.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4">
                      {v.stock < 10 ? (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-black">
                          {v.stock} left
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
                          {v.stock} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                        title="Edit Variant"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingVariant(v)}
                        className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all shadow-xs"
                        title="Delete Variant"
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

      {/* CREATE VARIANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Add Product Variant</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVariant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Parent Product *</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                >
                  <option value="" disabled>
                    Select Product...
                  </option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 50ml EDP Spray, 10ml Roll-On"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-ROSE-50ML"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Volume / Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="50ml, 100ml, 10ml"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Variant Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                  {isSubmitting ? 'Creating...' : 'Save Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VARIANT MODAL */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Edit Product Variant</h2>
              </div>
              <button onClick={() => setEditingVariant(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVariant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Volume / Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Compare Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Variant Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
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

      {/* DELETE VARIANT MODAL */}
      {deletingVariant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Variant</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingVariant.name}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this variant? Customers will no longer be able to select this volume size on product pages.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingVariant(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVariant}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Variant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
