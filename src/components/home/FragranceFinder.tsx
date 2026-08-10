'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { DevFileTag } from '@/components/common/DevFileTag';

export function FragranceFinder() {
  const [selectedMood, setSelectedMood] = useState<string>('romance');

  const moods = [
    { id: 'romance', label: 'Floral Romance', note: 'Damask Rose, Jasmine & Neroli', slug: 'rose-royale-eau-de-parfum' },
    { id: 'calm', label: 'Serene Botanical Calm', note: 'Madagascar Vanilla & Golden Amber', slug: 'velvet-amber-vanilla-oil-blend' },
    { id: 'fresh', label: 'Midnight Citrus Fresh', note: 'Calabrian Bergamot & White Musk', slug: 'midnight-jasmine-bergamot-cologne' },
  ];

  const activeMood = moods.find((m) => m.id === selectedMood) || moods[0];

  return (
    <section className="py-16 bg-[#F2D4D4]/40 border-y border-[#E8B8B8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#9A2048] text-xs font-semibold shadow-sm mb-3">
          <Compass className="w-3.5 h-3.5 text-[#D45A7A]" />
          <span>Interactive Fragrance Finder</span>
        </div>

        <h2 className="font-serif text-3xl font-bold text-[#7A1840]">Find Your Signature Fragrance</h2>
        <p className="text-xs text-[#5A1030] mt-1 max-w-md mx-auto">
          Select your olfactory mood to reveal your bespoke fragrance pairing.
        </p>

        {/* Mood Selection Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {moods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                selectedMood === m.id
                  ? 'bg-[#D45A7A] text-white shadow-luxury scale-105'
                  : 'bg-white text-[#5A1030] border border-[#E8B8B8] hover:border-[#D45A7A]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Recommendation Card */}
        <div className="mt-8 glass-panel p-8 rounded-2xl max-w-xl mx-auto border border-[#E8B8B8] shadow-luxury animate-in fade-in">
          <span className="text-[10px] uppercase tracking-widest text-[#B03060] font-bold">Matched Scent Notes</span>
          <h3 className="font-serif text-xl font-bold text-[#5A1030] mt-1">{activeMood.note}</h3>
          <p className="text-xs text-[#7A1840] mt-2">
            Hand-compounded with organic botanical extractions for exceptional sillage and longevity.
          </p>

          <Link
            href={`/products/${activeMood.slug}`}
            className="inline-flex items-center gap-2 mt-5 bg-[#7A1840] hover:bg-[#5A1030] text-white text-xs font-semibold py-2.5 px-6 rounded-full transition-all shadow-sm"
          >
            Discover Perfume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
