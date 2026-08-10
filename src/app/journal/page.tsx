import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export default function JournalPage() {
  const articles = [
    {
      slug: 'art-of-fragrance-layering',
      title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
      excerpt: 'Discover how master perfumers combine pure Kannauj hydro-distilled Ruh Gulab with Mysore Sandalwood for an enduring scent trail.',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
      date: 'August 2026',
    },
    {
      slug: 'harvesting-damask-roses',
      title: 'Dawn Harvest: Inside Kannauj’s Damask Rose Fields',
      excerpt: 'Step into the fields at pre-dawn as delicate petals are gathered before the morning sun evaporates their volatile aromatic compounds.',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
      date: 'July 2026',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-bold flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> The Olfactory Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510]">Essays on Perfumery & Legacy</h1>
          <p className="text-xs sm:text-sm text-[#4A0D25]">
            Chronicles of Kannauj steam distillation, botanical skincare, and scent memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art) => (
            <div key={art.slug} className="bg-[#FAE6E7]/50 rounded-3xl border border-[#F7D1D8] overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              <div className="relative h-64 w-full">
                <Image src={art.image} alt={art.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] text-[#4A0D25] uppercase tracking-wider font-extrabold">{art.date}</span>
                <h3 className="font-serif text-xl font-bold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors">{art.title}</h3>
                <p className="text-xs text-[#4A0D25] leading-relaxed font-medium">{art.excerpt}</p>
                <Link href={`/journal/${art.slug}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A0D25] hover:underline pt-2">
                  <span>Read Journal Article</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F6A6BB]" />
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
