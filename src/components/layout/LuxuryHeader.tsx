'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShoppingBag, User, Heart, ChevronDown, Menu, X, Award, Droplet, ArrowRight, ShieldCheck, Trash2, ShoppingCart, CheckCircle2, QrCode, MapPin, BookOpen, Newspaper } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';
import { CurrencySelector } from './CurrencySelector';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

let cachedHeaderCategories: CategoryItem[] | null = null;

export function LuxuryHeader() {
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'collection' | 'inspiration' | null>(null);
  const [cartHoverOpen, setCartHoverOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>(cachedHeaderCategories || []);
  const [mounted, setMounted] = useState(false);

  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const { items, toggleCart, updateQuantity, removeItem, getTotalINR } = useCartStore();
  const { productIds } = useWishlistStore();

  useEffect(() => {
    setMounted(true);

    if (cachedHeaderCategories && cachedHeaderCategories.length > 0) {
      setCategories(cachedHeaderCategories);
      return;
    }

    // Fetch real dynamic categories for the Collection dropdown (cached in memory)
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          cachedHeaderCategories = data.categories;
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Categories fetch error:', err));
  }, []);


  // Close Cart, Notification & Account Dropdowns when clicking outside anywhere on the page
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setCartHoverOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getTotalINR();

  return (
    <header className="luxury-header-sticky">
      {/* 1. Top Authority Heritage Banner Bar */}
      <div className="luxury-top-bar">
        <span className="luxury-top-bar-item luxury-top-bar-item-gold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>World’s Largest Producer of Pure Rose Oil</span>
        </span>
        <span className="luxury-top-bar-dot hidden md:inline">•</span>
        <span className="luxury-top-bar-item hidden md:inline-flex">
          <Award className="w-3.5 h-3.5" />
          <span>400-Year Copper Deg-Bhapka Heritage – Kannauj</span>
        </span>
        <span className="luxury-top-bar-dot hidden lg:inline">•</span>
        <span className="luxury-top-bar-item luxury-top-bar-item-emerald hidden lg:inline-flex">
          <Droplet className="w-3.5 h-3.5" />
          <span>100% Alcohol-Free • Pure Hydro-Distillates</span>
        </span>
      </div>

      {/* 2. ROW 1: UTILITIES (LEFT), CENTERED LOGO (CENTER), ACTIONS (RIGHT) */}
      <div className="luxury-header-top-row">
        {/* Left: Mobile Toggle, Currency Selector & Notification right next to Currency */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="luxury-mobile-menu-btn lg:hidden luxury-icon-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <CurrencySelector />

            {/* Mouseover & Click Notification Dropdown - Placed Right Next to Currency */}
            <div
              ref={notificationRef}
              className="luxury-notification-wrapper"
              onMouseEnter={() => setNotificationOpen(true)}
            >
              <button
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="luxury-icon-btn relative"
                title="Notifications & Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {mounted && productIds.length > 0 && (
                  <span className="luxury-wishlist-badge">
                    {productIds.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  className="luxury-notification-menu"
                  onMouseEnter={() => setNotificationOpen(true)}
                >
                  <div className="luxury-notification-header">
                    <h3 className="luxury-notification-title">
                      Notifications & Reserve
                    </h3>
                    <span className="luxury-notification-badge">
                      {mounted ? productIds.length : 0} ITEMS SAVED
                    </span>
                  </div>

                  <div className="luxury-notification-list">
                    <div className="luxury-notification-item">
                      <div className="luxury-notification-item-icon">
                        <Sparkles className="w-4 h-4 text-[#F6A6BB]" />
                      </div>
                      <div>
                        <h4 className="luxury-notification-item-title">
                          2026 Damask Rose Harvest Live
                        </h4>
                        <p className="luxury-notification-item-desc">
                          Hydro-distillation in progress in Vessel #Deg-04. Limited Ruh Gulab batches reserved.
                        </p>
                      </div>
                    </div>

                    {mounted && productIds.length > 0 ? (
                      <div className="p-3 rounded-xl bg-[#F7EEED] text-center border border-[#F7D1D8]">
                        <p className="text-xs text-[#4A0D25] font-bold">
                          You have {productIds.length} saved item(s) in your Private Reserve Wishlist.
                        </p>
                        <button
                          onClick={() => {
                            setNotificationOpen(false);
                            router.push('/wishlist');
                          }}
                          className="mt-2 text-xs font-bold text-[#F6A6BB] underline hover:text-[#4A0D25]"
                        >
                          View My Saved Wishlist &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-[#4A0D25]">
                        Your private wishlist is empty. Tap the heart on any fragrance to save.
                      </div>
                    )}
                  </div>

                  <div className="luxury-notification-footer">
                    <Link
                      href="/wishlist"
                      onClick={() => setNotificationOpen(false)}
                      className="luxury-notification-footer-btn"
                    >
                      Manage Private Reserve Wishlist
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Prominently CENTERED Brand Logo */}
        <Link href="/" className="luxury-brand-link-centered">
          <h1 className="luxury-brand-title">
            ROSE VALLEY KANNAUJ
          </h1>
          <span className="luxury-brand-subtitle">
            Est. 1620 • Pure Hydro-Distillates
          </span>
        </Link>
             {/* Right: Actions Group (Account Button 100% Styled Like Cart Button, & Cart Preview Pill) */}
        <div className="luxury-actions-group">
          
          {/* Account Capsule Pill Button - 100% Identical to Cart Button Design */}
          <div
            ref={accountRef}
            className="luxury-cart-hover-wrapper relative inline-block"
            onMouseEnter={() => setAccountOpen(true)}
          >
            <button
              onClick={() => setAccountOpen((prev) => !prev)}
              className="luxury-cart-btn"
              aria-label="Private Client Account"
              title="Private Client Account & Orders"
            >
              <User className="luxury-cart-icon" />
              <span className="luxury-cart-text">Account</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#4A0D25] transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
            </button>

            {accountOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 border-2 border-[#F7D1D8] shadow-2xl rounded-3xl bg-white p-3 space-y-2 text-left z-50 animate-fade-in"
                onMouseEnter={() => setAccountOpen(true)}
              >
                <div className="px-3.5 py-3 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-extrabold text-[#1A0510] text-sm">Private Client Portal</h3>
                    <p className="text-[10px] text-[#4A0D25] font-black uppercase tracking-widest mt-0.5">Rose Valley Kannauj</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] text-[9px] font-black uppercase tracking-wider shadow-xs">
                    MEMBER
                  </span>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#1A0510] group-hover:text-[#4A0D25]">My Orders</p>
                      <span className="text-[10px] text-stone-500 font-bold block">Track orders & AWB receipts</span>
                    </div>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#1A0510] group-hover:text-[#4A0D25]">My Wishlist</p>
                      <span className="text-[10px] text-stone-500 font-bold block">Saved attars ({mounted ? productIds.length : 0})</span>
                    </div>
                  </Link>

                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#1A0510] group-hover:text-[#4A0D25]">My Profile & Addresses</p>
                      <span className="text-[10px] text-stone-500 font-bold block">Saved shipping address book</span>
                    </div>
                  </Link>

                  <Link
                    href="/provenance-passport"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#1A0510] group-hover:text-[#4A0D25]">Authenticity Passports</p>
                      <span className="text-[10px] text-stone-500 font-bold block">Verify batch QR purity spectrum</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group border-t border-[#F7D1D8] pt-2"
                  >
                    <div className="p-2 rounded-xl bg-[#4A0D25] text-[#F6A6BB] flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-xs text-[#4A0D25]">Admin Suite</p>
                      <span className="text-[10px] text-stone-500 font-bold block">Manage orders & inventory</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mouseover & Click Rose Gold Cart Preview Pill */}
          <div
            ref={cartDropdownRef}
            className="luxury-cart-hover-wrapper"
            onMouseEnter={() => setCartHoverOpen(true)}
          >
            <button
              onClick={() => setCartHoverOpen((prev) => !prev)}
              className="luxury-cart-btn"
              aria-label="Open Rose Cart"
            >
              <ShoppingBag className="luxury-cart-icon" />
              <span className="luxury-cart-text">Cart</span>
              <span className="luxury-cart-badge">
                {mounted ? totalCartCount : 0}
              </span>
            </button>

            {/* Mouseover & Click Preview Dropdown Panel */}
            {cartHoverOpen && (
              <div
                className="luxury-cart-hover-menu"
                onMouseEnter={() => setCartHoverOpen(true)}
              >
                <div className="luxury-cart-hover-header">
                  <div>
                    <h3 className="luxury-cart-hover-title">
                      Your Fragrance Reserve Bag
                    </h3>
                    <span className="luxury-cart-hover-count">
                      {mounted ? totalCartCount : 0} {totalCartCount === 1 ? 'item' : 'items'} selected
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-extrabold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" /> 100% Purity
                  </span>
                </div>

                {mounted && items.length > 0 ? (
                  <>
                    <div className="luxury-cart-hover-items-list">
                      {items.map((item) => (
                        <div key={item.id} className="luxury-cart-hover-item">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAE6E7] border border-[#F7D1D8] flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#FAE6E7] flex items-center justify-center text-[#F6A6BB]">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="luxury-cart-hover-details">
                            <h4 className="luxury-cart-hover-name line-clamp-1">
                              {item.name}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="luxury-cart-hover-qty-controls border border-[#F7D1D8] rounded-lg px-2 py-0.5 bg-white">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="text-xs font-bold text-stone-600 hover:text-[#4A0D25]"
                                >
                                  -
                                </button>
                                <span className="text-xs font-extrabold text-[#1A0510]">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-xs font-bold text-stone-600 hover:text-[#4A0D25]"
                                >
                                  +
                                </button>
                              </div>
                              <span className="luxury-cart-hover-price">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#F7D1D8] pt-3 mt-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-stone-600">Subtotal:</span>
                        <span className="font-serif font-extrabold text-base text-[#4A0D25]">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setCartHoverOpen(false);
                            router.push('/cart');
                          }}
                          className="py-2.5 rounded-full border border-[#F7D1D8] text-[#1A0510] hover:bg-[#FAE6E7] text-xs font-black uppercase tracking-wider transition-all"
                        >
                          View Bag
                        </button>
                        <button
                          onClick={() => {
                            setCartHoverOpen(false);
                            router.push('/checkout');
                          }}
                          className="py-2.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] hover:bg-[#F4BBC9] text-xs font-extrabold uppercase tracking-wider shadow-xs flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Checkout</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <ShoppingBag className="w-8 h-8 text-[#F6A6BB] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#1A0510]">Your reserve bag is currently empty.</p>
                    <p className="text-[11px] text-stone-500 mt-1 font-semibold">Explore our artisanal Damask Rose collection to add pure distillates.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. ROW 2: CENTERED NAVIGATION MENU BELOW LOGO */}
      <div className="luxury-header-bottom-row hidden lg:flex">
        <nav className="luxury-nav-menu-centered">
          {/* Navigation Item 1: Home */}
          <div className="luxury-nav-item">
            <Link href="/" className="luxury-nav-link">
              Home
            </Link>
          </div>

          {/* Navigation Item 2: Collection (Dropdown of Real Database Categories) */}
          <div
            className="luxury-nav-item relative group"
            onMouseEnter={() => setActiveDropdown('collection')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link href="/products" className="luxury-nav-link">
              <span>Collection</span>
              <ChevronDown className="luxury-nav-arrow" />
            </Link>

            {activeDropdown === 'collection' && (
              <div className="luxury-mega-dropdown">
                <div className="luxury-mega-dropdown-grid">
                  <div className="luxury-mega-col">
                    <span className="luxury-mega-category-header">Real Scent Categories</span>
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <Link key={c.id} href={`/products?category=${c.slug}`} className="luxury-mega-item">
                          <span className="luxury-mega-item-title">{c.name}</span>
                          <span className="luxury-mega-item-desc">{c.description || 'Pure hydro-distilled Kannauj fragrance'}</span>
                        </Link>
                      ))
                    ) : (
                      <>
                        <Link href="/products?category=artisanal-perfumes" className="luxury-mega-item">
                          <span className="luxury-mega-item-title">Artisanal Perfumes</span>
                          <span className="luxury-mega-item-desc">Hand-crafted fine fragrances with Damask Rose</span>
                        </Link>
                        <Link href="/products?category=pure-essential-oils" className="luxury-mega-item">
                          <span className="luxury-mega-item-title">Pure Essential Oils</span>
                          <span className="luxury-mega-item-desc">100% steam-distilled single-origin attars</span>
                        </Link>
                        <Link href="/products?category=luxury-elixirs-blends" className="luxury-mega-item">
                          <span className="luxury-mega-item-title">Luxury Elixirs & Blends</span>
                          <span className="luxury-mega-item-desc">Matured sandalwood & botanical synergy oils</span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="luxury-mega-col">
                    <span className="luxury-mega-category-header">Catalog Quick Links</span>
                    <Link href="/products" className="luxury-mega-item">
                      <span className="luxury-mega-item-title">All Fragrance Products</span>
                      <span className="luxury-mega-item-desc">Explore complete 2026 Rose Valley catalog</span>
                    </Link>
                    <Link href="/provenance-passport" className="luxury-mega-item">
                      <span className="luxury-mega-item-title">Authenticity Passports</span>
                      <span className="luxury-mega-item-desc">Verify batch purity spectrums & QR certificates</span>
                    </Link>
                  </div>

                  <div className="luxury-mega-featured-card">
                    <span className="luxury-mega-card-badge">2026 DEG HARVEST</span>
                    <h4 className="luxury-mega-card-title">Ruh Gulab Pure Extract</h4>
                    <p className="luxury-mega-card-desc">Hand-harvested at dawn in Kannauj fields. 99.98% pure hydro-extract.</p>
                    <Link href="/products" className="luxury-mega-card-link">
                      Explore Full Collection &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Item 3: Inspiration Dropdown (Blog & Press Mentions) */}
          <div
            className="luxury-nav-item relative group"
            onMouseEnter={() => setActiveDropdown('inspiration')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link href="/journal" className="luxury-nav-link">
              <span>Inspiration</span>
              <ChevronDown className="luxury-nav-arrow" />
            </Link>

            {activeDropdown === 'inspiration' && (
              <div className="luxury-mega-dropdown w-96 p-4">
                <div className="space-y-2">
                  <span className="luxury-mega-category-header block mb-3">Stories & Media</span>

                  <Link
                    href="/journal"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-[#FAE6E7] border border-transparent hover:border-[#F7D1D8] transition-all group/item"
                  >
                    <div className="p-2.5 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover/item:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-[#1A0510] group-hover/item:text-[#4A0D25] block">
                        Blog / Olfactory Journal
                      </span>
                      <span className="text-[10px] text-[#4A0D25] font-bold leading-tight block mt-0.5">
                        Essays on Kannauj steam distillation, rose harvesting & fragrance layering
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/press"
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-[#FAE6E7] border border-transparent hover:border-[#F7D1D8] transition-all group/item"
                  >
                    <div className="p-2.5 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover/item:bg-[#F6A6BB] transition-colors flex-shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-[#1A0510] group-hover/item:text-[#4A0D25] block">
                        Press & Media Mentions
                      </span>
                      <span className="text-[10px] text-[#4A0D25] font-bold leading-tight block mt-0.5">
                        Featured in Vogue, Harper's Bazaar, GQ & Economic Times
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Item 4: About Rose Valley */}
          <div className="luxury-nav-item">
            <Link href="/about" className="luxury-nav-link">
              About Rose Valley
            </Link>
          </div>

          {/* Navigation Item 5: Contact Us */}
          <div className="luxury-nav-item">
            <Link href="/contact" className="luxury-nav-link">
              Contact Us
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
