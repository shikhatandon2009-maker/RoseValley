'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Bell, Search, ShieldCheck, Menu } from 'lucide-react';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex font-sans antialiased selection:bg-[#F6A6BB] selection:text-neutral-950">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7EEED]">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-[#F7D1D8] bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs gap-3">
          {/* Left: Hamburger + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-all flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-sm hidden sm:block">
              <Search className="w-4 h-4 text-[#4A0D25] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, products, SKU..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F7EEED] border border-[#F7D1D8] text-xs text-[#1A0510] font-bold placeholder-[#4A0D25]/60 focus:outline-none focus:border-[#F6A6BB] transition-all"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Mobile search button */}
            <button className="sm:hidden p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25]">
              <Search className="w-4 h-4" />
            </button>

            <button className="relative p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F6A6BB] rounded-full ring-2 ring-white" />
            </button>

            <div className="h-6 w-[1px] bg-[#F7D1D8] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4A0D25] to-[#F6A6BB] p-0.5 shadow-md">
                <div className="w-full h-full bg-[#1A0510] rounded-full flex items-center justify-center text-[#F6A6BB] font-black text-xs">
                  AD
                </div>
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-black text-[#1A0510] flex items-center gap-1">
                  Admin <ShieldCheck className="w-3 h-3 text-[#F6A6BB]" />
                </div>
                <div className="text-[10px] text-[#4A0D25] font-semibold truncate max-w-[120px]">admin@rosevalley.in</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
