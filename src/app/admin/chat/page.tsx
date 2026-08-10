'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Bot,
  Brain,
  Send,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Clock,
  Sparkles,
  BookOpen,
  Terminal,
  MessageCircle,
  Flame
} from 'lucide-react';

interface ChatMessage {
  id: string;
  store_id: string;
  session_id: string;
  user_id?: string;
  message: string;
  sender: 'user' | 'bot';
  created_at: string;
  users?: { full_name: string; email: string };
}

interface ChatSession {
  session_id: string;
  user?: { full_name: string; email: string };
  messages: ChatMessage[];
  last_activity: string;
}

interface KnowledgeTopic {
  id: string;
  store_id: string;
  topic: string;
  content: string;
  created_at: string;
}

interface Stats {
  totalSessions: number;
  userMessagesCount: number;
  botResponsesCount: number;
}

export default function ChatAdminPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'knowledge'>('logs');

  // Chat Logs State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    userMessagesCount: 0,
    botResponsesCount: 0,
  });

  // Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeTopic[]>([]);

  // Common UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals & Inputs
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isAddKnowledgeOpen, setIsAddKnowledgeOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeTopic | null>(null);
  const [deletingKnowledge, setDeletingKnowledge] = useState<KnowledgeTopic | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const [knowledgeForm, setKnowledgeForm] = useState({
    topic: '',
    content: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/chat?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chat logs');

      setSessions(data.sessions || []);
      if (data.stats) setStats(data.stats);

      // Auto-select first session if none selected
      if (!selectedSession && data.sessions?.length > 0) {
        setSelectedSession(data.sessions[0]);
      } else if (selectedSession && data.sessions) {
        const updated = data.sessions.find((s: any) => s.session_id === selectedSession.session_id);
        if (updated) setSelectedSession(updated);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading chat sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/chat/knowledge?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chatbot knowledge');

      setKnowledgeList(data.knowledge || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading chatbot knowledge base');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchChatSessions();
    } else {
      fetchKnowledgeBase();
    }
  }, [activeTab]);

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const term = search.toLowerCase().trim();
    return sessions.filter(
      (s) =>
        s.session_id.toLowerCase().includes(term) ||
        (s.user?.full_name && s.user.full_name.toLowerCase().includes(term)) ||
        (s.user?.email && s.user.email.toLowerCase().includes(term)) ||
        s.messages.some((m) => m.message.toLowerCase().includes(term))
    );
  }, [sessions, search]);

  const filteredKnowledge = useMemo(() => {
    if (!search.trim()) return knowledgeList;
    const term = search.toLowerCase().trim();
    return knowledgeList.filter(
      (k) => k.topic.toLowerCase().includes(term) || k.content.toLowerCase().includes(term)
    );
  }, [knowledgeList, search]);

  // Handlers for Chat Logs
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !adminReplyText.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.session_id,
          message: adminReplyText.trim(),
          sender: 'bot',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');

      showToast('success', 'Admin reply sent to chat session!');
      setAdminReplyText('');
      fetchChatSessions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat?session_id=${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete chat session');

      showToast('success', 'Chat session transcript deleted.');
      if (selectedSession?.session_id === sessionId) setSelectedSession(null);
      fetchChatSessions();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete chat transcript.');
    }
  };

  // Handlers for Knowledge Base
  const handleOpenAddKnowledge = () => {
    setKnowledgeForm({
      topic: 'Kannauj Copper Deg-Bhapka Distillation',
      content:
        'Our attars are distilled in Kannauj using 400-year-old traditional copper stills (Degs) and bamboo receiving vessels (Bhapkas). The process requires no alcohol, synthetic solvers, or chemical additives.',
    });
    setIsAddKnowledgeOpen(true);
  };

  const handleOpenEditKnowledge = (k: KnowledgeTopic) => {
    setEditingKnowledge(k);
    setKnowledgeForm({
      topic: k.topic,
      content: k.content,
    });
  };

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeForm.topic.trim() || !knowledgeForm.content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/chat/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add knowledge topic');

      showToast('success', 'Knowledge topic added to Chatbot AI brain!');
      setIsAddKnowledgeOpen(false);
      fetchKnowledgeBase();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add knowledge topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKnowledge) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/chat/knowledge?id=${editingKnowledge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update topic');

      showToast('success', 'Knowledge topic updated.');
      setEditingKnowledge(null);
      fetchKnowledgeBase();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKnowledge = async () => {
    if (!deletingKnowledge) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/chat/knowledge?id=${deletingKnowledge.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete topic');

      showToast('success', 'Knowledge topic deleted.');
      setDeletingKnowledge(null);
      fetchKnowledgeBase();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete topic.');
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
            <Bot className="w-4 h-4" /> Conversational AI & Live Concierge
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Customer Chat Transcripts & AI Knowledge Base
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Audit live visitor chatbot conversations, step in as human concierge, and train the Chatbot AI knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={activeTab === 'logs' ? fetchChatSessions : fetchKnowledgeBase}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          {activeTab === 'knowledge' && (
            <button
              onClick={handleOpenAddKnowledge}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add AI Knowledge Topic
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'logs'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Live Customer Chat Transcripts ({stats.totalSessions})
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`pb-3.5 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'knowledge'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Brain className="w-4 h-4 text-purple-400" /> Chatbot AI Knowledge Base ({knowledgeList.length})
        </button>
      </div>

      {/* TAB 1: CHAT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Metrics Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Active Chat Sessions</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalSessions}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Customer Inquiries Sent</div>
            <div className="text-2xl font-bold font-serif text-purple-700 mt-1">{stats.userMessagesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Bot & Concierge Responses</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.botResponsesCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Bot className="w-5 h-5" />
          </div>
        </div>
      </div>

          {/* Chat Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            {/* Sessions Sidebar */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chat sessions..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-medium focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Conversations ({filteredSessions.length})
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-4 text-center font-medium">No chat sessions found.</p>
                ) : (
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredSessions.map((s) => {
                      const isSelected = selectedSession?.session_id === s.session_id;
                      const lastMsg = s.messages[s.messages.length - 1];

                      return (
                        <button
                          key={s.session_id}
                          onClick={() => setSelectedSession(s)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-amber-50 border-amber-300 text-stone-900 shadow-sm'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-amber-800 text-xs shrink-0">
                            {s.user?.full_name?.charAt(0) || 'G'}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs truncate text-stone-900">
                                {s.user?.full_name || 'Guest Visitor'}
                              </span>
                              <span className="text-[9px] text-stone-500 font-mono">
                                {new Date(s.last_activity).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 truncate font-medium">
                              {lastMsg ? lastMsg.message : 'No messages'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Transcript Area */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
              {!selectedSession ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-3">
                  <Bot className="w-10 h-10 text-stone-400" />
                  <p className="text-xs text-stone-500 font-medium">Select a conversation from the left to view transcript.</p>
                </div>
              ) : (
                <>
                  {/* Transcript Header */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs">
                        {selectedSession.user?.full_name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">
                          {selectedSession.user?.full_name || 'Guest Visitor'}
                        </div>
                        <div className="font-mono text-[10px] text-stone-500">
                          Session: {selectedSession.session_id}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(selectedSession.session_id)}
                      className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors"
                      title="Delete Session Transcript"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages Bubble Area */}
                  <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                    {selectedSession.messages.map((m) => {
                      const isUser = m.sender === 'user';

                      return (
                        <div
                          key={m.id}
                          className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                              isUser
                                ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                                : 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-100 rounded-tr-none'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 text-[9px] text-neutral-400 font-medium">
                              <span>{isUser ? 'Customer' : 'Scent Advisor AI / Staff'}</span>
                              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="leading-relaxed font-sans">{m.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Concierge Reply Input */}
                  <form onSubmit={handleSendAdminReply} className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Step in as Human Concierge to reply..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !adminReplyText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reply
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHATBOT KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search AI knowledge base topics..."
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="md:col-span-2 p-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs text-neutral-400">Loading AI Knowledge Base from Supabase...</p>
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <div className="md:col-span-2 p-16 text-center space-y-4 rounded-2xl border border-amber-500/20 bg-neutral-900/60">
                <Brain className="w-10 h-10 text-neutral-600 mx-auto" />
                <h3 className="text-base font-serif font-bold text-neutral-300">No knowledge base topics</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click "Add AI Knowledge Topic" to train your AI Chatbot on Kannauj attar craftsmanship and store FAQs.
                </p>
              </div>
            ) : (
              filteredKnowledge.map((k) => (
                <div
                  key={k.id}
                  className="p-5 rounded-2xl bg-neutral-900/80 border border-amber-500/20 space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-amber-300 text-base">{k.topic}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditKnowledge(k)}
                          className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-amber-300 transition-colors"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingKnowledge(k)}
                          className="p-1.5 rounded-lg bg-neutral-950 text-neutral-400 hover:text-rose-400 transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800/80 whitespace-pre-line font-sans">
                      {k.content}
                    </p>
                  </div>

                  <div className="text-[10px] text-neutral-500 flex items-center gap-1 border-t border-neutral-800/80 pt-2">
                    <Clock className="w-3 h-3" /> Updated on {new Date(k.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT KNOWLEDGE MODAL */}
      {(isAddKnowledgeOpen || editingKnowledge) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Brain className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">
                  {editingKnowledge ? 'Edit AI Knowledge Topic' : 'Add AI Knowledge Topic'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddKnowledgeOpen(false);
                  setEditingKnowledge(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingKnowledge ? handleUpdateKnowledge : handleCreateKnowledge}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Knowledge Topic Title *</label>
                <input
                  type="text"
                  required
                  value={knowledgeForm.topic}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, topic: e.target.value })}
                  placeholder="e.g. Hydro-Distillation & Alcohol-Free Purity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">AI Context & Instructions *</label>
                <textarea
                  rows={6}
                  required
                  value={knowledgeForm.content}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })}
                  placeholder="Enter detailed knowledge base facts and instructions for the chatbot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddKnowledgeOpen(false);
                    setEditingKnowledge(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Knowledge Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE KNOWLEDGE MODAL */}
      {deletingKnowledge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete Knowledge Topic</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingKnowledge.topic}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this AI knowledge base entry?
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingKnowledge(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteKnowledge}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
