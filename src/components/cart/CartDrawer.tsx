'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCurrencyStore } from '@/store/currency-store';
import { CheckoutChoiceModal } from '@/components/checkout/CheckoutChoiceModal';

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalINR } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkoutChoiceOpen, setCheckoutChoiceOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        })
        .catch(() => setCurrentUser(null));
    }
  }, [isOpen]);

  const totalINR = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + p * Math.max(1, q);
    }, 0);
  }, [items]);

  if (!isOpen && !checkoutChoiceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => toggleCart(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l-2 border-[#F7D1D8] flex flex-col justify-between text-[#1A0510]">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#F7D1D8] flex items-center justify-between bg-[#FAE6E7]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                <ShoppingBag className="w-5 h-5 text-[#F6A6BB]" />
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-lg text-[#1A0510]">Fragrance Reserve Bag</h2>
                <span className="text-[10px] text-[#4A0D25] font-black uppercase tracking-wider">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-full text-stone-600 hover:text-[#1A0510] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center mx-auto text-[#F6A6BB]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-extrabold text-xl text-[#1A0510]">Your reserve bag is empty</h3>
                <p className="text-xs text-[#4A0D25] max-w-xs mx-auto font-bold">Discover our artisanal Damask Rose attars and hydro-distilled essential oils.</p>
                <button
                  onClick={() => {
                    toggleCart(false);
                    router.push('/products');
                  }}
                  className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black py-3 px-8 rounded-full uppercase tracking-wider transition-all shadow-xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[#FAE6E7]/40 rounded-2xl border border-[#F7D1D8] shadow-xs relative group"
                >
                  <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0 bg-white border border-[#F7D1D8]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FAE6E7] flex items-center justify-center text-[#F6A6BB]">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-extrabold text-sm text-[#1A0510] line-clamp-1">{item.name}</h4>
                      {item.variantName && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-xs text-[#4A0D25] font-bold">{item.variantName}</span>
                          {item.gross_weight ? (
                            <span className="text-[10px] text-stone-500 font-medium">
                              • {(() => {
                                const unit = (item.weight_unit || '').toLowerCase();
                                const gw = item.gross_weight;
                                const isKg = unit === 'kg' || unit === 'l' || (item.variantName && item.variantName.toLowerCase().includes('kg'));
                                return isKg ? `${gw % 1 === 0 ? gw : gw.toFixed(1)} Kg gross` : `${Math.round(gw)}g gross`;
                              })()}
                            </span>
                          ) : null}
                        </div>
                      )}
                      <p className="text-xs font-black text-[#4A0D25] mt-1" suppressHydrationWarning>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#F7D1D8] rounded-xl bg-white text-xs px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-1.5 py-0.5 font-bold text-stone-600 hover:text-[#4A0D25]"
                        >
                          -
                        </button>
                        <span className="px-2.5 font-extrabold text-[#1A0510]">{item.quantity > 99 ? 1 : item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-1.5 py-0.5 font-bold text-stone-600 hover:text-[#4A0D25]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#F7D1D8] bg-[#FAE6E7]/80 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#4A0D25] font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" /> 100% Purity Guaranteed
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider">Free Express Delivery</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#F7D1D8]">
                <span className="text-xs font-black text-[#1A0510] uppercase tracking-wider">Subtotal:</span>
                <span className="font-serif font-black text-2xl text-[#4A0D25]" suppressHydrationWarning>
                  {formatPrice(totalINR)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={() => toggleCart(false)}
                  className="w-full py-3 rounded-full border border-[#F7D1D8] bg-white hover:bg-[#FAE6E7] text-[#1A0510] text-xs font-extrabold uppercase tracking-wider text-center transition-all shadow-xs"
                >
                  View Full Cart
                </Link>
                <button
                  onClick={() => {
                    if (currentUser) {
                      toggleCart(false);
                      router.push('/checkout');
                    } else {
                      setCheckoutChoiceOpen(true);
                    }
                  }}
                  className="w-full py-3 rounded-full bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider text-center transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckoutChoiceModal
        isOpen={checkoutChoiceOpen}
        isCompulsory={true}
        onClose={() => setCheckoutChoiceOpen(false)}
        onContinueGuest={() => {
          setCheckoutChoiceOpen(false);
          toggleCart(false);
          try { sessionStorage.setItem('active_guest_checkout', 'true'); } catch (e) {}
          router.push('/checkout');
        }}
      />
    </div>
  );
}
