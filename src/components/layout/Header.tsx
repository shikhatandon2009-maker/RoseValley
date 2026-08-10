'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Sparkles, Menu, X, Heart, Shield } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { NotificationBell } from './NotificationBell';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { NAVIGATION_LINKS, STORE_NAME } from '@/lib/constants';
import { DevFileTag } from '@/components/common/DevFileTag';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, toggleCart, syncLiveCart } = useCartStore();
  const { productIds, syncLiveWishlist } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
    syncLiveCart();
    syncLiveWishlist();
  }, []);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[#E8B8B8]/60 transition-all shadow-sm">

      {/* Top Announcement Bar */}
      <div className="bg-gradient-dark-luxury text-white text-[11px] py-1.5 px-4 text-center tracking-widest uppercase font-sans flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-[#E8B8B8]" />
        <span>Authentic Deg-Bhapka Hydro-Distillation • Free Shipping Over ₹2,500</span>
        <Sparkles className="w-3 h-3 text-[#E8B8B8]" />
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#5A1030] hover:text-[#D45A7A] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="inline-block group">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#7A1840] group-hover:text-[#D45A7A] transition-colors leading-none">
              {STORE_NAME}
            </h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#9A2048] block mt-0.5 font-sans font-semibold">
              Artisanal Attars & Pure Distillates • Kannauj
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs uppercase tracking-widest font-semibold text-[#5A1030] hover:text-[#D45A7A] transition-colors relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D45A7A] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right: Admin Button, Currency Selector, Notification Bell, Wishlist, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Dev Phase Button */}
          <Link
            href="/admin/products"
            className="px-3 py-1.5 rounded-full bg-[#7A1840] hover:bg-[#9A2048] text-white text-[10px] sm:text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-luxury transition-all"
            title="Admin Panel (Dev Phase)"
          >
            <Shield className="w-3.5 h-3.5 text-[#E8B8B8]" />
            <span>Admin</span>
          </Link>

          <div className="hidden sm:block">
            <CurrencySelector />
          </div>

          <NotificationBell />

          <Link
            href="/account"
            className="p-2 text-[#5A1030] hover:text-[#D45A7A] transition-colors hidden sm:block"
            title="My Account"
          >
            <User className="w-5 h-5" />
          </Link>

          <Link
            href="/wishlist"
            className="p-2 text-[#5A1030] hover:text-[#D45A7A] transition-colors relative hidden sm:block"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {mounted && productIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D45A7A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {productIds.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => toggleCart(true)}
            className="p-2 text-[#5A1030] hover:text-[#D45A7A] transition-colors relative focus:outline-none"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#B03060] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#F2D4D4] bg-[#F8E8E8] p-6 space-y-4 animate-in slide-in-from-top-2">
          <div className="pb-3 border-b border-[#E8B8B8] flex justify-between items-center">
            <CurrencySelector />
            <Link
              href="/admin/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs bg-[#7A1840] text-white px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#E8B8B8]" /> Admin Portal
            </Link>
          </div>
          <nav className="flex flex-col space-y-3">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-serif font-semibold text-[#5A1030] hover:text-[#D45A7A] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
