'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Star, ChevronLeft, ChevronRight, Droplets, Palette, Check } from 'lucide-react';
import { useCurrencyStore } from '@/store/currency-store';

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */
interface HeroProduct {
  id: string;
  name: string;
  tagline: string;
  story: string;
  accord: string[];
  slug: string;
  image: string;
  price: number;
  comparePrice?: number;
  volume: string;
  badge: string;
  accentColor: string;
  glowColor: string;
}

/* ──────────────────────────────────────────
   FALLBACK CATALOGUE (5 Products)
────────────────────────────────────────── */
const CATALOGUE: HeroProduct[] = [
  {
    id: 'h1',
    name: 'Gulab Khas',
    tagline: 'The Essence of Dawn',
    story: 'Twelve thousand kilograms of pre-dawn Damask petals captured in a single copper still — living perfumery at its purest.',
    accord: ['Damask Rose', 'Copper Deg-Bhapka', 'Sandalwood'],
    slug: 'gulab-khas-pure-ruh-gulab',
    image: '/images/hero/champaca-bottle.png',
    price: 5500,
    comparePrice: 6200,
    volume: '10ml Pure Ruh Gulab',
    badge: 'Signature',
    accentColor: '#C45D78',
    glowColor: 'rgba(196, 93, 120, 0.45)',
  },
  {
    id: 'h2',
    name: 'Ruh Khus',
    tagline: 'Earth After Rain',
    story: 'Wild monsoon vetiver roots hand-harvested from river banks, steam-distilled in hand-beaten copper through three full moons.',
    accord: ['Wild Vetiver', 'Petrichor', 'Cedarwood'],
    slug: 'ruh-khus-oil',
    image: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    price: 3200,
    comparePrice: 3800,
    volume: '10ml Pure Concentrate',
    badge: 'Heritage',
    accentColor: '#3A7D63',
    glowColor: 'rgba(58, 125, 99, 0.45)',
  },
  {
    id: 'h3',
    name: 'Shamama Attar',
    tagline: 'Forty Sacred Botanicals',
    story: 'Forty rare botanicals fused across seven days of continuous low-fire distillation — a fragrance that defies classification.',
    accord: ['Aged Oud', 'Saffron', 'Rose Absolute'],
    slug: 'shamama-kannauj-attar',
    image: '/uploads/hero/ai_bottle_1786262186076.png',
    price: 3900,
    comparePrice: 4500,
    volume: '12ml Concentrated Oil',
    badge: 'Rare Batch',
    accentColor: '#A4742B',
    glowColor: 'rgba(164, 116, 43, 0.45)',
  },
  {
    id: 'h4',
    name: 'Royal Rose Oud',
    tagline: 'Velvet & Mystique',
    story: 'An intoxicating marriage of Bulgarian rose absolute and rare Assam oud, aged in copper vessels for unrivaled depth.',
    accord: ['Bulgarian Rose', 'Velvet Oud', 'Amber'],
    slug: 'royal-rose-oud-perfume',
    image: '/uploads/hero/champaca_bottle_1786262252250.png',
    price: 4800,
    comparePrice: 5500,
    volume: '10ml Extrait',
    badge: 'Bestseller',
    accentColor: '#9C3D5A',
    glowColor: 'rgba(156, 61, 90, 0.45)',
  },
  {
    id: 'h5',
    name: 'Saffron Crocus',
    tagline: 'Liquid Gold of Kashmir',
    story: 'Kashmiri Mogra saffron stamens blended with warm amber and Damask Rose — a scent born of ancient ritual.',
    accord: ['Kashmiri Saffron', 'Warm Amber', 'White Oud'],
    slug: 'saffron-crocus-attar',
    image: '/uploads/hero/image__5__1786261765122.png',
    price: 6400,
    comparePrice: 7200,
    volume: '10ml Artisanal',
    badge: 'Limited',
    accentColor: '#B8860B',
    glowColor: 'rgba(184, 134, 11, 0.45)',
  },
];

/* ──────────────────────────────────────────
   BACKGROUND COLOR THEMES (4 SWATCHES)
────────────────────────────────────────── */
export type HeroBgTheme = 'beige' | 'rose-pink' | 'light-gray' | 'skyblue';

