import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { RotateCcw, ShieldCheck, CheckCircle2, Clock, ArrowLeft, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | RoseOil.in',
  description: 'Understand our return, transit replacement, and refund policies for authentic pure essential oils at RoseOil.in.',
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans flex flex-col justify-between">
      <LuxuryHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-12 sm:pb-16 space-y-10 flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25]/70">
          <Link href="/" className="hover:text-[#F6A6BB] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-[#1A0510]">Return and Refund Policy</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-3 pb-6 border-b border-[#F7D1D8]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
            <RotateCcw className="w-4 h-4 text-[#4A0D25]" /> Client Satisfaction Guarantee
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510] tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed">
            Effective Date: August 1, 2026 • RoseOil.in
          </p>
        </div>

        {/* Key Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" /> 100% Transit Safe
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Free instant replacement for damaged bottles</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Clock className="w-4 h-4 text-[#F6A6BB]" /> 48-Hour Claim Window
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Quick resolution on any delivery discrepancy</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <RotateCcw className="w-4 h-4 text-[#F6A6BB]" /> 5-7 Day Refunds
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Direct credit to your original payment method</p>
          </div>
        </div>

        {/* Policy Details */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A0D25] leading-relaxed">
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A0D25]" /> 1. Hygiene & Botanical Integrity Standards
            </h2>
            <p>
              Due to the sensitive, consumable nature of pure botanical essential oils and extracts, 
              <strong> opened or used bottles cannot be returned for restock</strong> once the tamper-evident seal is broken, in adherence to cosmetic hygiene protocols.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4A0D25]" /> 2. Transit Damage & Defective Item Replacement
            </h2>
            <p>
              Your satisfaction and trust are paramount. We offer a <strong>100% complimentary immediate replacement</strong> if:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li>The package is damaged, cracked, or leaking upon arrival.</li>
              <li>You received an incorrect item or botanical variant compared to your order confirmation.</li>
              <li>The bottle dropper, cap, or seal possesses a manufacturing defect.</li>
            </ul>
            <p className="pt-2">
              <strong>How to Request a Replacement:</strong> Please contact our support team at <a href="mailto:support@roseoil.in" className="font-bold underline text-[#1A0510]">support@roseoil.in</a> within <strong>48 hours of delivery</strong> with your Order Number and a clear photograph or unboxing video of the damaged item.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#4A0D25]" /> 3. Order Cancellation Before Dispatch
            </h2>
            <p>
              Orders can be cancelled free of charge at any time <strong>before dispatch</strong> directly from your <Link href="/account" className="underline font-bold text-[#1A0510]">Client Account</Link> or by notifying customer support. 
              Upon cancellation, a full 100% refund is initiated immediately.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#4A0D25]" /> 4. Refund Processing Timelines
            </h2>
            <p>
              Approved refunds are credited directly to your original method of payment (UPI, Credit Card, Debit Card, Net Banking, or Digital Wallet) within <strong>5 to 7 business days</strong> in accordance with standard banking settlement cycles.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#FAE6E7]/60 border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#4A0D25]" /> 5. Need Immediate Assistance?
            </h2>
            <p>
              Our dedicated customer support desk is here to help you:
            </p>
            <p className="text-xs font-semibold">
              Email: <a href="mailto:support@roseoil.in" className="underline">support@roseoil.in</a><br />
              Hours: Monday – Saturday, 9:00 AM to 7:00 PM IST
            </p>
          </section>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
