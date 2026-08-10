'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Bell, LogOut, Truck, CheckCircle2, Sparkles, Key, Copy, Check, ShieldCheck, ArrowRight, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';

interface AccountClientProps {
  user: any;
  orders: any[];
  defaultTab: string;
}

export function AccountClient({ user: initialUser, orders: initialOrders, defaultTab }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'orders');
  const [userState, setUserState] = useState(initialUser);
  const [ordersList, setOrdersList] = useState<any[]>(initialOrders || []);
  const [tempAccount, setTempAccount] = useState<{ username: string; password: string; fullName: string; email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const router = useRouter();
  const { productIds } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  useEffect(() => {
    // Load temporary guest account & stored local orders from localStorage
    if (typeof window !== 'undefined') {
      const storedAccountStr = localStorage.getItem('temp_guest_account');
      if (storedAccountStr) {
        try {
          const parsedAcc = JSON.parse(storedAccountStr);
          setTempAccount(parsedAcc);
          if (parsedAcc.fullName || parsedAcc.email) {
            setUserState({
              full_name: parsedAcc.fullName || initialUser.full_name,
              email: parsedAcc.email || initialUser.email,
              role: 'customer',
            });
          }
        } catch (e) {
          console.error('Error parsing temp_guest_account:', e);
        }
      }

      const storedOrdersStr = localStorage.getItem('user_orders');
      if (storedOrdersStr) {
        try {
          const parsedOrders = JSON.parse(storedOrdersStr);
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            // Merge local placed orders with initialOrders avoiding duplicates
            const combinedMap = new Map();
            parsedOrders.forEach((o) => combinedMap.set(o.order_number || o.id, o));
            initialOrders.forEach((o) => combinedMap.set(o.order_number || o.id, o));
            setOrdersList(Array.from(combinedMap.values()));
          }
        } catch (e) {
          console.error('Error parsing user_orders:', e);
        }
      }
    }
  }, []);

  const handleCopyCredentials = () => {
    if (!tempAccount) return;
    const textToCopy = `Username: ${tempAccount.username}\nPassword: ${tempAccount.password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp_guest_account');
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1A0510]">
      {/* 1. Header Profile Banner */}
      <div className="p-8 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-left">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6A6BB] text-[#4A0D25] flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#F7D1D8]">
            {userState.full_name?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Maison Private Client Portal
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#1A0510] mt-1">
              {userState.full_name || 'Victoria Sterling'}
            </h1>
            <p className="text-xs text-[#4A0D25] font-bold mt-0.5">{userState.email || 'victoria@example.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-full border border-[#F7D1D8] bg-white text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* 2. Temporary Account Credentials Notification Box (If Created) */}
      {tempAccount && (
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-lg text-left space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-amber-950">
                  Temporary Account Auto-Generated On Order Placement
                </h3>
                <p className="text-xs text-amber-800 font-bold">
                  Use these credentials to log in anytime and view your order history & tracking.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCredentials}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Credentials</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-0.5">
                Username / Email ID
              </span>
              <span className="font-mono font-black text-sm text-stone-900 select-all">
                {tempAccount.username}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-0.5">
                  Password (Customer Last Name)
                </span>
                <span className="font-mono font-black text-sm text-amber-900 select-all">
                  {showPassword ? tempAccount.password : '••••••••'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex border-b-2 border-[#F7D1D8] overflow-x-auto gap-8 text-xs font-black uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <Package className="w-4 h-4 text-[#F6A6BB]" /> Placed Order History ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#F6A6BB]" /> Saved Wishlist ({productIds.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#F6A6BB]" /> Shipping Address Book
        </button>
      </div>

      {/* 4. Tab 1: Placed Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-6 text-left animate-fade-in">
          {ordersList.length === 0 ? (
            <div className="text-center py-20 bg-[#FAE6E7]/30 border-2 border-dashed border-[#F7D1D8] rounded-3xl space-y-4">
              <Package className="w-12 h-12 text-[#F6A6BB] mx-auto" />
              <h3 className="font-serif font-extrabold text-xl text-[#1A0510]">No Past Orders Placed Yet</h3>
              <p className="text-xs text-[#4A0D25] font-bold max-w-sm mx-auto">
                Explore our hand-distilled Damask Rose attars and essential oils catalog.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider py-3 px-8 rounded-full shadow-xs"
              >
                Shop Scent Collection
              </button>
            </div>
          ) : (
            ordersList.map((ord) => (
              <div
                key={ord.id || ord.order_number}
                className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-lg space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F7D1D8] pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-extrabold text-lg text-[#1A0510]">
                        Order #{ord.order_number || ord.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10px] font-black uppercase tracking-wider">
                        PAID VIA RAZORPAY
                      </span>
                    </div>
                    <p className="text-xs text-[#4A0D25] font-bold mt-0.5">
                      Placed on {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider">
                      STATUS: {ord.status || 'PROCESSING'}
                    </span>
                    <span className="font-serif font-black text-xl text-[#4A0D25]" suppressHydrationWarning>
                      {formatPrice(ord.total_amount || 4800)}
                    </span>
                  </div>
                </div>

                {/* Courier Tracking Banner */}
                <div className="p-4 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] text-xs font-bold text-[#4A0D25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-[#F6A6BB]" />
                    <div>
                      <span>Carrier Partner: <strong>{ord.courier_name || 'Bluedart Express Courier'}</strong></span>
                      <span className="block text-[11px] font-mono text-[#1A0510] font-bold mt-0.5">
                        Tracking AWB #: {ord.tracking_number || 'AWB-2026-948201'}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    Dispatched from Kannauj Estate
                  </span>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-black text-[#4A0D25] uppercase tracking-wider block">
                    Order Items Breakdown:
                  </span>
                  {ord.order_items && ord.order_items.length > 0 ? (
                    ord.order_items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#F7D1D8] bg-white flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-[#1A0510] text-sm">{item.product_name || item.name}</h4>
                            <span className="text-[11px] text-[#4A0D25] font-bold block">
                              Qty: {item.quantity} • {item.variantName || 'Standard Bottle'}
                            </span>
                          </div>
                        </div>
                        <span className="font-serif font-black text-sm text-[#1A0510]" suppressHydrationWarning>
                          {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] text-xs font-bold text-[#4A0D25]">
                      Damask Rose Artisanal Attars & Pure Botanical Hydro-Distillates Batch
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="p-10 bg-white rounded-3xl border-2 border-[#F7D1D8] text-center space-y-4 shadow-lg animate-fade-in">
          <Heart className="w-12 h-12 text-[#F6A6BB] mx-auto fill-current animate-pulse" />
          <h3 className="font-serif text-2xl font-extrabold text-[#1A0510]">Your Saved Fragrance Reserve</h3>
          <p className="text-xs text-[#4A0D25] font-bold">
            You have <strong className="text-[#4A0D25]">{productIds.length} item(s)</strong> saved in your private wishlist.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/wishlist')}
              className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black py-3.5 px-8 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> View Saved Wishlist Catalog
            </button>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Shipping Addresses */}
      {activeTab === 'addresses' && (
        <div className="p-8 bg-white rounded-3xl border-2 border-[#F7D1D8] space-y-4 shadow-lg text-left animate-fade-in">
          <h3 className="font-serif text-xl font-extrabold text-[#1A0510]">Default Shipping Address</h3>
          <div className="p-5 bg-[#FAE6E7]/50 rounded-2xl border border-[#F7D1D8] text-xs text-[#4A0D25] space-y-1.5 shadow-xs font-bold">
            <p className="font-extrabold text-sm text-[#1A0510]">{userState.full_name || 'Victoria Sterling'}</p>
            <p>35 Farsh Road / Rosewood Estate, Suite 4B</p>
            <p>Kannauj, Uttar Pradesh 209725</p>
            <p>India (+91 98390 12345)</p>
          </div>
        </div>
      )}

    </div>
  );
}
