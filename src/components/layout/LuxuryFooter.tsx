'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Award, Droplet } from 'lucide-react';
import { useSiteSettingsStore } from '@/store/site-settings-store';
import { formatImageUrl } from '@/lib/format-image';

export function LuxuryFooter() {
  const settings = useSiteSettingsStore((s) => s.settings);

  return (
    <footer className="bg-[#F7EEED] text-[#1A0510] border-t border-[#F7D1D8] pt-16 pb-12 font-sans relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Brand Authority Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 border-b border-[#F7D1D8]">
          <div className="space-y-3">
            <Link href="/" className="inline-block group">
              {settings.use_text_logo ? (
                <div className="flex flex-col">
                  <span className="font-serif font-black text-2xl text-[#1A0510] uppercase tracking-widest group-hover:text-[#4A0D25] transition-colors">
                    {settings.site_name || 'RoseOil.in'}
                  </span>
                  <span className="text-[10px] font-bold text-[#4A0D25] tracking-widest uppercase">
                    {settings.tagline || '100% Pure Botanical Distillates'}
                  </span>
                </div>
              ) : (
                <img
                  src={formatImageUrl(settings.logo_url, '/images/logo/logo.png')}
                  alt={settings.site_name || "RoseOil.in"}
                  className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/logo/logo.png';
                  }}
                />
              )}
            </Link>
            <p className="text-xs text-[#4A0D25] leading-relaxed max-w-sm font-medium">
              Pure essential oils and authentic botanical hydro-distillates formulated with 100% natural, alcohol-free ingredients.
            </p>
          </div>

          {/* Three Mandatory Brand Positionings Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Sparkles className="w-4 h-4 text-[#F6A6BB]" /> 100% Pure & Natural
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Pure Botanical Essential Oils</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Award className="w-4 h-4 text-[#F6A6BB]" /> Steam Distilled
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Artisanal Hydro-Distillation</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A0510]">
                <Droplet className="w-4 h-4 text-[#F6A6BB]" /> 100% Alcohol-Free
              </div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Pure Botanical Extracts</div>
            </div>
          </div>
        </div>

        {/* Navigation & Policies Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-xs">
          {/* Col 1: Real Collection Categories */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              Fragrance Collections
            </h3>
            <ul className="space-y-2 text-[#4A0D25] font-bold">
              <li><Link href="/products?category=pure-essential-oils" className="hover:text-[#F6A6BB] transition-colors">Pure Essential Oils</Link></li>
              <li><Link href="/products?category=artisanal-blends" className="hover:text-[#F6A6BB] transition-colors">Artisanal Blends & Distillates</Link></li>
              <li><Link href="/products?category=royal-attars" className="hover:text-[#F6A6BB] transition-colors">Pure Botanical Extracts</Link></li>
              <li><Link href="/products" className="hover:text-[#F6A6BB] transition-colors">Explore All Products</Link></li>
            </ul>
          </div>

          {/* Col 2: Policies & Legal */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              Policies & Legal
            </h3>
            <ul className="space-y-2 text-[#4A0D25] font-bold">
              <li><Link href="/shipping-delivery-policy" className="hover:text-[#F6A6BB] transition-colors">Shipping and Delivery Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#F6A6BB] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[#F6A6BB] transition-colors">Terms and Conditions</Link></li>
              <li><Link href="/return-refund-policy" className="hover:text-[#F6A6BB] transition-colors">Return and Refund Policy</Link></li>
            </ul>
          </div>

          {/* Col 3: About & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif font-extrabold text-sm text-[#1A0510] uppercase tracking-widest">
              About & Support
            </h3>
            <ul className="space-y-2 text-[#4A0D25] font-bold">
              <li><Link href="/about" className="hover:text-[#F6A6BB] transition-colors">About RoseOil.in</Link></li>
              <li><Link href="/contact" className="hover:text-[#F6A6BB] transition-colors">Contact Us & Support</Link></li>
              <li><Link href="/account" className="hover:text-[#F6A6BB] transition-colors">Client Account Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#F7D1D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#4A0D25] font-semibold">
          <p>© 2026 RoseOil.in. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
