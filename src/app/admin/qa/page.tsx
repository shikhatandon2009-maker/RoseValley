'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  ExternalLink,
  Package,
  User,
  ShieldCheck,
  Sparkles,
  Send,
  Clock
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

interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_official: boolean;
  created_at: string;
  users?: { full_name: string; email: string };
}

interface Question {
  id: string;
  store_id: string;
  product_id: string;
  user_id: string;
  question: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  products?: { id: string; name: string; images?: string[]; slug: string };
  users?: { id: string; full_name: string; email: string };
  answers?: Answer[];
}

interface Stats {
  totalQuestions: number;
  unansweredCount: number;
  approvedCount: number;
  officialAnswersCount: number;
}

export default function QAAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    unansweredCount: 0,
    approvedCount: 0,
    officialAnswersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [answerFilter, setAnswerFilter] = useState('all');

  // Modals & Inline Replies
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [replyingQuestion, setReplyingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  // Form states
  const [questionFormData, setQuestionFormData] = useState({
    product_id: '',
    user_id: '',
    question: '',
    status: 'approved' as 'pending' | 'approved' | 'rejected',
  });
  const [answerInputText, setAnswerInputText] = useState('');
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

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/qa?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (answerFilter !== 'all') url += `&filter=${answerFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch Q&A');

      setQuestions(data.questions || []);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading Q&A');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchQuestions();
  }, [statusFilter, answerFilter]);

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return questions;
    const term = search.toLowerCase().trim();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(term) ||
        (q.products?.name && q.products.name.toLowerCase().includes(term)) ||
        (q.users?.full_name && q.users.full_name.toLowerCase().includes(term)) ||
        (q.users?.email && q.users.email.toLowerCase().includes(term))
    );
  }, [questions, search]);

  const handleOpenAddQuestionModal = () => {
    setQuestionFormData({
      product_id: productsList.length > 0 ? productsList[0].id : '',
      user_id: usersList.length > 0 ? usersList[0].id : '',
      question: 'Is this attar 100% alcohol-free and safe for pulse point application?',
      status: 'approved',
    });
    setIsAddQuestionModalOpen(true);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.product_id || !questionFormData.user_id || !questionFormData.question.trim()) {
      showToast('error', 'Product, User, and Question text are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post question');

      showToast('success', 'Product question created successfully!');
      setIsAddQuestionModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostOfficialAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingQuestion || !answerInputText.trim()) {
      showToast('error', 'Please enter an answer.');
      return;
    }

    const adminUserId = usersList.find((u) => u.email.includes('admin'))?.id || usersList[0]?.id;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/qa/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: replyingQuestion.id,
          user_id: adminUserId,
          answer: answerInputText.trim(),
          is_official: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post answer');

      showToast('success', `Official answer posted to ${replyingQuestion.products?.name || 'question'}!`);
      setReplyingQuestion(null);
      setAnswerInputText('');
      fetchQuestions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to post answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuestionStatus = async (q: Question, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/qa/${q.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      showToast('success', `Question marked as ${newStatus.toUpperCase()}`);
      fetchQuestions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/qa/${deletingQuestion.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete question');

      showToast('success', 'Question deleted.');
      setDeletingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      const res = await fetch(`/api/admin/qa/answers?id=${answerId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete answer');

      showToast('success', 'Answer deleted.');
      fetchQuestions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete answer.');
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
            <HelpCircle className="w-4 h-4" /> Community & Customer Support
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Product Questions & Official Answers (Q&A)
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Answer shopper inquiries about fragrance notes, alcohol-free formulations, bottle sizes, and distillation purity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Q&A"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddQuestionModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product Question
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Product Questions</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalQuestions}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Unanswered Inbox</div>
            <div className="text-2xl font-bold font-serif text-rose-700 mt-1">{stats.unansweredCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Approved Questions</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.approvedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Official Staff Answers</div>
            <div className="text-2xl font-bold font-serif text-purple-700 mt-1">{stats.officialAnswersCount}</div>
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
            placeholder="Search by question, customer, or fragrance..."
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
            <span className="text-xs text-stone-600 font-bold">Answer Status:</span>
            <select
              value={answerFilter}
              onChange={(e) => setAnswerFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Inquiries</option>
              <option value="unanswered">Unanswered Inbox ({stats.unansweredCount})</option>
              <option value="answered">Answered Questions</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-bold">Approval:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Q&A Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center space-y-3 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading product inquiries from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 rounded-2xl border border-rose-300 bg-white shadow-sm">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <HelpCircle className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No product questions found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No questions matching search term "${search}".`
                : 'No customer questions submitted under this filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => {
              const answersList = q.answers || [];
              const isUnanswered = answersList.length === 0;

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-2xl bg-white border border-stone-200 transition-all space-y-4 shadow-sm"
                >
                  {/* Top Bar: Fragrance Product & Customer Inquirer */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold">
                        Q
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          {q.users?.full_name || 'Customer'}
                          {isUnanswered && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                              Needs Answer
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium">{q.users?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {q.products && (
                        <Link
                          href={`/products/${q.products.slug}`}
                          target="_blank"
                          className="px-3 py-1 rounded-xl bg-stone-50 border border-stone-300 text-amber-800 text-xs font-bold hover:border-amber-500 flex items-center gap-1.5 shadow-xs"
                        >
                          <Package className="w-3.5 h-3.5" /> {q.products.name}
                        </Link>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          q.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : q.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="space-y-1">
                    <div className="text-stone-900 font-bold text-sm">
                      "{q.question}"
                    </div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Asked on {new Date(q.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Published Answers Section */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Answers ({answersList.length})
                    </div>

                    {answersList.length === 0 ? (
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-500 italic">
                        No answers posted yet. Click "+ Reply / Post Answer" below to respond as Master Perfumer or Admin.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {answersList.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
                              ans.is_official
                                ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-200">
                                  {ans.users?.full_name || 'Maison Essence Staff'}
                                </span>
                                {ans.is_official && (
                                  <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> Official Store Response
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteAnswer(ans.id)}
                                className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                                title="Delete Answer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="leading-relaxed font-sans">{ans.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800/80">
                    <button
                      onClick={() => {
                        setReplyingQuestion(q);
                        setAnswerInputText('');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs transition-all shadow-md flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" /> + Reply / Post Official Answer
                    </button>

                    <div className="flex items-center gap-2">
                      {q.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateQuestionStatus(q, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {q.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateQuestionStatus(q, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingQuestion(q)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                        title="Delete Question"
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

      {/* CREATE QUESTION MODAL */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900">Add Product Question</h2>
              </div>
              <button onClick={() => setIsAddQuestionModalOpen(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Select Product *</label>
                  <select
                    required
                    value={questionFormData.product_id}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, product_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="" disabled>Select Product...</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Inquirer Customer *</label>
                  <select
                    required
                    value={questionFormData.user_id}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, user_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  >
                    <option value="" disabled>Select User...</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.question}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  placeholder="e.g. Is this attar steam-distilled or cold-pressed?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST REPLY / OFFICIAL ANSWER MODAL */}
      {replyingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-neutral-100">Post Official Response</h2>
                  <p className="text-[11px] text-amber-400">{replyingQuestion.products?.name}</p>
                </div>
              </div>
              <button onClick={() => setReplyingQuestion(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs space-y-1">
              <div className="text-[11px] text-neutral-400 font-medium">Question asked by {replyingQuestion.users?.full_name}:</div>
              <div className="text-neutral-100 font-serif italic font-semibold">"{replyingQuestion.question}"</div>
            </div>

            <form onSubmit={handlePostOfficialAnswer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">Official Response Body *</label>
                <textarea
                  rows={4}
                  required
                  value={answerInputText}
                  onChange={(e) => setAnswerInputText(e.target.value)}
                  placeholder="Enter official response from Maison Essence Master Perfumer..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setReplyingQuestion(null)}
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
                  {isSubmitting ? 'Posting...' : 'Post Official Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE QUESTION MODAL */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Question</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingQuestion.question}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this question? All associated staff and customer answers will also be deleted.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
