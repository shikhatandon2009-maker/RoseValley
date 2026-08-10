'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Droplets, ShieldCheck } from 'lucide-react';
import '@/styles/hero-champaca.css';

export interface HeroSlideData {
  id?: string;
  tagline: string;
  title: string;
  subtitle: string;
  product_name: string;
  product_link: string;
  bg_image_url: string;
  bottle_image_url: string;
  button_text: string;
  badge_text: string;
  glow_color?: string;
}

const DEFAULT_SLIDE: HeroSlideData = {
  tagline: 'Harvest 2026 • Royal Botanical Reserve',
  title: 'Golden Champaca',
  subtitle:
    'Extracted from dawn-harvested golden Champaca blossoms (Magnolia champaca). Steam distilled into a pure sandalwood base for an extraordinary divine floral sillage.',
  product_name: 'Golden Champaca Absolute Oil',
  product_link: '/products',
  bg_image_url: '/images/hero/champaca-flower-bg.png',
  bottle_image_url: '/images/hero/champaca-bottle.png',
  button_text: 'Explore Golden Champaca',
  badge_text: '100% Hydro-Distilled • Alcohol-Free',
  glow_color: '#FFD700',
};

export function HeroChampaca() {
  const [slide, setSlide] = useState<HeroSlideData>(DEFAULT_SLIDE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/hero-slides')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.slides && data.slides.length > 0) {
          const activeSlide = data.slides.find((s: any) => s.is_active) || data.slides[0];
          setSlide({
            id: activeSlide.id,
            tagline: activeSlide.tagline || DEFAULT_SLIDE.tagline,
            title: activeSlide.title || DEFAULT_SLIDE.title,
            subtitle: activeSlide.subtitle || DEFAULT_SLIDE.subtitle,
            product_name: activeSlide.product_name || DEFAULT_SLIDE.product_name,
            product_link: activeSlide.product_link || DEFAULT_SLIDE.product_link,
            bg_image_url: activeSlide.bg_image_url || DEFAULT_SLIDE.bg_image_url,
            bottle_image_url: activeSlide.bottle_image_url || DEFAULT_SLIDE.bottle_image_url,
            button_text: activeSlide.button_text || `Explore ${activeSlide.product_name || 'Golden Champaca'}`,
            badge_text: activeSlide.badge_text || DEFAULT_SLIDE.badge_text,
            glow_color: activeSlide.glow_color || '#FFD700',
          });
        }
      })
      .catch((err) => {
        console.log('Error fetching hero slides, using default Champaca slide:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="champaca-hero-section">
      {/* Full-Screen Champaca Background Cover */}
      <img
        src={slide.bg_image_url}
        alt="Champaca Flower Background"
        className="champaca-bg-layer"
      />

      {/* Dark Luxury Vignette & Radial Light Overlays */}
      <div className="champaca-overlay-dark" />
      <div className="champaca-overlay-radial" />
      <div className="champaca-overlay-bottom-fade" />

      {/* Hero Main Content & Right Glowing Bottle Grid */}
      <div className="champaca-hero-grid">
        {/* Left Side: Tagline, Title, Description & Action Buttons */}
        <div className="champaca-content-left">
          {/* Badge */}
          <div className="champaca-badge">
            <Sparkles className="champaca-badge-sparkle" />
            <span className="champaca-badge-text">{slide.badge_text}</span>
          </div>

          {/* Tagline */}
          <div className="champaca-title-tagline">
            {slide.tagline}
          </div>

          {/* Main Headline */}
          <h1 className="champaca-main-heading">
            <span className="champaca-heading-prefix">Sovereign Essence Of</span>
            <span className="champaca-heading-gold">{slide.title}</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="champaca-description">
            {slide.subtitle}
          </p>

          {/* Call to Actions */}
          <div className="champaca-cta-group">
            <Link href={slide.product_link} className="champaca-btn-gold">
              <span>{slide.button_text || `Explore ${slide.product_name}`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Side: Champaca Bottle Aligned Right with Golden Glow */}
        <div className="champaca-bottle-container">
          {/* Radiant Golden Glow Aura */}
          <div
            className="champaca-golden-glow"
            style={{
              background: `radial-gradient(circle, ${slide.glow_color || '#FFD700'}D0 0%, ${slide.glow_color || '#FFD700'}60 40%, transparent 80%)`,
            }}
          />

          {/* Floating Bottle Image */}
          <div className="champaca-bottle-wrapper">
            <img
              src={slide.bottle_image_url}
              alt={slide.product_name}
              className="champaca-bottle-img"
            />
          </div>

          {/* Spec Badge Overlay */}
          <div className="champaca-spec-card">
            <div className="champaca-spec-icon">
              <ShieldCheck className="w-5 h-5 text-stone-900" />
            </div>
            <div className="champaca-spec-info">
              <span className="champaca-spec-title">{slide.product_name}</span>
              <span className="champaca-spec-sub">Pure Steam Distilled • Rare Harvest</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
