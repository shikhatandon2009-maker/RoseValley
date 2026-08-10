'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  UserX,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  DollarSign,
  Sparkles,
  ExternalLink,
  Bell
} from 'lucide-react';

interface CartItemRow {
  id: string;
  store_id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  products?: { id: string; name: string; price: number; images?: string[]; slug: string };
  product_variants?: { id: string; name: string; price: number; size?: string };
  users?: { id: string; full_name: string; email: string; phone?: string };
}

interface Stats {
  totalCartItemsCount: number;
  registeredCount: number;
  guestCount: number;
  totalActiveCarts: number;
  totalCartValue: number;
}

export default function LiveCartItemsAdminPage() {
  const [cartItems, setCartItems] = useState<CartItemRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCartItemsCount: 0,
    registeredCount: 0,
    guestCount: 0,
    totalActiveCarts: 0,
    totalCartValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'registered' | 'guest'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchLiveCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/cart-items?user_type=${userTypeFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch cart items');

      setCartItems(data.cartItems || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading live carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCarts();
  }, [userTypeFilter]);

  const filteredCartItems = useMemo(() => {
    if (!search.trim()) return cartItems;
    const term = search.toLowerCase().trim();
    return cartItems.filter(
      (ci) =>
        ci.products?.name.toLowerCase().includes(term) ||
        (ci.users?.full_name && ci.users.full_name.toLowerCase().includes(term)) ||
        (ci.users?.email && ci.users.email.toLowerCase().includes(term)) ||
        (ci.session_id && ci.session_id.toLowerCase().includes(term))
    );
  }, [cartItems, search]);

  const handleDeleteCartItem = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/cart-items?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove cart item');

      showToast('success', 'Cart item removed.');
      fetchLiveCarts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove cart item.');
    } finally {
      setDeletingId(null);
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
            <ShoppingCart className="w-4 h-4 text-[#F6A6BB]" /> Sales & Real-Time Activity
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#1A0510] mt-1">
            Live Cart Items (Customer & Visitor Wise)
          </h1>
          <p className="text-[#4A0D25] text-xs sm:text-sm mt-1 font-bold">
            Monitor active shopping carts, registered user profiles vs. guest visitor sessions, abandoned cart values, and item quantities in real time.
          </p>
        </div>

        <button
          onClick={fetchLiveCarts}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#FAE6E7] font-black text-xs transition-all flex items-center gap-2 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F6A6BB]' : ''}`} /> Refresh Live Feed
        </button>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Total Live Cart Value</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-800 mt-1">
              ₹{stats.totalCartValue.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Active Carts</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.totalActiveCarts} Carts</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Registered User Carts</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A0D25] mt-1">{stats.registeredCount} Items</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Guest Visitor Carts</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-purple-900 mt-1">{stats.guestCount} Items</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 text-purple-900 border border-purple-300">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, email, or session ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A0510]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Cart Owner Filter:</span>
          <select
            value={userTypeFilter}
            onChange={(e: any) => setUserTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
          >
            <option value="all">All Carts ({stats.totalCartItemsCount} Items)</option>
            <option value="registered">Registered Users Only ({stats.registeredCount})</option>
            <option value="guest">Guest Visitors Only ({stats.guestCount})</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-[#F7D1D8] bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
            <p className="text-xs text-[#4A0D25] font-bold">Loading live cart items from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <button
              onClick={fetchLiveCarts}
              className="px-4 py-2 rounded-xl bg-[#FAE6E7] text-xs text-[#4A0D25] font-black hover:bg-[#F6A6BB]"
            >
              Retry
            </button>
          </div>
        ) : filteredCartItems.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <ShoppingCart className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-extrabold text-[#1A0510]">No active cart items</h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto font-bold">
              {search
                ? `No cart items matching search term "${search}".`
                : 'There are currently no active items sitting in shopping carts.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A0510]">
              <thead className="bg-[#FAE6E7]/80 text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                <tr>
                  <th className="py-4 px-6">Cart Owner (User / Guest)</th>
                  <th className="py-4 px-4">Fragrance Product & Variant</th>
                  <th className="py-4 px-4">Unit Price</th>
                  <th className="py-4 px-4 text-center">Qty</th>
                  <th className="py-4 px-4 font-right">Subtotal</th>
                  <th className="py-4 px-4">Last Activity</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8]">
                {filteredCartItems.map((ci) => {
                  const isRegistered = Boolean(ci.user_id && ci.users);
                  const price = ci.product_variants?.price || ci.products?.price || 0;
                  const subtotal = Number(price) * ci.quantity;
                  const mainImg = ci.products?.images && ci.products.images.length > 0 ? ci.products.images[0] : null;

                  return (
                    <tr key={ci.id} className="hover:bg-[#FAE6E7]/40 transition-colors group">
                      {/* Owner */}
                      <td className="py-4 px-6">
                        {isRegistered ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] font-black text-xs shadow-xs">
                              {ci.users?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#1A0510] text-xs sm:text-sm flex items-center gap-1.5">
                                {ci.users?.full_name}
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-[9px] font-black uppercase">
                                  User
                                </span>
                              </div>
                              <div className="text-xs text-[#4A0D25] font-bold">{ci.users?.email}</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-extrabold text-[#4A0D25] text-xs flex items-center gap-1.5">
                              <UserX className="w-4 h-4 text-purple-700" /> Guest Visitor Session
                            </div>
                            <div className="font-mono text-xs text-stone-600 font-bold mt-0.5 max-w-[170px] truncate">
                              ID: {ci.session_id || 'anonymous_guest'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {mainImg ? (
                            <img
                              src={mainImg}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-[#F7D1D8] bg-[#FAE6E7]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-[#1A0510] text-xs sm:text-sm">
                              {ci.products?.name || 'Fragrance Product'}
                            </div>
                            {ci.product_variants?.name && (
                              <div className="text-xs text-[#4A0D25] font-bold">
                                Variant: {ci.product_variants.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-4 font-bold text-[#1A0510] text-xs sm:text-sm">
                        ₹{Number(price).toLocaleString()}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] font-black text-[#4A0D25] text-xs shadow-xs">
                          {ci.quantity}
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-4 px-4 font-black text-[#4A0D25] text-sm sm:text-base">
                        ₹{subtotal.toLocaleString()}
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-4 text-stone-600 font-bold text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" />
                          {new Date(ci.updated_at || ci.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteCartItem(ci.id)}
                          disabled={deletingId === ci.id}
                          className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all shadow-xs disabled:opacity-50"
                          title="Remove Cart Item"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
