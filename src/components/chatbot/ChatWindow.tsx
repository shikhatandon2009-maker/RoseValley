'use client';

import React, { useState } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Greetings! I am your Maison De L\'Essence fragrance concierge. Ask me about our notes, ingredients, order status, or shipping details!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chatbot-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText }),
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'Our fragrance team is reviewing your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'I am temporarily offline. Please contact support@maisonessence.com for immediate help.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 sm:w-96 h-[480px] glass-panel rounded-2xl shadow-luxury-lg border border-[#E8B8B8] flex flex-col overflow-hidden animate-in zoom-in-95">
      {/* Header */}
      <div className="p-4 bg-gradient-dark-luxury text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E08A9A]/30 flex items-center justify-center border border-[#E8B8B8]">
            <Sparkles className="w-4 h-4 text-[#F2D4D4]" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-white">Maison Concierge AI</h3>
            <span className="text-[10px] text-[#F2D4D4] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Connected to Store Database
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#F2D4D4] hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8E8E8]/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user' ? 'bg-[#D45A7A] text-white' : 'bg-[#5A1030] text-[#F2D4D4]'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#D45A7A] text-white rounded-tr-none'
                  : 'bg-white border border-[#E8B8B8] text-[#5A1030] rounded-tl-none shadow-sm'
              }`}
            >
              <p>{msg.text}</p>
              <span className={`text-[9px] block mt-1 opacity-70 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#9A2048]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B03060]" />
            <span>Consulting database...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#F2D4D4] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, orders, ingredients..."
          className="flex-1 text-xs bg-[#F8E8E8] border border-[#E8B8B8] rounded-full py-2 px-3.5 text-[#5A1030] placeholder-[#9A2048]/60 focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-[#D45A7A] hover:bg-[#C94A6A] disabled:opacity-50 text-white rounded-full transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
