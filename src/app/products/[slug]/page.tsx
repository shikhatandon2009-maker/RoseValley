import React from 'react';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProductVariants, fetchReviews, fetchQuestions } from '@/lib/supabase/store-scoped-queries';
import { ProductDetailClient } from './ProductDetailClient';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface ProductDetailPageProps {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product = await fetchProductBySlug(params.slug);

  if (!product) {
    return notFound();
  }

  const variants = await fetchProductVariants(product.id);
  const reviews = await fetchReviews(product.id);
  const questions = await fetchQuestions(product.id);

  return (
    <div className="min-h-screen bg-white text-black">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductDetailClient
          product={product}
          variants={variants.length > 0 ? variants : [
            { id: 'v1', name: '10ml Pure Extrait', price: product.price, size: '10ml', stock: 25 },
            { id: 'v2', name: '50ml Royal Flacon', price: product.price * 2, size: '50ml', stock: 20 },
          ]}
          initialReviews={reviews}
          initialQuestions={questions}
        />
      </main>

      <LuxuryFooter />
    </div>
  );
}
