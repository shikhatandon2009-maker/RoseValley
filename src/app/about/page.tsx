import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Droplet, Sparkles, Clock, ShieldCheck, ArrowRight, CheckCircle2, Leaf, Globe, FlaskConical, Crown, Users, BookOpen, ExternalLink, Flame, Compass, History } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

export const metadata = {
  title: 'About Rose Valley Kannauj | 400-Year Heritage Distillation',
  description: 'Discover the world\'s largest producer of pure hydro-distilled Damask Rose attars, operating authentic copper Deg-Bhapka stills in Kannauj since 1620.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950 overflow-x-hidden relative">
      <LuxuryHeader />

      {/* CINEMATIC HERO WITH SUBTLE FLORAL CORNERS */}
      <section className="relative py-20 sm:py-32 overflow-hidden border-b border-[#F7D1D8] bg-gradient-to-b from-[#FAE6E7] via-[#F7EEED] to-[#F7EEED]">
        
        {/* Soft Radial Ambient Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[700px] h-[250px] sm:h-[450px] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 70%)' }}
        />

        {/* Soft Watercolor Floral Accents */}
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt=""
          className="absolute top-0 left-0 w-48 sm:w-80 md:w-96 opacity-25 pointer-events-none select-none -translate-x-[15%] -translate-y-[10%] rotate-[-8deg] filter blur-[0.2px]"
        />
        <img
          src="/Hero/CollectionHero/floral-corner.png"
          alt=""
          className="absolute top-0 right-0 w-48 sm:w-80 md:w-96 opacity-25 pointer-events-none select-none translate-x-[15%] -translate-y-[10%] rotate-[8deg] scale-x-[-1] filter blur-[0.2px]"
        />

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-5 sm:space-y-6">
          
          {/* Trust & Heritage Subheading Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#F7D1D8] text-[#4A0D25] text-[11px] sm:text-xs font-semibold uppercase tracking-widest shadow-xs">
            <Crown className="w-3.5 h-3.5 text-[#D45A7A]" /> Est. 1620 • Kannauj, India
          </div>

          {/* Thin Executive Hero Title */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#1A0510] leading-[1.05] sm:leading-[0.95]">
            Four Centuries of
            <span className="block font-normal text-[#4A0D25] mt-1 sm:mt-2">
              Pure Distillation Mastery
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#4A0D25]/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Rose Valley Kannauj is the world&apos;s preeminent house of pure hydro-distilled Damask Rose attars, operating sacred copper Deg-Bhapka stills uninterrupted since the Mughal era.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex items-center justify-center gap-3.5 sm:gap-4 pt-3 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#4A0D25] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#1A0510] transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
            >
              Explore Collection <ArrowRight className="w-4 h-4 text-[#F6A6BB]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#F7D1D8] text-[#1A0510] font-bold text-xs uppercase tracking-widest hover:bg-[#FAE6E7] transition-all shadow-xs"
            >
              Consult Perfumer
            </Link>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS — EXECUTIVE PRESTIGE PANEL */}
      <section className="bg-gradient-to-br from-[#2D0516] via-[#3D071E] to-[#1A0510] text-white py-14 sm:py-20 relative overflow-hidden border-y border-[#F7D1D8]/20 shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 50%, #F6A6BB, transparent 70%)' }} />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] sm:text-xs text-[#F6A6BB] font-black uppercase tracking-widest font-mono">
              Global Scale & Pure Provenance
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#FFF5F7]">
              Distilling at the Apex of World Perfumery
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            {/* Metric 1 */}
            <div className="space-y-2 p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#F6A6BB]/50 hover:bg-white/10 transition-all">
              <div className="font-serif font-light text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_12px_rgba(246,166,187,0.3)]">
                <AnimatedCounter end={400} suffix="+" duration={1400} className="text-[#FFF5F7] font-serif font-light text-4xl sm:text-5xl" />
              </div>
              <div className="text-[11px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-wider">Years Unbroken Lineage</div>
              <div className="text-[11px] text-white/60 font-light">Direct royal court lineage since 1620</div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-2 p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#F6A6BB]/50 hover:bg-white/10 transition-all">
              <div className="font-serif font-light text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_12px_rgba(246,166,187,0.3)]">
                <AnimatedCounter end={12} suffix="M+" duration={1500} className="text-[#FFF5F7] font-serif font-light text-4xl sm:text-5xl" />
              </div>
              <div className="text-[11px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-wider">Kgs Damask Roses</div>
              <div className="text-[11px] text-white/60 font-light">Pre-dawn harvest distilled within hours</div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-2 p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#F6A6BB]/50 hover:bg-white/10 transition-all">
              <div className="font-serif font-light text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_12px_rgba(246,166,187,0.3)]">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} className="text-[#FFF5F7] font-serif font-light text-4xl sm:text-5xl" />
              </div>
              <div className="text-[11px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-wider">Lab-Certified Purity</div>
              <div className="text-[11px] text-white/60 font-light">100% alcohol-free pure hydro-extract</div>
            </div>

            {/* Metric 4 */}
            <div className="space-y-2 p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm hover:border-[#F6A6BB]/50 hover:bg-white/10 transition-all">
              <div className="font-serif font-light text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_12px_rgba(246,166,187,0.3)]">
                <AnimatedCounter end={54} suffix="+" duration={1200} className="text-[#FFF5F7] font-serif font-light text-4xl sm:text-5xl" />
              </div>
              <div className="text-[11px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-wider">Countries Supplied</div>
              <div className="text-[11px] text-white/60 font-light">Global luxury boutique distribution</div>
            </div>

          </div>
        </div>
      </section>

      {/* HERITAGE CRAFT & TRADITIONAL COPPER DEGS */}
      <SectionWrapper className="bg-[#F7EEED] relative z-10 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="space-y-5 text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#9A2048] uppercase tracking-widest">
              <Flame className="w-4 h-4 text-[#D45A7A]" /> Sacred Deg-Bhapka Method
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#1A0510] leading-[1.05]">
              Pre-Dawn Petals &
              <span className="block font-normal text-[#4A0D25]">
                Hand-Hammered Copper Stills
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#4A0D25]/90 leading-relaxed font-normal">
              Every spring in the fertile alluvial plains of Kannauj, millions of fresh <em>Rosa Damascena</em> blossoms are gently hand-plucked before sunrise, while their natural aromatic dew remains undisturbed.
            </p>

            <p className="text-sm sm:text-base text-[#4A0D25]/90 leading-relaxed font-normal">
              Sealed in heavy copper Degs with natural artesian water and heated over controlled wood fires, the fragrant vapors travel through hollow bamboo pipes (<em>Chonga</em>) into receiver vessels (<em>Bhapka</em>) submerged in cold circulating water — slowly capturing the soul of each petal into aged sandalwood oil.
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-3">
              <div className="p-4 rounded-2xl bg-white/90 border border-[#F7D1D8] shadow-xs space-y-1">
                <span className="text-[10px] text-[#9A2048] font-bold uppercase tracking-widest block">Distillation Cycle</span>
                <p className="font-serif font-bold text-lg text-[#1A0510]">72-Hour Slow Extraction</p>
                <p className="text-[11px] text-[#4A0D25]/75">Preserves full olfactory spectrum</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-[#F7D1D8] shadow-xs space-y-1">
                <span className="text-[10px] text-[#9A2048] font-bold uppercase tracking-widest block">Zero Alcohol Base</span>
                <p className="font-serif font-bold text-lg text-[#1A0510]">100% Pure Botanical</p>
                <p className="text-[11px] text-[#4A0D25]/75">Hypoallergenic & skin-nourishing</p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#F7D1D8] group order-1 lg:order-2">
            <Image
              src="/images/deg-bhapka-heritage.jpg"
              alt="Authentic Kannauj Copper Deg-Bhapka Distillation Stills"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0510]/80 via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
              <span className="bg-[#F6A6BB] text-[#4A0D25] text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                Authentic Heritage Stills
              </span>
              <p className="font-serif font-light text-xl text-white">400-Year Deg-Bhapka Technique</p>
              <p className="text-xs text-stone-200/90 font-light">Hand-hammered copper vessels heated over traditional wood fires in Kannauj</p>
            </div>
          </div>

        </div>
      </SectionWrapper>

      {/* 400-YEAR MILESTONE TIMELINE */}
      <SectionWrapper className="bg-white/60 border-y border-[#F7D1D8] py-16 sm:py-24 relative">
        <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
            <History className="w-3.5 h-3.5 text-[#D45A7A]" /> 400-Year Milestone Journey
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1A0510]">
            A Legacy Inscribed in
            <span className="block font-normal text-[#4A0D25]">Damask Rose Petals</span>
          </h2>
        </div>

        {/* Milestone Steps */}
        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F7D1D8] via-[#F6A6BB] to-[#F7D1D8]" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4">
            {[
              { year: '1620', title: 'Imperial Commission', desc: 'Mughal court commissions Kannauj artisans for pure hydro-distilled Ruh Gulab', icon: Crown },
              { year: '1780', title: 'Maritime Trade Route', desc: 'Rose attar shipments voyage across the Arabian Sea to royal dynasties', icon: Globe },
              { year: '1880', title: 'Deg-Bhapka Refinement', desc: 'Pioneered cold-tank condensation in bamboo receivers for unprecedented purity', icon: FlaskConical },
              { year: '1960', title: 'Aged Sandalwood Matrix', desc: 'Standardized natural Mysore sandalwood base ensuring 12+ hour sillage', icon: Droplet },
              { year: 'TODAY', title: 'Global Leader', desc: 'World’s largest certified copper deg network & digital Provenance Passports', icon: Award },
            ].map((milestone, idx) => {
              const Icon = milestone.icon;
              const isLast = idx === 4;
              return (
                <div key={idx} className="relative text-center flex flex-col items-center group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center z-10 shadow-md mb-4 transition-transform duration-300 group-hover:scale-110 ${
                    isLast
                      ? 'bg-[#4A0D25] text-white ring-4 ring-[#F6A6BB]/40'
                      : 'bg-white border-2 border-[#F7D1D8] text-[#4A0D25]'
                  }`}>
                    <Icon className={`w-6 h-6 ${isLast ? 'text-[#F6A6BB]' : 'text-[#9A2048]'}`} />
                  </div>
                  
                  <span className={`font-mono text-xs font-black uppercase tracking-wider mb-1 ${isLast ? 'text-[#4A0D25]' : 'text-[#D45A7A]'}`}>
                    {milestone.year}
                  </span>
                  <h3 className="font-serif font-bold text-[#1A0510] text-sm mb-1.5">{milestone.title}</h3>
                  <p className="text-[11px] text-[#4A0D25]/85 leading-relaxed font-normal max-w-[170px]">
                    {milestone.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* MASTER PERFUMER & DYNASTY STATEMENT */}
      <SectionWrapper className="bg-[#F7EEED] py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-br from-[#F6A6BB] via-[#F7D1D8] to-[#D45A7A] shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FAE6E7] to-[#F7D1D8] flex items-center justify-center p-6 text-center border-4 border-white/60">
                <div className="space-y-2">
                  <Crown className="w-12 h-12 text-[#4A0D25] mx-auto" />
                  <span className="font-serif text-lg font-bold text-[#1A0510] block">Master Perfumer</span>
                  <span className="text-[11px] text-[#4A0D25] font-semibold uppercase tracking-widest block">7th Generation Artisan</span>
                  <span className="text-[10px] text-[#7A1840]/75 block">Kannauj Distilling Dynasty</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 text-left">
            <span className="text-xs font-bold text-[#9A2048] uppercase tracking-widest font-mono">
              The Artisan Lineage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-[#1A0510] leading-tight">
              Seven Generations of
              <span className="block font-normal text-[#4A0D25]">Uncompromising Heritage</span>
            </h2>
            <p className="text-sm sm:text-base text-[#4A0D25]/90 leading-relaxed font-normal">
              Our Master Perfumer carries forward an ancestral lineage that has distilled for royal courts across India and the Middle East. Trained by touch, smell, and intuition since childhood, they oversee every delicate condensation step.
            </p>
            
            <blockquote className="border-l-4 border-[#F6A6BB] pl-4 italic text-sm sm:text-base text-[#1A0510] font-serif leading-relaxed py-1">
              &ldquo;Every drop of pure rose oil holds the memory of ten thousand petals and four hundred years of devotion. We do not manufacture perfume — we capture botanical eternity.&rdquo;
            </blockquote>
          </div>

        </div>
      </SectionWrapper>

      {/* CERTIFICATIONS & QUALITY ASSURANCE */}
      <section className="py-16 sm:py-20 bg-white border-y border-[#F7D1D8]">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center space-y-3 mb-12 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D45A7A]" /> Trusted & Certified
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-[#1A0510]">
              Global Standards of Purity & Excellence
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              { title: 'GMP Certified', desc: 'Good Manufacturing Practice certified processing', icon: CheckCircle2 },
              { title: 'ISO 9001:2015', desc: 'International Quality Management accredited', icon: ShieldCheck },
              { title: '100% Organic', desc: 'Wildcrafted botanicals free of synthetics', icon: Leaf },
              { title: 'FSSAI Licensed', desc: 'Government food-safety grade certification', icon: Award },
              { title: 'Cruelty Free', desc: 'Zero animal testing across all production', icon: Users },
              { title: 'GC-MS Tested', desc: 'Gas chromatography verified purity index', icon: FlaskConical },
              { title: 'Export Certified', desc: 'Registered for distribution across 54+ nations', icon: Globe },
              { title: 'Heritage GI Craft', desc: 'Recognized geographical heritage of Kannauj', icon: BookOpen },
            ].map((cert, idx) => {
              const Icon = cert.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] text-center space-y-2.5 hover:border-[#D45A7A] hover:bg-[#FAE6E7]/50 hover:shadow-md transition-all duration-200 group">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#F7D1D8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#D45A7A]" />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#1A0510]">{cert.title}</h3>
                  <p className="text-[11px] text-[#4A0D25]/80 font-medium leading-relaxed">{cert.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* GRAND CALL TO ACTION */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#4A0D25] via-[#3D081E] to-[#1A0510] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 70% 30%, #F6A6BB, transparent 60%)' }} />
        
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[#FFF5F7] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Begin Your Fragrance Journey
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
            Experience Pure Hydro-Distilled Rose Essence
          </h2>
          
          <p className="text-sm sm:text-base text-white/75 font-normal max-w-xl mx-auto leading-relaxed">
            Immerse yourself in our collection of authentic attars, pure botanical skincare elixirs, and bespoke scents — crafted in Kannauj since 1620.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-3 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#F4BBC9] transition-all hover:scale-[1.02]"
            >
              Explore Scent Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              Contact Us <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}
