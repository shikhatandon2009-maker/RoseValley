'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Mail,
  Phone,
  Tag,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    replied: 0,
  });

  // Reply Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Replied');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/admin/inquiries?status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch inquiries');

      setInquiries(data.inquiries || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading customer inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleOpenReplyModal = (inq: any) => {
    setSelectedInquiry(inq);
    setReplyText(inq.reply || '');
    setReplyStatus(inq.status === 'Closed' ? 'Closed' : 'Replied');
    setReplySuccess(null);
  };

  const handleApplyPreset = (template: string) => {
    setReplyText(template);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedInquiry) return;

    setSendingReply(true);
    setReplySuccess(null);

    try {
      const payload = {
        id: selectedInquiry.id,
        inquiry_ref: selectedInquiry.inquiry_ref,
        reply: replyText.trim(),
        status: replyStatus,
        customer_email: selectedInquiry.email,
        customer_name: selectedInquiry.name,
        subject: selectedInquiry.subject,
      };

      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save reply');

      setReplySuccess('Official concierge reply saved and customer notified.');
      
      // Update locally
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === selectedInquiry.id
            ? { ...i, reply: replyText.trim(), status: replyStatus }
            : i
        )
      );

      setTimeout(() => {
        setSelectedInquiry(null);
        fetchInquiries();
      }, 1200);
    } catch (err: any) {
      alert('Error sending reply: ' + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1A0510] text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#F6A6BB] uppercase tracking-widest block">
                COMMUNITY & CLIENT CARE
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1A0510]">
                Customer Communications & Inquiries
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#4A0D25] font-bold mt-1 max-w-2xl">
            Review incoming queries from logged-in clients and Contact Us inquiries. Replies are instantly recorded to the customer’s Private Client Portal and emailed.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] hover:bg-[#FAE6E7] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Total Inquiries</span>
            <div className="text-2xl font-serif font-black text-[#1A0510] mt-0.5">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAE6E7] text-[#4A0D25] flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Pending Review</span>
            <div className="text-2xl font-serif font-black text-amber-950 mt-0.5">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Answered & Resolved</span>
            <div className="text-2xl font-serif font-black text-emerald-950 mt-0.5">{stats.replied}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="p-4 rounded-2xl bg-[#FAE6E7]/40 border border-[#F7D1D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#F7D1D8] w-fit">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'In Review', label: 'Pending Review' },
            { id: 'Replied', label: 'Replied' },
            { id: 'Closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#F6A6BB] text-[#4A0D25] shadow-xs'
                  : 'text-stone-600 hover:text-[#1A0510] hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, email, subject, or ref..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Inquiries Table / Feed */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-white border border-[#F7D1D8] text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#4A0D25]">Loading client communications from Supabase...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border-2 border-dashed border-[#F7D1D8] text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-[#F6A6BB] mx-auto" />
          <h3 className="font-serif font-extrabold text-lg text-[#1A0510]">No Customer Inquiries Found</h3>
          <p className="text-xs text-[#4A0D25] font-bold max-w-sm mx-auto">
            No inquiries match your current status filter or search keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const isPending = inq.status === 'In Review' || !inq.status;
            const isReplied = inq.status === 'Replied';
            const dateStr = inq.created_at
              ? new Date(inq.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent';

            return (
              <div
                key={inq.id}
                className={`p-6 rounded-3xl border-2 transition-all space-y-4 shadow-xs ${
                  isPending
                    ? 'bg-amber-50/40 border-amber-300'
                    : isReplied
                    ? 'bg-white border-[#F7D1D8]'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7D1D8] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25]">
                      {inq.inquiry_ref || `INQ-${inq.id?.slice(-5)}`}
                    </span>
                    <span className="font-serif font-extrabold text-base text-[#1A0510]">
                      {inq.subject || 'General Inquiry'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-200 text-amber-950 border border-amber-300'
                          : isReplied
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {inq.status || 'In Review'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-stone-500 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" /> {dateStr}
                    </span>
                    <button
                      onClick={() => handleOpenReplyModal(inq)}
                      className="px-4 py-1.5 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {inq.reply ? 'Update Reply' : 'Reply To Client'}
                    </button>
                  </div>
                </div>

                {/* Client Details Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-stone-600 bg-white/70 p-3 rounded-2xl border border-[#F7D1D8]">
                  <div className="flex items-center gap-1.5 text-[#1A0510]">
                    <User className="w-3.5 h-3.5 text-[#F6A6BB]" />
                    <span>{inq.name || 'Client'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F6A6BB]" />
                    <span className="font-mono">{inq.email}</span>
                  </div>
                  {inq.phone && inq.phone !== 'N/A' && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#F6A6BB]" />
                      <span className="font-mono">{inq.phone}</span>
                    </div>
                  )}
                </div>

                {/* Customer Message */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#4A0D25] uppercase tracking-wider block">
                    Client Inquired Message:
                  </span>
                  <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] leading-relaxed whitespace-pre-line">
                    {inq.message || 'No message provided.'}
                  </div>
                </div>

                {/* Existing Reply if present */}
                {inq.reply && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                      Sent Concierge Response (Visible in Customer Portal):
                    </span>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950 leading-relaxed whitespace-pre-line">
                      {inq.reply}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
              <div>
                <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25]">
                  {selectedInquiry.inquiry_ref || `INQ-${selectedInquiry.id?.slice(-5)}`}
                </span>
                <h3 className="font-serif font-extrabold text-xl text-[#1A0510] mt-1">
                  Reply to {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {replySuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                {replySuccess}
              </div>
            )}

            {/* Original Inquired Summary */}
            <div className="p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs font-bold text-[#4A0D25] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#1A0510] font-black">{selectedInquiry.subject}</span>
                <span className="font-mono text-stone-600">{selectedInquiry.email}</span>
              </div>
              <p className="text-stone-800 bg-white p-3 rounded-xl border border-[#F7D1D8] whitespace-pre-line mt-1">
                {selectedInquiry.message}
              </p>
            </div>

            {/* Fast Reply Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: '📦 Shipment & Tracking Update',
                    text: `Dear ${selectedInquiry.name},\n\nThank you for reaching out to Rose Valley Kannauj. Your order has been dispatched via insured courier and tracking updates have been synchronized to your client portal.\n\nWarm regards,\nMaison Concierge Desk`,
                  },
                  {
                    label: '🏢 GST Tax Invoice & ITC Credit',
                    text: `Dear ${selectedInquiry.name},\n\nYour tax invoice with your buyer GSTIN has been processed under HSN Code 330300. You can download and print the GST tax invoice directly from your orders tab in the account portal.\n\nWarm regards,\nMaison Concierge Desk`,
                  },
                  {
                    label: '🌸 Custom Hydro-Distillation Batch',
                    text: `Dear ${selectedInquiry.name},\n\nOur master distillers in Kannauj have reviewed your custom attar formulation request. A dedicated perfumer will reach out to discuss your scent profile requirements.\n\nWarm regards,\nMaison Concierge Desk`,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.text)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#FAE6E7] hover:border-[#F6A6BB] border border-stone-300 text-[11px] font-bold text-[#4A0D25] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-[#4A0D25] mb-1">
                  Official Concierge Reply Message *
                </label>
                <textarea
                  rows={6}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the customer. This will be visible in their Account Portal..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-black text-[#1A0510]">Update Inquiry Status:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyStatus('Replied')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      replyStatus === 'Replied'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700'
                    }`}
                  >
                    Replied (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyStatus('Closed')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      replyStatus === 'Closed'
                        ? 'bg-stone-800 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700'
                    }`}
                  >
                    Resolved & Closed
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-extrabold text-[#1A0510] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="px-6 py-2.5 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingReply ? 'Dispatching Reply...' : 'Save & Dispatch Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
