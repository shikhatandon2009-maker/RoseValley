'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, LogIn, UserPlus, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';

interface CheckoutChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueGuest: () => void;
  isCompulsory?: boolean;
}

export function CheckoutChoiceModal({ isOpen, onClose, onContinueGuest, isCompulsory = false }: CheckoutChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-2xl p-6 sm:p-8 space-y-6 text-left text-[#1A0510]">
        {/* Close button - hidden when compulsory selection is required */}
        {!isCompulsory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-[#4A0D25] hover:bg-[#FAE6E7] transition-all cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Private Client Checkout
          </div>
          <h2 className="font-serif font-extrabold text-2xl text-[#1A0510]">
            How would you like to proceed?
          </h2>
          <p className="text-xs text-[#4A0D25] font-semibold">
            Choose to sign in for automated address autofill and order rewards, or checkout instantly as a guest.
          </p>
        </div>

        {/* Options Stack */}
        <div className="space-y-3 pt-2">
          {/* Option 1: Continue as Guest */}
          <button
            onClick={() => {
              onClose();
              onContinueGuest();
            }}
            className="w-full p-4 rounded-2xl bg-[#FDF8F8] hover:bg-[#FAE6E7] border-2 border-[#F7D1D8] transition-all flex items-center justify-between group shadow-xs text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FAE6E7] text-[#D45A7A] shadow-xs group-hover:bg-[#D45A7A] group-hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A0510]">Checkout as Guest</h4>
                <p className="text-[11px] text-stone-500 font-bold">Fast guest checkout with auto-generated order tracking</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D45A7A] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Option 2: Sign In to Account */}
          <Link
            href="/login?redirect=/checkout"
            onClick={onClose}
            className="w-full p-4 rounded-2xl bg-[#D45A7A] hover:bg-[#C94A6A] text-white transition-all flex items-center justify-between group shadow-md text-left cursor-pointer border border-[#C94A6A]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 text-white">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Sign In to Existing Account</h4>
                <p className="text-[11px] text-pink-100 font-medium">Autofill saved shipping addresses & track orders</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Option 3: Create New Account */}
          <Link
            href="/register?redirect=/checkout"
            onClick={onClose}
            className="w-full p-4 rounded-2xl bg-[#FDF8F8] hover:bg-[#FAE6E7] border-2 border-[#F7D1D8] transition-all flex items-center justify-between group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FAE6E7] text-[#D45A7A] group-hover:bg-[#D45A7A] group-hover:text-white transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A0510]">Create New Account</h4>
                <p className="text-[11px] text-stone-500 font-bold">Join for private client privileges & rewards</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D45A7A] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Security footer */}
        <div className="pt-2 border-t border-[#F7D1D8] flex items-center justify-center gap-2 text-[10px] font-bold text-stone-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F6A6BB]" />
          <span>256-Bit Encrypted Secure Payment via Razorpay</span>
        </div>
      </div>
    </div>
  );
}
