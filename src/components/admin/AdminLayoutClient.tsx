'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminSeoDrawer from '@/components/admin/AdminSeoDrawer';
import { Bell, Search, ShieldCheck, Menu, Sparkles } from 'lucide-react';

import AdminScrollToTop from '@/components/admin/AdminScrollToTop';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seoDrawerOpen, setSeoDrawerOpen] = useState(false);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const [targetPageId, setTargetPageId] = useState<string | null>(null);

  // Listen to global event 'open_seo_drawer' from any admin table/button
  useEffect(() => {
    const handleOpenDrawer = (e: any) => {
      const detail = e.detail || {};
      if (detail.productId) setTargetProductId(detail.productId);
      if (detail.pageId) setTargetPageId(detail.pageId);
      setSeoDrawerOpen(true);
    };

    window.addEventListener('open_seo_drawer', handleOpenDrawer);
    return () => window.removeEventListener('open_seo_drawer', handleOpenDrawer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex font-sans antialiased selection:bg-[#F6A6BB] selection:text-neutral-950">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Dedicated SEO & Content Studio Sidebar Drawer */}
      <AdminSeoDrawer
        isOpen={seoDrawerOpen}
        onClose={() => {
          setSeoDrawerOpen(false);
          setTargetProductId(null);
          setTargetPageId(null);
        }}
        initialProductId={targetProductId}
        initialPageId={targetPageId}
        onSuccess={() => {
          window.dispatchEvent(new Event('refresh_admin_data'));
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7EEED]">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-[#F7D1D8] bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs gap-3">
          {/* Left: Hamburger + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-all flex-shrink-0 cursor-pointer"
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
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* ⚡ Quick SEO & Content Studio Drawer Button */}
            <button
              type="button"
              onClick={() => {
                setTargetProductId(null);
                setTargetPageId(null);
                setSeoDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#4A0D25] to-[#7A1840] hover:from-[#7A1840] hover:to-[#4A0D25] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB] animate-pulse" />
              <span className="hidden xs:inline">SEO & Content Studio</span>
              <span className="xs:hidden">SEO</span>
            </button>

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

        {/* Global Interactive Scroll To Top Button */}
        <AdminScrollToTop />
      </div>
    </div>
  );
}
