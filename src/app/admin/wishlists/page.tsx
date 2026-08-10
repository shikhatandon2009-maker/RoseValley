'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  RefreshCw,
  Search,
  Users,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Sparkles,
  ExternalLink,
  Flame,
  Calendar
} from 'lucide-react';

interface WishlistItem {
  id: string;
  store_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  users?: { id: string; full_name: string; email: string; phone?: string };
  products?: { id: string; name: string; price: number; images?: string[]; slug: string };
}

interface LeaderboardItem {
  product: { id: string; name: string; price: number; images?: string[]; slug: string };
  count: number;
}

interface Stats {
  totalWishlistEntries: number;
  uniqueUsersCount: number;
  leaderboard: LeaderboardItem[];
}

export default function WishlistsAdminPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWishlistEntries: 0,
    uniqueUsersCount: 0,
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/wishlists?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch wishlists');

      setWishlists(data.wishlists || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading wishlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlists();
  }, []);

  const filteredWishlists = useMemo(() => {
    if (!search.trim()) return wishlists;
    const term = search.toLowerCase().trim();
    return wishlists.filter(
      (w) =>
        w.products?.name.toLowerCase().includes(term) ||
        (w.users?.full_name && w.users.full_name.toLowerCase().includes(term)) ||
        (w.users?.email && w.users.email.toLowerCase().includes(term))
    );
  }, [wishlists, search]);

  const handleDeleteWishlist = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/wishlists?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove wishlist entry');

      showToast('success', 'Wishlist entry removed.');
      fetchWishlists();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove wishlist entry.');
    } finally {
      setDeletingId(null);
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
            <Heart className="w-4 h-4" /> Customer Demand Analytics
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Customer Wishlists & Saved Fragrances
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Track saved products, customer wishlists, and perfume popularity leaderboards across registered users.
          </p>
        </div>

        <button
          onClick={fetchWishlists}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 self-start sm:self-auto shadow-sm"
          title="Refresh Wishlists"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Metrics & Leaderboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-500 font-bold">Total Saved Items</div>
              <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalWishlistEntries}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Heart className="w-5 h-5 fill-amber-500/20" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-500 font-bold">Customers With Active Wishlists</div>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.uniqueUsersCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Most Wishlisted Leaderboard Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-600" /> Most Wishlisted Perfumes Leaderboard
            </div>
            <span className="text-[10px] text-stone-500 font-medium">Top Saved Items</span>
          </div>

          {stats.leaderboard.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">No wishlisted products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.leaderboard.slice(0, 3).map((item, idx) => {
                const img = item.product.images && item.product.images.length > 0 ? item.product.images[0] : null;
                return (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3 relative overflow-hidden"
                  >
                    <span className="absolute top-1 right-2 text-[10px] font-bold text-amber-700 font-serif">
                      #{idx + 1}
                    </span>
                    {img ? (
                      <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-stone-900 text-xs truncate">{item.product.name}</div>
                      <div className="text-[10px] text-amber-700 font-bold mt-0.5">{item.count} Wishlists</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or perfume..."
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
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading wishlists from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchWishlists}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredWishlists.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Heart className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No wishlist entries found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No wishlist entries matching search term "${search}".`
                : 'No wishlisted products saved by customers yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Customer Profile</th>
                  <th className="py-4 px-4">Wishlisted Perfume</th>
                  <th className="py-4 px-4">Product Price</th>
                  <th className="py-4 px-4">Date Saved</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredWishlists.map((w) => {
                  const img = w.products?.images && w.products.images.length > 0 ? w.products.images[0] : null;

                  return (
                    <tr key={w.id} className="hover:bg-stone-50 transition-colors group">
                      {/* Customer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
                            {w.users?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs">
                              {w.users?.full_name || 'Customer'}
                            </div>
                            <div className="text-[11px] text-stone-500 font-medium">{w.users?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-stone-100 shadow-xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 group-hover:text-amber-700">
                              {w.products?.name || 'Fragrance Product'}
                            </div>
                            {w.products?.slug && (
                              <div className="text-[10px] text-amber-800 font-mono font-bold">
                                /{w.products.slug}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-stone-900">
                        ₹{Number(w.products?.price || 0).toLocaleString()}
                      </td>

                      {/* Saved Date */}
                      <td className="py-4 px-4 text-stone-600 text-[11px] font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {new Date(w.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {w.products?.slug && (
                          <Link
                            href={`/products/${w.products.slug}`}
                            target="_blank"
                            className="inline-flex p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                            title="View Product Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteWishlist(w.id)}
                          disabled={deletingId === w.id}
                          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all disabled:opacity-50"
                          title="Remove Wishlist Entry"
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
    </div>
  );
}
