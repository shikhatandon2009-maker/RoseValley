'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Package,
  User,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  full_name: string;
  email: string;
}

interface Review {
  id: string;
  store_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean;
  created_at: string;
  products?: { id: string; name: string; images?: string[]; slug: string };
  users?: { id: string; full_name: string; email: string };
  votes?: { helpful: number; unhelpful: number };
}

interface Stats {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageRating: string;
  totalHelpfulVotes: number;
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    averageRating: '5.0',
    totalHelpfulVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  // Form
  const [formData, setFormData] = useState({
    product_id: '',
    user_id: '',
    rating: 5,
    title: '',
    comment: '',
    imagesText: '',
    status: 'approved' as 'pending' | 'approved' | 'rejected',
    is_verified_purchase: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDropdowns = async () => {
    try {
      const [resP, resU] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/users'),
      ]);
      const dataP = await resP.json();
      const dataU = await resU.json();

      if (resP.ok) setProductsList(dataP.products || []);
      if (resU.ok) setUsersList(dataU.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/reviews?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (ratingFilter !== 'all') url += `&rating=${ratingFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');

      setReviews(data.reviews || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;
    const term = search.toLowerCase().trim();
    return reviews.filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(term)) ||
        r.comment.toLowerCase().includes(term) ||
        (r.products?.name && r.products.name.toLowerCase().includes(term)) ||
        (r.users?.full_name && r.users.full_name.toLowerCase().includes(term)) ||
        (r.users?.email && r.users.email.toLowerCase().includes(term))
    );
  }, [reviews, search]);

  const handleOpenAddModal = () => {
    setFormData({
      product_id: productsList.length > 0 ? productsList[0].id : '',
      user_id: usersList.length > 0 ? usersList[0].id : '',
      rating: 5,
      title: 'Exquisite Damask Rose Essence',
      comment: 'The scent longevity is unmatched! Truly hydro-distilled Kannauj craftsmanship.',
      imagesText: '',
      status: 'approved',
      is_verified_purchase: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (r: Review) => {
    setEditingReview(r);
    setFormData({
      product_id: r.product_id,
      user_id: r.user_id,
      rating: r.rating,
      title: r.title || '',
      comment: r.comment,
      imagesText: (r.images || []).join('\n'),
      status: r.status,
      is_verified_purchase: r.is_verified_purchase,
    });
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.user_id || !formData.comment.trim()) {
      showToast('error', 'Product, User, and Comment are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const imagesArray = formData.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, images: imagesArray }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post review');

      showToast('success', 'Review posted successfully!');
      setIsAddModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (review: Review, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review status');

      showToast('success', `Review marked as ${newStatus.toUpperCase()}`);
      fetchReviews();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      setIsSubmitting(true);
      const imagesArray = formData.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, images: imagesArray }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review');

      showToast('success', 'Review updated successfully.');
      setEditingReview(null);
      fetchReviews();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReview) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/reviews/${deletingReview.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');

      showToast('success', 'Review deleted.');
      setDeletingReview(null);
      fetchReviews();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
            }`}
          />
        ))}
      </div>
    );
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
            <Star className="w-4 h-4" /> Community & Feedback
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Reviews & Review Votes Moderation
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Moderate customer ratings, verified purchase status, review comments, image attachments, and helpful/unhelpful votes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Reviews"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post Official Review
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Average Store Rating</div>
            <div className="text-2xl font-bold font-serif text-[#000000] mt-1 flex items-center gap-1.5">
              {stats.averageRating} <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Pending Moderation</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{stats.pendingCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Approved Reviews</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.approvedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Helpful Votes</div>
            <div className="text-2xl font-bold font-serif text-purple-700 mt-1">{stats.totalHelpfulVotes}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <ThumbsUp className="w-5 h-5" />
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
            placeholder="Search by customer, product, title, comment..."
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
            <span className="text-xs text-stone-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Statuses ({stats.totalReviews})</option>
              <option value="pending">Pending ({stats.pendingCount})</option>
              <option value="approved">Approved ({stats.approvedCount})</option>
              <option value="rejected">Rejected ({stats.rejectedCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Stars ⭐⭐⭐⭐</option>
              <option value="3">3 Stars ⭐⭐⭐</option>
              <option value="2">2 Stars ⭐⭐</option>
              <option value="1">1 Star ⭐</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center space-y-3 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading customer reviews from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-rose-300 bg-white shadow-sm">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Star className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No reviews found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No reviews matching search term "${search}".`
                : 'No reviews submitted under this status filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="p-6 rounded-2xl bg-white border border-stone-200 transition-all space-y-4 shadow-sm"
              >
                {/* Top Row: Reviewer & Status & Product */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
                      {r.users?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{r.users?.full_name || 'Customer'}</span>
                        {r.is_verified_purchase && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">{r.users?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {r.products && (
                      <Link
                        href={`/products/${r.products.slug}`}
                        target="_blank"
                        className="px-3 py-1 rounded-xl bg-stone-50 border border-stone-300 text-amber-800 text-xs font-bold hover:border-amber-500 flex items-center gap-1.5 shadow-xs"
                      >
                        <Package className="w-3.5 h-3.5" /> {r.products.name}
                      </Link>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        r.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* Rating & Review Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {renderStars(r.rating)}
                    {r.title && <h3 className="font-serif font-bold text-stone-900 text-base">{r.title}</h3>}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-line font-medium">
                    "{r.comment}"
                  </p>

                  {/* Review Images */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {r.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Review attachment"
                          className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 bg-neutral-950"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Votes & Moderation Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800/80">
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                      <ThumbsUp className="w-3.5 h-3.5" /> {r.votes?.helpful || 0} Helpful
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400 font-semibold bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                      <ThumbsDown className="w-3.5 h-3.5" /> {r.votes?.unhelpful || 0} Unhelpful
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                      title="Edit Review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingReview(r)}
                      className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE REVIEW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Post Official Review</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Select Product *</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="" disabled>Select Product...</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Reviewer User *</label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="" disabled>Select User...</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Rating (1 to 5 Stars) *</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500/40"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Review Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Masterpiece Scent"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Detailed customer review..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified_purchase}
                    onChange={(e) => setFormData({ ...formData, is_verified_purchase: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500 bg-neutral-900 border-neutral-800"
                  />
                  <span>Mark as Verified Purchase</span>
                </label>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 focus:outline-none"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
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
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Edit Review Details</h2>
              </div>
              <button onClick={() => setEditingReview(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Rating *</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500/40"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Review Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Comment Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified_purchase}
                    onChange={(e) => setFormData({ ...formData, is_verified_purchase: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500 bg-neutral-900 border-neutral-800"
                  />
                  <span>Verified Purchase Badge</span>
                </label>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 focus:outline-none"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
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

      {/* DELETE REVIEW MODAL */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Review</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingReview.title || 'Review Entry'}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this review? All associated helpful/unhelpful votes will also be permanently removed.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
