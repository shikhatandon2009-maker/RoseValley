'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  Droplets,
  Sparkles,
  Play,
  Pause,
  ChevronDown,
} from 'lucide-react';
import { useCurrencyStore } from '@/store/currency-store';

/* ─────────────── Types ─────────────── */
interface HeroProduct {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  image: string;
  price: number;
  badge?: string;
}

/* ─────────────── Fallback Data ─────────────── */
const FALLBACK_PRODUCTS: HeroProduct[] = [
  {
    id: 'f1',
    name: 'Gulab Khas\nPure Ruh Gulab',
    tagline: 'The Queen of Kannauj — 400-year copper Deg-Bhapka rose distillate',
    slug: 'gulab-khas-pure-ruh-gulab',
    image: '/images/hero/champaca-bottle.png',
    price: 5500,
    badge: 'Signature',
  },
  {
    id: 'f2',
    name: 'Ruh Khus\nVetiver Extract',
    tagline: 'Wild monsoon vetiver roots steam-captured in hand-beaten copper',
    slug: 'ruh-khus-oil',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    price: 3200,
    badge: 'Heritage',
  },
  {
    id: 'f3',
    name: 'Royal Rose\nOud Perfume',
    tagline: 'Aged oud heart woven with dawn-harvested Kannauj Damask rose',
    slug: 'royal-rose-oud-perfume',
    image: '/images/hero/champaca-bottle.png',
    price: 4800,
    badge: 'Bestseller',
  },
  {
    id: 'f4',
    name: 'Shamama\nKannauj Attar',
    tagline: '40 rare botanicals fused in a single seasonal copper still batch',
    slug: 'shamama-kannauj-attar',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    price: 3900,
    badge: 'Rare Batch',
  },
];

/* ─────────────── Component ─────────────── */
interface CinematicHeroProps {
  products?: any[];
}

