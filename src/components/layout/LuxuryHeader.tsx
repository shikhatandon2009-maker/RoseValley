'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles, ShoppingBag, User, Heart, ChevronDown, ChevronRight,
  Menu, X, Award, Droplet, ArrowRight, ShieldCheck, Trash2,
  ShoppingCart, CheckCircle2, QrCode, MapPin, BookOpen, Newspaper,
  Search, Phone, Mail, Package, Star, Gift, Flame, Crown, LogIn, LogOut, Globe
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';
import { CurrencySelector } from './CurrencySelector';
import { CheckoutChoiceModal } from '../checkout/CheckoutChoiceModal';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface UserSession {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

let cachedHeaderCategories: CategoryItem[] | null = null;

export function LuxuryHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { formatPrice } = useCurrencyStore();

  // UI & Auth states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'collection' | 'inspiration' | null>(null);
  const [cartHoverOpen, setCartHoverOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>(cachedHeaderCategories || []);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [checkoutChoiceOpen, setCheckoutChoiceOpen] = useState(false);

  // Refs for outside-click
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { items, toggleCart, updateQuantity, removeItem, getTotalINR } = useCartStore();
  const { productIds } = useWishlistStore();

  // Auth session check
  const checkAuthSession = useCallback(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else if (typeof window !== 'undefined') {
          const tempAccStr = localStorage.getItem('temp_guest_account');
          if (tempAccStr) {
            try {
              const tempAcc = JSON.parse(tempAccStr);
              if (tempAcc.fullName || tempAcc.email) {
                setCurrentUser({
                  id: 'temp-guest',
                  email: tempAcc.email || 'guest@example.com',
                  full_name: tempAcc.fullName || 'Guest Client',
                  role: 'customer',
                });
                return;
              }
            } catch (e) { }
          }
          setCurrentUser(null);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession, pathname]);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp_guest_account');
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setAccountOpen(false);
    router.push('/');
    router.refresh();
  };

  // Mount + fetch categories
  useEffect(() => {
    setMounted(true);
    if (cachedHeaderCategories && cachedHeaderCategories.length > 0) {
      setCategories(cachedHeaderCategories);
      return;
    }
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

  // Scroll-aware header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdowns on outside click
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

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Dropdown hover handlers with delay to prevent flicker
  const handleDropdownEnter = useCallback((dropdown: 'collection' | 'inspiration') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(dropdown);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getTotalINR();

  // Check if nav link is active
  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix);

  return (
    <>
      <header className={`luxury-header-sticky ${scrolled ? 'luxury-header-scrolled' : ''}`}>
        {/* 1. Top Authority Heritage Banner Bar — hides on scroll */}
        <div className={`luxury-top-bar ${scrolled ? 'luxury-top-bar-hidden' : ''}`}>
          <span className="luxury-top-bar-item luxury-top-bar-item-gold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>World's Largest Producer of Pure Rose Oil</span>
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
          {/* Left: Mobile Toggle, Currency Selector & Notification */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="luxury-mobile-menu-btn lg:hidden luxury-icon-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <CurrencySelector />

              {/* Notification/Wishlist Dropdown */}
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

          {/* Center: Brand Logo */}
          <Link href="/" className="luxury-brand-link-centered">
            {/* Desktop Brand Title */}
            <h1 className="luxury-brand-title hidden sm:block">
              ROSE VALLEY KANNAUJ
            </h1>
            {/* Mobile Compact Monogram */}
            <h1 className="luxury-brand-title block sm:hidden text-xl font-serif font-extrabold tracking-[0.25em] text-[#1A0510]">
              Rose Valley
            </h1>
            <span className={`luxury-brand-subtitle hidden sm:block ${scrolled ? 'luxury-brand-subtitle-hidden' : ''}`}>
              Est. 1620 • Pure Hydro-Distillates
            </span>
          </Link>

          {/* Right: Account / Login & Cart */}
          <div className="luxury-actions-group">
            {/* Account / Login Button */}
            <div
              ref={accountRef}
              className="luxury-cart-hover-wrapper relative inline-block"
              onMouseEnter={() => setAccountOpen(true)}
            >
              {currentUser ? (
                <button
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="luxury-cart-btn"
                  aria-label="Private Client Account"
                  title={`Account (${currentUser.full_name})`}
                >
                  <User className="luxury-cart-icon" />
                  <span className="luxury-cart-text hidden sm:inline">
                    {currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#4A0D25] transition-transform duration-300 hidden sm:block ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="luxury-cart-btn"
                  aria-label="Sign In to Account"
                  title="Sign In to Account"
                >
                  <User className="luxury-cart-icon" />
                  <span className="luxury-cart-text hidden sm:inline">Login</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#4A0D25] transition-transform duration-300 hidden sm:block ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 border-2 border-[#F7D1D8] shadow-2xl rounded-3xl bg-white p-3 space-y-2 text-left z-50 animate-fade-in"
                  onMouseEnter={() => setAccountOpen(true)}
                >
                  {currentUser ? (
                    <>
                      {/* LOGGED IN ACCOUNT MENU */}
                      <div className="px-3.5 py-3 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-between">
                        <div>
                          <h3 className="font-serif font-extrabold text-[#1A0510] text-sm">{currentUser.full_name || 'Private Client'}</h3>
                          <p className="text-[10px] text-[#4A0D25] font-black tracking-wider truncate max-w-[160px]">{currentUser.email}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] text-[9px] font-black uppercase tracking-wider shadow-xs">
                          {currentUser.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {[
                          { href: '/account', icon: ShoppingBag, label: 'My Orders', desc: 'Track orders & AWB receipts' },
                          { href: '/wishlist', icon: Heart, label: 'My Wishlist', desc: `Saved attars (${mounted ? productIds.length : 0})` },
                          { href: '/account', icon: MapPin, label: 'My Profile & Addresses', desc: 'Saved shipping address book' },
                          { href: '/provenance-passport', icon: ShieldCheck, label: 'Authenticity Passports', desc: 'Verify batch QR purity spectrum' },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-[#FAE6E7]/70 text-[#1A0510] transition-colors group"
                          >
                            <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] group-hover:bg-[#F6A6BB] transition-colors flex-shrink-0">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-[#1A0510] group-hover:text-[#4A0D25]">{item.label}</p>
                              <span className="text-[10px] text-stone-500 font-bold block">{item.desc}</span>
                            </div>
                          </Link>
                        ))}

                        {currentUser.role === 'admin' && (
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
                              <span className="text-[10px] text-stone-500 font-bold block">Manage orders & catalog</span>
                            </div>
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-rose-50 text-rose-700 transition-colors group border-t border-[#F7D1D8] pt-2 text-left"
                        >
                          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 flex-shrink-0">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-rose-800">Sign Out</p>
                            <span className="text-[10px] text-stone-500 font-bold block">Log out of your account</span>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* LOGGED OUT / GUEST DROPDOWN */}
                      <div className="px-3.5 py-3 rounded-2xl bg-[#FAE6E7] border border-[#F7D1D8]">
                        <h3 className="font-serif font-extrabold text-[#1A0510] text-sm">Private Client Access</h3>
                        <p className="text-[11px] text-[#4A0D25] font-semibold mt-0.5">
                          Sign in to access your orders, saved addresses & private reserve wishlist.
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setAccountOpen(false)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <LogIn className="w-4 h-4 text-[#F6A6BB]" />
                          <span>Sign In to Account</span>
                        </Link>

                        <Link
                          href="/register"
                          onClick={() => setAccountOpen(false)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-[#FAE6E7] hover:bg-[#F6A6BB]/50 text-[#4A0D25] border border-[#F7D1D8] text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all"
                        >
                          <User className="w-4 h-4 text-[#4A0D25]" />
                          <span>Create New Account</span>
                        </Link>

                        <Link
                          href="/account"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-[#4A0D25] hover:bg-stone-50 transition-colors border-t border-[#F7D1D8] pt-2"
                        >
                          <span>Track Guest Order</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#F6A6BB]" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
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
                <span className="luxury-cart-text hidden sm:inline">Cart</span>
                <span className="luxury-cart-badge" suppressHydrationWarning>
                  {mounted ? totalCartCount : 0}
                </span>
              </button>

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
                                <span className="luxury-cart-hover-price" suppressHydrationWarning>
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
                          <span className="font-serif font-extrabold text-base text-[#4A0D25]" suppressHydrationWarning>
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
                              if (currentUser) {
                                router.push('/checkout');
                              } else {
                                setCheckoutChoiceOpen(true);
                              }
                            }}
                            className="py-2.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] hover:bg-[#F4BBC9] text-xs font-extrabold uppercase tracking-wider shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
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
            {/* Home */}
            <div className="luxury-nav-item">
              <Link href="/" className={`luxury-nav-link ${isActive('/') ? 'luxury-nav-link-active' : ''}`}>
                Home
              </Link>
            </div>

            {/* Collection — Full-Width Mega Dropdown */}
            <div
              className="luxury-nav-item relative group"
              onMouseEnter={() => handleDropdownEnter('collection')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link href="/products" className={`luxury-nav-link ${isActivePrefix('/products') ? 'luxury-nav-link-active' : ''}`}>
                <span>Collection</span>
                <ChevronDown className={`luxury-nav-arrow ${activeDropdown === 'collection' ? 'rotate-180' : ''}`} />
              </Link>

              {activeDropdown === 'collection' && (
                <div className="luxury-mega-dropdown luxury-mega-dropdown-fullwidth">
                  <div className="luxury-mega-dropdown-inner">
                    {/* Column 1: Categories */}
                    <div className="luxury-mega-col">
                      <span className="luxury-mega-category-header">
                        <Package className="w-3.5 h-3.5 text-[#F6A6BB]" />
                        Fragrance Categories
                      </span>
                      <div className="luxury-mega-items-grid">
                        {categories.length > 0 ? (
                          categories.map((c, i) => (
                            <Link
                              key={c.id}
                              href={`/products?category=${c.slug}`}
                              className="luxury-mega-item-rich"
                              style={{ animationDelay: `${i * 50}ms` }}
                            >
                              <div className="luxury-mega-item-icon-wrapper">
                                <Droplet className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="luxury-mega-item-title">{c.name}</span>
                                <span className="luxury-mega-item-desc">{c.description || 'Pure hydro-distilled Kannauj fragrance'}</span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <>
                            {[
                              { slug: 'artisanal-perfumes', name: 'Artisanal Perfumes', desc: 'Hand-crafted fine fragrances', icon: Crown },
                              { slug: 'pure-essential-oils', name: 'Pure Essential Oils', desc: '100% steam-distilled single-origin', icon: Droplet },
                              { slug: 'luxury-elixirs-blends', name: 'Luxury Elixirs & Blends', desc: 'Matured sandalwood & botanical synergy', icon: Sparkles },
                            ].map((item, i) => (
                              <Link
                                key={item.slug}
                                href={`/products?category=${item.slug}`}
                                className="luxury-mega-item-rich"
                                style={{ animationDelay: `${i * 50}ms` }}
                              >
                                <div className="luxury-mega-item-icon-wrapper">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="luxury-mega-item-title">{item.name}</span>
                                  <span className="luxury-mega-item-desc">{item.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="luxury-mega-col">
                      <span className="luxury-mega-category-header">
                        <Star className="w-3.5 h-3.5 text-[#F6A6BB]" />
                        Quick Links
                      </span>
                      <div className="luxury-mega-items-grid">
                        {[
                          { href: '/products', icon: Package, label: 'All Products', desc: 'Explore complete 2026 catalog' },
                          { href: '/products?sort=newest', icon: Flame, label: 'New Arrivals', desc: 'Latest hydro-distilled additions' },
                          { href: '/products?sort=popular', icon: Star, label: 'Bestsellers', desc: 'Most loved by collectors' },
                          { href: '/wishlist', icon: Heart, label: 'Your Wishlist', desc: 'Saved private reserve items' },
                        ].map((item, i) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="luxury-mega-item-rich"
                            style={{ animationDelay: `${(i + 3) * 50}ms` }}
                          >
                            <div className="luxury-mega-item-icon-wrapper">
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="luxury-mega-item-title">{item.label}</span>
                              <span className="luxury-mega-item-desc">{item.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Featured Card */}
                    <div className="luxury-mega-featured-card">
                      <div className="luxury-mega-card-image-wrapper">
                        <img
                          src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop"
                          alt="Ruh Gulab Pure Extract"
                          className="luxury-mega-card-image"
                          loading="lazy"
                        />
                        <span className="luxury-mega-card-badge">2026 DEG HARVEST</span>
                      </div>
                      <div className="luxury-mega-card-content">
                        <h4 className="luxury-mega-card-title">Ruh Gulab Pure Extract</h4>
                        <p className="luxury-mega-card-desc">
                          Hand-harvested at dawn in Kannauj fields. 99.98% pure hydro-extract.
                        </p>
                        <Link href="/products" className="luxury-mega-card-cta">
                          Explore Collection
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inspiration Dropdown */}
            <div
              className="luxury-nav-item relative group"
              onMouseEnter={() => handleDropdownEnter('inspiration')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link href="/journal" className={`luxury-nav-link ${isActivePrefix('/journal') || isActivePrefix('/press') || isActivePrefix('/blogs') ? 'luxury-nav-link-active' : ''}`}>
                <span>Inspiration</span>
                <ChevronDown className={`luxury-nav-arrow ${activeDropdown === 'inspiration' ? 'rotate-180' : ''}`} />
              </Link>

              {activeDropdown === 'inspiration' && (
                <div className="luxury-mega-dropdown luxury-mega-dropdown-compact">
                  <span className="luxury-mega-category-header">
                    <BookOpen className="w-3.5 h-3.5 text-[#F6A6BB]" />
                    Stories & Media
                  </span>
                  <div className="luxury-inspiration-grid">
                    <Link href="/journal" className="luxury-inspiration-card">
                      <div className="luxury-inspiration-card-image-wrapper">
                        <img
                          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=300&auto=format&fit=crop"
                          alt="Olfactory Journal"
                          className="luxury-inspiration-card-image"
                          loading="lazy"
                        />
                      </div>
                      <div className="luxury-inspiration-card-content">
                        <span className="luxury-mega-item-title">Blog / Olfactory Journal</span>
                        <span className="luxury-mega-item-desc">
                          Essays on Kannauj distillation, rose harvesting & fragrance layering
                        </span>
                      </div>
                    </Link>
                    <Link href="/press" className="luxury-inspiration-card">
                      <div className="luxury-inspiration-card-image-wrapper">
                        <img
                          src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=300&auto=format&fit=crop"
                          alt="Press & Media"
                          className="luxury-inspiration-card-image"
                          loading="lazy"
                        />
                      </div>
                      <div className="luxury-inspiration-card-content">
                        <span className="luxury-mega-item-title">Press & Media Mentions</span>
                        <span className="luxury-mega-item-desc">
                          Featured in Vogue, Harper's Bazaar, GQ & Economic Times
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="luxury-nav-item">
              <Link href="/about" className={`luxury-nav-link ${isActive('/about') ? 'luxury-nav-link-active' : ''}`}>
                About Rose Valley
              </Link>
            </div>

            {/* Contact */}
            <div className="luxury-nav-item">
              <Link href="/contact" className={`luxury-nav-link ${isActive('/contact') ? 'luxury-nav-link-active' : ''}`}>
                Contact Us
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ================================================================
         FULL MOBILE DRAWER — Slide-in from left with overlay
         ================================================================ */}
      {/* Overlay */}
      <div
        className={`luxury-mobile-overlay ${mobileMenuOpen ? 'luxury-mobile-overlay-visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className={`luxury-mobile-drawer ${mobileMenuOpen ? 'luxury-mobile-drawer-open' : ''}`}>
        {/* Drawer Header */}
        <div className="luxury-mobile-drawer-header">
          <div>
            <h2 className="font-serif font-extrabold text-lg text-[#1A0510] tracking-wider">ROSE VALLEY</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#4A0D25]">Est. 1620 • Kannauj</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="luxury-icon-btn"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Side Menu Currency Selector Bar */}
        <div className="px-5 py-3 bg-[#FAE6E7]/80 border-b border-[#F7D1D8] flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#4A0D25] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#F6A6BB]" /> Currency:
          </span>
          <CurrencySelector />
        </div>

        {/* Drawer Nav */}
        <nav className="luxury-mobile-nav">
          <Link
            href="/"
            className={`luxury-mobile-link ${isActive('/') ? 'luxury-mobile-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Home</span>
          </Link>

          {/* Collection Accordion */}
          <div>
            <button
              className={`luxury-mobile-link w-full ${isActivePrefix('/products') ? 'luxury-mobile-link-active' : ''}`}
              onClick={() => setMobileAccordion(mobileAccordion === 'collection' ? null : 'collection')}
            >
              <span>Collection</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileAccordion === 'collection' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`luxury-mobile-accordion ${mobileAccordion === 'collection' ? 'luxury-mobile-accordion-open' : ''}`}>
              <div className="luxury-mobile-accordion-inner">
                <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="luxury-mobile-sub-link">
                  <Package className="w-4 h-4 text-[#F6A6BB]" />
                  All Products
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="luxury-mobile-sub-link"
                  >
                    <Droplet className="w-4 h-4 text-[#F6A6BB]" />
                    {c.name}
                  </Link>
                ))}
                {categories.length === 0 && (
                  <>
                    <Link href="/products?category=artisanal-perfumes" onClick={() => setMobileMenuOpen(false)} className="luxury-mobile-sub-link">
                      <Crown className="w-4 h-4 text-[#F6A6BB]" />
                      Artisanal Perfumes
                    </Link>
                    <Link href="/products?category=pure-essential-oils" onClick={() => setMobileMenuOpen(false)} className="luxury-mobile-sub-link">
                      <Droplet className="w-4 h-4 text-[#F6A6BB]" />
                      Pure Essential Oils
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Inspiration Accordion */}
          <div>
            <button
              className={`luxury-mobile-link w-full ${isActivePrefix('/journal') || isActivePrefix('/press') ? 'luxury-mobile-link-active' : ''}`}
              onClick={() => setMobileAccordion(mobileAccordion === 'inspiration' ? null : 'inspiration')}
            >
              <span>Inspiration</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileAccordion === 'inspiration' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`luxury-mobile-accordion ${mobileAccordion === 'inspiration' ? 'luxury-mobile-accordion-open' : ''}`}>
              <div className="luxury-mobile-accordion-inner">
                <Link href="/journal" onClick={() => setMobileMenuOpen(false)} className="luxury-mobile-sub-link">
                  <BookOpen className="w-4 h-4 text-[#F6A6BB]" />
                  Blog / Olfactory Journal
                </Link>
                <Link href="/press" onClick={() => setMobileMenuOpen(false)} className="luxury-mobile-sub-link">
                  <Newspaper className="w-4 h-4 text-[#F6A6BB]" />
                  Press & Media Mentions
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/about"
            className={`luxury-mobile-link ${isActive('/about') ? 'luxury-mobile-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>About Rose Valley</span>
          </Link>

          <Link
            href="/contact"
            className={`luxury-mobile-link ${isActive('/contact') ? 'luxury-mobile-link-active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Contact Us</span>
          </Link>
        </nav>

        {/* Drawer Footer Quick Actions */}
        <div className="luxury-mobile-drawer-footer">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="luxury-mobile-footer-btn"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({mounted ? totalCartCount : 0})</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="luxury-mobile-footer-btn"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({mounted ? productIds.length : 0})</span>
            </Link>
          </div>
          {currentUser ? (
            <div className="space-y-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="luxury-mobile-footer-btn-primary"
              >
                <User className="w-4 h-4" />
                <span>My Account ({currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Member'})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full py-2.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-rose-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="luxury-mobile-footer-btn-primary"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          )}
        </div>
      </div>

      <CheckoutChoiceModal
        isOpen={checkoutChoiceOpen}
        isCompulsory={true}
        onClose={() => setCheckoutChoiceOpen(false)}
        onContinueGuest={() => {
          setCheckoutChoiceOpen(false);
          try { sessionStorage.setItem('active_guest_checkout', 'true'); } catch (e) { }
          router.push('/checkout');
        }}
      />
    </>
  );
}
