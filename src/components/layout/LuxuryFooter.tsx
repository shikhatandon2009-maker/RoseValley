'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Award, Droplet, Shield } from 'lucide-react';

export function LuxuryFooter() {
  return (
    <footer className="bg-[#F7EEED] text-[#1A0510] border-t border-[#F7D1D8] pt-16 pb-12 font-sans relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Brand Authority Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 border-b border-[#F7D1D8]">
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-2xl text-[#1A0510] tracking-wider">
              ROSE VALLEY KANNAUJ
            </h2>
            <p className="text-xs text-[#4A0D25] leading-relaxed max-w-sm font-medium">
              World’s Largest Producer of Pure Rose Oil. Distilling rare Rosa Damascena and hydro-distilled botanical attars in Kannauj copper stills for over four centuries.
            </p>
          </div>

          {/* Three Mandatory Brand Positionings Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Sparkles className="w-4 h-4 text-[#F6A6BB]" /> World&apos;s Largest
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Producer of Pure Rose Oil & Attars</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Award className="w-4 h-4 text-[#F6A6BB]" /> 400-Year Heritage
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Copper Deg-Bhapka Distillation</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Droplet className="w-4 h-4 text-[#F6A6BB]" /> 100% Alcohol-Free
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Pure Botanical Hydro-Distillates</div>
            </div>
          </div>
        </div>

        {/* Navigation & Press Column */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Collections */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              Collections
            </h3>
            <ul className="space-y-2 text-[#4A0D25] font-bold">
              <li><Link href="/products?category=artisanal-perfumes" className="hover:text-[#F6A6BB] transition-colors">Artisanal Attars (Ruh Gulab)</Link></li>
              <li><Link href="/products?category=pure-essential-oils" className="hover:text-[#F6A6BB] transition-colors">Pure Botanical Essential Oils</Link></li>
              <li><Link href="/products?category=luxury-elixirs-blends" className="hover:text-[#F6A6BB] transition-colors">Sandalwood Synergy Elixirs</Link></li>
              <li><Link href="/products" className="hover:text-[#F6A6BB] transition-colors">All Fragrance Collections</Link></li>
            </ul>
          </div>

          {/* Col 2: Client Services */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              Client Services
            </h3>
            <ul className="space-y-2 text-[#4A0D25] font-bold">
              <li><Link href="/contact" className="hover:text-[#F6A6BB] transition-colors">Contact Us & Estate Map</Link></li>
              <li><Link href="/about" className="hover:text-[#F6A6BB] transition-colors">About 400-Yr Kannauj Heritage</Link></li>
              <li><Link href="/provenance-passport" className="hover:text-[#F6A6BB] transition-colors">Digital Provenance Passport</Link></li>
              <li><Link href="/account" className="hover:text-[#F6A6BB] transition-colors">Private Client Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Press Recognition */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              As Featured In International Press
            </h3>
            <div className="flex flex-wrap gap-3 text-xs font-serif font-extrabold text-[#1A0510] italic">
              <span className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] shadow-xs">VOGUE INTERNATIONAL</span>
              <span className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] shadow-xs">ROBB REPORT LUXURY</span>
              <span className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] shadow-xs">HARPER&apos;S BAZAAR</span>
              <span className="p-2.5 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] shadow-xs">ARCHITECTURAL DIGEST</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F7D1D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#4A0D25] font-semibold">
          <p>© 2026 Rose Valley Kannauj • Maison De L&apos;Essence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-[#4A0D25] font-extrabold hover:text-[#F6A6BB] hover:underline flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#F6A6BB]" /> Admin Executive Suite
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
