'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ListOrdered,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  PackageCheck,
  FileText,
  Printer,
  Sparkles,
  UserPlus,
  Key,
  Copy,
  Check,
  Mail
} from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product_name: string;
  image_url?: string;
}

interface Order {
  id: string;
  store_id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address: any;
  company_name?: string;
  business_name?: string;
  payment_status: 'unpaid' | 'paid' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  courier_name?: string;
  tracking_number?: string;
  shipping_label_url?: string;
  dispatched_at?: string;
  created_at: string;
  users?: { full_name: string; email: string; phone?: string };
  items?: OrderItem[];
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCount: 0,
    shippedCount: 0,
    deliveredCount: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingFulfillmentOrder, setEditingFulfillmentOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [convertingGuestOrder, setConvertingGuestOrder] = useState<Order | null>(null);

  // Guest Account Conversion Form State
  const [guestForm, setGuestForm] = useState({
    email: '',
    full_name: '',
    password: '',
  });
  const [generatedAccountSuccess, setGeneratedAccountSuccess] = useState<{ email: string; password: string; name: string } | null>(null);
  const [copiedGuestCreds, setCopiedGuestCreds] = useState(false);

  // Fulfillment form
  const [fulfillmentForm, setFulfillmentForm] = useState({
    status: 'pending',
    payment_status: 'unpaid',
    courier_name: '',
    tracking_number: '',
    shipping_label_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendTaxInvoiceEmail = async (order: Order) => {
    const orderIdentifier = order.id || order.order_number;
    const custEmail = order.users?.email || order.guest_email || order.shipping_address?.email;
    if (!custEmail) {
      showToast('error', 'No customer email address found for this order.');
      return;
    }

    try {
      setSendingInvoiceId(order.id);
      const res = await fetch(`/api/orders/${orderIdentifier}/email-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: custEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Official GST Tax Invoice #${order.order_number} sent to ${custEmail}`);
      } else {
        showToast('error', data.error || 'Failed to dispatch invoice email.');
      }
    } catch (err: any) {
      showToast('error', 'Network error while dispatching invoice email.');
    } finally {
      setSendingInvoiceId(null);
    }
  };

  const handleOpenConvertGuestModal = (order: Order) => {
    const custEmail = order.users?.email || order.guest_email || 'guest@example.com';
    const rawName = order.users?.full_name || order.shipping_address?.fullName || order.shipping_address?.name || 'Guest Customer';
    const cleanName = rawName.replace(/Guest\s*Customer/i, '').trim() || 'Valued Customer';
    const firstWord = cleanName.split(' ')[0] || 'Member';
    const passwordSuggestion = `${firstWord}2026!`;

    setGuestForm({
      email: custEmail,
      full_name: cleanName,
      password: passwordSuggestion,
    });
    setGeneratedAccountSuccess(null);
    setConvertingGuestOrder(order);
  };

  const handleCreateGuestAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestForm.email,
          password: guestForm.password,
          full_name: guestForm.full_name,
          role: 'customer',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate regular account');

      setGeneratedAccountSuccess({
        email: guestForm.email,
        password: guestForm.password,
        name: guestForm.full_name,
      });

      showToast('success', `Regular account created for "${guestForm.email}"!`);
      fetchOrders();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to convert guest account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyGuestCreds = () => {
    if (!generatedAccountSuccess) return;
    const textToCopy = `Maison Account Credentials:\nUsername: ${generatedAccountSuccess.email}\nPassword: ${generatedAccountSuccess.password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedGuestCreds(true);
    setTimeout(() => setCopiedGuestCreds(false), 2500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/orders?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (paymentFilter !== 'all') url += `&payment_status=${paymentFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');

      setOrders(data.orders || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const term = search.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(term) ||
        (o.guest_email && o.guest_email.toLowerCase().includes(term)) ||
        (o.tracking_number && o.tracking_number.toLowerCase().includes(term)) ||
        (o.users?.full_name && o.users.full_name.toLowerCase().includes(term)) ||
        (o.users?.email && o.users.email.toLowerCase().includes(term))
    );
  }, [orders, search]);

  const handleOpenFulfillmentModal = (o: Order) => {
    setEditingFulfillmentOrder(o);
    setFulfillmentForm({
      status: o.status,
      payment_status: o.payment_status,
      courier_name: o.courier_name || 'Blue Dart Express',
      tracking_number: o.tracking_number || '',
      shipping_label_url: o.shipping_label_url || '',
    });
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFulfillmentOrder) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/orders/${editingFulfillmentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fulfillmentForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order fulfillment');

      showToast('success', `Order ${editingFulfillmentOrder.order_number} status updated to ${fulfillmentForm.status.toUpperCase()}`);
      setEditingFulfillmentOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/orders/${deletingOrder.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete order');

      showToast('success', `Order ${deletingOrder.order_number} deleted.`);
      setDeletingOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'paid':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse';
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
            <ShoppingBag className="w-4 h-4" /> Sales & Fulfillment
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#1A0510] mt-1">
            Orders & Shipments
          </h1>
          <p className="text-[#4A0D25] text-xs sm:text-sm mt-1 font-bold">
            Track customer sales, payment verifications, Razorpay transaction IDs, courier tracking & dispatch labels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders/items"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#4A0D25] text-xs font-black hover:bg-[#FAE6E7] transition-all flex items-center gap-2 shadow-xs"
          >
            <ListOrdered className="w-4 h-4 text-[#F6A6BB]" /> Order Line Items
          </Link>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#FAE6E7] transition-all disabled:opacity-50 shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F6A6BB]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Total Paid Revenue</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-800 mt-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Total Orders</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A0510] mt-1">{stats.totalOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Pending Fulfillment</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A0D25] mt-1">{stats.pendingCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Shipped & En Route</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif text-purple-900 mt-1">{stats.shippedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 text-purple-900 border border-purple-300">
            <Truck className="w-5 h-5" />
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
            placeholder="Search by order #, email, or tracking #..."
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
            <span className="text-xs text-stone-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid (Processing)</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading orders from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No orders found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No orders matching search term "${search}".`
                : 'No customer orders placed yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A0510]">
              <thead className="bg-[#FAE6E7]/80 text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                <tr>
                  <th className="py-4 px-6">Order # / Date</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Fulfillment Status</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Tracking</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7D1D8]">
                {filteredOrders.map((o) => {
                  const customerName = o.users?.full_name || 'Guest Customer';
                  const email = o.users?.email || o.guest_email || 'No email';

                  return (
                    <tr key={o.id} className="hover:bg-[#FAE6E7]/40 transition-colors group">
                      {/* Order # */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-[#4A0D25] text-xs sm:text-sm">
                          {o.order_number}
                        </div>
                        <div className="text-xs text-stone-600 font-bold flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#F6A6BB]" />
                          {new Date(o.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-[#1A0510] text-xs sm:text-sm">{customerName}</div>
                        <div className="text-xs text-[#4A0D25] font-bold">{email}</div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${getStatusBadgeClass(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4">
                        {o.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 text-xs font-black">
                            <CreditCard className="w-3.5 h-3.5 text-rose-700" /> {o.payment_status}
                          </span>
                        )}
                      </td>

                      {/* Tracking */}
                      <td className="py-4 px-4">
                        {o.tracking_number ? (
                          <div>
                            <div className="font-mono text-xs text-[#4A0D25] font-black flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-[#F6A6BB]" /> {o.tracking_number}
                            </div>
                            <div className="text-xs text-stone-600 font-bold">{o.courier_name || 'Express'}</div>
                          </div>
                        ) : (
                          <span className="text-stone-500 font-bold text-xs">Unshipped</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 font-black text-[#1A0510] text-sm sm:text-base">
                        ₹{Number(o.total_amount).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleSendTaxInvoiceEmail(o)}
                          disabled={sendingInvoiceId === o.id}
                          className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 hover:bg-emerald-200 transition-all shadow-xs disabled:opacity-50"
                          title={`Email GST Tax Invoice to ${o.users?.email || o.guest_email || 'Customer'}`}
                        >
                          {sendingInvoiceId === o.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                          ) : (
                            <Mail className="w-4 h-4 text-emerald-800" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenConvertGuestModal(o)}
                          className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 hover:bg-amber-200 transition-all shadow-xs"
                          title="Generate Regular Account for Guest"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenFulfillmentModal(o)}
                          className="p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                          title="Update Status & Tracking"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingOrder(o)}
                          className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all shadow-xs"
                          title="Delete Order"
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

      {/* VIEW ORDER DETAILS MODAL (LIGHT LUXURY THEME) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] font-extrabold font-serif">
                  ORD
                </div>
                <div>
                  <h2 className="text-xl font-serif font-extrabold text-[#1A0510] flex items-center gap-2">
                    {selectedOrder.order_number}
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-black border uppercase tracking-wider ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </h2>
                  <p className="text-xs text-[#4A0D25] font-extrabold mt-0.5">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1 text-xs">
              {/* Customer & Shipping Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-[#4A0D25] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <User className="w-4 h-4 text-[#F6A6BB]" /> Customer Details
                    </div>
                    <button
                      onClick={() => handleOpenConvertGuestModal(selectedOrder)}
                      className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs flex items-center gap-1"
                      title="Convert Guest Customer into Permanent Account"
                    >
                      <UserPlus className="w-3 h-3" /> Convert Account
                    </button>
                  </div>
                  <div className="text-[#1A0510] font-extrabold text-sm">
                    {selectedOrder.users?.full_name || 'Guest Customer'}
                  </div>
                  <div className="text-[#4A0D25] font-bold text-xs">{selectedOrder.users?.email || selectedOrder.guest_email}</div>
                  <div className="text-[#4A0D25] font-semibold text-xs">{selectedOrder.users?.phone || 'No phone'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] space-y-2">
                  <div className="font-black text-[#4A0D25] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#F6A6BB]" /> Shipping Address
                  </div>
                  <div className="text-[#1A0510] font-bold text-xs leading-relaxed">
                    {selectedOrder.shipping_address?.streetAddress1 || selectedOrder.shipping_address?.street || selectedOrder.shipping_address?.address || 'Standard Address'}<br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postalCode || selectedOrder.shipping_address?.zip}<br />
                    {selectedOrder.shipping_address?.country || 'India'}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Purchased Line Items</h3>
                <div className="rounded-2xl border border-[#F7D1D8] bg-white overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs text-[#1A0510]">
                    <thead className="bg-[#FAE6E7] text-[#4A0D25] uppercase text-xs font-black tracking-wider border-b border-[#F7D1D8]">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F7D1D8]">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#FAE6E7]/30 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#F7D1D8]" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                            <span className="font-extrabold text-[#1A0510] text-xs sm:text-sm">{item.product_name}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-black text-sm">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-xs">₹{Number(item.price).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-black text-[#4A0D25] text-sm">
                            ₹{(Number(item.price) * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Payment Details */}
              {(() => {
                const totalAmt = Number(selectedOrder.total_amount || 0);
                const sAddr = (selectedOrder.shipping_address as any) || {};
                const taxRate = sAddr.tax_rate || 18.00;
                const taxableVal = sAddr.taxable_amount || Math.round(totalAmt / (1 + taxRate / 100));
                const taxAmt = sAddr.tax_amount || (totalAmt - taxableVal);
                const buyerGstin = sAddr.gstin || null;
                const businessName = sAddr.company_name || sAddr.business_name || sAddr.companyName || selectedOrder.company_name || selectedOrder.business_name || null;
                const payMethod = sAddr.payment_method || (selectedOrder.razorpay_payment_id?.startsWith('PAYPAL') ? 'paypal' : 'razorpay');

                return (
                  <div className="space-y-3">
                    {(businessName || buyerGstin) && (
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between font-bold gap-2">
                        <div className="flex items-center gap-1.5">
                          <span>🏢 B2B Entity / Tax Credit:</span>
                          {businessName && <span className="font-black text-[#1A0510]">{businessName}</span>}
                        </div>
                        {buyerGstin && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                            GSTIN: {buyerGstin}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-[#4A0D25] font-bold">
                          Payment Method: <span className="font-black text-stone-900 uppercase px-2 py-0.5 rounded-full bg-white border border-[#F7D1D8] ml-1">{payMethod === 'paypal' ? 'PayPal Express' : 'Razorpay Gateway'}</span>
                        </div>
                        <div className="text-xs text-[#4A0D25] font-bold">
                          Payment Status: <span className="font-black text-emerald-800 uppercase px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 ml-1">{selectedOrder.payment_status}</span>
                        </div>
                        {selectedOrder.razorpay_payment_id && (
                          <div className="font-mono text-xs text-stone-600 font-bold">Txn Ref: {selectedOrder.razorpay_payment_id}</div>
                        )}
                      </div>

                      <div className="text-right space-y-1 text-xs">
                        <div className="text-stone-600">Taxable Value: <strong className="text-stone-900">₹{Number(taxableVal).toLocaleString()}</strong></div>
                        <div className="text-[#4A0D25] font-bold">GST Tax ({taxRate}%): <strong>₹{Number(taxAmt).toLocaleString()}</strong></div>
                        <div className="text-xs text-[#4A0D25] font-extrabold uppercase tracking-wider pt-1 border-t border-[#F7D1D8]">Grand Total</div>
                        <div className="text-2xl font-black font-serif text-[#4A0D25]">₹{totalAmt.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F7D1D8]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSendTaxInvoiceEmail(selectedOrder)}
                  disabled={sendingInvoiceId === selectedOrder.id}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  title={`Email GST Tax Invoice to ${selectedOrder.users?.email || selectedOrder.guest_email || 'Customer'}`}
                >
                  {sendingInvoiceId === selectedOrder.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending Invoice...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Send Invoice Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleOpenFulfillmentModal(selectedOrder)}
                  className="px-4 py-2.5 rounded-xl bg-[#F6A6BB] text-[#4A0D25] text-xs font-black uppercase tracking-wider hover:bg-[#F4BBC9] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Truck className="w-4 h-4" /> Shipment Tracking
                </button>
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      const sAddr = (selectedOrder.shipping_address as any) || {};
                      const totalAmt = Number(selectedOrder.total_amount || 0);
                      const taxRate = sAddr.tax_rate || 18.00;
                      const taxableVal = sAddr.taxable_amount || Math.round(totalAmt / (1 + taxRate / 100));
                      const taxAmt = sAddr.tax_amount || (totalAmt - taxableVal);
                      const buyerGstin = sAddr.gstin || 'N/A (B2C Retail)';
                      const businessName = sAddr.company_name || sAddr.business_name || sAddr.companyName || selectedOrder.company_name || selectedOrder.business_name || '';

                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Tax Invoice - #${selectedOrder.order_number}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
                              .header { border-bottom: 2px solid #8b0000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
                              .title { font-size: 24px; font-weight: bold; color: #8b0000; }
                              .meta { margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
                              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                              th { background-color: #f8f8f8; }
                              .total-box { margin-top: 20px; float: right; width: 300px; font-size: 13px; }
                              .total-box tr td { border: none; padding: 5px; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div>
                                <div class="title">ROSE VALLEY KANNAUJ</div>
                                <p style="margin: 4px 0; font-size: 12px; color: #666;">Maison Fragrances & Hydro-Distillates • Kannauj, Uttar Pradesh</p>
                                <p style="margin: 2px 0; font-size: 12px; font-weight: bold;">Store GSTIN: 09AAACR1234F1Z5 | HSN Code: 330300</p>
                              </div>
                              <div style="text-align: right;">
                                <h3 style="margin: 0; color: #8b0000;">TAX INVOICE</h3>
                                <p style="margin: 4px 0; font-size: 13px;"><strong>Invoice #:</strong> ${selectedOrder.order_number}</p>
                                <p style="margin: 2px 0; font-size: 12px;">Date: ${new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div class="meta">
                              <strong>Billed & Shipped To:</strong><br/>
                              ${businessName ? `<strong>${businessName}</strong> (Attn: ${sAddr.fullName || selectedOrder.users?.full_name || 'Client'})<br/>` : `${sAddr.fullName || selectedOrder.users?.full_name || 'Client'}<br/>`}
                              ${sAddr.streetAddress1 || 'Main Street'}, ${sAddr.city || 'Kannauj'}, ${sAddr.state || ''} ${sAddr.postalCode || ''}<br/>
                              Phone: ${sAddr.phone || 'N/A'} | Email: ${sAddr.email || selectedOrder.guest_email || 'N/A'}<br/>
                              ${businessName ? `<strong>Business Name:</strong> ${businessName}<br/>` : ''}
                              <strong>Buyer GSTIN:</strong> ${buyerGstin}
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th>Item Description</th>
                                  <th>HSN</th>
                                  <th>Qty</th>
                                  <th>Rate (₹)</th>
                                  <th>Taxable Amount (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${(selectedOrder.items || []).map((it: any) => `
                                  <tr>
                                    <td>${it.product_name}</td>
                                    <td>330300</td>
                                    <td>${it.quantity}</td>
                                    <td>₹${Number(it.price).toLocaleString()}</td>
                                    <td>₹${(Number(it.price) * it.quantity).toLocaleString()}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>

                            <table class="total-box">
                              <tr>
                                <td><strong>Taxable Base Subtotal:</strong></td>
                                <td style="text-align: right;">₹${Number(taxableVal).toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td><strong>GST Tax (${taxRate}%):</strong></td>
                                <td style="text-align: right;">₹${Number(taxAmt).toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td><strong>Shipping:</strong></td>
                                <td style="text-align: right;">FREE</td>
                              </tr>
                              <tr style="border-top: 2px solid #8b0000; font-size: 16px; font-weight: bold; color: #8b0000;">
                                <td>Grand Total:</td>
                                <td style="text-align: right;">₹${totalAmt.toLocaleString()}</td>
                              </tr>
                            </table>
                            <script>window.onload = function() { window.print(); }</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-300 text-[#1A0510] text-xs font-bold hover:bg-stone-200 transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-stone-700" /> Print Tax Invoice
                </button>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-extrabold text-[#1A0510] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE FULFILLMENT & TRACKING MODAL */}
      {editingFulfillmentOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-900">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-extrabold text-[#1A0510]">Fulfillment & Courier Tracking</h2>
                  <p className="text-xs text-[#4A0D25] font-mono font-bold">{editingFulfillmentOrder.order_number}</p>
                </div>
              </div>
              <button onClick={() => setEditingFulfillmentOrder(null)} className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFulfillment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#4A0D25] mb-1">Order Status *</label>
                  <select
                    value={fulfillmentForm.status}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid (Processing)</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-[#4A0D25] mb-1">Payment Status *</label>
                  <select
                    value={fulfillmentForm.payment_status}
                    onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, payment_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Courier Partner Name</label>
                <input
                  type="text"
                  value={fulfillmentForm.courier_name}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, courier_name: e.target.value })}
                  placeholder="e.g. Blue Dart, Delhivery, India Post"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Tracking AWB Number</label>
                <input
                  type="text"
                  value={fulfillmentForm.tracking_number}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, tracking_number: e.target.value })}
                  placeholder="e.g. BD789421056"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] mb-1">Shipping Label PDF URL</label>
                <input
                  type="text"
                  value={fulfillmentForm.shipping_label_url}
                  onChange={(e) => setFulfillmentForm({ ...fulfillmentForm, shipping_label_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setEditingFulfillmentOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Fulfillment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ORDER MODAL */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 text-[#1A0510]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-extrabold text-rose-950">Delete Order Record</h3>
                <p className="text-xs text-rose-800 font-mono font-bold">{deletingOrder.order_number}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A0D25] font-semibold leading-relaxed">
              Are you sure you want to delete this order? All associated line item records will also be permanently removed.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-rose-200">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT GUEST CUSTOMER TO REGULAR ACCOUNT MODAL */}
      {convertingGuestOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-[#1A0510]">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-950">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-extrabold text-[#1A0510]">
                    Generate Regular Customer Account
                  </h2>
                  <p className="text-xs text-[#4A0D25] font-bold">
                    For Order #{convertingGuestOrder.order_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertingGuestOrder(null)}
                className="p-2 rounded-full hover:bg-[#FAE6E7] text-stone-600 hover:text-[#1A0510]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedAccountSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4 text-left">
                <div className="flex items-center gap-2 text-emerald-950 font-serif font-extrabold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Regular Account Successfully Generated!
                </div>
                <p className="text-xs text-emerald-900 font-bold">
                  The guest customer account has been created and registered in the database.
                </p>

                <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 font-mono text-xs shadow-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">Username / Email:</span>
                    <span className="font-extrabold text-stone-900">{generatedAccountSuccess.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-bold">Password:</span>
                    <span className="font-extrabold text-amber-900">{generatedAccountSuccess.password}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleCopyGuestCreds}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5"
                  >
                    {copiedGuestCreds ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedGuestCreds ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvertingGuestOrder(null)}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-800 font-bold text-xs hover:bg-stone-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateGuestAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#4A0D25] mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestForm.full_name}
                    onChange={(e) => setGuestForm({ ...guestForm, full_name: e.target.value })}
                    placeholder="e.g. Shiva Exports India"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#4A0D25] mb-1">Login Username / Email ID *</label>
                  <input
                    type="email"
                    required
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    placeholder="shivaexportsindia@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#4A0D25] mb-1">Initial Password *</label>
                  <input
                    type="text"
                    required
                    value={guestForm.password}
                    onChange={(e) => setGuestForm({ ...guestForm, password: e.target.value })}
                    placeholder="e.g. Exports2026!"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-amber-950 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                  <span className="text-[10px] text-stone-500 font-bold mt-1 block">
                    Auto-suggested from customer name/email. Admin can customize password before generating.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                  <button
                    type="button"
                    onClick={() => setConvertingGuestOrder(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Creating Account...' : 'Generate Regular Account'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
