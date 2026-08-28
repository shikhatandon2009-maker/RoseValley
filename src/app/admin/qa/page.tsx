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
              ? 'bg-[#FAE6E7] border-emerald-500/40 text-emerald-950'
              : 'bg-[#FAE6E7] border-rose-500/40 text-rose-950'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-xs font-bold text-[#1A0510]">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-[#4A0D25] hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#4A0D25] uppercase tracking-widest">
            <HelpCircle className="w-4 h-4 text-[#F6A6BB]" /> Community & Customer Support
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#1A0510] mt-1">
            Product Questions & Official Answers (Q&A)
          </h1>
          <p className="text-[#4A0D25] text-xs mt-1 font-bold">
            Answer shopper inquiries about fragrance notes, alcohol-free formulations, bottle sizes, and distillation purity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white border border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7] transition-all disabled:opacity-50 shadow-xs"
            title="Refresh Q&A"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
          </button>
          <button
            onClick={handleOpenAddQuestionModal}
            className="px-4 py-2.5 rounded-2xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs transition-all shadow-xs flex items-center gap-2 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-[#4A0D25]" /> Add Product Question
          </button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold">Total Product Questions</div>
            <div className="text-2xl font-black font-serif text-[#1A0510] mt-1">{stats.totalQuestions}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7D1D8] text-[#4A0D25]">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold">Unanswered Inbox</div>
            <div className="text-2xl font-black font-serif text-rose-700 mt-1">{stats.unansweredCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 text-rose-800">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold">Approved Questions</div>
            <div className="text-2xl font-black font-serif text-emerald-800 mt-1">{stats.approvedCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#4A0D25] font-extrabold">Official Staff Answers</div>
            <div className="text-2xl font-black font-serif text-[#4A0D25] mt-1">{stats.officialAnswersCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F6A6BB] text-[#4A0D25]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#FAE6E7]/40 border border-[#F7D1D8] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#4A0D25] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question, customer, or fragrance..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] font-bold"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A0D25] hover:text-[#1A0510]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4A0D25] font-extrabold">Answer Status:</span>
            <select
              value={answerFilter}
              onChange={(e) => setAnswerFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] font-bold"
            >
              <option value="all">All Inquiries</option>
              <option value="unanswered">Unanswered Inbox ({stats.unansweredCount})</option>
              <option value="answered">Answered Questions</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4A0D25] font-extrabold">Approval:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] font-bold"
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
          <div className="p-16 text-center space-y-3 rounded-3xl border border-[#F7D1D8] bg-[#FAE6E7]/30 shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
            <p className="text-xs text-[#4A0D25] font-bold">Loading product inquiries...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3 rounded-3xl border border-rose-300 bg-rose-50 shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 rounded-2xl bg-white border border-rose-300 text-xs text-rose-900 font-extrabold hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-3xl border border-[#F7D1D8] bg-[#FAE6E7]/30 shadow-xs">
            <HelpCircle className="w-10 h-10 text-[#F6A6BB] mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#1A0510]">No product questions found</h3>
            <p className="text-xs text-[#4A0D25] max-w-sm mx-auto font-semibold">
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
                  className="p-6 rounded-3xl bg-white border-2 border-[#F7D1D8] transition-all space-y-4 shadow-sm hover:shadow-md"
                >
                  {/* Top Bar: Fragrance Product & Customer Inquirer */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] font-serif font-black text-base">
                        Q
                      </div>
                      <div>
                        <div className="font-extrabold text-[#1A0510] text-sm flex items-center gap-2">
                          {q.users?.full_name || 'Customer'}
                          {isUnanswered && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black uppercase tracking-wider">
                              Needs Answer
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#4A0D25] font-bold">{q.users?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {q.products && (
                        <Link
                          href={`/products/${q.products.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black hover:bg-[#F6A6BB] flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-[#F6A6BB]" /> {q.products.name}
                        </Link>
                      )}

                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                          q.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : q.status === 'rejected'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="space-y-1">
                    <div className="text-[#1A0510] font-serif font-extrabold text-base">
                      "{q.question}"
                    </div>
                    <div className="text-[10px] text-[#4A0D25] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#F6A6BB]" />
                      Asked on {new Date(q.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Published Answers Section */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-black text-[#4A0D25] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#F6A6BB]" /> Answers ({answersList.length})
                    </div>

                    {answersList.length === 0 ? (
                      <div className="p-3.5 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#4A0D25] italic font-semibold">
                        No answers posted yet. Click "+ Reply / Post Answer" below to respond as Master Perfumer or Admin.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {answersList.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-2xl text-xs space-y-1.5 border ${
                              ans.is_official
                                ? 'bg-[#FAE6E7] border-[#F7D1D8] text-[#1A0510]'
                                : 'bg-white border-[#F7D1D8] text-[#1A0510]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[#1A0510]">
                                  {ans.users?.full_name || 'RoseOil.in Botanical Specialist'}
                                </span>
                                {ans.is_official && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                    <Sparkles className="w-2.5 h-2.5" /> Official Store Response
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteAnswer(ans.id)}
                                className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                title="Delete Answer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="leading-relaxed font-semibold text-[#4A0D25]">{ans.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[#F7D1D8]">
                    <button
                      onClick={() => {
                        setReplyingQuestion(q);
                        setAnswerInputText('');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs transition-all shadow-xs flex items-center gap-2 uppercase tracking-wider"
                    >
                      <Send className="w-3.5 h-3.5" /> + Reply / Post Official Answer
                    </button>

                    <div className="flex items-center gap-2">
                      {q.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateQuestionStatus(q, 'approved')}
                          className="px-3 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold hover:bg-emerald-200 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {q.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateQuestionStatus(q, 'rejected')}
                          className="px-3 py-1.5 rounded-2xl bg-rose-100 text-rose-900 border border-rose-300 text-xs font-extrabold hover:bg-rose-200 transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingQuestion(q)}
                        className="p-2 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-all"
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
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <HelpCircle className="w-4 h-4 text-[#F6A6BB]" />
                </div>
                <h2 className="text-lg font-serif font-extrabold text-[#1A0510]">Add Product Question</h2>
              </div>
              <button onClick={() => setIsAddQuestionModalOpen(false)} className="p-1 rounded-xl text-[#4A0D25] hover:bg-[#FAE6E7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#4A0D25] mb-1">Select Product *</label>
                  <select
                    required
                    value={questionFormData.product_id}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, product_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  >
                    <option value="" disabled>Select Product...</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#4A0D25] mb-1">Inquirer Customer *</label>
                  <select
                    required
                    value={questionFormData.user_id}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, user_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  >
                    <option value="" disabled>Select User...</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#4A0D25] mb-1">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.question}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  placeholder="e.g. Is this attar steam-distilled or cold-pressed?"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-[#4A0D25] hover:bg-[#FAE6E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs shadow-xs disabled:opacity-50 uppercase tracking-wider"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <Send className="w-4 h-4 text-[#F6A6BB]" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-extrabold text-[#1A0510]">Post Official Response</h2>
                  <p className="text-[11px] text-[#4A0D25] font-bold">{replyingQuestion.products?.name}</p>
                </div>
              </div>
              <button onClick={() => setReplyingQuestion(null)} className="p-1 rounded-xl text-[#4A0D25] hover:bg-[#FAE6E7]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] text-xs space-y-1">
              <div className="text-[11px] text-[#4A0D25] font-bold">Question asked by {replyingQuestion.users?.full_name}:</div>
              <div className="text-[#1A0510] font-serif italic font-bold text-sm">"{replyingQuestion.question}"</div>
            </div>

            <form onSubmit={handlePostOfficialAnswer} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#4A0D25] mb-1">Official Response Body *</label>
                <textarea
                  rows={4}
                  required
                  value={answerInputText}
                  onChange={(e) => setAnswerInputText(e.target.value)}
                  placeholder="Enter official response from RoseOil.in Botanical Specialist..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FAE6E7]/40 border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setReplyingQuestion(null)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-[#4A0D25] hover:bg-[#FAE6E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs shadow-xs disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-extrabold text-[#1A0510]">Delete Question</h3>
                <p className="text-xs text-rose-900 font-bold">{deletingQuestion.question}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A0D25] leading-relaxed font-bold">
              Are you sure you want to delete this question? All associated staff and customer answers will also be deleted.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setDeletingQuestion(null)}
                className="px-4 py-2.5 rounded-2xl text-xs font-extrabold text-[#4A0D25] hover:bg-[#FAE6E7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs disabled:opacity-50 uppercase tracking-wider"
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
