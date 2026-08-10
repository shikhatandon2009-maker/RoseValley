import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Bell, Search, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Maison De L\'Essence',
  description: 'Luxury Perfumes & Essential Oils Management Platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex font-sans antialiased selection:bg-[#D4AF37] selection:text-neutral-950">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F5]">
        {/* Top Header */}
        <header className="h-16 border-b border-stone-200 bg-white sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
          {/* Left: Quick Search */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, customers, products, SKU..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-5">
            <button className="relative p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-4 ring-white" />
            </button>

            <div className="h-6 w-[1px] bg-stone-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md">
                <div className="w-full h-full bg-stone-900 rounded-full flex items-center justify-center text-amber-300 font-bold text-xs">
                  AD
                </div>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-stone-900 flex items-center gap-1">
                  Master Administrator <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-[10px] text-stone-500 font-medium">admin@maisonessence.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
