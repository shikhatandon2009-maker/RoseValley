'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useCurrencyStore } from '@/store/currency-store';

interface BottleItem {
  id: string;
  name: string;
  subtitle: string;
  volume: string;
  price: string;
  priceNum: number;
  slug: string;
  image: string;
  notes: string;
}

const DEFAULT_BOTTLES: BottleItem[] = [
  {
    id: 'b1',
    name: 'Gulab Khas Pure Ruh Gulab',
    subtitle: 'Pure Rose Oil Hydro-Distillate',
    volume: '10ml Extrait De Parfum',
    price: '₹5,500',
    priceNum: 5500,
    slug: 'gulab-khas-pure-ruh-gulab',
    image: '/images/hero/champaca-bottle.png',
    notes: 'Damask Rose • Copper Deg-Bhapka • Dawn Petals',
  },
  {
    id: 'b2',
    name: 'Ruh Khus Vetiver Extract',
    subtitle: 'Copper Still Wild Roots',
    volume: '10ml Pure Concentrate',
    price: '₹3,200',
    priceNum: 3200,
    slug: 'ruh-khus-oil',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    notes: 'Wild Vetiver • Cooling Earth • Copper Water',
  },
  {
    id: 'b3',
    name: 'Royal Rose Oud Perfume',
    subtitle: 'Artisanal Perfume Blend',
    volume: '50ml Eau De Parfum',
    price: '₹4,800',
    priceNum: 4800,
    slug: 'royal-rose-oud-perfume',
    image: '/images/hero/champaca-bottle.png',
    notes: 'Aged Oud • Kannauj Rose • Mysore Sandalwood',
  },
  {
    id: 'b4',
    name: 'Shamama Kannauj Attar',
    subtitle: 'Legacy Heritage Spice & Rose',
    volume: '12ml Concentrated Oil',
    price: '₹3,900',
    priceNum: 3900,
    slug: 'shamama-kannauj-attar',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    notes: '40 Rare Botanicals • Deg-Bhapka Steam',
  },
  {
    id: 'b5',
    name: 'Saffron Crocus Attar',
    subtitle: 'Kashmiri Mogra & Rose Synergy',
    volume: '6ml Royal Reserve',
    price: '₹6,400',
    priceNum: 6400,
    slug: 'saffron-crocus-attar',
    image: '/images/hero/champaca-bottle.png',
    notes: 'Kashmiri Saffron • Golden Amber • Damask Petals',
  },
];

interface RoseOilBottlesOrbitalSpinnerProps {
  products?: any[];
}

