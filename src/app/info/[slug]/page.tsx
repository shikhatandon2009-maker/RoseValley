import React from 'react';
import Link from 'next/link';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export default function StaticPolicyPage({ params }: { params: { slug: string } }) {
  const titles: Record<string, string> = {
    'shipping-policy': 'Shipping & Returns Policy',
    'privacy-policy': 'Privacy & Data Policy',
    'terms-of-service': 'Terms of Service',
  };

  const title = titles[params.slug] || 'Maison Information';

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <LuxuryHeader />

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510]">{title}</h1>

        <div className="p-8 rounded-3xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-xs text-[#4A0D25] leading-relaxed space-y-4 font-serif">
          <p>
            Welcome to Rose Valley Kannauj (Maison De L'Essence). We are committed to providing an exceptional luxury experience from copper deg steam creation to global doorstep delivery.
          </p>

          <h3 className="font-bold text-sm text-[#1A0510]">Express Worldwide Shipping</h3>
          <p>
            All orders are packed in climate-controlled temperature containers with shock-absorbent velvet sleeves. Orders placed before 2 PM IST are processed and dispatched on the same business day.
          </p>

          <h3 className="font-bold text-sm text-[#1A0510]">Complimentary Discovery Sampler Guarantee</h3>
          <p>
            Every full-sized fragrance bottle includes a complimentary 2ml sample vial of the exact same scent. We encourage you to test the 2ml vial first before breaking the protective seal on the main bottle.
          </p>
        </div>
      </main>

      <LuxuryFooter />
    </div>
  );
}
