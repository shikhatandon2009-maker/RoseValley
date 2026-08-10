'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Copy,
  Clock,
  Zap
} from 'lucide-react';

interface Coupon {
  id: string;
  store_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  totalCoupons: number;
  activeCouponsCount: number;
  percentageRulesCount: number;
  expiredCouponsCount: number;
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCoupons: 0,
    activeCouponsCount: 0,
    percentageRulesCount: 0,
    expiredCouponsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  // Form
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '' as string | number,
    min_spend: 0 as string | number,
    expiry_date: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/coupons?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch coupons');

      setCoupons(data.coupons || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const filteredCoupons = useMemo(() => {
    if (!search.trim()) return coupons;
    const term = search.toLowerCase().trim();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.discount_type.toLowerCase().includes(term)
    );
  }, [coupons, search]);

  const handleGenerateRandomCode = () => {
    const prefixes = ['ROYAL', 'KANNAUJ', 'ESSENCE', 'LUXE', 'ATTAR'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${prefix}${num}` }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      code: 'ROYAL15',
      discount_type: 'percentage',
      discount_value: 15,
      min_spend: 2500,
      expiry_date: '',
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_spend: c.min_spend || 0,
      expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : '',
      is_active: c.is_active,
    });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discount_value) {
      showToast('error', 'Coupon code and discount value are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');

      showToast('success', `Coupon "${formData.code.toUpperCase()}" created successfully!`);
      setIsAddModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');

      showToast('success', `Coupon "${formData.code}" updated successfully.`);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !c.is_active }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle status');

      showToast('success', `Coupon ${c.code} is now ${!c.is_active ? 'ACTIVE' : 'INACTIVE'}`);
      fetchCoupons();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update coupon.');
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/coupons/${deletingCoupon.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');

      showToast('success', `Coupon "${deletingCoupon.code}" deleted.`);
      setDeletingCoupon(null);
      fetchCoupons();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete coupon.');
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
            <Ticket className="w-4 h-4" /> Promotions & Discounts
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Coupons & Discount Rules
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Create promotional codes, percentage / flat rate discounts, minimum spend thresholds, and expiry rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Promo Codes</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalCoupons}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Active & Redeemable</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.activeCouponsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Percentage % Rules</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{stats.percentageRulesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Expired Rules</div>
            <div className="text-2xl font-bold font-serif text-rose-700 mt-1">{stats.expiredCouponsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-5 h-5" />
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
            placeholder="Search by coupon code..."
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
          <span className="text-xs text-stone-600 font-bold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
          >
            <option value="all">All Coupons</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading coupon codes from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchCoupons}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Ticket className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No coupon codes found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No coupons matching search term "${search}".`
                : 'No discount coupons created yet. Click "Create Coupon" to launch a promotional code.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Promo Code</th>
                  <th className="py-4 px-4">Discount Value</th>
                  <th className="py-4 px-4">Min Spend Threshold</th>
                  <th className="py-4 px-4">Expiry Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredCoupons.map((c) => {
                  const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();

                  return (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors group">
                      {/* Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-stone-100 border border-stone-300 text-amber-800 font-mono font-bold text-xs tracking-wider shadow-xs">
                            {c.code}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4">
                        {c.discount_type === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 text-sm">
                            <Percent className="w-4 h-4 text-amber-700" /> {c.discount_value}% OFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-sm">
                            ₹{Number(c.discount_value).toLocaleString()} OFF
                          </span>
                        )}
                      </td>

                      {/* Min Spend */}
                      <td className="py-4 px-4 text-stone-700 font-medium">
                        {c.min_spend && Number(c.min_spend) > 0 ? (
                          <span>Min Spend ₹{Number(c.min_spend).toLocaleString()}</span>
                        ) : (
                          <span className="text-stone-400 italic">No Minimum</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-4 px-4 text-stone-600 text-[11px] font-medium">
                        {c.expiry_date ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {new Date(c.expiry_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {isExpired && (
                              <span className="ml-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                                EXPIRED
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Never Expires</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            c.is_active
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-stone-100 text-stone-500 border-stone-200'
                          }`}
                        >
                          {c.is_active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCoupon(c)}
                          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                          title="Delete Coupon"
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

      {/* CREATE COUPON MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Create Coupon Code</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-300">Coupon Code *</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" /> Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. ROYAL15"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="percentage">Percentage (%) OFF</option>
                    <option value="fixed">Fixed Amount (₹) OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Discount Value ({formData.discount_type === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === 'percentage' ? '15' : '500'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Minimum Spend (₹)</label>
                  <input
                    type="number"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="add_coupon_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 bg-neutral-900 border-neutral-800"
                />
                <label htmlFor="add_coupon_active" className="text-xs text-neutral-300">
                  Activate coupon immediately for checkout redemption
                </label>
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
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Edit Coupon</h2>
              </div>
              <button onClick={() => setEditingCoupon(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="percentage">Percentage (%) OFF</option>
                    <option value="fixed">Fixed Amount (₹) OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Minimum Spend (₹)</label>
                  <input
                    type="number"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit_coupon_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-amber-500 bg-neutral-900 border-neutral-800"
                />
                <label htmlFor="edit_coupon_active" className="text-xs text-neutral-300">
                  Active status
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
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

      {/* DELETE COUPON MODAL */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Coupon Code</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingCoupon.code}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this coupon? Customers will no longer be able to enter this promotional code at checkout.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingCoupon(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCoupon}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
