import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Droplet, Sparkles, Clock, ShieldCheck, ArrowRight, CheckCircle2, QrCode } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { LiveDistilleryFeedWidget } from '@/components/home/LiveDistilleryFeedWidget';
import { SectionWrapper } from '@/components/common/SectionWrapper';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-[#FAE6E7]/60 via-[#F7EEED] to-white border-b border-[#F7D1D8] overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#F6A6BB]" /> Maison De L’Essence • Est. 1620
          </div>
          <h1 className="font-serif font-bold text-4xl sm:text-6xl text-[#1A0510] leading-tight">
            400 Years of Kannauj Steam Distillation Mastery
          </h1>
          <p className="text-sm sm:text-lg text-[#4A0D25] max-w-2xl mx-auto leading-relaxed font-medium">
            Rose Valley Kannauj is the world’s largest producer of pure hydro-distilled Damask Rose attars, operating authentic copper Deg-Bhapka stills since the Mughal Empire.
          </p>
        </div>
      </section>

      {/* Main Story & Heritage Milestones */}
      <SectionWrapper className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="text-xs font-bold text-[#F6A6BB] uppercase tracking-widest font-mono">
              The Heritage Craft
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-[#1A0510] leading-tight">
              Pre-Dawn Petals & Pure Copper Vessels
            </h2>
            <p className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed font-medium">
              Every spring in the fertile Rose Valley of Kannauj, over 12,000,000 kilograms of Rosa Damascena petals are hand-harvested before sunrise. Within hours of picking, the fresh petals are sealed inside traditional copper Degs with natural well water.
            </p>
            <p className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed font-medium">
              Heated over wood fires, the steam travels through bamboo receiver pipes (Chonga) immersed in cold water tanks, condensing into concentrated Ruh Gulab and pure Mysore Sandalwood bases.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8]">
                <div className="font-serif font-bold text-2xl text-[#4A0D25]">
                  <AnimatedCounter end={400} suffix="+" duration={1400} />
                </div>
                <div className="text-[10px] text-[#1A0510] font-bold uppercase tracking-wider mt-1">Years Heritage Still</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8]">
                <div className="font-serif font-bold text-2xl text-[#4A0D25]">
                  <AnimatedCounter end={99.98} decimals={2} suffix="%" duration={1600} />
                </div>
                <div className="text-[10px] text-[#1A0510] font-bold uppercase tracking-wider mt-1">Alcohol-Free Purity</div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-luxury border-2 border-[#F7D1D8] group">
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

      {/* Live Distillery Feed Widget */}
      <SectionWrapper className="bg-white">
        <LiveDistilleryFeedWidget />
      </SectionWrapper>

      {/* Call to Action */}
      <section className="py-16 bg-[#FAE6E7] border-t border-[#F7D1D8] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1A0510]">
            Experience Pure Hydro-Distilled Rose Oil
          </h2>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-medium">
            Browse our artisanal attars, rose skincare serums, and digital Provenance Passport collection.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#F4BBC9] transition-all"
          >
            <span>Explore Scent Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}
