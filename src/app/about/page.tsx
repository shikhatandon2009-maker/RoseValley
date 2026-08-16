import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Droplet, Sparkles, Clock, ShieldCheck, ArrowRight, CheckCircle2, Leaf, Globe, FlaskConical, Crown, Users, BookOpen, ExternalLink } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

export const metadata = {
  title: 'About Rose Valley Kannauj | 400-Year Heritage Distillation',
  description: 'Learn about Rose Valley Kannauj, the world\'s largest producer of pure hydro-distilled Damask Rose attars, operating copper Deg-Bhapka stills since 1620.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      {/* CINEMATIC HERO */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-b border-[#F7D1D8]">
        {/* Multi-layered gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAE6E7] via-[#F7EEED] to-[#F7EEED]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #F6A6BB, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F7EEED] to-transparent" />

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4 text-[#F6A6BB]" /> Est. 1620 • Kannauj, India
          </div>
          <h1 className="font-serif font-bold text-5xl sm:text-7xl text-[#1A0510] leading-[0.95] tracking-tight">
            Four Centuries of
            <span className="block text-[#4A0D25] mt-1">Pure Distillation Mastery</span>
          </h1>
          <p className="text-base sm:text-lg text-[#4A0D25]/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Rose Valley Kannauj is the world's largest producer of pure hydro-distilled Damask Rose attars,
            operating authentic copper Deg-Bhapka stills since the Mughal Empire.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#4A0D25] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#1A0510] transition-all shadow-lg"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white border border-[#F7D1D8] text-[#1A0510] font-bold text-xs uppercase tracking-widest hover:bg-[#FAE6E7] transition-all shadow-sm"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS — DARK PREMIUM PANEL */}
      <section className="bg-[#3D071E] text-white py-14 sm:py-20 relative overflow-hidden border-y border-[#F7D1D8]/20 shadow-inner">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 50%, #F6A6BB, transparent 70%)' }} />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-2 p-5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 shadow-sm hover:border-[#F6A6BB]/40 transition-all">
              <div className="font-serif font-bold text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_10px_rgba(255,245,247,0.3)]">
                <AnimatedCounter end={400} suffix="+" duration={1400} className="text-[#FFF5F7] font-serif font-bold text-4xl sm:text-5xl" />
              </div>
              <div className="text-xs text-[#F6A6BB] font-bold uppercase tracking-widest">Years Heritage</div>
              <div className="text-[11px] text-white/70 font-normal">Since Mughal Empire Era</div>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 shadow-sm hover:border-[#F6A6BB]/40 transition-all">
              <div className="font-serif font-bold text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_10px_rgba(255,245,247,0.3)]">
                <AnimatedCounter end={12} suffix="M+" duration={1500} className="text-[#FFF5F7] font-serif font-bold text-4xl sm:text-5xl" />
              </div>
              <div className="text-xs text-[#F6A6BB] font-bold uppercase tracking-widest">Kgs Rose Petals</div>
              <div className="text-[11px] text-white/70 font-normal">Pre-dawn harvest annually</div>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 shadow-sm hover:border-[#F6A6BB]/40 transition-all">
              <div className="font-serif font-bold text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_10px_rgba(255,245,247,0.3)]">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} className="text-[#FFF5F7] font-serif font-bold text-4xl sm:text-5xl" />
              </div>
              <div className="text-xs text-[#F6A6BB] font-bold uppercase tracking-widest">Certified Purity</div>
              <div className="text-[11px] text-white/70 font-normal">Alcohol-free hydro-extract</div>
            </div>
            <div className="space-y-2 p-5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 shadow-sm hover:border-[#F6A6BB]/40 transition-all">
              <div className="font-serif font-bold text-4xl sm:text-5xl text-[#FFF5F7] tracking-tight drop-shadow-[0_2px_10px_rgba(255,245,247,0.3)]">
                <AnimatedCounter end={54} suffix="+" duration={1200} className="text-[#FFF5F7] font-serif font-bold text-4xl sm:text-5xl" />
              </div>
              <div className="text-xs text-[#F6A6BB] font-bold uppercase tracking-widest">Countries</div>
              <div className="text-[11px] text-white/70 font-normal">Global export network</div>
            </div>
          </div>
        </div>
      </section>

      {/* HERITAGE STORY — EDITORIAL LAYOUT */}
      <SectionWrapper className="bg-[#F7EEED]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left order-2 lg:order-1">
            <span className="text-xs font-bold text-[#F6A6BB] uppercase tracking-widest font-mono">
              The Heritage Craft
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510] leading-tight">
              Pre-Dawn Petals & Pure Copper Vessels
            </h2>
            <p className="text-sm text-[#4A0D25]/90 leading-relaxed font-normal">
              Every spring in the fertile Rose Valley of Kannauj, over 12,000,000 kilograms of Rosa Damascena petals are hand-harvested before sunrise. Within hours of picking, the fresh petals are sealed inside traditional copper Degs with natural well water.
            </p>
            <p className="text-sm text-[#4A0D25]/90 leading-relaxed font-normal">
              Heated over wood fires, the steam travels through bamboo receiver pipes (Chonga) immersed in cold water tanks, condensing into concentrated Ruh Gulab and pure Mysore Sandalwood bases.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#3D071E] border border-[#F6A6BB]/40 shadow-lg text-white space-y-1">
                <div className="font-serif font-bold text-3xl sm:text-4xl text-[#FFF5F7]">
                  <AnimatedCounter end={400} suffix="+" duration={1400} className="text-[#FFF5F7] font-serif font-bold text-3xl sm:text-4xl" />
                </div>
                <div className="text-[10px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-widest mt-1">Years Heritage Still</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#3D071E] border border-[#F6A6BB]/40 shadow-lg text-white space-y-1">
                <div className="font-serif font-bold text-3xl sm:text-4xl text-[#FFF5F7]">
                  <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} className="text-[#FFF5F7] font-serif font-bold text-3xl sm:text-4xl" />
                </div>
                <div className="text-[10px] sm:text-xs text-[#F6A6BB] font-bold uppercase tracking-widest mt-1">Alcohol-Free Purity</div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-luxury border-2 border-[#F7D1D8] group order-1 lg:order-2">
            <Image
              src="/images/deg-bhapka-heritage.jpg"
              alt="Authentic Kannauj Copper Deg-Bhapka Distillation Stills"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0510]/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="bg-[#F6A6BB] text-[#4A0D25] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Authentic Deg-Bhapka Stills
              </span>
              <p className="font-serif font-bold text-lg text-white">400-Year Heritage Copper Distillation</p>
              <p className="text-xs text-stone-200">Hand-hammered copper degs heated over traditional wood fires in Kannauj</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* INTERACTIVE TIMELINE */}
      <SectionWrapper className="bg-[#F7EEED] border-b border-[#F7D1D8]">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" /> Our Journey
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510]">
            A Legacy Written in Rose Petals
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F7D1D8] via-[#F6A6BB] to-[#F7D1D8]" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { year: '1620', title: 'Imperial Commission', desc: 'Mughal court commissions Kannauj artisans for alcohol-free Ruh Gulab', icon: Crown },
              { year: '1780', title: 'Trade Route Expansion', desc: 'Rose oil exports via Arabian Sea routes to Gulf royal courts', icon: Globe },
              { year: '1880', title: 'Bhapka Innovation', desc: 'Double-distillation in bamboo receivers for maximum purity', icon: FlaskConical },
              { year: '1960', title: 'Sandalwood Aging', desc: 'Standardized Mysore sandalwood base for 12+ hour longevity', icon: Droplet },
              { year: 'TODAY', title: 'Global Leader', desc: 'World\'s largest certified copper deg distillation network', icon: Award },
            ].map((milestone, idx) => {
              const Icon = milestone.icon;
              const isLast = idx === 4;
              return (
                <div key={idx} className="relative text-center flex flex-col items-center">
                  {/* Dot on timeline */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center z-10 shadow-md mb-4 ${isLast
                    ? 'bg-[#4A0D25] text-white ring-4 ring-[#F6A6BB]/30'
                    : 'bg-white border-2 border-[#F7D1D8] text-[#4A0D25]'
                    }`}>
                    <Icon className={`w-6 h-6 ${isLast ? 'text-[#F6A6BB]' : 'text-[#F6A6BB]'}`} />
                  </div>
                  <span className={`font-mono text-sm font-bold ${isLast ? 'text-[#4A0D25]' : 'text-[#F6A6BB]'} mb-1`}>
                    {milestone.year}
                  </span>
                  <h3 className="font-serif font-bold text-[#1A0510] text-sm mb-1">{milestone.title}</h3>
                  <p className="text-[11px] text-[#4A0D25] leading-relaxed font-semibold max-w-[180px]">
                    {milestone.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* FOUNDER / MASTER PERFUMER SPOTLIGHT */}
      <SectionWrapper className="bg-[#F7EEED]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-[#F7D1D8] shadow-luxury">
              <div className="w-full h-full bg-gradient-to-br from-[#FAE6E7] via-[#F7D1D8] to-[#F4BBC9] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Crown className="w-12 h-12 text-[#4A0D25] mx-auto" />
                  <span className="text-xs font-bold text-[#4A0D25] uppercase tracking-widest block">Master Perfumer</span>
                  <span className="text-[10px] text-[#4A0D25]/60 font-semibold block">7th Generation Artisan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <span className="text-xs font-bold text-[#F6A6BB] uppercase tracking-widest font-mono">
              The Artisan Behind the Essence
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510] leading-tight">
              7th Generation Master Perfumer
            </h2>
            <p className="text-sm text-[#4A0D25] leading-relaxed font-medium">
              Our Master Perfumer represents the 7th generation of a Kannauj distilling dynasty that has served royal courts across the Indian subcontinent. Trained since childhood in the art of copper deg hydro-distillation, they bring unparalleled expertise to every batch.
            </p>
            <p className="text-sm text-[#4A0D25]/90 leading-relaxed font-normal">
              Each fragrance is personally supervised from pre-dawn petal harvest through the 72-hour distillation cycle, ensuring the 99.98% purity standard that defines our house.
            </p>
            <blockquote className="border-l-4 border-[#F6A6BB] pl-4 italic text-sm text-[#1A0510] font-medium">
              "Every drop of rose oil carries the memory of ten thousand petals and four hundred years of devotion. We don't make perfume — we distill heritage."
            </blockquote>
          </div>
        </div>
      </SectionWrapper>

      {/* CERTIFICATIONS & AWARDS */}
      <section className="py-14 bg-white border-y border-[#F7D1D8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" /> Trusted & Certified
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
              Certifications & Quality Assurance
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { title: 'GMP Certified', desc: 'Good Manufacturing Practice compliant facility', icon: CheckCircle2 },
              { title: 'ISO 9001:2015', desc: 'Quality management system certification', icon: ShieldCheck },
              { title: '100% Organic', desc: 'Certified organic botanicals, no synthetic compounds', icon: Leaf },
              { title: 'FSSAI Licensed', desc: 'Food safety certified for ingestible-grade purity', icon: Award },
              { title: 'Cruelty Free', desc: 'No animal testing at any stage of production', icon: Users },
              { title: 'GC-MS Tested', desc: 'Gas chromatography verified purity spectrum', icon: FlaskConical },
              { title: 'Export Certified', desc: 'Licensed for international export to 54+ countries', icon: Globe },
              { title: 'Heritage Craft', desc: 'Recognized intangible cultural heritage of India', icon: BookOpen },
            ].map((cert, idx) => {
              const Icon = cert.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] text-center space-y-3 hover:border-[#F6A6BB] hover:shadow-md transition-all group">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#F7D1D8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#F6A6BB]" />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#1A0510]">{cert.title}</h3>
                  <p className="text-[11px] text-[#4A0D25] font-semibold leading-relaxed">{cert.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRESS & MEDIA LOGOS (COMMENTED OUT)
      <section className="py-10 bg-[#F7EEED] border-b border-[#F7D1D8]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <p className="text-xs font-bold text-[#4A0D25]/50 uppercase tracking-widest">As Featured In</p>
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-40">
            {['Vogue India', 'GQ Magazine', 'The Hindu', 'Forbes India', 'Condé Nast', 'Times of India'].map((pub) => (
              <span key={pub} className="font-serif font-bold text-sm sm:text-lg text-[#1A0510] tracking-wider uppercase">
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ENHANCED CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#4A0D25] via-[#3D081E] to-[#1A0510] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(ellipse at 70% 30%, #F6A6BB, transparent 55%)' }} />
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Begin Your Scent Journey
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-5xl text-white leading-tight">
            Experience Pure Hydro-Distilled Rose Oil
          </h2>
          <p className="text-sm text-white/60 font-medium max-w-lg mx-auto">
            Browse our artisanal attars, rose skincare serums, and digital Provenance Passport collection. Every bottle tells a 400-year story.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-[#F4BBC9] transition-all"
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