export function CinematicHero({ products }: CinematicHeroProps) {
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Map DB products to hero items
  const items: HeroProduct[] =
    products && products.length > 0
      ? products.slice(0, 4).map((p, i) => {
          const fb = FALLBACK_PRODUCTS[i % FALLBACK_PRODUCTS.length];
          const img = p.images?.[0] || fb.image;
          return {
            id: p.id || `p-${i}`,
            name: p.name || fb.name,
            tagline: p.short_description || fb.tagline,
            slug: p.slug || fb.slug,
            image: img,
            price: p.price || fb.price,
            badge: p.is_bestseller ? 'Bestseller' : fb.badge,
          };
        })
      : FALLBACK_PRODUCTS;

  const total = items.length;
  const current = items[active];

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance
  const advance = useCallback(() => {
    setActive((p) => (p + 1) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(advance, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, advance]);

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      style={{ minHeight: 'max(88vh, 580px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ═══════ Background Layers ═══════ */}

      {/* Base gradient — deep rose-to-cream sweep */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0510] via-[#3A0A20] to-[#4A0D25]" />

      {/* Animated aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #F6A6BB 0%, transparent 70%)',
            animation: 'auroraFloat 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #F4BBC9 0%, transparent 70%)',
            animation: 'auroraFloat 22s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full opacity-10 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #E88FA6 0%, transparent 70%)',
            animation: 'auroraFloat 15s ease-in-out infinite 3s',
          }}
        />
      </div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Thin gold-rose horizontal accent lines */}
      <div className="absolute top-[15%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F6A6BB]/20 to-transparent" />
      <div className="absolute bottom-[12%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F6A6BB]/15 to-transparent" />

      {/* ═══════ Main Content Grid ═══════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center" style={{ minHeight: 'max(88vh, 580px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center py-12 lg:py-0">

          {/* ──── Left: Copy & CTA ──── */}
          <div
            className={`space-y-6 sm:space-y-8 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Heritage badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#F6A6BB]/30 bg-[#F6A6BB]/10 backdrop-blur-sm text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#F6A6BB]">
                <Droplets className="w-3.5 h-3.5" /> Est. 1620 • Kannauj
              </span>
              {current.badge && (
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#F4BBC9]">
                  {current.badge}
                </span>
              )}
            </div>

            {/* Product name — cinematic split lines */}
            <div className="space-y-1">
              {current.name.split('\n').map((line, i) => (
                <h1
                  key={`${active}-${i}`}
                  className="font-serif font-bold tracking-tight text-white leading-[1.05]"
                  style={{
                    fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
                    animation: `heroTextReveal 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s both`,
                  }}
                >
                  {line}
                </h1>
              ))}
            </div>

            {/* Tagline */}
            <p
              key={`tag-${active}`}
              className="text-sm sm:text-base text-[#F4BBC9]/80 max-w-md leading-relaxed font-medium"
              style={{
                animation: 'heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both',
              }}
            >
              {current.tagline}
            </p>

            {/* Price block */}
            <div
              key={`price-${active}`}
              className="flex items-end gap-4"
              style={{
                animation: 'heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both',
              }}
            >
              <span className="font-serif text-4xl sm:text-5xl font-bold text-white" suppressHydrationWarning>
                {formatPrice(current.price)}
              </span>
              <span className="text-[11px] text-[#F4BBC9]/60 uppercase font-bold tracking-widest pb-2">
                Pure Extract
              </span>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap items-center gap-4 pt-2"
              style={{
                animation: 'heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.45s both',
              }}
            >
              <button
                onClick={() => router.push(`/products/${current.slug}`)}
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #F6A6BB 0%, #E88FA6 100%)',
                  color: '#1A0510',
                  boxShadow: '0 0 40px rgba(246,166,187,0.3), 0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Explore This Fragrance
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Hover shimmer sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-[#F6A6BB]/30 text-[#F4BBC9] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#F6A6BB]/10 hover:border-[#F6A6BB]/50 transition-all duration-300 backdrop-blur-sm"
              >
                View All Collections
              </Link>
            </div>

            {/* Trust micro-strip */}
            <div className="flex items-center gap-5 pt-4">
              <span className="flex items-center gap-1.5 text-[10px] text-[#F4BBC9]/50 font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]/60" /> 100% Pure
              </span>
              <span className="w-[1px] h-3 bg-[#F6A6BB]/20" />
              <span className="flex items-center gap-1.5 text-[10px] text-[#F4BBC9]/50 font-bold uppercase tracking-widest">
                <Droplets className="w-3.5 h-3.5 text-[#F6A6BB]/60" /> Alcohol-Free
              </span>
              <span className="w-[1px] h-3 bg-[#F6A6BB]/20" />
              <span className="flex items-center gap-1.5 text-[10px] text-[#F4BBC9]/50 font-bold uppercase tracking-widest">
                COA Certified
              </span>
            </div>
          </div>

          {/* ──── Right: Cinematic Bottle Display ──── */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1000 delay-200 ease-out ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Concentric glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] rounded-full border border-[#F6A6BB]/10"
                style={{ animation: 'ringPulse 4s ease-in-out infinite' }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] rounded-full border border-[#F6A6BB]/5"
                style={{ animation: 'ringPulse 4s ease-in-out infinite 1s' }}
              />
            </div>

            {/* Central radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full bg-gradient-radial from-[#F6A6BB]/25 via-[#F6A6BB]/8 to-transparent blur-2xl" />
            </div>

            {/* Bottle image */}
            <div
              key={`bottle-${active}`}
              className="relative w-[280px] h-[360px] sm:w-[360px] sm:h-[460px] md:w-[420px] md:h-[520px] z-10"
              style={{
                animation: 'bottleFloat 6s ease-in-out infinite, bottleReveal 0.9s cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              <Image
                src={current.image}
                alt={current.name.replace('\n', ' ')}
                fill
                priority
                className="object-contain drop-shadow-[0_30px_80px_rgba(246,166,187,0.35)]"
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 360px, 420px"
                style={{ filter: 'brightness(1.05) contrast(1.02)' }}
              />

              {/* Subtle reflection */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-16 opacity-15 blur-xl"
                style={{
                  background: 'radial-gradient(ellipse, #F6A6BB 0%, transparent 70%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ──── Bottom: Slide Indicators + Scroll Prompt ──── */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-5 z-20">
          {/* Slide indicators */}
          <div className="flex items-center gap-3">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                className="group relative flex items-center"
                aria-label={`View ${item.name.replace('\n', ' ')}`}
              >
                <div
                  className={`rounded-full transition-all duration-500 ${
                    i === active
                      ? 'w-10 h-2 bg-[#F6A6BB]'
                      : 'w-2 h-2 bg-[#F6A6BB]/30 group-hover:bg-[#F6A6BB]/60'
                  }`}
                />
              </button>
            ))}

            {/* Play / Pause */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-3 w-7 h-7 rounded-full border border-[#F6A6BB]/30 flex items-center justify-center text-[#F6A6BB]/60 hover:text-[#F6A6BB] hover:border-[#F6A6BB]/60 transition-all"
              aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play className="w-3 h-3 ml-0.5" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>

          {/* Scroll hint */}
          <div
            className="flex flex-col items-center gap-1 text-[#F4BBC9]/40 cursor-pointer hover:text-[#F4BBC9]/70 transition-colors"
            onClick={() => {
              const next = document.getElementById('heritage-section');
              next?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.25em]">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
