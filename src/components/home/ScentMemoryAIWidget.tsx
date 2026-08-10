'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AnimatedGoldButton } from '../common/AnimatedGoldButton';

interface Recommendation {
  title: string;
  notes: string[];
  description: string;
  slug: string;
}

export function ScentMemoryAIWidget() {
  const [memoryInput, setMemoryInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const samplePrompts = [
    'Sunset in a vintage palace courtyard after warm rain',
    'Morning breeze through ancient Damask rose fields in Kannauj',
    'Evening quiet in a dimly lit library with golden amber & aged leather',
  ];

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryInput.trim()) return;

    setIsAnalyzing(true);
    setRecommendation(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const text = memoryInput.toLowerCase();

      if (text.includes('rain') || text.includes('court') || text.includes('palace')) {
        setRecommendation({
          title: 'Damask Rose & Aged Amber Elixir (100% Attar)',
          notes: ['Calabrian Bergamot', 'Kannauj Hydro-Rose', 'Smoked Amber Resin'],
          description:
            'Matches your memory of petrichor and regal courtyard serenity. Hydro-distilled in Kannauj copper degs without alcohol.',
          slug: 'rose-royale-eau-de-parfum',
        });
      } else if (text.includes('morning') || text.includes('breeze') || text.includes('field')) {
        setRecommendation({
          title: 'Ruh Gulab 2026 Pure Distillate (Single Harvest)',
          notes: ['Pre-Dawn Damask Rose', 'Wild Pink Pepper', 'Soft White Cedar'],
          description:
            'Captures the exact dew-drenched floral peak of Kannauj rose fields at 5:00 AM.',
          slug: 'ruh-gulab-pure-rose-oil',
        });
      } else {
        setRecommendation({
          title: 'Mysore Sandalwood & Royal Rose Synergist',
          notes: ['Mysore Sandalwood Oil', 'Rosa Damascena', 'Rare Saffron Stigmas'],
          description:
            'Harmonizes nostalgic warmth with 14-hour skin longevity aged in authentic Mysore sandalwood.',
          slug: 'sandalwood-synergy-elixir',
        });
      }
    }, 1200);
  };

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-[#FAE6E7]/80 border border-[#F7D1D8] shadow-sm space-y-6 text-[#1A0510]">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7EEED] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold uppercase tracking-widest">
          <Brain className="w-4 h-4 text-[#F6A6BB]" /> Scent Memory AI Engine
        </div>
        <h3 className="font-serif font-bold text-3xl text-[#1A0510]">
          Translate Any Memory Into a Pure Perfume Formula
        </h3>
        <p className="text-xs sm:text-sm text-[#4A0D25] max-w-xl mx-auto leading-relaxed font-semibold">
          Describe a place, atmosphere, or nostalgic emotion. Our AI perfumer matches your memory with authentic Kannauj botanical distillates.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <textarea
            value={memoryInput}
            onChange={(e) => setMemoryInput(e.target.value)}
            placeholder="Type your memory here (e.g. 'Walking through damp rose gardens at dawn in Jaipur...')"
            rows={3}
            className="w-full p-4 rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] text-xs sm:text-sm text-[#1A0510] placeholder-[#4A0D25]/60 focus:outline-none focus:ring-1 focus:ring-[#F6A6BB] resize-none shadow-xs font-medium"
          />
        </div>

        {/* Sample Prompts */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[#4A0D25] font-bold">Try:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMemoryInput(prompt)}
              className="px-3 py-1 rounded-full bg-[#F7EEED] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] transition-all text-[11px] font-semibold text-left truncate max-w-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <AnimatedGoldButton type="submit" disabled={isAnalyzing || !memoryInput.trim()}>
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#4A0D25]" />
                Analyzing Botanical Synergy...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A0D25]" />
                Synthesize Perfume Recommendation
              </span>
            )}
          </AnimatedGoldButton>
        </div>
      </form>

      {/* AI Recommendation Output */}
      <AnimatePresence>
        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#F7EEED] border-2 border-[#F6A6BB] space-y-4 shadow-sm text-left"
          >
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Matches Your Memory Profile
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F6A6BB]/30 text-[#4A0D25] text-[10px] font-bold">
                98.4% Accord Fit
              </span>
            </div>

            <div>
              <h4 className="font-serif font-bold text-xl text-[#1A0510]">
                {recommendation.title}
              </h4>
              <p className="text-xs text-[#4A0D25] leading-relaxed mt-1 font-semibold">
                {recommendation.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {recommendation.notes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-xs text-[#1A0510] font-bold"
                >
                  {note}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
