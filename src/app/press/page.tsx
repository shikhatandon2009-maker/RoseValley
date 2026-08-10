import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ExternalLink, Award, Newspaper, BookOpen, ChevronRight } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Press & Media Mentions | Rose Valley Kannauj',
  description: 'Explore national and international press coverage, magazine features, and media mentions of Rose Valley Kannauj pure hydro-distilled attars.',
};

const FALLBACK_PRESS = [
  {
    id: 'press-vogue-2026',
    publisher: 'Vogue India',
    title: 'Inside Kannauj’s 400-Year-Old Copper Deg Stills with Rose Valley',
    quote: 'Rose Valley Kannauj preserves the sacred art of pre-dawn hydro-distillation. Their Ruh Gulab and Ruh Khus extracts represent the pinnacle of Indian luxury perfumery.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    date: 'June 2026',
  },
  {
    id: 'press-harpers-2026',
    publisher: "Harper's Bazaar",
    title: 'The Liquid Gold of Kannauj: Why Natural Attars Are Replacing Synthetic Perfumes',
    quote: 'Free from synthetic alcohol and parabens, Rose Valley’s Damask Rose distillates unfold with an extraordinary 14-hour longevity on pulse points.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    date: 'May 2026',
  },
  {
    id: 'press-et-2026',
    publisher: 'The Economic Times',
    title: 'Reviving Ancient Craftsmanship: How Rose Valley Took Kannauj Attar Global',
    quote: 'Combining QR provenance passports with traditional copper deg distillation, Rose Valley has redefined heritage luxury exports for discerning international collectors.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop',
    date: 'March 2026',
  },
  {
    id: 'press-gq-2025',
    publisher: 'GQ Magazine',
    title: 'The Best Artisanal Alcohol-Free Fragrances Every Collector Needs',
    quote: 'Ruh Khus Vetiver Extract by Rose Valley is an olfactory masterpiece—cooling, earthy, and steeped in four centuries of Kannauj craftsmanship.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
    date: 'December 2025',
  },
];

export default async function PressPage() {
  let pressItems = FALLBACK_PRESS;

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('page_type', 'press')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        pressItems = data.map((item: any) => ({
          id: item.id,
          publisher: item.title.split(':')[0] || 'Media Release',
          title: item.title,
          quote: item.excerpt || item.content,
          image: item.featured_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
          date: new Date(item.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        }));
      }
    }
  } catch (err) {
    console.error('Error loading live press items:', err);
  }

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-black flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto shadow-xs">
            <Newspaper className="w-4 h-4 text-[#F6A6BB]" /> Global Recognition
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#1A0510]">
            Press & Media Mentions
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-bold leading-relaxed">
            Featured in leading international beauty, lifestyle, and financial publications.
          </p>
        </div>

        {/* Press List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pressItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border-2 border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-64 bg-[#FAE6E7] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-[#4A0D25] border border-[#F7D1D8]">
                  {item.publisher}
                </span>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#4A0D25] font-bold">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#F6A6BB]" /> Editorial Coverage
                  </span>
                  <span>{item.date}</span>
                </div>

                <h3 className="font-serif text-xl font-extrabold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors leading-snug">
                  {item.title}
                </h3>

                <blockquote className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed italic border-l-2 border-[#F6A6BB] pl-4 py-1">
                  "{item.quote}"
                </blockquote>
              </div>

              <div className="p-8 pt-0 border-t border-[#F7D1D8] mt-4 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-bold">Official Publication</span>
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#4A0D25] hover:text-[#F6A6BB] transition-colors"
                >
                  Read Story <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
