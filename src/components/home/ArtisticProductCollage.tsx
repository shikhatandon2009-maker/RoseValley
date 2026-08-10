'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Orbit } from 'lucide-react';
import '@/styles/product-collage.css';

export interface ProductItem {
  id?: string;
  name: string;
  slug?: string;
  price?: number | string;
  images?: string[];
  description?: string;
  tag?: string;
  sizeClass?: string;
  isBestseller?: boolean;
}

const BESTSELLER_PRODUCTS: (ProductItem & { sizeClass: string })[] = [
  {
    id: 'collage-1',
    name: 'Ruh Gulab Imperial Attar',
    slug: 'ruh-gulab-imperial',
    price: 18500,
    images: ['/images/hero/champaca-bottle.png'],
    description: 'Hydro-distilled in traditional 400-year-old Kannauj copper Degs at pre-dawn harvest.',
    tag: '★ BESTSELLER • COPPER DEG',
    sizeClass: 'size-250',
    isBestseller: true,
  },
  {
    id: 'collage-2',
    name: 'Aged Mysore Sandalwood Pure Oil',
    slug: 'mysore-sandalwood-pure-oil',
    price: 24000,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'],
    description: '100% pure steam-distilled Santalum album aged for 12 years in clay vessels.',
    tag: '★ BESTSELLER • 100% PURE',
    sizeClass: 'size-180',
    isBestseller: true,
  },
  {
    id: 'collage-3',
    name: 'Night Jasmine Sambac Absolute',
    slug: 'jasmine-sambac-absolute',
    price: 14500,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'],
    description: 'Hand-picked moonlit jasmine Sambac flowers hydro-extracted into a rich amber base.',
    tag: '★ BESTSELLER • MOONLIT',
    sizeClass: 'size-130x180',
    isBestseller: true,
  },
  {
    id: 'collage-4',
    name: 'Royal Saffron & Oud Extrait',
    slug: 'royal-saffron-oud',
    price: 32000,
    images: ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop'],
    description: 'Kashmiri saffron crocus infused into 25-year aged Cambodian agarwood resin.',
    tag: '★ BESTSELLER • ROYAL OUD',
    sizeClass: 'size-220',
    isBestseller: true,
  },
  {
    id: 'collage-5',
    name: 'Golden Champaca Elixir',
    slug: 'golden-champaca-elixir',
    price: 21000,
    images: ['/images/hero/champaca-bottle.png'],
    description: 'Extracted from dawn-harvested golden Champaca blossoms in pure sandalwood base.',
    tag: '★ BESTSELLER • CHAMPACA',
    sizeClass: 'size-240x200',
    isBestseller: true,
  },
  {
    id: 'collage-6',
    name: 'Kannauj Bhapka Copper Extract',
    slug: 'kannauj-bhapka-copper',
    price: 19500,
    images: ['https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1000&auto=format&fit=crop'],
    description: 'Authentic Kannauj double condensation distillate with zero synthetic solvents.',
    tag: '★ BESTSELLER • HERITAGE',
    sizeClass: 'size-140',
    isBestseller: true,
  },
  {
    id: 'collage-7',
    name: 'Smoldering Amber & Musk Oil',
    slug: 'smoldering-amber-musk',
    price: 16800,
    images: ['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop'],
    description: 'Warm, magnetic botanical amber blend aged to perfection for 14-hour skin longevity.',
    tag: '★ BESTSELLER • AMBER',
    sizeClass: 'size-210x160',
    isBestseller: true,
  },
  {
    id: 'collage-8',
    name: 'Blue Lotus Sacred Hydro-Distillate',
    slug: 'blue-lotus-sacred',
    price: 28500,
    images: ['https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1000&auto=format&fit=crop'],
    description: 'Rare Nymphaea caerulea hydro-extract distilled using ancient royal court methods.',
    tag: '★ BESTSELLER • BLUE LOTUS',
    sizeClass: 'size-160x230',
    isBestseller: true,
  },
  {
    id: 'collage-9',
    name: 'Wild Rose & Cardamom Elixir',
    slug: 'wild-rose-cardamom',
    price: 17200,
    images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop'],
    description: 'Fresh Damask rose infused with wild green cardamom pods.',
    tag: '★ BESTSELLER • WILD ROSE',
    sizeClass: 'size-100',
    isBestseller: true,
  },
  {
    id: 'collage-10',
    name: 'Royal Vetiver Roots Attar',
    slug: 'royal-vetiver-roots',
    price: 15900,
    images: ['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=1000&auto=format&fit=crop'],
    description: 'Hydro-distilled Khus roots in copper still for cooling earthy elegance.',
    tag: '★ BESTSELLER • KHUS ROOT',
    sizeClass: 'size-120',
    isBestseller: true,
  },
];

