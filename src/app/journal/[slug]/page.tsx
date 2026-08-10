import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export default function JournalArticlePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <LuxuryHeader />

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <Link href="/journal" className="inline-flex items-center gap-1.5 text-xs text-[#4A0D25] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4 text-[#F6A6BB]" /> Back to Olfactory Journal
        </Link>

        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-bold px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit">
            Master Perfumer Essay
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510]">
            The Art of Fragrance Layering: Creating Your Scent Signature
          </h1>
          <p className="text-xs text-[#4A0D25]">Published by Maison Master Perfumer • August 2026</p>
        </div>

        <div className="relative h-96 rounded-3xl overflow-hidden shadow-luxury border-2 border-[#F7D1D8]">
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
            alt="Perfume bottle layering"
            fill
            className="object-cover"
          />
        </div>

        <div className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed space-y-5 font-serif font-medium">
          <p>
            Fragrance layering is an intimate, creative ritual. Rather than wearing a single linear scent, layering pure Kannauj hydro-distilled Ruh Gulab underneath Mysore Sandalwood allows you to compose a sensory signature that reacts uniquely to your personal skin chemistry.
          </p>
          <h3 className="text-xl font-bold text-[#1A0510]">1. Prepare with Pure Botanicals</h3>
          <p>
            Aromatic molecules adhere best to warm, hydrated skin. Apply a few drops of 100% pure alcohol-free Kannauj rose water or Sandalwood oil immediately after bathing to create a rich moisture barrier.
          </p>
          <h3 className="text-xl font-bold text-[#1A0510]">2. Anchor with Aged Mysore Sandalwood</h3>
          <p>
            Apply deeper, resinous attars first—such as Aged Mysore Sandalwood, Velvet Oud, or Shamama. These dense molecules act as anchors for lighter pre-dawn rose top notes applied subsequently.
          </p>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
