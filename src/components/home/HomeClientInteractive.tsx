'use client';

import React, { useState } from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { AnimatedGoldButton } from '../common/AnimatedGoldButton';
import { PrivateAllocationModal } from './PrivateAllocationModal';

interface HomeClientInteractiveProps {
  featuredProducts?: any[];
}

export function HomeClientInteractive({ featuredProducts }: HomeClientInteractiveProps) {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <AnimatedGoldButton
          onClick={() => {
            const el = document.getElementById('featured');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          size="lg"
          icon={<Sparkles className="w-5 h-5 text-neutral-950" />}
        >
          Explore Pure Rose Oil Reserve
        </AnimatedGoldButton>

        <button
          onClick={() => setIsAllocationModalOpen(true)}
          className="px-8 py-4 rounded-full bg-[#18070F] border-2 border-[#D4AF37] text-amber-300 font-serif font-bold text-sm sm:text-base hover:bg-[#220914] hover:text-amber-200 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <Lock className="w-4 h-4 text-amber-400" /> Request Private Allocation
        </button>
      </div>

      <PrivateAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        productName={featuredProducts?.[0]?.name || 'Ruh Gulab 2026 Single Copper Still Reserve'}
      />
    </>
  );
}
