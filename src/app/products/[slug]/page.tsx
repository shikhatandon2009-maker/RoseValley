import React from 'react';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProductVariants, fetchReviews, fetchQuestions } from '@/lib/supabase/store-scoped-queries';
import { ProductDetailClient } from './ProductDetailClient';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface ProductDetailPageProps {
  params: { slug: string };
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return notFound();
  }

  const [variants, reviews, questions] = await Promise.all([
    fetchProductVariants(product.id, product.price),
    fetchReviews(product.id),
    fetchQuestions(product.id),
  ]);

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex flex-col justify-between overflow-x-hidden w-full">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full overflow-x-hidden">
        <ProductDetailClient
          product={product}
          variants={variants}
          initialReviews={reviews}
          initialQuestions={questions}
        />
      </main>

      <LuxuryFooter />
    </div>
  );
}