export interface BgColorOption {
  id: HeroBgTheme;
  label: string;
  subtitle: string;
  swatchHex: string;
  borderHex: string;
  bgGradient: string;
  glowAura: string;
  textPrimary: string;
  textMuted: string;
  brandTagColor: string;
  chipBorder: string;
  chipBg: string;
  vignetteTop: string;
  vignetteBottom: string;
}

export const BG_COLOR_OPTIONS: BgColorOption[] = [
  {
    id: 'beige',
    label: 'Beige',
    subtitle: 'Warm Royal Sand',
    swatchHex: '#EADBCC',
    borderHex: '#C5A88B',
    bgGradient: 'radial-gradient(ellipse 90% 70% at 50% 30%, #FFFDF8 0%, #F6EFE5 40%, #EBDCCB 85%, #E3D1BE 100%)',
    glowAura: 'rgba(214, 168, 114, 0.4)',
    textPrimary: '#1E120B',
    textMuted: '#523A2C',
    brandTagColor: '#8C562D',
    chipBorder: 'rgba(140, 86, 45, 0.25)',
    chipBg: 'rgba(255, 255, 255, 0.65)',
    vignetteTop: 'rgba(246, 239, 229, 0.6)',
    vignetteBottom: '#F7EEED',
  },
  {
    id: 'rose-pink',
    label: 'Rose Pink',
    subtitle: 'Damask Rose Mist',
    swatchHex: '#F4BBC9',
    borderHex: '#E08A9E',
    bgGradient: 'radial-gradient(ellipse 90% 70% at 50% 30%, #FFF5F7 0%, #FBE6EB 40%, #F4CCD6 85%, #E9B2C0 100%)',
    glowAura: 'rgba(246, 166, 187, 0.5)',
    textPrimary: '#2B0413',
    textMuted: '#5C142E',
    brandTagColor: '#A82C5A',
    chipBorder: 'rgba(168, 44, 90, 0.25)',
    chipBg: 'rgba(255, 255, 255, 0.65)',
    vignetteTop: 'rgba(251, 230, 235, 0.6)',
    vignetteBottom: '#F7EEED',
  },
  {
    id: 'light-gray',
    label: 'Light Gray',
    subtitle: 'Platinum Silk Mist',
    swatchHex: '#DFE3E8',
    borderHex: '#B0B8C2',
    bgGradient: 'radial-gradient(ellipse 90% 70% at 50% 30%, #FAFBFC 0%, #EFF2F5 40%, #DEE4EA 85%, #CFD7DF 100%)',
    glowAura: 'rgba(180, 195, 212, 0.45)',
    textPrimary: '#11151A',
    textMuted: '#3A4452',
    brandTagColor: '#475569',
    chipBorder: 'rgba(71, 85, 105, 0.25)',
    chipBg: 'rgba(255, 255, 255, 0.7)',
    vignetteTop: 'rgba(239, 242, 245, 0.6)',
    vignetteBottom: '#F7EEED',
  },
  {
    id: 'skyblue',
    label: 'Skyblue',
    subtitle: 'Azure Morning Dew',
    swatchHex: '#C5E2F3',
    borderHex: '#80BBE0',
    bgGradient: 'radial-gradient(ellipse 90% 70% at 50% 30%, #F5FAFD 0%, #E3F1F9 40%, #CEE6F5 85%, #B7D9EE 100%)',
    glowAura: 'rgba(135, 198, 235, 0.45)',
    textPrimary: '#081723',
    textMuted: '#1E425E',
    brandTagColor: '#176591',
    chipBorder: 'rgba(23, 101, 145, 0.25)',
    chipBg: 'rgba(255, 255, 255, 0.7)',
    vignetteTop: 'rgba(227, 241, 249, 0.6)',
    vignetteBottom: '#F7EEED',
  },
];

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */
export function CinematicHeroV2({ products }: { products?: any[] }) {
  const router = useRouter();
  const { formatPrice } = useCurrencyStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Background swatch color state (defaults to 'beige', switchable between Beige, Rose Pink, Light Gray, Skyblue)
  const [currentBgTheme, setCurrentBgTheme] = useState<HeroBgTheme>('beige');

  const activeTheme = useMemo(
    () => BG_COLOR_OPTIONS.find((t) => t.id === currentBgTheme) || BG_COLOR_OPTIONS[0],
    [currentBgTheme]
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [entered, setEntered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* Map DB products → hero items */
  const items: HeroProduct[] = useMemo(() => {
    if (products && products.length > 0) {
      return products.slice(0, 5).map((p, i) => {
        const fb = CATALOGUE[i % CATALOGUE.length];
        return {
          id: p.id || fb.id,
          name: p.name || fb.name,
          tagline: fb.tagline,
          story: p.short_description || p.description || fb.story,
          accord: p.scent_notes
            ? [
                ...(p.scent_notes.top || []).slice(0, 2),
                ...(p.scent_notes.base || []).slice(0, 1),
              ]
            : fb.accord,
          slug: p.slug || fb.slug,
          image: p.images?.[0] || fb.image,
          price: p.price || fb.price,
          comparePrice: p.compare_at_price || fb.comparePrice,
          volume: fb.volume,
          badge: p.is_bestseller ? 'Bestseller' : fb.badge,
          accentColor: fb.accentColor,
          glowColor: fb.glowColor,
        };
      });
    }
    return CATALOGUE;
  }, [products]);

  const total = items.length;
  const current = items[activeIdx];

  /* Entrance */
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  /* Navigation */
  const go = useCallback(
    (next: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setActiveIdx(((next % total) + total) % total);
      setTimeout(() => setTransitioning(false), 800);
    },
    [transitioning, total]
  );

  const goNext = useCallback(() => go(activeIdx + 1), [activeIdx, go]);
  const goPrev = useCallback(() => go(activeIdx - 1), [activeIdx, go]);

  /* Auto-rotation */
  useEffect(() => {
    intervalRef.current = setInterval(goNext, 6500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [goNext]);

  /* Touch gestures */
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  /* Keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  /* Get position class for carousel items */
  const getCarouselPosition = (idx: number) => {
    const diff = ((idx - activeIdx) % total + total) % total;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right-1';
    if (diff === total - 1) return 'left-1';
    if (diff === 2) return 'right-2';
    if (diff === total - 2) return 'left-2';
    return 'hidden';
  };

  return (
    <section
      ref={containerRef}
      className={`cinematic-v2-hero cinematic-v2-theme-${currentBgTheme}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Perfume Collection"
      style={{
        color: activeTheme.textPrimary,
      }}
    >
      {/* ════ ATMOSPHERIC BACKGROUND WITH COLOR THEME ════ */}
      <div className="cinematic-v2-bg">
        {/* Base Theme Gradient */}
        <div
          className="cinematic-v2-bg-base"
          style={{
            background: activeTheme.bgGradient,
            transition: 'background 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Dynamic accent glow */}
        <div
          className="cinematic-v2-accent-glow"
          style={{
            background: `radial-gradient(ellipse at 50% 55%, ${current.glowColor} 0%, ${activeTheme.glowAura} 45%, transparent 75%)`,
            transition: 'background 1.2s ease',
          }}
        />

        {/* Floating particles */}
        <div className="cinematic-v2-particles" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="cinematic-v2-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 2.5}px`,
                height: `${2 + Math.random() * 2.5}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 8}s`,
                opacity: 0,
                background: `radial-gradient(circle, ${current.accentColor} 0%, ${activeTheme.borderHex} 70%)`,
              }}
            />
          ))}
        </div>

        {/* Subtle noise texture overlay */}
        <div className="cinematic-v2-noise" />

        {/* Top vignette */}
        <div
          className="cinematic-v2-vignette-top"
          style={{
            background: `linear-gradient(to bottom, ${activeTheme.vignetteTop}, transparent)`,
          }}
        />
        {/* Bottom fade to page */}
        <div
          className="cinematic-v2-vignette-bottom"
          style={{
            background: `linear-gradient(to top, ${activeTheme.vignetteBottom} 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* ════ FLOATING LUXURY COLOR SWATCH SELECTOR ════ */}
      <div
        className="cinematic-v2-swatch-control"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-14px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
        }}
      >
        <div className="cinematic-v2-swatch-panel">
          <div className="cinematic-v2-swatch-header">
            <Palette className="w-3.5 h-3.5 text-[#4A0D25]" />
            <span className="cinematic-v2-swatch-title">HERO BACKGROUND SWATCH</span>
          </div>

          <div className="cinematic-v2-swatch-buttons">
            {BG_COLOR_OPTIONS.map((opt) => {
              const isSelected = opt.id === currentBgTheme;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCurrentBgTheme(opt.id)}
                  className={`cinematic-v2-swatch-btn ${isSelected ? 'is-active' : ''}`}
                  title={`${opt.label} (${opt.subtitle})`}
                  style={{
                    borderColor: isSelected ? opt.borderHex : 'rgba(0, 0, 0, 0.12)',
                    boxShadow: isSelected
                      ? `0 4px 16px ${opt.glowAura}, 0 0 0 2px ${opt.borderHex}`
                      : '0 2px 6px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <span
                    className="cinematic-v2-swatch-bubble"
                    style={{
                      backgroundColor: opt.swatchHex,
                      border: `1.5px solid ${opt.borderHex}`,
                    }}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-[#1A0510] stroke-[3]" />}
                  </span>
                  <span className="cinematic-v2-swatch-name">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <div className="cinematic-v2-content">

        {/* ── TOP: Brand Tagline ── */}
        <div
          className="cinematic-v2-brand-bar"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(-12px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          <div
            className="cinematic-v2-brand-line"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeTheme.chipBorder}, transparent)`,
            }}
          />
          <span
            className="cinematic-v2-brand-text"
            style={{ color: activeTheme.brandTagColor }}
          >
            <Sparkles className="w-3 h-3" style={{ color: current.accentColor }} />
            MAISON DE L&apos;ESSENCE · EST. 1620
          </span>
          <div
            className="cinematic-v2-brand-line"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeTheme.chipBorder}, transparent)`,
            }}
          />
        </div>

        {/* ── CENTER: 3D Perspective Carousel ── */}
        <div className="cinematic-v2-carousel-zone">

          {/* Carousel Container */}
          <div className="cinematic-v2-carousel">
            {items.map((item, idx) => {
              const position = getCarouselPosition(idx);
              return (
                <div
                  key={item.id}
                  className={`cinematic-v2-carousel-item cinematic-v2-pos-${position}`}
                  onClick={() => {
                    if (position !== 'center') go(idx);
                  }}
                  style={{ cursor: position !== 'center' ? 'pointer' : 'default' }}
                >
                  {/* Glow ring behind bottle */}
                  <div
                    className="cinematic-v2-bottle-glow"
                    style={{
                      background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Bottle Image */}
                  <div className="cinematic-v2-bottle-img-wrap">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      priority={idx === 0}
                      className="object-contain"
                      style={{
                        filter: position === 'center'
                          ? `drop-shadow(0 24px 45px ${item.glowColor}) drop-shadow(0 10px 20px rgba(0,0,0,0.18))`
                          : 'brightness(0.85) contrast(0.95) saturate(0.6)',
                      }}
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 340px"
                    />
                  </div>

                  {/* Name label on flanking items */}
                  {position !== 'center' && position !== 'hidden' && (
                    <div
                      className="cinematic-v2-flank-label"
                      style={{ color: activeTheme.textMuted }}
                    >
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="cinematic-v2-nav-btn cinematic-v2-nav-left"
            aria-label="Previous product"
            style={{
              color: activeTheme.textPrimary,
              borderColor: activeTheme.chipBorder,
              background: activeTheme.chipBg,
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="cinematic-v2-nav-btn cinematic-v2-nav-right"
            aria-label="Next product"
            style={{
              color: activeTheme.textPrimary,
              borderColor: activeTheme.chipBorder,
              background: activeTheme.chipBg,
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ── BOTTOM: Product Info Panel ── */}
        <div
          className="cinematic-v2-info-panel"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
          }}
        >
          {/* Product Badge */}
          <div className="cinematic-v2-badge-row">
            <span
              className="cinematic-v2-badge"
              style={{
                borderColor: `${current.accentColor}66`,
                color: current.accentColor,
                background: 'rgba(255, 255, 255, 0.75)',
                boxShadow: `0 2px 10px ${current.glowColor}`,
              }}
            >
              {current.badge}
            </span>
          </div>

          {/* Product Name */}
          <h1
            key={`name-${activeIdx}`}
            className="cinematic-v2-product-name"
            style={{
              color: activeTheme.textPrimary,
              animationName: 'cinematicTextRevealV2',
            }}
          >
            {current.name}
          </h1>

          {/* Tagline */}
          <p
            key={`tag-${activeIdx}`}
            className="cinematic-v2-tagline"
            style={{
              color: current.accentColor,
              animationName: 'cinematicFadeUpV2',
              animationDelay: '0.12s',
            }}
          >
            {current.tagline}
          </p>

          {/* Story */}
          <p
            key={`story-${activeIdx}`}
            className="cinematic-v2-story"
            style={{
              color: activeTheme.textMuted,
              animationName: 'cinematicFadeUpV2',
              animationDelay: '0.22s',
            }}
          >
            {current.story}
          </p>

          {/* Accord Chips */}
          <div
            key={`accords-${activeIdx}`}
            className="cinematic-v2-accords"
            style={{ animationName: 'cinematicFadeUpV2', animationDelay: '0.3s' }}
          >
            {current.accord.map((a) => (
              <span
                key={a}
                className="cinematic-v2-accord-chip"
                style={{
                  borderColor: activeTheme.chipBorder,
                  color: activeTheme.textPrimary,
                  background: activeTheme.chipBg,
                }}
              >
                <Droplets className="w-2.5 h-2.5" style={{ color: current.accentColor }} />
                {a}
              </span>
            ))}
          </div>

          {/* Price + CTA Row */}
          <div
            key={`cta-${activeIdx}`}
            className="cinematic-v2-cta-row"
            style={{ animationName: 'cinematicFadeUpV2', animationDelay: '0.38s' }}
          >
            <div className="cinematic-v2-price-block">
              <span
                className="cinematic-v2-price"
                style={{ color: activeTheme.textPrimary }}
                suppressHydrationWarning
              >
                {formatPrice(current.price)}
              </span>
              {current.comparePrice && (
                <span
                  className="cinematic-v2-compare-price"
                  style={{ color: activeTheme.textMuted }}
                  suppressHydrationWarning
                >
                  {formatPrice(current.comparePrice)}
                </span>
              )}
              <span
                className="cinematic-v2-volume"
                style={{ color: activeTheme.textMuted }}
              >
                {current.volume}
              </span>
            </div>

            <button
              onClick={() => router.push(`/products/${current.slug}`)}
              className="cinematic-v2-cta-btn shimmer-btn"
              style={{
                background: `linear-gradient(135deg, ${current.accentColor} 0%, #1A0510 100%)`,
                color: '#FFFFFF',
                boxShadow: `0 8px 24px ${current.glowColor}, 0 2px 6px rgba(0,0,0,0.12)`,
              }}
            >
              <span>Discover &amp; Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Strip */}
          <div className="cinematic-v2-trust-strip">
            <div className="cinematic-v2-trust-item">
              <div className="cinematic-v2-trust-avatars">
                {['P', 'A', 'S', 'V'].map((l, i) => (
                  <div
                    key={i}
                    className="cinematic-v2-trust-avatar"
                    style={{
                      zIndex: 4 - i,
                      background: `linear-gradient(135deg, ${current.accentColor}, #4A0D25)`,
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="cinematic-v2-trust-rating">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span style={{ color: activeTheme.textMuted }}>2,400+ reviews</span>
              </div>
            </div>

            <div
              className="cinematic-v2-trust-separator"
              style={{ background: activeTheme.chipBorder }}
            />

            <div
              className="cinematic-v2-trust-item"
              style={{ color: activeTheme.textMuted }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: current.accentColor }} />
              <span className="font-semibold">100% Pure · COA Certified</span>
            </div>
          </div>
        </div>

        {/* ── DOT NAVIGATION ── */}
        <div className="cinematic-v2-dots">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`cinematic-v2-dot ${i === activeIdx ? 'active' : ''}`}
              aria-label={`Go to product ${i + 1}`}
              style={{
                background: i === activeIdx ? current.accentColor : activeTheme.chipBorder,
              }}
            >
              <div
                className="cinematic-v2-dot-fill"
                style={{
                  background: i === activeIdx ? current.accentColor : 'transparent',
                  boxShadow: i === activeIdx ? `0 0 8px ${current.glowColor}` : 'none',
                }}
              />
            </button>
          ))}

          <span className="cinematic-v2-dot-counter" style={{ color: current.accentColor }}>
            {String(activeIdx + 1).padStart(2, '0')}
            <span className="cinematic-v2-dot-separator" style={{ color: activeTheme.textMuted }}>/</span>
            <span style={{ color: activeTheme.textMuted }}>{String(total).padStart(2, '0')}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
