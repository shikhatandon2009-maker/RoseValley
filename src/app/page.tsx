import React from 'react';
import Link from 'next/link';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { RoseOilBottlesOrbitalSpinner } from '@/components/home/RoseOilBottlesOrbitalSpinner';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts } from '@/lib/supabase/store-scoped-queries';
import { Award, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Clock, Truck, RotateCcw, Lock, CreditCard, Star } from 'lucide-react';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

// ISR: revalidate every 60 seconds for fast loads with fresh data
export const revalidate = 60;

export default async function Home() {
  const liveProducts = await fetchProducts();
  const featuredProducts = liveProducts.slice(0, 6);
  const heroProducts = liveProducts.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-[#4A0D25] flex flex-col justify-between">
      {/* Main Navigation Header */}
      <LuxuryHeader />

      {/* 🔥 TRUST BAR — Social proof strip */}
      <div className="bg-[#4A0D25] text-white py-2.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 sm:gap-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-wrap">
          <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#F6A6BB]" /> Free Shipping ₹2000+</span>
          <span className="hidden sm:flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-[#F6A6BB]" /> Highest Quality </span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" /> 100% Authentic</span>
          <span className="hidden sm:flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-[#F6A6BB]" /> COA Available</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#F6A6BB]" /> Secure Checkout</span>
        </div>
      </div>

      <div className="flex-1">
        {/* 1. HERO ROTATING ORBITAL SPINNER BOTTLE DISPLAY */}
        <RoseOilBottlesOrbitalSpinner products={heroProducts} />

        {/* 2. WORLD'S LARGEST PRODUCER AUTHORITY METRICS */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#F6A6BB]" /> Unmatched Heritage Authority
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510]">
              World's Largest Producer of Pure Rose Oil
            </h2>
            <p className="text-xs sm:text-sm text-[#4A0D25]/90 max-w-2xl mx-auto leading-relaxed font-normal">
              Distilling over <AnimatedCounter end={12000000} duration={1600} /> kilograms of fresh Damask rose petals annually using authentic Kannauj copper deg-bhapka vessels.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={400} suffix="+" duration={1400} />
              </div>
              <div className="text-xs text-[#4A0D25] font-bold uppercase tracking-wider">Years Heritage</div>
              <div className="text-[11px] text-[#4A0D25]/75 font-normal">Kannauj Distillation since 1620</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={12000} suffix="+" duration={1500} />
              </div>
              <div className="text-xs text-[#4A0D25] font-bold uppercase tracking-wider">Kgs Rose Petals</div>
              <div className="text-[11px] text-[#4A0D25]/75 font-normal">Pre-dawn harvest every season</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-emerald-800">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} />
              </div>
              <div className="text-xs text-[#4A0D25] font-bold uppercase tracking-wider">Certified Purity</div>
              <div className="text-[11px] text-[#4A0D25]/75 font-normal">100% Alcohol-Free Hydro-extract</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-1 shadow-xs">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
                <AnimatedCounter end={54} duration={1200} />
              </div>
              <div className="text-xs text-[#4A0D25] font-bold uppercase tracking-wider">Countries Exported</div>
              <div className="text-[11px] text-[#4A0D25]/75 font-normal">Supplying royal families & perfumers</div>
            </div>
          </div>
        </SectionWrapper>

        {/* 3. DYNAMIC PRODUCTS GRID (LIVE FROM SUPABASE DATABASE) */}
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

        {/* 4. TESTIMONIALS SECTION */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 text-[#F6A6BB]" /> What Our Patrons Say
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
              Loved by Fragrance Connoisseurs Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma',
                location: 'Mumbai, India',
                rating: 5,
                text: 'The Gulab Khas is unlike anything I\'ve ever experienced. The scent lingered on my skin for over 14 hours. Truly magical craftsmanship.',
              },
              {
                name: 'Sheikh Ahmed Al-Rashid',
                location: 'Dubai, UAE',
                rating: 5,
                text: 'As someone who collects rare attars, Rose Valley Kannauj stands apart. The purity certificate and provenance passport add incredible trust.',
              },
              {
                name: 'Victoria Sterling',
                location: 'London, UK',
                rating: 5,
                text: 'I\'ve been ordering from Rose Valley for 3 years. The Saffron Crocus Attar receives compliments every single time. Absolute perfection.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#F7D1D8] shadow-sm space-y-4 hover:shadow-md transition-shadow">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F6A6BB] text-[#F6A6BB]" />
                  ))}
                </div>
                <p className="text-sm text-[#1A0510] leading-relaxed font-medium italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#F7D1D8]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F6A6BB] to-[#F4BBC9] flex items-center justify-center text-[#4A0D25] font-black text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A0510]">{testimonial.name}</div>
                    <div className="text-[11px] text-[#4A0D25] font-semibold">{testimonial.location}</div>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* 5. KANNAUJ HERITAGE TIMELINE (1620 → TODAY) */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8] content-auto">
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

        {/* 6. NEWSLETTER SIGNUP */}
        <NewsletterSignup />
      </div>

      {/* Main Footer */}
      <LuxuryFooter />
    </div>
  );
}
