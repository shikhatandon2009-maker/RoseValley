import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { Truck, Clock, ShieldCheck, Globe, PackageCheck, AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping and Delivery Policy | RoseOil.in',
  description: 'Learn about shipping timelines, domestic delivery in India, international express dispatch, and packaging standards for RoseOil.in pure essential oils.',
};

export default function ShippingDeliveryPolicyPage() {
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
          <span className="text-[#1A0510]">Shipping and Delivery Policy</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-3 pb-6 border-b border-[#F7D1D8]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-widest">
            <Truck className="w-4 h-4 text-[#4A0D25]" /> Dispatch & Logistics
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510] tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] font-medium leading-relaxed">
            Last Updated: August 2026 • RoseOil.in
          </p>
        </div>

        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Clock className="w-4 h-4 text-[#F6A6BB]" /> 24-48 Hours
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Fast batch dispatch from our distillation center</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Truck className="w-4 h-4 text-[#F6A6BB]" /> Free Shipping ₹2,000+
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Complimentary insured delivery across all Indian pin codes</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-[#F7D1D8] shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#1A0510]">
              <Globe className="w-4 h-4 text-[#F6A6BB]" /> Worldwide Delivery
            </div>
            <p className="text-[11px] text-[#4A0D25] font-medium">Express DHL / FedEx delivery to 100+ countries</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A0D25] leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#4A0D25]" /> 1. Order Processing & Dispatch Timelines
            </h2>
            <p>
              Every botanical oil at <strong>RoseOil.in</strong> is carefully bottled and decanted under strict purity standards. 
              Orders are typically processed and dispatched within <strong>24 to 48 business hours</strong> (excluding Sundays and national holidays) after payment confirmation.
            </p>
            <p>
              Once your parcel is handed over to our courier partner (Blue Dart, Delhivery, DTDC, or India Post Speed Post), you will automatically receive an SMS and email notification with your live tracking number.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#4A0D25]" /> 2. Domestic Shipping Rates & Estimated Delivery Time (India)
            </h2>
            <div className="space-y-2">
              <p>• <strong>Free Domestic Shipping:</strong> Orders valued at <strong>₹2,000 and above</strong> qualify for 100% Free Express Shipping anywhere in India.</p>
              <p>• <strong>Standard Shipping Fee:</strong> A nominal flat fee of <strong>₹99</strong> is applicable on domestic orders below ₹2,000.</p>
              <p>• <strong>Estimated Delivery Duration:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 2 to 4 business days.</li>
                <li><strong>Rest of India (Tier 2 & 3 Cities):</strong> 4 to 7 business days.</li>
                <li><strong>North-East & Remote Locations:</strong> 6 to 9 business days via Speed Post / Air Cargo.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#4A0D25]" /> 3. International Express Shipping
            </h2>
            <p>
              We deliver our pure essential oils and botanical extracts worldwide to over 100 countries including the United States, United Kingdom, European Union, UAE, Saudi Arabia, Canada, Australia, and Singapore via <strong>DHL Express</strong> and <strong>FedEx International Priority</strong>.
            </p>
            <p>
              • <strong>International Transit Time:</strong> 5 to 10 business days depending on customs clearance.<br />
              • <strong>Customs & Import Duties:</strong> International orders are shipped with official Certificate of Analysis (COA) and MSDS declarations. Any applicable local import taxes or customs duties assessed by the destination country are the responsibility of the recipient.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-3xl bg-white border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A0D25]" /> 4. Premium Packaging & Transit Insurance
            </h2>
            <p>
              All pure essential oils and flacons are encased in custom shock-absorbing foam capsules and sealed luxury boxes to ensure zero leakage and full temperature stability during transit.
            </p>
            <p>
              Every shipment is fully insured by RoseOil.in against transit loss or damage. In the rare event of transit damage, please notify us within 48 hours of delivery at <a href="mailto:support@roseoil.in" className="font-bold underline text-[#1A0510]">support@roseoil.in</a> with photos or unboxing video for an instant complimentary replacement.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-3xl bg-[#FAE6E7]/60 border border-[#F7D1D8] shadow-xs space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#4A0D25]" /> 5. Need Assistance with Your Delivery?
            </h2>
            <p>
              Our support team is available Monday to Saturday, 9:00 AM – 7:00 PM IST to assist with address adjustments before dispatch, expedited shipments, or courier coordination.
            </p>
            <p className="font-semibold text-xs">
              Email: <a href="mailto:support@roseoil.in" className="underline">support@roseoil.in</a>
            </p>
          </section>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
