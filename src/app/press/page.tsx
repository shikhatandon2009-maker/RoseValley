import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ExternalLink, Award, Newspaper, BookOpen, ChevronRight } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export const metadata = {
  title: 'Press & Media Mentions | Rose Valley Kannauj',
  description: 'Explore national and international press coverage, magazine features, and media mentions of Rose Valley Kannauj pure hydro-distilled attars.',
};

const PRESS_MENTIONS = [
  {
    id: 'press-vogue-2026',
    publisher: 'Vogue India',
    badge: 'Luxury Feature',
    title: 'Inside Kannauj’s 400-Year-Old Copper Deg Stills with Rose Valley',
    quote: 'Rose Valley Kannauj preserves the sacred art of pre-dawn hydro-distillation. Their Ruh Gulab and Ruh Khus extracts represent the pinnacle of Indian luxury perfumery.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    date: 'June 2026',
    category: 'Print & Digital Cover',
  },
  {
    id: 'press-harpers-2026',
    publisher: "Harper's Bazaar",
    badge: 'Artisanal Selection',
    title: 'The Liquid Gold of Kannauj: Why Natural Attars Are Replacing Synthetic Perfumes',
    quote: 'Free from synthetic alcohol and parabens, Rose Valley’s Damask Rose distillates unfold with an extraordinary 14-hour longevity on pulse points.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    date: 'May 2026',
    category: 'Beauty & Wellness',
  },
  {
    id: 'press-et-2026',
    publisher: 'The Economic Times',
    badge: 'Heritage & Business',
    title: 'Reviving Ancient Craftsmanship: How Rose Valley Took Kannauj Attar Global',
    quote: 'Combining QR provenance passports with traditional copper deg distillation, Rose Valley has redefined heritage luxury exports for discerning international collectors.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    date: 'March 2026',
    category: 'Heritage Enterprise',
  },
  {
    id: 'press-gq-2025',
    publisher: 'GQ Magazine',
    badge: 'Grooming Choice',
    title: 'The Best Artisanal Alcohol-Free Fragrances Every Collector Needs',
    quote: 'Ruh Khus Vetiver Extract by Rose Valley is an olfactory masterpiece—cooling, earthy, and steeped in four centuries of Kannauj craftsmanship.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    date: 'December 2025',
    category: 'Gentlemen Grooming',
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-black flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto shadow-xs">
            <Newspaper className="w-4 h-4 text-[#F6A6BB]" /> Press & Media Coverage
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#1A0510]">
            As Featured In Global Media
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-bold leading-relaxed">
            Discover how leading publications celebrate Rose Valley Kannauj’s 400-year copper Deg-Bhapka heritage, pure Damask Rose hydro-distillates, and alcohol-free attars.
          </p>
        </div>

        {/* Media Logos Grid Strip */}
        <div className="p-8 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] shadow-xs text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#4A0D25]">
            Featured Across Premier Publications
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 pt-2">
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1A0510] tracking-wider">VOGUE</span>
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1A0510] tracking-wider">HARPER'S BAZAAR</span>
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1A0510] tracking-wider">ECONOMIC TIMES</span>
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1A0510] tracking-wider">GQ</span>
            <span className="font-serif text-xl sm:text-2xl font-black text-[#1A0510] tracking-wider">ARCHITECTURAL DIGEST</span>
          </div>
        </div>

        {/* Press Articles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PRESS_MENTIONS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border-2 border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-64 w-full bg-[#FAE6E7]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-[#F7D1D8] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4A0D25]">
                  {item.publisher}
                </div>
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-[#4A0D25]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8]">
                      {item.badge}
                    </span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-serif text-xl font-extrabold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <blockquote className="text-xs text-[#4A0D25] font-serif italic border-l-2 border-[#F6A6BB] pl-3 py-1 font-semibold leading-relaxed">
                    "{item.quote}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                    {item.category}
                  </span>
                  <Link
                    href="/journal"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#4A0D25] hover:text-[#F6A6BB] transition-colors"
                  >
                    <span>Read Full Story</span>
                    <ChevronRight className="w-4 h-4 text-[#F6A6BB]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
