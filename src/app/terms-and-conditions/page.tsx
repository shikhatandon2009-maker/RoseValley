import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { FileText, ShieldCheck, Scale, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Rose Valley Kannauj',
  description: 'Terms and conditions governing orders, authentic Kannauj artisanal hydro-distillates, pricing, and services of Rose Valley Kannauj.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans flex flex-col justify-between">
      <LuxuryHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25]/70">
          <Link href="/" className="hover:text-[#F6A6BB] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span>/</span>
          <span className="text-[#1A0510]">Terms and Conditions</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-3 pb-6 border-b border-[#F7D1D8]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
            <Scale className="w-4 h-4 text-[#4A0D25]" /> Legal Framework
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed">
            Effective Date: August 1, 2026 • Rose Valley Kannauj (Maison De L&apos;Essence)
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A0D25] leading-relaxed">
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or purchasing from <strong>rosevalleykannauj.com</strong> (the &quot;Site&quot;), operated by <strong>Rose Valley Kannauj / Maison De L&apos;Essence</strong>, you agree to be legally bound by these Terms and Conditions and our associated policies (Privacy Policy, Shipping Policy, and Return/Refund Policy).
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              2. Authentic Artisanal Distillates & Natural Variations
            </h2>
            <p>
              All our Ruh Gulab, wild Ruh Khus, Shamama, and botanical essential oils are 100% pure hydro-distillates produced using traditional copper Deg-Bhapka equipment in Kannauj.
            </p>
            <p>
              Because natural harvest yields of <em>Rosa Damascena</em> flowers, vetiver roots, and rainfall conditions vary from season to season, subtle color and scent nuances may naturally occur. These natural variations are the defining hallmark of pure unadulterated artisanal botanical extracts.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              3. Pricing, Multi-Currency & GST Invoicing
            </h2>
            <p>
              • Prices are listed in Indian Rupees (INR) and converted into applicable foreign currencies (USD, EUR, GBP, AED) for global patrons using real-time market exchange rates.<br />
              • All domestic orders in India include statutory GST (HSN 330300). Registered businesses can input their GSTIN and Company Name during checkout or prior to order dispatch to receive an official Input Tax Credit (ITC) compliant GST invoice.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              4. Order Acceptance & Right of Cancellation
            </h2>
            <p>
              We reserve the right to decline or cancel any order in the event of suspected fraud, pricing inaccuracies caused by technical failure, or temporary botanical harvest stock shortages. If an order is cancelled by us, a 100% refund will be credited back to your original payment method immediately.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              5. Intellectual Property & Brand Heritage
            </h2>
            <p>
              All trademarks, imagery, historical distillery narratives, bottle designs, logos, and digital content published on this website are the proprietary intellectual property of Rose Valley Kannauj. Unauthorized reproduction or commercial imitation is strictly prohibited.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#FAE6E7]/60 border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              6. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any legal disputes arising in connection with orders shall be subject to the exclusive jurisdiction of the competent courts in Kannauj, Uttar Pradesh, India.
            </p>
            <p className="text-xs font-semibold">
              Inquiries regarding Terms: <a href="mailto:legal@rosevalleykannauj.com" className="underline">legal@rosevalleykannauj.com</a>
            </p>
          </section>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
