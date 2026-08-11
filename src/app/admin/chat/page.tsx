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
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#4A0D25] uppercase tracking-wider">
            <Bot className="w-4 h-4 text-[#F6A6BB]" /> Conversational AI & Live Concierge
          </div>
          <h1 className="text-3xl font-serif font-extrabold text-[#1A0510] mt-1">
            Customer Chat Transcripts & AI Knowledge Base
          </h1>
          <p className="text-[#4A0D25] text-xs mt-1 font-semibold">
            Audit live visitor chatbot conversations, step in as human concierge, and train the Chatbot AI knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={activeTab === 'logs' ? fetchChatSessions : fetchKnowledgeBase}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7] transition-all disabled:opacity-50 shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F6A6BB]' : ''}`} />
          </button>
          {activeTab === 'knowledge' && (
            <button
              onClick={handleOpenAddKnowledge}
              className="px-5 py-2.5 rounded-xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#F6A6BB]" /> Add AI Knowledge Topic
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-[#F7D1D8] pb-1">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'logs'
              ? 'border-[#4A0D25] bg-white text-[#4A0D25] shadow-xs'
              : 'border-transparent text-[#4A0D25]/70 hover:text-[#1A0510] hover:bg-[#FAE6E7]/50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#F6A6BB]" /> Live Customer Chat Transcripts ({stats.totalSessions})
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-5 py-3 rounded-t-xl text-xs font-black transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'knowledge'
              ? 'border-[#4A0D25] bg-white text-[#4A0D25] shadow-xs'
              : 'border-transparent text-[#4A0D25]/70 hover:text-[#1A0510] hover:bg-[#FAE6E7]/50'
          }`}
        >
          <Brain className="w-4 h-4 text-[#4A0D25]" /> Chatbot AI Knowledge Base ({knowledgeList.length})
        </button>
      </div>

      {/* TAB 1: CHAT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Active Chat Sessions</div>
                <div className="text-2xl font-bold font-serif text-[#1A0510] mt-1">{stats.totalSessions}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
                <MessageCircle className="w-5 h-5 text-[#F6A6BB]" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Customer Inquiries Sent</div>
                <div className="text-2xl font-bold font-serif text-[#4A0D25] mt-1">{stats.userMessagesCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
                <User className="w-5 h-5 text-[#F6A6BB]" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs text-[#4A0D25] font-black uppercase tracking-wider">Bot & Concierge Responses</div>
                <div className="text-2xl font-bold font-serif text-emerald-800 mt-1">{stats.botResponsesCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Chat Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            {/* Sessions Sidebar */}
            <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#4A0D25] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chat sessions..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-bold text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:border-[#F6A6BB] focus:bg-white transition-all"
                  />
                </div>

                <div className="text-[11px] font-black text-[#4A0D25] uppercase tracking-wider">
                  Conversations ({filteredSessions.length})
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-6 h-6 text-[#F6A6BB] animate-spin mx-auto" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <p className="text-xs text-[#4A0D25] italic p-4 text-center font-bold">No chat sessions found.</p>
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
                              ? 'bg-[#4A0D25] text-white border-[#4A0D25] shadow-xs'
                              : 'bg-white border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7]/60'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-white text-[#4A0D25] border-white' : 'bg-[#FAE6E7] text-[#4A0D25] border-[#F7D1D8]'
                          }`}>
                            {s.user?.full_name?.charAt(0) || 'G'}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-[#1A0510]'}`}>
                                {s.user?.full_name || 'Guest Visitor'}
                              </span>
                              <span className={`text-[9px] font-mono ${isSelected ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`}>
                                {new Date(s.last_activity).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className={`text-[11px] truncate font-semibold ${isSelected ? 'text-[#FAE6E7]' : 'text-[#4A0D25]'}`}>
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
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex flex-col justify-between space-y-4">
              {!selectedSession ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-3">
                  <div className="p-4 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25]">
                    <Bot className="w-8 h-8 text-[#F6A6BB]" />
                  </div>
                  <p className="text-xs text-[#4A0D25] font-extrabold">Select a conversation from the left to view transcript.</p>
                </div>
              ) : (
                <>
                  {/* Transcript Header */}
                  <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] font-black text-xs">
                        {selectedSession.user?.full_name?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#1A0510] text-sm">
                          {selectedSession.user?.full_name || 'Guest Visitor'}
                        </div>
                        <div className="font-mono text-[10px] text-[#4A0D25] font-bold">
                          Session: {selectedSession.session_id}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(selectedSession.session_id)}
                      className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors"
                      title="Delete Session Transcript"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages Bubble Area */}
                  <div className="flex-1 space-y-3 max-h-[380px] overflow-y-auto p-4 bg-[#F7EEED]/60 rounded-2xl border border-[#F7D1D8]">
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
                                ? 'bg-white border border-[#F7D1D8] text-[#1A0510] shadow-xs rounded-tl-none font-medium'
                                : 'bg-[#4A0D25] text-white shadow-xs rounded-tr-none'
                            }`}
                          >
                            <div className={`flex items-center justify-between gap-4 text-[9px] font-bold ${
                              isUser ? 'text-[#4A0D25]' : 'text-[#F6A6BB]'
                            }`}>
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
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-bold text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:border-[#F6A6BB] focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !adminReplyText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-[#F6A6BB]" /> Send Reply
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
          <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#4A0D25] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search AI knowledge base topics..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-bold text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:border-[#F6A6BB] focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1A0510]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? (
              <div className="md:col-span-2 p-16 text-center space-y-3 bg-white rounded-2xl border border-[#F7D1D8]">
                <RefreshCw className="w-8 h-8 text-[#F6A6BB] animate-spin mx-auto" />
                <p className="text-xs text-[#4A0D25] font-bold">Loading AI Knowledge Base from Supabase...</p>
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <div className="md:col-span-2 p-16 text-center space-y-4 rounded-2xl border border-[#F7D1D8] bg-white shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] mx-auto">
                  <Brain className="w-7 h-7 text-[#F6A6BB]" />
                </div>
                <h3 className="text-lg font-serif font-extrabold text-[#1A0510]">No knowledge base topics</h3>
                <p className="text-xs text-[#4A0D25] font-semibold max-w-sm mx-auto leading-relaxed">
                  Click "Add AI Knowledge Topic" to train your AI Chatbot on Kannauj attar craftsmanship and store FAQs.
                </p>
              </div>
            ) : (
              filteredKnowledge.map((k) => (
                <div
                  key={k.id}
                  className="p-6 rounded-2xl bg-white border border-[#F7D1D8] space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-extrabold text-[#1A0510] text-base">{k.topic}</h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditKnowledge(k)}
                          className="p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-colors"
                          title="Edit Topic"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingKnowledge(k)}
                          className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#1A0510] leading-relaxed bg-[#F7EEED] p-4 rounded-xl border border-[#F7D1D8] whitespace-pre-line font-medium">
                      {k.content}
                    </p>
                  </div>

                  <div className="text-[10px] text-[#4A0D25] font-bold flex items-center gap-1 border-t border-[#F7D1D8] pt-3">
                    <Clock className="w-3 h-3 text-[#F6A6BB]" /> Updated on {new Date(k.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT KNOWLEDGE MODAL */}
      {(isAddKnowledgeOpen || editingKnowledge) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <Brain className="w-5 h-5 text-[#F6A6BB]" />
                </div>
                <h2 className="text-lg font-serif font-extrabold text-[#1A0510]">
                  {editingKnowledge ? 'Edit AI Knowledge Topic' : 'Add AI Knowledge Topic'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddKnowledgeOpen(false);
                  setEditingKnowledge(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-[#1A0510]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingKnowledge ? handleUpdateKnowledge : handleCreateKnowledge}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-black text-[#4A0D25] uppercase tracking-wider mb-1">Knowledge Topic Title *</label>
                <input
                  type="text"
                  required
                  value={knowledgeForm.topic}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, topic: e.target.value })}
                  placeholder="e.g. Hydro-Distillation & Alcohol-Free Purity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-bold text-[#1A0510] placeholder-[#4A0D25]/40 focus:outline-none focus:border-[#F6A6BB] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4A0D25] uppercase tracking-wider mb-1">AI Context & Instructions *</label>
                <textarea
                  rows={6}
                  required
                  value={knowledgeForm.content}
                  onChange={(e) => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })}
                  placeholder="Enter detailed knowledge base facts and instructions for the chatbot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-xs font-medium text-[#1A0510] placeholder-[#4A0D25]/40 focus:outline-none focus:border-[#F6A6BB] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddKnowledgeOpen(false);
                    setEditingKnowledge(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black text-stone-600 hover:text-[#1A0510] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#F7D1D8] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F7D1D8] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-extrabold text-[#1A0510]">Delete Knowledge Topic</h3>
                <p className="text-xs font-bold text-rose-700">{deletingKnowledge.topic}</p>
              </div>
            </div>

            <p className="text-xs text-[#4A0D25] font-semibold leading-relaxed bg-rose-50/50 p-3.5 rounded-xl border border-rose-100">
              Are you sure you want to delete this AI knowledge base entry?
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F7D1D8]">
              <button
                type="button"
                onClick={() => setDeletingKnowledge(null)}
                className="px-4 py-2 rounded-xl text-xs font-black text-stone-600 hover:text-[#1A0510] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteKnowledge}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
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
