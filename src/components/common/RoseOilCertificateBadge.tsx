'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';
import { RoseOilProvenancePassportModal } from './RoseOilProvenancePassportModal';

interface RoseOilCertificateBadgeProps {
  productName?: string;
  batchNumber?: string;
}

export function RoseOilCertificateBadge({
  productName,
  batchNumber,
}: RoseOilCertificateBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-rose-950/40 to-amber-500/10 border border-amber-500/40 text-amber-300 text-[11px] font-semibold hover:border-amber-400 hover:text-amber-200 transition-all shadow-md group cursor-pointer backdrop-blur-md"
        title="Click to view digital Provenance Passport Certificate"
      >
        <Award className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>Provenance Certified</span>
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
      </motion.button>

      <RoseOilProvenancePassportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={productName}
        batchNumber={batchNumber}
      />
    </>
  );
}
