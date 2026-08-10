'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ArrowLeft,
  Clock,
  Sparkles,
  Inbox,
  ShieldCheck,
  Check,
  Terminal
} from 'lucide-react';

interface NotificationLog {
  id: string;
  store_id: string;
  recipient: string;
  subject: string;
  notification_type: string;
  status: 'sent' | 'failed';
  provider_response?: string;
  created_at: string;
}

interface Stats {
  totalSent: number;
  successfulSent: number;
  failedSent: number;
  deliveryRate: string;
}

export default function NotificationLogsAdminPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    successfulSent: 0,
    failedSent: 0,
    deliveryRate: '100.0',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Test Email Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    recipient: 'customer@maisonessence.com',
    subject: 'Your Maison De L\'Essence Order #MDE-9876 Is Dispatched',
    notification_type: 'shipment_dispatch',
    status: 'sent' as 'sent' | 'failed',
    provider_response: '250 2.0.0 OK 1723053600 resend_msg_987654321',
  });

  const [deletingLog, setDeletingLog] = useState<NotificationLog | null>(null);
  const [viewingResponseLog, setViewingResponseLog] = useState<NotificationLog | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/notifications/logs?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (typeFilter !== 'all') url += `&notification_type=${typeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch notification logs');

      setLogs(data.logs || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading notification logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, typeFilter]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const term = search.toLowerCase().trim();
    return logs.filter(
      (l) =>
        l.recipient.toLowerCase().includes(term) ||
        l.subject.toLowerCase().includes(term) ||
        l.notification_type.toLowerCase().includes(term)
    );
  }, [logs, search]);

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/notifications/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send notification');

      showToast('success', `Test email recorded for ${testForm.recipient}`);
      setIsTestModalOpen(false);
      fetchLogs();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!deletingLog) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/notifications/logs?id=${deletingLog.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete log');

      showToast('success', 'Notification log deleted.');
      setDeletingLog(null);
      fetchLogs();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete log');
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
            <Mail className="w-4 h-4" /> System Audit & Email Transmissions
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Notification Logs (Emails Sent)
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Audit outbound customer transactional emails, order receipts, shipment dispatch tracking links, and provider responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> + Log Test Email
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Emails Logged</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalSent}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Successful Deliveries</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.successfulSent}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Failed Dispatches</div>
            <div className="text-2xl font-bold font-serif text-rose-700 mt-1">{stats.failedSent}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">SMTP Delivery Rate</div>
            <div className="text-2xl font-bold font-serif text-purple-700 mt-1">{stats.deliveryRate}%</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-5 h-5" />
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
            placeholder="Search by recipient email or subject..."
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Types</option>
              <option value="order_confirmation">Order Confirmation</option>
              <option value="shipment_dispatch">Shipment Tracking</option>
              <option value="password_reset">Password Reset</option>
              <option value="welcome_email">Welcome Email</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent / Delivered</option>
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
            <p className="text-xs text-stone-500 font-medium">Loading notification logs from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Inbox className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No notification logs found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No email logs matching search term "${search}".`
                : 'No transactional email logs recorded under this status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">Recipient Email</th>
                  <th className="py-4 px-4">Subject Line</th>
                  <th className="py-4 px-4">Notification Type</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Timestamp</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50 transition-colors group">
                    {/* Recipient */}
                    <td className="py-4 px-6 font-bold text-stone-900">{l.recipient}</td>

                    {/* Subject */}
                    <td className="py-4 px-4 text-stone-800 font-medium max-w-xs truncate">{l.subject}</td>

                    {/* Notification Type */}
                    <td className="py-4 px-4 font-mono text-[11px] text-amber-900 font-bold">{l.notification_type}</td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {l.status === 'sent' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" /> SENT
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <AlertCircle className="w-3 h-3 text-rose-700" /> FAILED
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-4 text-stone-600 font-medium text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {new Date(l.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setViewingResponseLog(l)}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all shadow-xs"
                        title="View Transmission Response Payload"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingLog(l)}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-rose-600 transition-all shadow-xs"
                        title="Delete Log Entry"
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

      {/* TEST EMAIL MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <Send className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900">Log Test Email Transmission</h2>
              </div>
              <button onClick={() => setIsTestModalOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={testForm.recipient}
                  onChange={(e) => setTestForm({ ...testForm, recipient: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Subject Line *</label>
                <input
                  type="text"
                  required
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Notification Type *</label>
                  <select
                    value={testForm.notification_type}
                    onChange={(e) => setTestForm({ ...testForm, notification_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                  >
                    <option value="order_confirmation">Order Confirmation</option>
                    <option value="shipment_dispatch">Shipment Dispatch</option>
                    <option value="password_reset">Password Reset</option>
                    <option value="welcome_email">Welcome Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Status *</label>
                  <select
                    value={testForm.status}
                    onChange={(e) => setTestForm({ ...testForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="sent">Sent (Delivered)</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Provider Response Payload</label>
                <textarea
                  rows={2}
                  value={testForm.provider_response}
                  onChange={(e) => setTestForm({ ...testForm, provider_response: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Log Transmission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROVIDER RESPONSE MODAL */}
      {viewingResponseLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-800" />
                <h3 className="text-base font-serif font-bold text-stone-900">Provider Transmission Response</h3>
              </div>
              <button onClick={() => setViewingResponseLog(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-stone-600">Recipient: <span className="text-stone-900 font-bold">{viewingResponseLog.recipient}</span></div>
              <div className="text-stone-600">Subject: <span className="text-amber-900 font-bold">{viewingResponseLog.subject}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-900 overflow-x-auto whitespace-pre-wrap font-medium">
              {viewingResponseLog.provider_response || 'SMTP 250 2.0.0 OK Message accepted'}
            </div>

            <div className="pt-2 flex justify-end border-t border-stone-200">
              <button
                type="button"
                onClick={() => setViewingResponseLog(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-xs font-bold text-stone-800 hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE LOG MODAL */}
      {deletingLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Delete Notification Log</h3>
                <p className="text-xs text-rose-800 font-bold">{deletingLog.recipient}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Are you sure you want to delete this notification transmission log?
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLog}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
