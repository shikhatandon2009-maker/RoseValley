'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  Send,
  Megaphone,
  User,
  Users,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  ShoppingBag,
  UserPlus,
  MessageSquare
} from 'lucide-react';

interface UserOption {
  id: string;
  full_name: string;
  email: string;
}

interface NotificationItem {
  id: string;
  store_id: string;
  recipient_id?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read_at?: string;
  created_at: string;
  users?: { id: string; full_name: string; email: string };
}

interface Stats {
  totalNotifications: number;
  broadcastsCount: number;
  customerSpecificCount: number;
  unreadCount: number;
}

export default function InAppNotificationsAdminPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalNotifications: 0,
    broadcastsCount: 0,
    customerSpecificCount: 0,
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [readStateFilter, setReadStateFilter] = useState('all');

  // Modals
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<NotificationItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    recipient_id: '' as string, // '' for Broadcast to All
    type: 'promo_alert',
    title: 'Exquisite Royal Rose Attar Flash Release!',
    message: 'We have just released 50 limited bottles of hydro-distilled Kannauj Rose Attar aged in vintage oak casks.',
    link: '/products',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) setUsersList(data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/notifications?search=${encodeURIComponent(search)}`;
      if (filterType !== 'all') url += `&filter=${filterType}`;
      if (readStateFilter !== 'all') url += `&read_state=${readStateFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch in-app notifications');

      setNotifications(data.notifications || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading in-app notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, [filterType, readStateFilter]);

  const filteredNotifications = useMemo(() => {
    if (!search.trim()) return notifications;
    const term = search.toLowerCase().trim();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        (n.users?.full_name && n.users.full_name.toLowerCase().includes(term)) ||
        (n.users?.email && n.users.email.toLowerCase().includes(term))
    );
  }, [notifications, search]);

  const handleOpenSendModal = () => {
    setFormData({
      recipient_id: '',
      type: 'promo_alert',
      title: 'Exquisite Royal Rose Attar Flash Release!',
      message: 'We have just released 50 limited bottles of hydro-distilled Kannauj Rose Attar aged in vintage oak casks.',
      link: '/products',
    });
    setIsSendModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('error', 'Title and message body are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: formData.recipient_id ? formData.recipient_id : null,
          type: formData.type,
          title: formData.title,
          message: formData.message,
          link: formData.link,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send notification');

      showToast('success', formData.recipient_id ? 'Customer notification sent!' : 'Global broadcast sent to all customers!');
      setIsSendModalOpen(false);
      fetchNotifications();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send notification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark as read');

      showToast('success', 'Marked as read');
      fetchNotifications();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update read state.');
    }
  };

  const handleDeleteNotification = async () => {
    if (!deletingNotification) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/notifications?id=${deletingNotification.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete notification');

      showToast('success', 'Notification deleted.');
      setDeletingNotification(null);
      fetchNotifications();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete notification.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" /> Customer Engagement & Alerts
          </div>
          <h1 className="text-3xl font-serif font-bold text-neutral-100 mt-1">
            In-App Notifications & Customer Broadcasting
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Broadcast promotional release alerts to all customers or send targeted order status and account messages to specific users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-300 hover:border-amber-500/30 transition-all disabled:opacity-50"
            title="Refresh In-App Notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenSendModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> + Send In-App Notification
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total In-App Alerts</div>
            <div className="text-2xl font-bold font-serif text-neutral-100 mt-1">{stats.totalNotifications}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-purple-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Global Broadcasts</div>
            <div className="text-2xl font-bold font-serif text-purple-300 mt-1">{stats.broadcastsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Customer Specific</div>
            <div className="text-2xl font-bold font-serif text-emerald-300 mt-1">{stats.customerSpecificCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Unread Customer Alerts</div>
            <div className="text-2xl font-bold font-serif text-amber-300 mt-1">{stats.unreadCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, message, or customer name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Target:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All In-App Notifications</option>
              <option value="broadcast">Global Broadcasts to All ({stats.broadcastsCount})</option>
              <option value="customer">Customer Specific ({stats.customerSpecificCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">State:</span>
            <select
              value={readStateFilter}
              onChange={(e) => setReadStateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Read States</option>
              <option value="unread">Unread Only ({stats.unreadCount})</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center space-y-3 rounded-2xl border border-amber-500/20 bg-neutral-900/60">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading in-app notifications from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-rose-500/20 bg-neutral-900/60">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-rose-300">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-200 hover:bg-neutral-700"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-2xl border border-amber-500/20 bg-neutral-900/60">
            <Bell className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="text-base font-serif font-bold text-neutral-300">No in-app notifications found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {search
                ? `No notifications matching search term "${search}".`
                : 'Click "Send In-App Notification" to issue an announcement or order alert.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map((n) => {
              const isBroadcast = !n.recipient_id;

              return (
                <div
                  key={n.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 shadow-lg ${
                    n.read_at
                      ? 'bg-neutral-900/60 border-neutral-800/80 opacity-80'
                      : 'bg-neutral-900/90 border-amber-500/30'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      {isBroadcast ? (
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                          <Megaphone className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-neutral-100 text-sm flex items-center gap-2">
                          {isBroadcast ? (
                            <span className="text-purple-300 flex items-center gap-1 font-bold">
                              📣 Global Broadcast (All Customers)
                            </span>
                          ) : (
                            <span>Target: {n.users?.full_name || 'Customer'}</span>
                          )}
                        </div>
                        {n.users?.email && (
                          <div className="text-[11px] text-neutral-400">{n.users.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 font-mono text-[10px] font-bold text-amber-300 uppercase">
                        {n.type}
                      </span>
                      {!n.read_at ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> UNREAD
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">
                          Read on {new Date(n.read_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-neutral-100 text-base flex items-center gap-2">
                      {n.title}
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
                      {n.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 flex items-center justify-between gap-4 border-t border-neutral-800/80">
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        Sent on {new Date(n.created_at).toLocaleString()}
                      </span>
                      {n.link && (
                        <Link
                          href={n.link}
                          target="_blank"
                          className="text-amber-400 hover:underline text-[11px] font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Target Link: {n.link}
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!n.read_at && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-semibold hover:border-amber-500/30 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingNotification(n)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                        title="Delete Notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEND NOTIFICATION MODAL */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Send className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Send In-App Notification</h2>
              </div>
              <button onClick={() => setIsSendModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Target Recipient *</label>
                  <select
                    value={formData.recipient_id}
                    onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="">📣 Broadcast to All Customers</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>👤 {u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Notification Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="promo_alert">Promotional Release Alert</option>
                    <option value="order_status">Order Status Update</option>
                    <option value="new_user">Welcome Account Message</option>
                    <option value="system_msg">System Announcement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Rare Vintage Attar Release"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter detailed in-app message text..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Target Action Link (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/products/damask-rose-attar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSendModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE NOTIFICATION MODAL */}
      {deletingNotification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Notification</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingNotification.title}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this in-app notification entry?
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingNotification(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNotification}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