interface ArtisticProductCollageProps {
  products?: any[];
}

export function ArtisticProductCollage({ products = [] }: ArtisticProductCollageProps) {
  // Filter products for bestsellers only
  const bestsellersOnly = products.filter(p => p.isBestseller || p.is_bestseller || p.featured || p.is_featured);

  // Combine catalog bestsellers with fallback items for a 10-item sphere collage
  const items = Array.from({ length: 10 }).map((_, idx) => {
    const fallback = BESTSELLER_PRODUCTS[idx % BESTSELLER_PRODUCTS.length];
    if (bestsellersOnly[idx]) {
      const p = bestsellersOnly[idx];
      return {
        id: p.id || `prod-${idx}`,
        name: p.name,
        slug: p.slug,
        images: p.images && p.images.length > 0 ? p.images : fallback.images,
        description: p.description || fallback.description,
        tag: '★ BESTSELLER RESERVE',
        sizeClass: fallback.sizeClass,
      };
    }
    return fallback;
  });

  return (
    <section className="collage-section-wrapper">
      {/* Background Ambient Glow Ornaments */}
      <div className="collage-bg-glow-1" />
      <div className="collage-bg-glow-2" />

      {/* Section Header */}
      <div className="collage-header">
        <div className="collage-header-badge">
          <Orbit className="w-3.5 h-3.5 text-[#d6006e]" />
          <span className="!text-[#d6006e] font-extrabold tracking-widest">The Bestseller Sphere • Bloomed Rose Core</span>
        </div>

        <h2 className="collage-header-title !text-[#1a0510]">
          <span className="!text-[#1a0510] font-extrabold">The Bestseller </span>
          <span className="collage-header-gold">Perfume Sphere</span>
        </h2>

        <p className="collage-header-subtitle">
          A fully bloomed Damask Pink Rose at the center of an exclusive celestial orbit showcasing Kannauj&apos;s most coveted Bestseller distillates.
        </p>
      </div>

      {/* BORDERLESS PERFUME SPHERE CONTAINER */}
      <div className="perfume-sphere-wrapper">
        {/* CENTER FULLY BLOOMED PINK ROSE IMAGE */}
        <div className="pink-rose-center-core">
          <img
            src="/images/hero/pink-rose-bloomed.png"
            alt="Fully Bloomed Damask Pink Rose"
            className="pink-rose-bloomed-img"
          />
        </div>

        {/* STATIC ORBIT TRACK WITH LEVEL TILE ANIMATIONS (NO TILT) */}
        <div className="perfume-sphere-orbit-track">
          {items.map((item, idx) => {
            const imgSrc = (item.images && item.images.length > 0 && item.images[0]) ? item.images[0] : '/images/hero/champaca-bottle.png';
            const productUrl = item.slug ? `/products/${item.slug}` : '/products';

            // Calculate starting angle deg for level orbit animation (zero tilt on mouseover)
            const startAngleDeg = Math.round(idx * (360 / items.length) - 90);

            return (
              <Link
                key={item.id || idx}
                href={productUrl}
                className={`collage-bound-tile ${item.sizeClass}`}
                style={{
                  '--angle-start': `${startAngleDeg}deg`,
                } as React.CSSProperties}
              >
                {/* Pink Smoky Aura Layer (Active on Mouseover) */}
                <div className="collage-red-smoky-layer" />

                {/* Transparent Image */}
                <img
                  src={imgSrc}
                  alt={item.name}
                  className="collage-bound-img"
                  loading="lazy"
                />

                {/* Unhovered Title Pill (Product Name Only, No Price) */}
                <div className="collage-bound-title-pill">
                  <span className="collage-pill-name">{item.name}</span>
                </div>

                {/* Expanded Pink Detail Overlay (No Price) */}
                <div className="collage-red-xzoom-details">
                  <span className="collage-red-badge">
                    {item.tag || '★ BESTSELLER RESERVE'}
                  </span>

                  <h3 className="collage-red-title">{item.name}</h3>

                  <p className="collage-red-desc">
                    {item.description}
                  </p>

                  <div className="collage-red-bottom">
                    <span className="collage-red-badge-bestseller">
                      ★ BESTSELLER SELECTION
                    </span>

                    <span className="collage-red-cta">
                      <span>Explore Reserve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
