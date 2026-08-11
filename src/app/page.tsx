import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { RoseOilBottlesOrbitalSpinner } from '@/components/home/RoseOilBottlesOrbitalSpinner';
import { LiveDistilleryFeedWidget } from '@/components/home/LiveDistilleryFeedWidget';
import { ScentMemoryAIWidget } from '@/components/home/ScentMemoryAIWidget';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts } from '@/lib/supabase/store-scoped-queries';
import { Award, Sparkles, ArrowRight, CheckCircle2, QrCode, ShieldCheck, Clock } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function Home() {
  // Fetch real live products from Supabase store database
  const liveProducts = await fetchProducts();
  const featuredProducts = liveProducts.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-[#4A0D25] flex flex-col justify-between">
      {/* Main Navigation Header */}
      <LuxuryHeader />

      <main className="flex-1">
        {/* 1. HERO ROTATING ORBITAL SPINNER BOTTLE DISPLAY */}
        <RoseOilBottlesOrbitalSpinner products={liveProducts} />

        {/* 2. WORLD'S LARGEST PRODUCER AUTHORITY METRICS */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#F6A6BB]" /> Unmatched Heritage Authority
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510]">
              World’s Largest Producer of Pure Rose Oil
            </h2>
            <p className="text-xs sm:text-sm text-[#4A0D25] max-w-2xl mx-auto leading-relaxed font-semibold">
              Distilling over <AnimatedCounter end={12000000} duration={1600} /> kilograms of fresh Damask rose petals annually using authentic Kannauj copper deg-bhapka vessels.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={400} suffix="+" duration={1400} />
              </div>
              <div className="text-xs text-[#1A0510] font-extrabold uppercase tracking-wider">Years Heritage</div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Kannauj Distillation since 1620</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={12000} suffix="+" duration={1500} />
              </div>
              <div className="text-xs text-[#1A0510] font-extrabold uppercase tracking-wider">Kgs Rose Petals</div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Pre-dawn harvest every season</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-emerald-800">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} />
              </div>
              <div className="text-xs text-[#1A0510] font-extrabold uppercase tracking-wider">Certified Purity</div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">100% Alcohol-Free Hydro-extract</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={54} duration={1200} />
              </div>
              <div className="text-xs text-[#1A0510] font-extrabold uppercase tracking-wider">Countries Exported</div>
              <div className="text-[11px] text-[#4A0D25] font-semibold">Supplying royal families & perfumers</div>
            </div>
          </div>
        </SectionWrapper>

        {/* 3. LIVE DISTILLERY FEED WIDGET */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <LiveDistilleryFeedWidget />
        </SectionWrapper>

        {/* 4. DYNAMIC PRODUCTS GRID (LIVE FROM SUPABASE DATABASE) */}
        <SectionWrapper id="featured" className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25] uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-[#F6A6BB]" /> Master Perfumer Reserve
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510] mt-1">
                Featured Pure Rose Oil Elixirs & Attars
              </h2>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-[#4A0D25] hover:text-[#F6A6BB] hover:underline flex items-center gap-1.5"
            >
              Explore All Collections <ArrowRight className="w-4 h-4 text-[#F6A6BB]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </SectionWrapper>

        {/* 5. UNIQUE SCENT MEMORY AI */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <ScentMemoryAIWidget />
        </SectionWrapper>

        {/* 6. KANNAUJ HERITAGE TIMELINE (1620 → TODAY) */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="text-center space-y-2 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" /> Historic Legacy
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510]">
              400-Year Kannauj Distillation Timeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left relative">
            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="font-mono text-xl font-bold text-[#4A0D25]">1620 AD</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Imperial Commission</h3>
              <p className="text-xs text-[#4A0D25] leading-relaxed font-semibold">
                Mughal royal court commissions Kannauj copper still artisans to craft alcohol-free Ruh Gulab.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="font-mono text-xl font-bold text-[#4A0D25]">1880 AD</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Bhapka Condensation</h3>
              <p className="text-xs text-[#4A0D25] leading-relaxed font-semibold">
                Pioneered double-distillation in bamboo receivers immersed in cold water baths for rose oil purity.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="font-mono text-xl font-bold text-[#4A0D25]">1960 AD</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Mysore Sandalwood Base</h3>
              <p className="text-xs text-[#4A0D25] leading-relaxed font-semibold">
                Standardized aging in pure Mysore sandalwood oil base for 12+ hour skin longevity without synthetic fixatives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7] border-2 border-[#F6A6BB] space-y-2 shadow-md">
              <span className="font-mono text-xl font-bold text-[#4A0D25]">TODAY</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">World's Largest Producer</h3>
              <p className="text-xs text-[#4A0D25] leading-relaxed font-semibold">
                Rose Valley Kannauj operates the world's largest certified copper deg distillation network.
              </p>
            </div>
          </div>
        </SectionWrapper>

        {/* 7. PROVENANCE PASSPORT FEATURE SHOWCASE */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
                <QrCode className="w-3.5 h-3.5 text-[#F6A6BB]" /> Digital Authenticity Verification
              </div>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510] leading-tight">
                Cryptographic Rose Oil Provenance Passport
              </h2>
              <p className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed font-semibold">
                Every bottle of Rose Valley Kannauj pure elixir carries a tamper-proof QR certificate tracing its exact harvest date, copper deg vessel batch ID, hydro-distillation timestamp, and GC-MS purity spectrum.
              </p>
              <div className="pt-2">
                <Link
                  href="/provenance-passport"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A0D25] text-white text-xs font-extrabold uppercase tracking-widest hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" /> Verify Batch Passport
                </Link>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAE6E7]/80 border border-[#F7D1D8] text-center space-y-4 relative overflow-hidden shadow-xs">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-white p-3 flex items-center justify-center shadow-xs">
                <QrCode className="w-full h-full text-[#4A0D25]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#4A0D25] uppercase tracking-widest font-bold block">
                  Batch Code: #DEG-2026-R88
                </span>
                <h3 className="font-serif font-bold text-xl text-[#1A0510] mt-1">
                  Authentic Damask Hydro-Extract
                </h3>
                <p className="text-xs text-[#4A0D25] font-semibold mt-1">
                  99.98% Purity • Harvested April 2026 • Kannauj Distillation
                </p>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </main>

      {/* Main Footer */}
      <LuxuryFooter />
    </div>
  );
}
