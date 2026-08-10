'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <ChatWindow onClose={() => setIsOpen(false)} />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-gold hover:opacity-95 text-white p-3.5 rounded-full shadow-luxury-lg flex items-center justify-center gap-2 group transition-all hover:scale-105 active:scale-95"
          aria-label="Open Fragrance AI Concierge Chat"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Fragrance Concierge</span>
        </button>
      )}
    </div>
  );
}
