'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Droplets, ShieldCheck, Star, ChevronRight } from 'lucide-react';
import { useCurrencyStore } from '@/store/currency-store';

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */
interface HeroItem {
  id: string;
  name: string;
  house: string;
  year: string;
  story: string;
  accord: string[];
  slug: string;
  image: string;
  price: number;
  volume: string;
  badge: string;
}

/* ──────────────────────────────────────────
   FALLBACK CATALOGUE
────────────────────────────────────────── */
const CATALOGUE: HeroItem[] = [
  {
    id: 'h1',
    name: 'Pure Damask Rose Oil',
    house: 'ROSEOIL.IN',
    year: '100% Pure Essential Oil',
    story: 'Pre-dawn harvested Damask rose petals steam-distilled to perfection — pure, therapeutic aromatherapeutic perfection.',
    accord: ['Damask Rose', 'Floral Heart', 'Morning Dew', 'Warm Petals'],
    slug: 'gulab-khas-pure-ruh-gulab',
    image: '/images/hero/champaca-bottle.png',
    price: 5500,
    volume: '10ml Pure Rose Oil',
    badge: 'Signature Collection',
  },
  {
    id: 'h2',
    name: 'Wild Himalayan Vetiver Oil',
    house: 'ROSEOIL.IN',
    year: '100% Pure Essential Oil',
    story: 'Wild monsoon vetiver roots steam-distilled into a grounding, deeply soothing pure essential oil.',
    accord: ['Wild Vetiver', 'Cooling Earth', 'Rain on Soil', 'Cedarwood'],
    slug: 'ruh-khus-oil',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    price: 3200,
    volume: '10ml Pure Concentrate',
    badge: 'Heritage Reserve',
  },
  {
    id: 'h3',
    name: 'Royal Botanical Blend',
    house: 'ROSEOIL.IN',
    year: '100% Pure Essential Oil',
    story: 'Rare therapeutic botanicals blended for daily wellness, aromatherapy diffusion, and natural skin vitality.',
    accord: ['Sandalwood', 'Saffron', 'Rose', 'Pure Botanicals'],
    slug: 'shamama-kannauj-attar',
    image: '/images/hero/champaca-bottle.png',
    price: 3900,
    volume: '12ml Concentrated Oil',
    badge: 'Seasonal Batch',
  },
];

const TICKER = [
  'PURE ROSE OIL', '·', 'THERAPEUTIC GRADE', '·', 'WILD VETIVER', '·', 'MYSORE SANDALWOOD',
  '·', 'ORGANIC LAVENDER', '·', 'STEAM DISTILLED', '·', 'COLD PRESSED', '·',
  '100% PURE & NATURAL', '·', 'ALCOHOL-FREE', '·', 'GC-MS TESTED', '·',
  'ROSEOIL.IN', '·', 'BOTANICAL ESSENCES', '·',
];

