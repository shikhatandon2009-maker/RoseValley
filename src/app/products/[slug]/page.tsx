import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductBySlug, fetchProductVariants, fetchReviews, fetchQuestions } from '@/lib/supabase/store-scoped-queries';
import { ProductDetailClient } from './ProductDetailClient';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface ProductDetailPageProps {
  params: { slug: string };
}

export const revalidate = 60;

/**
 * Dynamic SEO Generation directly powered by Admin Section 6 (Meta Title, Meta Description, Meta Keywords, Badges)
 */
export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | RoseOil.in',
      description: 'The requested product could not be found.',
    };
  }

  // 1. Meta Title (Fallback to Product Name | RoseOil.in)
  const metaTitle = product.meta_title?.trim()
    ? product.meta_title.trim()
    : `${product.name} | RoseOil.in`;

  // 2. Meta Description (Fallback to Product Excerpt)
  const cleanDescription = (product.description || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  const metaDescription = product.meta_description?.trim()
    ? product.meta_description.trim()
    : cleanDescription
      ? cleanDescription.slice(0, 160)
      : `Explore ${product.name}, 100% pure botanical essential oil and natural therapeutic extract from RoseOil.in.`;

  // 3. Meta Keywords
  const metaKeywords = product.meta_keywords?.trim()
    ? product.meta_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [product.name, 'pure essential oil', 'rose oil', 'botanical extract', 'alcohol-free', 'RoseOil.in'];

  // 4. Product Featured Image
  const primaryImage = product.images?.[0] || '/images/deg-bhapka-heritage.jpg';

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: `/products/${product.slug}`,
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [primaryImage],
    },
    alternates: {
      canonical: `/products/${product.slug}`,
    },
  };
}

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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-6 sm:pb-10 w-full overflow-x-hidden">
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
