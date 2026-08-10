import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { STORE_ID } from '@/lib/constants';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function JournalArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  let article: any = null;

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        article = data;
      }
    }
  } catch (err) {
    console.error('Error fetching article by slug:', err);
  }

  // Hardcoded fallback if not in DB
  if (!article) {
    article = {
      title: 'The Art of Fragrance Layering: Creating Your Scent Signature',
      excerpt: 'Discover how master perfumers combine pure Kannauj hydro-distilled Ruh Gulab with Mysore Sandalwood for an enduring, personal scent trail.',
      content: `Fragrance layering is an intimate, creative ritual. Rather than wearing a single linear scent, layering pure Kannauj hydro-distilled Ruh Gulab underneath Mysore Sandalwood allows you to compose a sensory signature that reacts uniquely to your personal skin chemistry.

1. Prepare with Pure Botanicals
Aromatic molecules adhere best to warm, hydrated skin. Apply a few drops of 100% pure alcohol-free Kannauj rose water or Sandalwood oil immediately after bathing to create a rich moisture barrier.

2. Anchor with Aged Mysore Sandalwood
Apply deeper, resinous attars first—such as Aged Mysore Sandalwood, Velvet Oud, or Shamama. These dense molecules act as anchors for lighter pre-dawn rose top notes applied subsequently.

3. The Finishing Touch: Pre-Dawn Damask Rose
Dab Ruh Gulab on pulse points: behind earlobes, wrists, and collarbones. The heat from your pulse points diffuses the ethereal floral bouquet, producing a subtle sillage that lingers gracefully for over 14 hours.`,
      featured_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
      created_at: new Date().toISOString(),
    };
  }

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Link href="/journal" className="inline-flex items-center gap-1.5 text-xs text-[#4A0D25] font-extrabold hover:underline">
          <ArrowLeft className="w-4 h-4 text-[#F6A6BB]" /> Back to Olfactory Journal
        </Link>

        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-black px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#F6A6BB]" /> Master Perfumer Essay
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#1A0510] leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#4A0D25] font-bold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#F6A6BB]" />
              {new Date(article.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F6A6BB]" /> 5 min read
            </span>
          </div>
        </div>

        <div className="relative h-96 rounded-3xl overflow-hidden shadow-luxury border-2 border-[#F7D1D8] bg-[#FAE6E7]">
          <Image
            src={article.featured_image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop'}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="bg-white rounded-3xl border border-[#F7D1D8] p-8 sm:p-12 shadow-xs space-y-6">
          <p className="text-sm sm:text-base text-[#4A0D25] font-bold leading-relaxed border-l-4 border-[#F6A6BB] pl-4 italic">
            "{article.excerpt || article.title}"
          </p>

          <div className="text-xs sm:text-sm text-[#1A0510] leading-relaxed space-y-5 font-serif font-medium whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
