'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle, Package, MessageSquare, Info } from 'lucide-react';
import { useNotificationStore } from '@/store/notification-store';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#5A1030] hover:text-[#D45A7A] transition-colors focus:outline-none"
        aria-label="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#B03060] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-xl shadow-luxury-lg z-50 p-4 border border-[#E8B8B8] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2D4D4] mb-3">
            <h4 className="font-serif font-semibold text-[#7A1840] text-sm">Notifications</h4>
            <span className="text-xs text-[#9A2048] bg-[#F2D4D4] px-2 py-0.5 rounded-full font-medium">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-center text-[#9A2048] py-4">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    item.read
                      ? 'bg-white/40 border-[#F2D4D4] opacity-75'
                      : 'bg-[#F8E8E8] border-[#E08A9A] shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#E8B8B8]/30 rounded-full text-[#B03060] shrink-0 mt-0.5">
                      {item.type === 'order' ? <Package className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#5A1030]">{item.title}</p>
                      <p className="text-[#7A1840] text-[11px] mt-0.5 line-clamp-2">{item.message}</p>
                      <span className="text-[9px] text-[#9A2048] mt-1 block opacity-70">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
