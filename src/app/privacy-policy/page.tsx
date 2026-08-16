import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { Lock, ShieldCheck, Database, Eye, Bell, ArrowLeft, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Rose Valley Kannauj',
  description: 'Learn how Rose Valley Kannauj protects your personal data, payment information, GST details, and browsing privacy.',
};

export default function PrivacyPolicyPage() {
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
          <span className="text-[#1A0510]">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-3 pb-6 border-b border-[#F7D1D8]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
            <Lock className="w-4 h-4 text-[#4A0D25]" /> Data Protection & Trust
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed">
            Effective Date: August 1, 2026 • Rose Valley Kannauj (Maison De L&apos;Essence)
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" /> 256-Bit SSL Encryption
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Bank-grade encrypted tokenized checkout</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Database className="w-4 h-4 text-[#F6A6BB]" /> Zero Payment Data Stored
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">No CVV or card numbers stored on our servers</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Eye className="w-4 h-4 text-[#F6A6BB]" /> Never Sold to 3rd Parties
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Your private details remain strictly confidential</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A0D25] leading-relaxed">
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              1. Information We Collect
            </h2>
            <p>
              When you purchase our fragrances, register for a private client account, or contact our customer concierge, we may collect the following details:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li><strong>Contact Information:</strong> Full Name, Email Address, and Phone Number.</li>
              <li><strong>Shipping & Billing Details:</strong> Street address, city, state, postal code, and country.</li>
              <li><strong>Commercial GST Details:</strong> GSTIN and registered Company Name (if provided by buyer for commercial tax invoices).</li>
              <li><strong>Order & Transaction Records:</strong> Order identifiers, purchased products, payment status, and dispatch tracking history.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              2. How We Use Your Data
            </h2>
            <p>Your personal information is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1 text-xs">
              <li>Fulfill and dispatch your orders, generate GST Tax Invoices, and provide delivery tracking updates.</li>
              <li>Authenticate your account login and secure your order history in your private client dashboard.</li>
              <li>Send critical transactional alerts (order confirmation, dispatch, delivery, and password reset notifications).</li>
              <li>Prevent fraudulent transactions and comply with Indian commercial tax laws.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              3. Payment Security & Third-Party Processors
            </h2>
            <p>
              All online payments on <strong>rosevalleykannauj.com</strong> are processed through PCI-DSS Level 1 certified gateways (Razorpay, Stripe, and authorized banking partners). 
              Rose Valley Kannauj <strong>never collects, stores, or accesses</strong> your credit card number, debit card PIN, or CVV code.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              4. Cookies and Analytical Technologies
            </h2>
            <p>
              We use functional cookies to remember your preferred display currency (INR, USD, EUR, GBP, AED), retain items in your shopping bag, and analyze aggregated website performance. You can disable cookies in your browser settings at any time.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              5. Your Privacy Rights & Data Deletion
            </h2>
            <p>
              Under applicable Indian and international data protection laws, you retain the right to review, update, or request deletion of your personal information from our database. To request data deletion or update your saved details, please email our Data Protection Officer at <a href="mailto:privacy@rosevalleykannauj.com" className="font-bold underline text-[#1A0510]">privacy@rosevalleykannauj.com</a>.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#FAE6E7]/60 border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">
              6. Contact Our Legal & Privacy Desk
            </h2>
            <p className="text-xs">
              Maison De L&apos;Essence • Rose Valley Kannauj<br />
              Attn: Privacy & Legal Officer<br />
              Estate Address: G.T. Road, Perfume City, Kannauj, Uttar Pradesh — 209725, India.<br />
              Email: <a href="mailto:privacy@rosevalleykannauj.com" className="underline">privacy@rosevalleykannauj.com</a>
            </p>
          </section>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
