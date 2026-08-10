'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ListOrdered,
  Search,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';

interface OrderItemRow {
  id: string;
  store_id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product_name: string;
  image_url?: string;
  created_at: string;
  orders?: {
    order_number: string;
    status: string;
    payment_status: string;
    created_at: string;
    guest_email?: string;
  };
}

export default function OrderItemsAdminPage() {
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/orders/items?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch order items');

      setItems(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading order items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase().trim();
    return items.filter(
      (it) =>
        it.product_name.toLowerCase().includes(term) ||
        (it.orders?.order_number && it.orders.order_number.toLowerCase().includes(term)) ||
        (it.orders?.guest_email && it.orders.guest_email.toLowerCase().includes(term))
    );
  }, [items, search]);

  const totalQuantitySold = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [filteredItems]);

  const totalLineItemsRevenue = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity || 0), 0);
  }, [filteredItems]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Link href="/admin/orders" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Orders
            </Link>
            <span>/</span>
            <span>Order Items</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Order Line Items Breakdown
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Granular line-item sales analysis, quantities sold per fragrance, unit prices, and revenue breakdown.
          </p>
        </div>

        <button
          onClick={fetchItems}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 self-start sm:self-auto shadow-sm"
          title="Refresh Items"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Quantity Sold</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{totalQuantitySold} Units</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <ListOrdered className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Line Items Value</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
              ₹{totalLineItemsRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign className="w-5 h-5" />
          </div>
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
            placeholder="Search by product name or order #..."
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
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading order items...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchItems}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <ListOrdered className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No order items found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              No line items matching search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Product Item</th>
                  <th className="py-4 px-4">Order #</th>
                  <th className="py-4 px-4 text-center">Quantity</th>
                  <th className="py-4 px-4 text-right">Unit Price</th>
                  <th className="py-4 px-4 text-right">Total Subtotal</th>
                  <th className="py-4 px-6">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredItems.map((it) => (
                  <tr key={it.id} className="hover:bg-stone-50 transition-colors group">
                    {/* Item */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-stone-100 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-amber-700">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-bold text-stone-900 group-hover:text-amber-700">
                          {it.product_name}
                        </span>
                      </div>
                    </td>

                    {/* Order # */}
                    <td className="py-4 px-4 font-mono font-bold text-amber-800">
                      {it.orders?.order_number || 'N/A'}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 text-center font-bold text-stone-900">{it.quantity}</td>

                    {/* Unit Price */}
                    <td className="py-4 px-4 text-right text-stone-700 font-medium">
                      ₹{Number(it.price).toLocaleString()}
                    </td>

                    {/* Total Subtotal */}
                    <td className="py-4 px-4 text-right font-bold text-stone-900 text-sm">
                      ₹{(Number(it.price) * it.quantity).toLocaleString()}
                    </td>

                    {/* Order Status */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold uppercase">
                        {it.orders?.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
