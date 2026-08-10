import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Inspiration & Olfactory Journal | Rose Valley Kannauj',
  description: 'Chronicles of Kannauj hydro-distillation, Damask rose harvesting, alcohol-free attar craftsmanship, and scent memory.',
};

const FALLBACK_ARTICLES = [
  {
    id: 'f1',
    slug: 'art-of-fragrance-layering',
    title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
    excerpt: 'Discover how master perfumers combine pure Kannauj hydro-distilled Ruh Gulab with Mysore Sandalwood for an enduring, personal scent trail.',
    featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
    created_at: '2026-08-01T00:00:00Z',
    page_type: 'blog',
  },
  {
    id: 'f2',
    slug: 'harvesting-damask-roses',
    title: 'Dawn Harvest: Inside Kannauj’s Pre-Dawn Damask Rose Fields',
    excerpt: 'Step into the fields at 4:30 AM as delicate petals are hand-picked before the morning sun evaporates their volatile aromatic compounds.',
    featured_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
    created_at: '2026-07-20T00:00:00Z',
    page_type: 'blog',
  },
  {
    id: 'f3',
    slug: 'copper-deg-bhapka-legacy',
    title: 'The 400-Year Heritage of Copper Deg-Bhapka Hydro-Distillation',
    excerpt: 'Explore why wood-fired copper vessels and clay sealing techniques create unmatchable depth that modern industrial factories cannot replicate.',
    featured_image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=800&auto=format&fit=crop',
    created_at: '2026-06-15T00:00:00Z',
    page_type: 'blog',
  },
  {
    id: 'f4',
    slug: 'ruh-khus-cooling-elixir',
    title: 'Ruh Khus: The Ancient Indian Cooling Elixir Distilled from Wild Vetiver',
    excerpt: 'How wild roots harvested along riverbanks produce a deep, earthy green extract revered for centuries during hot summer months.',
    featured_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    created_at: '2026-05-10T00:00:00Z',
    page_type: 'blog',
  },
  {
    id: 'f5',
    slug: 'alcohol-free-attar-purity',
    title: 'Why Pure Alcohol-Free Attars Outlast Synthetic Alcohol Perfumes',
    excerpt: 'Uncover the science of oil-based fragrance retention: how natural botanical oils bond with skin lipids for a 12+ hour intimate sillage.',
    featured_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    created_at: '2026-04-05T00:00:00Z',
    page_type: 'blog',
  },
];

export default async function JournalPage() {
  let articles = FALLBACK_ARTICLES;

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('page_type', 'blog')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        articles = data;
      }
    }
  } catch (err) {
    console.error('Error loading live journal articles:', err);
  }

  const featured = articles[0] || FALLBACK_ARTICLES[0];
  const secondary = articles.slice(1);

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
        {featured && (
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
            <div className="relative h-72 lg:h-auto lg:col-span-7 bg-[#FAE6E7]">
              <Image
                src={featured.featured_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop'}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#4A0D25] border border-[#F7D1D8]">
                FEATURED ESSAY
              </span>
            </div>

            <div className="p-8 lg:p-12 lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-[#4A0D25] font-bold">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAE6E7] border border-[#F7D1D8]">
                    Master Class
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" /> 5 min read
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors leading-tight">
                  {featured.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-between">
                <span className="text-xs text-stone-500 font-bold">By Master Perfumer</span>
                <Link
                  href={`/journal/${featured.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#4A0D25] hover:text-[#F6A6BB] transition-colors"
                >
                  Read Essay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Articles Grid */}
        <div className="space-y-6">
          <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-[#1A0510]">
            Recent Field Notes & Essays
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secondary.map((art) => (
              <article
                key={art.id || art.slug}
                className="bg-white rounded-3xl border border-[#F7D1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 bg-[#FAE6E7] overflow-hidden">
                    <Image
                      src={art.featured_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop'}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#4A0D25] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#FAE6E7] border border-[#F7D1D8]">
                        Heritage
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#1A0510] group-hover:text-[#4A0D25] transition-colors line-clamp-2">
                      {art.title}
                    </h4>

                    <p className="text-xs text-[#4A0D25] font-medium leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#F7D1D8] mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 font-bold">
                    {new Date(art.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                  <Link
                    href={`/journal/${art.slug}`}
                    className="text-xs font-black text-[#4A0D25] hover:text-[#F6A6BB] flex items-center gap-1 transition-colors"
                  >
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
