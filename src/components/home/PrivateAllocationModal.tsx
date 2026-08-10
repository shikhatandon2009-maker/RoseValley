'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, CheckCircle2, Sparkles, Send, Award, Lock } from 'lucide-react';
import { AnimatedGoldButton } from '../common/AnimatedGoldButton';

interface PrivateAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export function PrivateAllocationModal({
  isOpen,
  onClose,
  productName = 'Ruh Gulab 2026 Single Copper Still Reserve',
}: PrivateAllocationModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-b from-[#1E0514] via-[#0D0209] to-[#1E0514] border-2 border-[#D4AF37]/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] p-6 sm:p-8 space-y-6 text-neutral-100 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 border border-amber-500/30 text-neutral-400 hover:text-white hover:border-amber-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/20 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">
                  <Award className="w-3.5 h-3.5" /> Maison Concierge Reserve
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-neutral-100">
                  Request Private Allocation
                </h2>
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-neutral-100">Allocation Requested</h3>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  Your private reservation request for <strong className="text-amber-300">{productName}</strong> has been logged into our Kannauj master ledger. Our senior perfume concierge will reach out to <span className="text-amber-200">{email}</span> within 24 hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-neutral-950 font-bold text-xs shadow-lg hover:bg-[#FFE79A] transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">Reserve Allocation Batch</span>
                  <div className="font-serif font-bold text-sm text-neutral-100">{productName}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="His/Her Excellency..."
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="concierge@privateclient.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Country of Delivery</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="pt-2 flex justify-center">
                  <AnimatedGoldButton
                    type="submit"
                    disabled={isSubmitting || !email || !name}
                    icon={<Send className="w-4 h-4 text-neutral-950" />}
                  >
                    {isSubmitting ? 'Registering Allocation...' : 'Submit Allocation Request'}
                  </AnimatedGoldButton>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
