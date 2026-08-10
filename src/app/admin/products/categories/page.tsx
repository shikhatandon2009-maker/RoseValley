'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tags,
  Plus,
  RefreshCw,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  FolderTree,
  Link2
} from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface Mapping {
  store_id: string;
  product_id: string;
  category_id: string;
  products?: { id: string; name: string; slug: string; price: number };
  categories?: { id: string; name: string; slug: string };
}

export default function ProductCategoriesJunctionAdminPage() {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDropdowns = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();

      if (resProd.ok) setProductsList(dataProd.products || []);
      if (resCat.ok) setCategoriesList(dataCat.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/products/categories');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch product-category mappings');

      setMappings(data.mappings || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchMappings();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedProductId(productsList.length > 0 ? productsList[0].id : '');
    setSelectedCategoryId(categoriesList.length > 0 ? categoriesList[0].id : '');
    setIsAddModalOpen(true);
  };

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedCategoryId) {
      showToast('error', 'Please select both a Product and a Category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/products/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProductId,
          category_id: selectedCategoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mapping');

      showToast('success', 'Product mapped to Category successfully!');
      setIsAddModalOpen(false);
      fetchMappings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to map product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMapping = async (productId: string, categoryId: string) => {
    try {
      const res = await fetch(
        `/api/admin/products/categories?product_id=${productId}&category_id=${categoryId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove mapping');

      showToast('success', 'Mapping removed successfully.');
      fetchMappings();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove mapping.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-[#1A0510]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-100 font-bold'
              : 'bg-rose-950 border-rose-500 text-rose-100 font-bold'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#4A0D25] uppercase tracking-wider">
            <Link href="/admin/products" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-[#F6A6BB]" /> Products
            </Link>
            <span>/</span>
            <span>Product Categories</span>
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#1A0510] mt-1">
            Product Categories Junction Matrix
          </h1>
          <p className="text-[#4A0D25] text-xs sm:text-sm mt-1 font-bold">
            Manage many-to-many relationship mappings between perfumes and category taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMappings}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#FAE6E7] transition-all disabled:opacity-50 shadow-xs"
            title="Refresh Mappings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F6A6BB]' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Map Product to Category
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-[#F7D1D8] bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
            <p className="text-xs text-[#4A0D25] font-bold">Loading product-category mappings from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <button
              onClick={fetchMappings}
              className="px-4 py-2 rounded-xl bg-[#FAE6E7] text-xs text-[#4A0D25] font-black hover:bg-[#F6A6BB]"
            >
              Retry
            </button>
          </div>
        ) : mappings.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Tags className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-extrabold text-[#1A0510]">No category mappings found</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto font-bold">
              Click &quot;Map Product to Category&quot; to assign perfumes to fragrance categories.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A0510]">
              <thead className="bg-[#FAE6E7]/80 text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Relationship</th>
                  <th className="py-4 px-4">Assigned Category</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8]">
                {mappings.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#FAE6E7]/40 transition-colors group">
                    {/* Product */}
                    <td className="py-4 px-6 font-extrabold text-[#1A0510]">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#F6A6BB]" />
                        <span>{m.products?.name || `Product ID: ${m.product_id}`}</span>
                      </div>
                    </td>

                    {/* Link Icon */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8] text-xs font-mono font-black">
                        <Link2 className="w-3.5 h-3.5 text-[#F6A6BB]" /> STORE MAPPED
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-extrabold text-[#4A0D25]">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-[#F6A6BB]" />
                        <span>{m.categories?.name || `Category ID: ${m.category_id}`}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteMapping(m.product_id, m.category_id)}
                        className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all shadow-xs"
                        title="Remove Mapping"
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

      {/* CREATE MAPPING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <Tags className="w-5 h-5 text-[#F6A6BB]" />
                </div>
                <h2 className="text-lg font-serif font-extrabold text-[#1A0510]">Map Product to Category</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMapping} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Select Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
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
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Select Category *</label>
                <select
                  required
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                >
                  <option value="" disabled>
                    Select Category...
                  </option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Mapping...' : 'Create Mapping'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
