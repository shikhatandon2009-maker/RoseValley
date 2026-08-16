'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, CheckCircle2, Database, Zap, ShieldCheck } from 'lucide-react';

export default function CartItemsAdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-white border border-[#F7D1D8] shadow-luxury space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black text-[#1A0510]">Live Cart Tracking</h1>
            <p className="text-xs text-[#4A0D25]/70 font-semibold">High-Performance Client-Side Cart Optimization</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-emerald-950 font-medium">
            <div className="font-bold text-emerald-900">Database Resource Optimization Active</div>
            <p>
              Live server-side cart polling and sync have been disabled to conserve Supabase database compute resources and eliminate excessive read/write queries. Shopping carts now operate at zero-latency entirely on the customer's browser.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#4A0D25]">Database Tables to Drop in Supabase:</h3>
          <div className="p-4 rounded-xl bg-[#1A0510] text-[#F6A6BB] font-mono text-xs select-all">
            DROP TABLE IF EXISTS cart_items CASCADE;
          </div>
        </div>

        <div className="pt-4 border-t border-[#F7D1D8] flex gap-3">
          <Link
            href="/admin/orders"
            className="px-5 py-2.5 rounded-xl bg-[#4A0D25] hover:bg-[#1A0510] text-white text-xs font-bold transition-all shadow-md"
          >
            View Completed Orders
          </Link>
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold hover:bg-[#F7D1D8] transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