export function RoseOilBottlesOrbitalSpinner({ products }: RoseOilBottlesOrbitalSpinnerProps) {
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Map database products to bottle items — limit to max 5
  const bottleList: BottleItem[] =
    products && products.length > 0
      ? products.slice(0, 5).map((p, idx) => {
          const defaultBottle = DEFAULT_BOTTLES[idx % DEFAULT_BOTTLES.length];
          const dbImage = (p.images && p.images.length > 0 && p.images[0]) ? p.images[0] : defaultBottle.image;
          return {
            id: p.id || `db-${idx}`,
            name: p.name,
            subtitle: p.is_bestseller ? 'Bestseller Heritage Scent' : 'Pure Hydro-Distillate',
            volume: p.scent_notes?.top ? p.scent_notes.top.join(' • ') : 'Artisanal Perfume',
            price: `₹${(p.price || 4800).toLocaleString('en-IN')}`,
            priceNum: p.price || 4800,
            slug: p.slug,
            image: dbImage,
            notes: p.scent_notes
              ? `${p.scent_notes.top?.join(', ') || ''} • ${p.scent_notes.base?.join(', ') || ''}`
              : 'Damask Rose • Copper Deg-Bhapka',
          };
        })
      : DEFAULT_BOTTLES;

  const total = bottleList.length;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };

  // Auto orbital rotation every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const current = bottleList[activeIndex] || bottleList[0];
  const prevBottle = bottleList[(activeIndex - 1 + total) % total];
  const nextBottle = bottleList[(activeIndex + 1) % total];

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#F7EEED] via-white to-[#F7EEED] py-10 md:py-16 select-none border-b border-[#F7D1D8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Soft pinkish radial aura glow — responsive circular spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] bg-gradient-radial from-[#F6A6BB]/25 via-[#F4BBC9]/10 to-transparent rounded-full blur-2xl sm:blur-3xl pointer-events-none z-0" />

      {/* Background product name watermark */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[500px] flex justify-center text-center pointer-events-none overflow-hidden opacity-[0.08] z-0">
        <span className="font-serif text-3xl sm:text-5xl font-black uppercase tracking-[0.15em] text-[#1A0510] leading-tight text-center block">
          {current.name}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* THREE BOTTLE ORBITAL CAROUSEL */}
        <div className="w-full flex items-center justify-between gap-2 sm:gap-6 relative z-20 my-2">
          
          {/* Left: Previous Product Preview Card */}
          <div
            onClick={handlePrev}
            className="hidden lg:flex flex-col items-center gap-2 cursor-pointer group opacity-50 hover:opacity-100 transition-all duration-300 transform hover:-translate-x-1"
            title={`Previous: ${prevBottle.name}`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A0D25] flex items-center gap-1">
              <ChevronLeft className="w-3 h-3 text-[#F6A6BB]" /> Previous
            </span>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-transparent flex items-center justify-center transition-all duration-300">
              <Image
                src={prevBottle.image}
                alt={prevBottle.name}
                fill
                loading="lazy"
                className="object-contain mix-blend-multiply drop-shadow-md"
                sizes="128px"
              />
            </div>
            <p className="text-xs font-serif font-bold text-[#1A0510] max-w-[120px] truncate text-center group-hover:text-[#4A0D25] transition-colors">
              {prevBottle.name}
            </p>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="p-3.5 sm:p-4 rounded-full bg-[#FAE6E7] backdrop-blur-md border border-[#F7D1D8] text-[#1A0510] hover:bg-[#F6A6BB] hover:text-[#4A0D25] hover:border-[#F6A6BB] transition-all shadow-xl active:scale-95 flex-shrink-0 z-30"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Centered Image Carousel Track Viewport */}
          <div className="overflow-hidden w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-2 py-4 relative z-20">
            <div
              className="flex w-full flex-nowrap"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                transition: 'transform 0.7s cubic-bezier(0.25,1,0.5,1)',
                willChange: 'transform',
              }}
            >
              {bottleList.map((bottle, idx) => {
                const isActive = idx === activeIndex;

                return (
                  <div
                    key={bottle.id}
                    className="w-full flex-shrink-0 flex items-center justify-center p-2 sm:p-4"
                  >
                    <div
                      onClick={() => {
                        if (!isActive) goToIndex(idx);
                        else router.push(`/products/${bottle.slug}`);
                      }}
                      className={`relative cursor-pointer w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] flex items-center justify-center transition-all duration-700 ${
                        isActive
                          ? 'scale-100 opacity-100'
                          : 'scale-90 opacity-30'
                      }`}
                    >
                      {/* Soft pinkish radial aura glow for active bottle — soft circular backlight */}
                      {isActive && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] bg-gradient-radial from-[#F6A6BB]/30 via-[#F4BBC9]/15 to-transparent rounded-full blur-xl sm:blur-2xl pointer-events-none z-0" />
                      )}

                      {/* Light Studio Ground Shadow */}
                      {isActive && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-[#4A0D25]/10 rounded-full blur-xl pointer-events-none z-10" />
                      )}

                      {/* Bottle Image with soft rose drop shadow */}
                      <Image
                        src={bottle.image}
                        alt={bottle.name}
                        fill
                        priority={idx === 0}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        className="object-contain mix-blend-multiply drop-shadow-[0_20px_50px_rgba(246,166,187,0.4)] hover:scale-105 transition-transform duration-700 ease-out z-20 relative"
                        sizes="(max-width: 768px) 320px, 420px"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="p-3.5 sm:p-4 rounded-full bg-[#FAE6E7] backdrop-blur-md border border-[#F7D1D8] text-[#1A0510] hover:bg-[#F6A6BB] hover:text-[#4A0D25] hover:border-[#F6A6BB] transition-all shadow-xl active:scale-95 flex-shrink-0 z-30"
            aria-label="Next product"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Right: Next Product Preview Card */}
          <div
            onClick={handleNext}
            className="hidden lg:flex flex-col items-center gap-2 cursor-pointer group opacity-50 hover:opacity-100 transition-all duration-300 transform hover:translate-x-1"
            title={`Next: ${nextBottle.name}`}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A0D25] flex items-center gap-1">
              Next <ChevronRight className="w-3 h-3 text-[#F6A6BB]" />
            </span>
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-transparent flex items-center justify-center transition-all duration-300">
              <Image
                src={nextBottle.image}
                alt={nextBottle.name}
                fill
                loading="lazy"
                className="object-contain mix-blend-multiply drop-shadow-md"
                sizes="128px"
              />
            </div>
            <p className="text-xs font-serif font-bold text-[#1A0510] max-w-[120px] truncate text-center group-hover:text-[#4A0D25] transition-colors">
              {nextBottle.name}
            </p>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 my-3">
          {bottleList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToIndex(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-8 h-2.5 bg-[#F6A6BB]'
                  : 'w-2.5 h-2.5 bg-[#F7D1D8] hover:bg-[#F4BBC9]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* CENTER CAPTION & DETAILS */}
        <div
          key={current.id}
          className="mt-2 w-full max-w-2xl text-center flex flex-col items-center space-y-4 px-4 transition-all duration-500 relative z-20"
        >
          {/* Category Tag */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[11px] font-extrabold tracking-widest uppercase text-[#4A0D25] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" />
            {current.subtitle}
          </span>

          {/* Product Name */}
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510] tracking-tight leading-tight">
            {current.name}
          </h2>

          {/* Fragrance Notes Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {current.notes.split('•').map((note, i) => (
              <span
                key={i}
                className="px-3.5 py-1 rounded-full bg-[#FAE6E7]/80 border border-[#F7D1D8] text-[#1A0510] text-xs font-bold tracking-wide"
              >
                {note.trim()}
              </span>
            ))}
          </div>

          {/* Price & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-[#4A0D25] uppercase font-bold tracking-widest block">
                {current.volume}
              </span>
              <span className="text-3xl font-serif font-bold text-[#1A0510]" suppressHydrationWarning>
                {formatPrice(current.priceNum)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/products/${current.slug}`)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-bold text-xs uppercase tracking-widest hover:bg-[#F4BBC9] transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Fragrance</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#1A0510] font-bold text-xs uppercase tracking-widest hover:bg-[#F7EEED] transition-all shadow-xs"
              >
                <span>All Collections</span>
              </button>
            </div>
          </div>

          {/* Heritage Seal */}
          <p className="text-[11px] text-[#4A0D25] font-bold tracking-widest pt-1 flex items-center justify-center gap-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" />
            100% Pure Botanical Hydro-Distillate • Copper Deg-Bhapka Heritage
          </p>
        </div>

      </div>
    </div>
  );
}
