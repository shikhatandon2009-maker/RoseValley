'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ShieldCheck, X, QrCode, CheckCircle2, Sparkles, Droplet, Clock, Flame } from 'lucide-react';

interface ProvenancePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  batchNumber?: string;
  stillNumber?: string;
  harvestDate?: string;
  purityScore?: string;
}

export function RoseOilProvenancePassportModal({
  isOpen,
  onClose,
  productName = 'Royal Damask Rose Hydro-Distillate (Ruh Gulab)',
  batchNumber = 'MDE-2026-HARVEST-9874',
  stillNumber = 'Copper Still #Deg-04 (Kannauj South)',
  harvestDate = 'May 2026 • Pre-Dawn Hand Picking',
  purityScore = '99.98% Pure Rosa Damascena Extract',
}: ProvenancePassportModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-b from-[#1C0512] via-[#0D0209] to-[#1C0512] border-2 border-[#D4AF37]/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.25)] p-6 sm:p-8 space-y-6 text-neutral-100 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 border border-amber-500/30 text-neutral-400 hover:text-white hover:border-amber-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Seal */}
            <div className="flex items-center gap-4 border-b border-[#D4AF37]/20 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-[#FFE79A] to-[#AA771C] p-0.5 shadow-xl shrink-0">
                <div className="w-full h-full bg-[#0D0209] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Digital Verification Certificate
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-neutral-100">
                  Rose Oil Provenance Passport
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Authentic Kannauj 400-Year Deg-Bhapka Distillation Record
                </p>
              </div>
            </div>

            {/* Product Title */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">Verified Product</span>
              <h3 className="font-serif font-bold text-lg text-amber-200">{productName}</h3>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-500 font-medium uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Batch Serial #
                </div>
                <div className="font-mono font-bold text-amber-300 truncate">{batchNumber}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-500 font-medium uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> Copper Still Vessel
                </div>
                <div className="font-semibold text-neutral-200 truncate">{stillNumber}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-500 font-medium uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Harvest Season
                </div>
                <div className="font-semibold text-neutral-200 truncate">{harvestDate}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-500 font-medium uppercase flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-emerald-400" /> Purity Assay
                </div>
                <div className="font-semibold text-emerald-300 truncate">{purityScore}</div>
              </div>
            </div>

            {/* QR Code & Master Signature Bar */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-[#D4AF37]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-neutral-950 shrink-0">
                  <QrCode className="w-10 h-10" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-200">Scan to Verify Provenance</div>
                  <div className="text-[10px] text-neutral-400">Cryptographically signed on Maison Ledger</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-amber-300 text-sm">Nawab of Kannauj</div>
                <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">Master Distiller Signature</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#FFE79A] text-neutral-950 font-bold text-xs shadow-lg transition-all"
              >
                Close Passport Certificate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