const PALETTES = [
  { accent: '#C8485E', soft: '#FDF0F2', glow: 'rgba(200,72,94,0.15)' },
  { accent: '#4A6741', soft: '#EFF3EE', glow: 'rgba(74,103,65,0.15)' },
  { accent: '#7A5230', soft: '#F5EDE4', glow: 'rgba(122,82,48,0.15)' },
];

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */
export function LuxuryEditorialHero({ products }: { products?: any[] }) {
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();

  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* Map DB products */
  const items: HeroItem[] =
    products && products.length > 0
      ? products.slice(0, 3).map((p, i) => {
          const fb = CATALOGUE[i % CATALOGUE.length];
          return {
            id: p.id || fb.id,
            name: p.name || fb.name,
            house: fb.house,
            year: fb.year,
            story: p.short_description || fb.story,
            accord: p.scent_notes
              ? [
                  ...(p.scent_notes.top || []).slice(0, 2),
                  ...(p.scent_notes.base || []).slice(0, 2),
                ]
              : fb.accord,
            slug: p.slug || fb.slug,
            image: p.images?.[0] || fb.image,
            price: p.price || fb.price,
            volume: fb.volume,
            badge: p.is_bestseller ? 'Bestseller' : fb.badge,
          };
        })
      : CATALOGUE;

  const total = items.length;
  const current = items[activeIdx];
  const pal = PALETTES[activeIdx % PALETTES.length];

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setActiveIdx(next);
      setTimeout(() => setTransitioning(false), 700);
    },
    [transitioning]
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => go((activeIdx + 1) % total), 7000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeIdx, go, total]);

  return (
    <div className="relative w-full overflow-hidden border-b border-[#F7D1D8]">
      {/* ════ PETALS ════ */}
      {[
        { l: '7%',  s: 9,  d: '0s',   r: '16s', c: '#F6A6BB' },
        { l: '20%', s: 6,  d: '3s',   r: '20s', c: '#F4BBC9' },
        { l: '38%', s: 8,  d: '6s',   r: '13s', c: '#E88FA6' },
        { l: '58%', s: 11, d: '1.5s', r: '18s', c: '#F6A6BB' },
        { l: '73%', s: 7,  d: '4s',   r: '22s', c: '#F4BBC9' },
        { l: '87%', s: 9,  d: '2s',   r: '15s', c: '#E88FA6' },
      ].map((p, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: p.l, bottom: '-4%',
            width: p.s, height: p.s,
            background: p.c,
            animationDelay: p.d,
            animationDuration: p.r,
            opacity: 0,
          }}
        />
      ))}

      {/* ════ MAIN LAYOUT ════ */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 transition-colors duration-1000"
        style={{ background: `linear-gradient(135deg, #FAF7F5 0%, ${pal.soft} 100%)` }}
      >
        {/* ── LEFT: Story Panel ── */}
        <div className="flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-10 sm:py-12 gap-8">

          {/* Top content block */}
          <div
            className="space-y-5"
            style={{ animation: entered ? 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}
          >
            {/* House + Year */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-[10px] font-black uppercase tracking-[0.28em]"
                style={{ color: pal.accent }}
              >
                {current.house}
              </span>
              <span className="text-[10px] font-bold text-[#4A0D25]/40 tracking-widest border-l border-current pl-3">
                {current.year}
              </span>
            </div>

            {/* Name */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#4A0D25]/40 mb-1">
                The Fragrance
              </p>
              <h1
                key={`name-${activeIdx}`}
                className="font-serif font-black text-[#1A0510] leading-[0.9]"
                style={{
                  fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                  animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                {current.name}
              </h1>
            </div>

            {/* Badge rule */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#1A0510]/10" />
              <span
                className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                style={{ color: pal.accent, borderColor: `${pal.accent}45`, background: `${pal.accent}0E` }}
              >
                {current.badge}
              </span>
              <div className="flex-1 h-[1px] bg-[#1A0510]/10" />
            </div>

            {/* Story */}
            <p
              key={`story-${activeIdx}`}
              className="text-sm sm:text-[15px] text-[#4A0D25]/70 leading-[1.8] font-medium max-w-md"
              style={{ animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
            >
              {current.story}
            </p>

            {/* Accord chips */}
            <div
              className="flex flex-wrap gap-2"
              style={{ animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.18s both' }}
            >
              {current.accord.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    background: `${pal.accent}08`,
                    borderColor: `${pal.accent}30`,
                    color: pal.accent,
                  }}
                >
                  {a}
                </span>
              ))}
            </div>

            {/* CTA row */}
            <div
              className="flex flex-wrap items-center gap-4 pt-1"
              style={{ animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}
            >
              <button
                onClick={() => router.push(`/products/${current.slug}`)}
                className="shimmer-btn relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-black text-[11px] uppercase tracking-[0.16em] text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${pal.accent} 0%, #1A0510 100%)`,
                  boxShadow: `0 6px 28px ${pal.glow}, 0 2px 8px rgba(0,0,0,0.12)`,
                }}
              >
                <Droplets className="w-4 h-4" />
                Discover &amp; Shop
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4A0D25]/50 hover:text-[#4A0D25] transition-colors group"
              >
                Our Kannauj Story
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="flex flex-wrap items-center gap-3 pt-1"
              style={{ animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}
            >
              <div className="flex -space-x-1.5">
                {[
                  { l: 'P', bg: pal.accent },
                  { l: 'A', bg: '#7A5230' },
                  { l: 'S', bg: '#4A6741' },
                  { l: 'V', bg: '#4A0D25' },
                  { l: 'R', bg: '#C8485E' },
                ].map((av, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                    style={{ background: av.bg }}
                  >
                    {av.l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[10px] text-[#4A0D25]/50 font-semibold">
                  4.9 · 2,400+ verified patrons worldwide
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest sm:ml-auto" style={{ color: pal.accent }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Pure
              </div>
            </div>
          </div>

          {/* ── Bottom: Collection Switcher (in flow, not absolute) ── */}
          <div
            className="flex items-center gap-3 pt-2 border-t border-[#1A0510]/08"
            style={{ animation: entered ? 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both' : 'none' }}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-[#4A0D25]/35 hidden sm:block">
              Collection
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => go(i)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300"
                  style={{
                    borderColor: i === activeIdx ? pal.accent : 'transparent',
                    background: i === activeIdx ? `${pal.accent}10` : 'transparent',
                    opacity: i === activeIdx ? 1 : 0.45,
                  }}
                >
                  <div className="relative w-8 h-10 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider hidden sm:block"
                    style={{ color: i === activeIdx ? pal.accent : '#1A0510' }}
                  >
                    {item.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] font-black" style={{ color: pal.accent }}>
                {String(activeIdx + 1).padStart(2, '0')}
              </span>
              <div className="w-10 h-[2px] rounded-full bg-[#1A0510]/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${((activeIdx + 1) / total) * 100}%`, background: pal.accent }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#4A0D25]/30">
                {String(total).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Bottle Visual Panel ── */}
        <div
          className="relative flex flex-col items-center justify-center py-10 sm:py-14 lg:py-16 px-6 min-h-[340px] sm:min-h-[440px]"
          style={{
            background: `linear-gradient(145deg, ${pal.soft} 0%, #FAF7F5 100%)`,
            transition: 'background 1.2s ease',
          }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="rounded-full blur-3xl"
              style={{
                width: '65%', height: '65%',
                background: `radial-gradient(circle, ${pal.glow} 0%, transparent 70%)`,
                animation: 'glowBreath 5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Rings */}
          {[0, 1].map((r) => (
            <div
              key={r}
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: '55%', aspectRatio: '1',
                borderColor: `${pal.accent}20`,
                animation: `ringOut 4s ease-out infinite ${r * 2}s`,
              }}
            />
          ))}

          {/* Bottle */}
          <div
            key={`bottle-${activeIdx}`}
            className="relative z-10"
            style={{
              width: 'clamp(180px, 22vw, 320px)',
              height: 'clamp(240px, 28vw, 420px)',
              animation: 'bottleIn 0.85s cubic-bezier(0.16,1,0.3,1) both, bottleFloat 7s ease-in-out 0.85s infinite',
            }}
          >
            <Image
              src={current.image}
              alt={current.name}
              fill
              priority
              className="object-contain"
              style={{
                filter: `drop-shadow(0 24px 60px ${pal.glow}) drop-shadow(0 4px 16px rgba(0,0,0,0.07))`,
              }}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 260px, 320px"
            />
          </div>

          {/* Price card — right bottom, clear of bottle */}
          <div
            key={`card-${activeIdx}`}
            className="relative z-10 mt-6 w-full max-w-[220px] rounded-2xl p-4 backdrop-blur-xl border"
            style={{
              background: 'rgba(255,255,255,0.78)',
              borderColor: `${pal.accent}22`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.05), 0 0 0 1px ${pal.accent}12`,
              animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both',
            }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4A0D25]/40 mb-1">
              {current.volume}
            </p>
            <p
              className="font-serif font-black text-[#1A0510] leading-none"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)' }}
              suppressHydrationWarning
            >
              {formatPrice(current.price)}
            </p>
            <div
              className="mt-2 pt-2 border-t flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
              style={{ borderColor: `${pal.accent}18`, color: pal.accent }}
            >
              <ShieldCheck className="w-3 h-3 flex-shrink-0" />
              COA Certified · Alcohol-Free
            </div>
            <button
              onClick={() => router.push(`/products/${current.slug}`)}
              className="mt-3 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${pal.accent}, #1A0510)` }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>

      {/* ════ SCENT TICKER ════ */}
      <div
        className="overflow-hidden py-3"
        style={{ background: pal.accent, transition: 'background 1.2s ease' }}
      >
        <div className="flex">
          <div className="ticker-track gap-8">
            {[...TICKER, ...TICKER].map((word, i) => (
              <span
                key={i}
                className="text-[10px] font-black uppercase tracking-[0.28em] text-white/75 inline-block px-4"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
