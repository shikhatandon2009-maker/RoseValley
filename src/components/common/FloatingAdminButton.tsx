'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles } from 'lucide-react';

export function FloatingAdminButton() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center group">
      <Link
        href="/admin"
        className="flex items-center gap-2.5 px-4 py-3 bg-[#4A0D25] text-[#F6A6BB] font-serif font-bold text-xs rounded-l-2xl border-l-2 border-y border-[#F7D1D8] shadow-2xl hover:border-[#F6A6BB] hover:bg-[#F6A6BB] hover:text-[#4A0D25] hover:-translate-x-1 transition-all backdrop-blur-md"
        title="Open Admin Executive Suite (/admin)"
      >
        <div className="w-6 h-6 rounded-lg bg-[#FAE6E7]/20 border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB] group-hover:rotate-12 transition-transform">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <span className="tracking-wider uppercase text-[11px] hidden sm:inline font-sans font-extrabold">
          Admin Suite
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB] animate-pulse" />
      </Link>
    </div>
  );
}
