import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export const metadata = {
  title: 'Inspiration & Olfactory Journal | Rose Valley Kannauj',
  description: 'Chronicles of Kannauj hydro-distillation, Damask rose harvesting, alcohol-free attar craftsmanship, and scent memory.',
};

const ARTICLES = [
  {
    slug: 'art-of-fragrance-layering',
    category: 'Master Class',
    title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
    excerpt: 'Discover how master perfumers combine pure Kannauj hydro-distilled Ruh Gulab with Mysore Sandalwood for an enduring, personal scent trail.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    date: 'August 2026',
    readTime: '4 min read',
    author: 'Master Perfumer',
  },
  {
    slug: 'harvesting-damask-roses',
    category: 'Field Notes',
    title: 'Dawn Harvest: Inside Kannauj’s Pre-Dawn Damask Rose Fields',
    excerpt: 'Step into the fields at 4:30 AM as delicate petals are hand-picked before the morning sun evaporates their volatile aromatic compounds.',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    date: 'July 2026',
    readTime: '6 min read',
    author: 'Botanical Researcher',
  },
  {
    slug: 'copper-deg-bhapka-legacy',
    category: 'Heritage Craft',
    title: 'The 400-Year Heritage of Copper Deg-Bhapka Hydro-Distillation',
    excerpt: 'Explore why wood-fired copper vessels and clay sealing techniques create unmatchable depth that modern industrial factories cannot replicate.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    date: 'June 2026',
    readTime: '5 min read',
    author: 'Distillation Master',
  },
  {
    slug: 'ruh-khus-cooling-elixir',
    category: 'Ingredient Spotlight',
    title: 'Ruh Khus: The Ancient Indian Cooling Elixir Distilled from Wild Vetiver',
    excerpt: 'How wild roots harvested along riverbanks produce a deep, earthy green extract revered for centuries during hot summer months.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    date: 'May 2026',
    readTime: '4 min read',
    author: 'Senior Evaluator',
  },
  {
    slug: 'alcohol-free-attar-purity',
    category: 'Purity Guide',
    title: 'Why Pure Alcohol-Free Attars Outlast Synthetic Alcohol Perfumes',
    excerpt: 'Uncover the science of oil-based fragrance retention: how natural botanical oils bond with skin lipids for a 12+ hour intimate sillage.',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    date: 'April 2026',
    readTime: '5 min read',
    author: 'Quality Lab Lead',
  },
];

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Page Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-black flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto shadow-xs">
            <BookOpen className="w-4 h-4 text-[#F6A6BB]" /> Inspiration & Stories
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#1A0510]">
            The Olfactory Journal
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-bold leading-relaxed">
            Essays on Kannauj copper steam distillation, botanical skincare, fragrance layering, and scent memories.
          </p>
        </div>

        {/* Featured Main Article */}
        <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
          <div className="relative h-72 lg:h-auto lg:col-span-7 bg-[#FAE6E7]">
            <Image
              src={ARTICLES[0].image}
              alt={ARTICLES[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4A0D25] border border-[#F7D1D8]">
              FEATURED ESSAY
            </span>
          </div>

          <div className="p-8 lg:p-12 lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-extrabold text-[#4A0D25]">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8]">
                  {ARTICLES[0].category}
                </span>
                <span>{ARTICLES[0].date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F6A6BB]" /> {ARTICLES[0].readTime}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors leading-snug">
                {ARTICLES[0].title}
              </h2>

              <p className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed font-semibold">
                {ARTICLES[0].excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500">By {ARTICLES[0].author}</span>
              <Link
                href={`/journal/${ARTICLES[0].slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#4A0D25] hover:text-[#F6A6BB] transition-colors"
              >
                <span>Read Full Essay</span>
                <ArrowRight className="w-4 h-4 text-[#F6A6BB]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Grid of Other Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ARTICLES.slice(1).map((art) => (
            <div
              key={art.slug}
              className="bg-white rounded-3xl border-2 border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative h-60 w-full bg-[#FAE6E7]">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4A0D25] border border-[#F7D1D8]">
                  {art.category}
                </span>
              </div>

              <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold text-[#4A0D25]">
                    <span>{art.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#F6A6BB]" /> {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-extrabold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-[#4A0D25] leading-relaxed font-semibold">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500">By {art.author}</span>
                  <Link
                    href={`/journal/${art.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#4A0D25] hover:text-[#F6A6BB] transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 text-[#F6A6BB]" />
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
