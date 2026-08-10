'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, ArrowLeft, Tag, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { useCartStore } from '@/store/cart-store';
import { useCurrencyStore } from '@/store/currency-store';

const AVAILABLE_COUPONS = [
  {
    code: 'ROYAL15',
    flag: '👑',
    name: 'Royal Heritage 15% OFF',
    desc: '15% OFF on pure Kannauj attars & luxury perfumes',
    percent: 15,
  },
  {
    code: 'ROSE10',
    flag: '🌹',
    name: 'Damask Rose 10% OFF',
    desc: '10% OFF on pre-dawn Rosa Damascena distillates',
    percent: 10,
  },
  {
    code: 'HERITAGE20',
    flag: '🏺',
    name: '400-Yr Heritage Reserve 20% OFF',
    desc: '20% OFF on artisanal attar collections',
    percent: 20,
  },
  {
    code: 'WELCOME10',
    flag: '✨',
    name: 'Welcome Member 10% OFF',
    desc: '10% instant discount for new private clients',
    percent: 10,
  },
];

export default function ViewCartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotalINR } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number; name: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotalINR = getTotalINR();
  const discountPercent = appliedCoupon ? appliedCoupon.percent : 0;
  const discountAmount = (subtotalINR * discountPercent) / 100;
  const finalTotalINR = Math.max(0, subtotalINR - discountAmount);

  const handleApplyCustomCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);
    setTimeout(() => {
      const match = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
      if (match) {
        setAppliedCoupon({ code: match.code, percent: match.percent, name: match.name });
        setCouponSuccess(`Coupon "${cleanCode}" applied! ${match.percent}% discount activated.`);
        setCouponInput('');
      } else if (cleanCode.length >= 3) {
        setAppliedCoupon({ code: cleanCode, percent: 15, name: `${cleanCode} Special Discount` });
        setCouponSuccess(`Coupon "${cleanCode}" applied! 15% discount activated.`);
        setCouponInput('');
      } else {
        setCouponError(`Invalid code "${cleanCode}". Try: ROYAL15, ROSE10, or HERITAGE20`);
      }
      setValidatingCoupon(false);
    }, 600);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('Coupon removed.');
    setTimeout(() => setCouponSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      {/* Hero Header */}
      <section className="py-12 bg-gradient-to-b from-[#FAE6E7]/60 via-[#F7EEED] to-white border-b border-[#F7D1D8]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#4A0D25] uppercase tracking-widest mb-1">
              <Link href="/products" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back To Products
              </Link>
              <span>/</span>
              <span>Reserve Bag</span>
            </div>
            <h1 className="font-serif font-extrabold text-3xl sm:text-5xl text-[#1A0510]">
              Your Fragrance Reserve Bag
            </h1>
            <p className="text-xs sm:text-sm text-[#4A0D25] font-bold mt-1">
              Review selected 100% pure hydro-distilled Kannauj attars and essential oils.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider self-start sm:self-auto shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" /> 100% Alcohol-Free Purity
          </div>
        </div>
      </section>

      {/* Main Cart Items Grid */}
      <SectionWrapper className="bg-white">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-[#FAE6E7]/30 border-2 border-dashed border-[#F7D1D8] rounded-3xl space-y-4 max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center mx-auto text-[#F6A6BB] shadow-xs">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="font-serif font-extrabold text-2xl text-[#1A0510]">Your Bag is Currently Empty</h2>
              <p className="text-xs text-[#4A0D25] font-bold max-w-md mx-auto">
                Explore our catalog of traditional Damask Rose attars, pure botanical essential oils, and sandalwood synergy elixirs.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-widest hover:bg-[#F4BBC9] transition-all shadow-md mt-2"
              >
                <span>Explore Scent Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Items List (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3 text-xs font-black text-[#4A0D25] uppercase tracking-wider">
                  <span>Selected Items ({items.length})</span>
                  <span>Unit Price</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#FAE6E7]/30 border-2 border-[#F7D1D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-[#F6A6BB] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-[#F7D1D8] relative flex-shrink-0">
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
                      <div>
                        <h3 className="font-serif font-extrabold text-base text-[#1A0510]">{item.name}</h3>
                        {item.variantName && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAE6E7] text-[#4A0D25] text-[10px] font-extrabold mt-1 border border-[#F7D1D8]">
                            Size: {item.variantName}
                          </span>
                        )}
                        <p className="text-xs font-black text-[#4A0D25] mt-1.5" suppressHydrationWarning>
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F7D1D8]">
                      <div className="flex items-center border border-[#F7D1D8] rounded-xl bg-white text-xs px-2 py-1 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 font-bold text-stone-600 hover:text-[#4A0D25]"
                        >
                          -
                        </button>
                        <span className="px-3 font-black text-[#1A0510] text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 font-bold text-stone-600 hover:text-[#4A0D25]"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-serif font-black text-lg text-[#1A0510]" suppressHydrationWarning>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200 transition-colors"
                          title="Remove item from bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary & Coupon Sidebar (5 cols) */}
              <div className="lg:col-span-5">
                <div className="p-8 rounded-3xl bg-[#FAE6E7]/50 border-2 border-[#F7D1D8] shadow-xl text-left space-y-6 sticky top-24">
                  <h3 className="font-serif font-extrabold text-2xl text-[#1A0510]">
                    Order Summary
                  </h3>

                  {/* Available Eligible Coupons List */}
                  <div className="space-y-3 pt-2 border-t border-[#F7D1D8]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-[#4A0D25] flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-[#F6A6BB]" /> Available Eligible Coupons & Offers
                      </label>
                      <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider">
                        {AVAILABLE_COUPONS.length} Active
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {AVAILABLE_COUPONS.map((coupon) => {
                        const isSelected = appliedCoupon?.code === coupon.code;
                        return (
                          <div
                            key={coupon.code}
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveCoupon();
                              } else {
                                setAppliedCoupon({ code: coupon.code, percent: coupon.percent, name: coupon.name });
                                setCouponSuccess(`Coupon "${coupon.code}" applied! ${coupon.percent}% discount activated.`);
                                setCouponError('');
                              }
                            }}
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 shadow-md'
                                : 'bg-white border-[#F7D1D8] hover:border-[#F6A6BB] hover:bg-[#FAE6E7]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl flex-shrink-0">{coupon.flag}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-xs text-[#1A0510]">
                                    {coupon.code}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#F6A6BB] text-[#4A0D25]'
                                    }`}
                                  >
                                    {coupon.percent}% OFF
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#4A0D25] font-bold mt-0.5 line-clamp-1">
                                  {coupon.desc}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all flex-shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25]'
                              }`}
                            >
                              {isSelected ? 'Applied ✓' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Coupon Input */}
                    <div className="pt-2">
                      <label className="text-[11px] font-extrabold text-[#4A0D25] block mb-1">
                        Have Your Own Custom Code?
                      </label>

                      {appliedCoupon ? (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-700" />
                            <div>
                              <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                                {appliedCoupon.code} <span className="text-[10px] text-emerald-800 font-extrabold uppercase">({appliedCoupon.percent}% OFF APPLIED)</span>
                              </div>
                              <span className="text-[10px] text-emerald-800 font-bold">{appliedCoupon.name}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black hover:bg-rose-100 hover:text-rose-900 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCustomCoupon} className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              if (couponError) setCouponError('');
                            }}
                            placeholder="Enter Code (e.g. ROYAL15)"
                            className="flex-1 bg-white border border-[#F7D1D8] rounded-xl px-3.5 py-2.5 text-xs text-[#1A0510] uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                          />
                          <button
                            type="submit"
                            disabled={validatingCoupon}
                            className="bg-[#F6A6BB] text-[#4A0D25] px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {validatingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                          </button>
                        </form>
                      )}

                      {couponError && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 pt-1.5">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}

                      {couponSuccess && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 pt-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{couponSuccess}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-xs font-bold text-[#4A0D25] border-t border-[#F7D1D8] pt-4">
                    <div className="flex justify-between items-center">
                      <span>Bag Subtotal</span>
                      <span className="font-serif font-black text-base text-[#1A0510]" suppressHydrationWarning>
                        {formatPrice(subtotalINR)}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-800 font-extrabold">
                        <span>Discount ({appliedCoupon.percent}% OFF)</span>
                        <span suppressHydrationWarning>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>Insured Express Shipping</span>
                      <span className="text-emerald-800 font-extrabold uppercase text-[10px] bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                        FREE
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Kannauj Hydro-Purity Certificate</span>
                      <span className="text-[#4A0D25] font-extrabold uppercase text-[10px] bg-[#FAE6E7] border border-[#F7D1D8] px-2 py-0.5 rounded-full">
                        INCLUDED
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F7D1D8]">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-serif font-extrabold text-lg text-[#1A0510]">Total Amount</span>
                      <span className="font-serif font-black text-3xl text-[#4A0D25]" suppressHydrationWarning>
                        {formatPrice(finalTotalINR)}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full py-4 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Proceed To Secure Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionWrapper>

      <LuxuryFooter />
    </div>
  );
}
