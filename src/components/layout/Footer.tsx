'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';
import { DevFileTag } from '@/components/common/DevFileTag';

export function Footer() {
  const footerImageUrl = "https://cdn.shopify.com/s/files/1/0639/5772/9519/files/grok-image-9d4d6697-de31-4587-bd77-611dd4f1cc88.jpg?v=1786018139";

  return (
    <footer className="relative bg-[#3A081F] text-[#F8E8E8] border-t border-[#7A1840] overflow-hidden">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45 filter brightness-90 contrast-105 pointer-events-none scale-105 transition-all duration-1000"
        style={{ backgroundImage: `url('${footerImageUrl}')` }}
      />
      {/* Dark Luxury Gradient Overlay for Contrast & Elegance */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#400B22]/90 via-[#2A0515]/85 to-[#1A030D]/95 pointer-events-none" />

      {/* Guarantees Bar */}
      <div className="relative z-10 border-b border-white/10 py-10 bg-black/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-[#9A2048]/40 border border-[#E8B8B8]/30 mb-3 text-[#F2D4D4]">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-semibold text-base text-[#F8E8E8]">Worldwide Express Delivery</h4>
            <p className="text-xs text-[#E8B8B8] mt-1 max-w-xs">Complimentary express shipping on orders above ₹2,500 with royal Kannauj gift packaging.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-[#9A2048]/40 border border-[#E8B8B8]/30 mb-3 text-[#F2D4D4]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-semibold text-base text-[#F8E8E8]">Authentic Kannauj Deg-Bhapka Distillation</h4>
            <p className="text-xs text-[#E8B8B8] mt-1 max-w-xs">Hydro-distilled in traditional copper stills without synthetic solvents or paraffin.</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-[#9A2048]/40 border border-[#E8B8B8]/30 mb-3 text-[#F2D4D4]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-semibold text-base text-[#F8E8E8]">Artisanal Sampler Assurance</h4>
            <p className="text-xs text-[#E8B8B8] mt-1 max-w-xs">Includes a 2ml discovery sampler so you can experience the attar before breaking the seal.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="font-serif text-3xl font-bold text-white tracking-tight">{STORE_NAME}</h3>
          <p className="text-xs text-[#E8B8B8] leading-relaxed">
            Distilling rare Rosa Damascena, Ruh Gulab, and botanical attars from the perfume capital of Kannauj for over a century.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#E8B8B8] hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-[#E8B8B8] hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="font-serif text-base font-semibold uppercase tracking-widest text-[#E8B8B8]">Collections</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=artisanal-perfumes" className="text-[#F2D4D4] hover:text-white transition-colors">Ruh Gulab & Rose Attars</Link></li>
            <li><Link href="/products?category=pure-essential-oils" className="text-[#F2D4D4] hover:text-white transition-colors">Pure Botanical Oils</Link></li>
            <li><Link href="/products?category=luxury-elixirs-blends" className="text-[#F2D4D4] hover:text-white transition-colors">Sandalwood Synergy Blends</Link></li>
            <li><Link href="/products" className="text-[#F2D4D4] hover:text-white transition-colors">Bestselling Attars</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="font-serif text-base font-semibold uppercase tracking-widest text-[#E8B8B8]">Client Services</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/account" className="text-[#F2D4D4] hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/pages/shipping-policy" className="text-[#F2D4D4] hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/pages/privacy-policy" className="text-[#F2D4D4] hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/pages/terms-of-service" className="text-[#F2D4D4] hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="/admin/login" className="text-[#E8B8B8]/60 hover:text-white transition-colors">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="font-serif text-base font-semibold uppercase tracking-widest text-[#E8B8B8]">Kannauj Gazette</h4>
          <p className="text-xs text-[#E8B8B8]">Receive private invitations to seasonal rose harvest distillations.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-[#7A1840]/60 border border-[#9A2048] rounded-l-lg py-2 px-3 text-xs text-white placeholder-[#E8B8B8]/60 focus:outline-none focus:border-[#D45A7A]"
            />
            <button
              type="submit"
              className="bg-[#D45A7A] hover:bg-[#C94A6A] text-white px-4 rounded-r-lg text-xs font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-[#E8B8B8]">
        <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved. Vercel & Supabase Multi-Tenant Ready.</p>
      </div>
    </footer>
  );
}
