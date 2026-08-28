import React from 'react';
import Link from 'next/link';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { CinematicHeroV2 } from '@/components/home/CinematicHeroV2';
// import { LuxuryEditorialHero } from '@/components/home/LuxuryEditorialHero';
// import { CinematicHero } from '@/components/home/CinematicHero';
// import { RoseOilBottlesOrbitalSpinner } from '@/components/home/RoseOilBottlesOrbitalSpinner';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { ProductCard } from '@/components/product/ProductCard';
import { fetchProducts } from '@/lib/supabase/store-scoped-queries';
import { Award, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Clock, Truck, RotateCcw, Lock, CreditCard, Star, Flame } from 'lucide-react';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

// ISR: revalidate every 60 seconds for fast loads with fresh data
export const revalidate = 60;

export default async function Home() {
  const liveProducts = await fetchProducts();
  
  // 1. Hero Carousel: exactly the 5 Featured products (or fallback if < 5)
  const featured = liveProducts.filter((p: any) => p.is_featured);
  const heroProducts = featured.length >= 5
    ? featured.slice(0, 5)
    : [...featured, ...liveProducts.filter((p: any) => !p.is_featured)].slice(0, 5);

  // 2. Below Hero: Bestsellers 6 products as selected in /admin/products (or fallback if < 6)
  const bestsellers = liveProducts.filter((p: any) => p.is_bestseller);
  const bestsellerProducts = bestsellers.length >= 6
    ? bestsellers.slice(0, 6)
    : [...bestsellers, ...liveProducts.filter((p: any) => !p.is_bestseller)].slice(0, 6);

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
        {/* ✨ NEW HERO — Cinematic V2 Dark Immersive Carousel */}
        <CinematicHeroV2 products={heroProducts} />

        {/* ✨ HERO A — Editorial Split-Screen (commented out, file kept at LuxuryEditorialHero.tsx)
        <LuxuryEditorialHero products={heroProducts} />
        */}

        {/* ✨ HERO B — Dark Cinematic Aurora (commented out, file kept at CinematicHero.tsx)
        <CinematicHero products={heroProducts} />
        */}

        {/* ✨ HERO C — Orbital Spinner (commented out, file kept at RoseOilBottlesOrbitalSpinner.tsx)
        <RoseOilBottlesOrbitalSpinner products={heroProducts} />
        */}

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

        {/* 3. DYNAMIC PRODUCTS GRID — BESTSELLERS WITH SOFT FLORAL ACCENTS */}
        <SectionWrapper id="bestsellers" className="bg-[#F7EEED] border-b border-[#F7D1D8] relative overflow-hidden">
          
          {/* Subtle Watercolor Floral Background Accents */}
          <img
            src="/Hero/CollectionHero/floral-corner.png"
            alt=""
            className="absolute top-0 right-0 w-44 sm:w-72 md:w-88 opacity-20 pointer-events-none select-none translate-x-[15%] -translate-y-[10%] rotate-[10deg] scale-x-[-1] filter blur-[0.2px] z-0"
          />
          <img
            src="/Hero/CollectionHero/floral-corner.png"
            alt=""
            className="absolute bottom-0 left-0 w-40 sm:w-64 md:w-80 opacity-15 pointer-events-none select-none -translate-x-[15%] translate-y-[10%] rotate-[-10deg] filter blur-[0.2px] z-0"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F7D1D8] pb-6 mb-8 sm:mb-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-[#D45A7A] fill-[#D45A7A]" /> Most Loved · Imperial Reserve
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#1A0510] leading-[1.05]">
                Bestseller Pure Rose Oil
                <span className="block font-normal text-[#4A0D25] mt-1">Elixirs & Artisanal Attars</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4A0D25]/85 leading-relaxed font-normal pt-1">
                Hand-harvested Damask rose distillates and aged sandalwood attars — formulated according to 400-year royal recipes.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white border border-[#F7D1D8] hover:border-[#D45A7A] text-xs font-bold uppercase tracking-wider text-[#4A0D25] hover:text-[#1A0510] transition-all shadow-xs shrink-0 self-start md:self-end"
            >
              <span>Explore All Fragrances</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D45A7A]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {bestsellerProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </SectionWrapper>

        {/* 4. TESTIMONIALS SECTION */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8] relative overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 70%)' }} />

          <div className="text-center space-y-3 mb-10 sm:mb-12 relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 text-[#D45A7A] fill-[#D45A7A]" /> Verified Customer Experiences
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#1A0510] leading-[1.05]">
              Loved by Fragrance Connoisseurs
              <span className="block font-normal text-[#4A0D25]">Across the Globe</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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
                text: 'As someone who collects rare botanical extracts, RoseOil.in stands apart. The purity certificate and provenance passport add incredible trust.',
              },
              {
                name: 'Victoria Sterling',
                location: 'London, UK',
                rating: 5,
                text: 'I\'ve been ordering from RoseOil.in for years. The Saffron and Rose Essential Oils receive compliments every single time. Absolute perfection.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/95 border border-[#F7D1D8] shadow-xs space-y-4 hover:shadow-md hover:border-[#D45A7A] transition-all duration-300">
                {/* Stars */}
                <div className="flex items-center gap-1 text-[#D45A7A]">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-[#1A0510] leading-relaxed font-serif italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#F7D1D8]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F6A6BB] to-[#F7D1D8] flex items-center justify-center text-[#4A0D25] font-bold text-xs shadow-xs">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A0510]">{testimonial.name}</div>
                    <div className="text-[10px] text-[#4A0D25]/75 font-medium">{testimonial.location}</div>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* 5. HERITAGE TIMELINE */}
        <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8] content-auto relative overflow-hidden">
          
          <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-[#D45A7A]" /> Botanical Distillation Journey
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#1A0510] leading-[1.05]">
              Botanical Distillation
              <span className="block font-normal text-[#4A0D25]">Through the Centuries</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left relative z-10">
            <div className="p-5 rounded-2xl bg-white/80 border border-[#F7D1D8] space-y-2 shadow-xs hover:border-[#D45A7A] hover:bg-white transition-all">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#D45A7A]">ORIGINS</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Imperial Distillation</h3>
              <p className="text-xs text-[#4A0D25]/85 leading-relaxed font-normal">
                Early artisans perfected slow steam hydro-distillation for pure alcohol-free Rose Oil.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 border border-[#F7D1D8] space-y-2 shadow-xs hover:border-[#D45A7A] hover:bg-white transition-all">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#D45A7A]">1880 AD</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Cold Condensation</h3>
              <p className="text-xs text-[#4A0D25]/85 leading-relaxed font-normal">
                Pioneered refined condensation in submerged receiver tanks for maximum aromatic purity.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 border border-[#F7D1D8] space-y-2 shadow-xs hover:border-[#D45A7A] hover:bg-white transition-all">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#D45A7A]">1960 AD</span>
              <h3 className="font-serif font-bold text-[#1A0510] text-base">Mysore Sandalwood Base</h3>
              <p className="text-xs text-[#4A0D25]/85 leading-relaxed font-normal">
                Standardized natural botanical aging for 12+ hour skin longevity without synthetic fixatives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#4A0D25] text-white border border-[#4A0D25] space-y-2 shadow-md ring-2 ring-[#F6A6BB]/30">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-[#F6A6BB]">TODAY</span>
              <h3 className="font-serif font-bold text-[#FFF5F7] text-base">100% Pure Botanical Purity</h3>
              <p className="text-xs text-white/80 leading-relaxed font-light">
                RoseOil.in operates a premier certified botanical distillation and testing network.
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
