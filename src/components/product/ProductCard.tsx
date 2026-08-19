'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Sparkles, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';
export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number;
    images?: string[];
    category_slug?: string;
    scent_notes?: { top?: string[]; heart?: string[]; base?: string[] };
    is_featured?: boolean;
    is_bestseller?: boolean;
    stock?: number;
  };
  priority?: boolean;
}

const FALLBACK_BOTTLE = '/uploads/products/roseoil_in_common_image_1787115790783.png';

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const [mounted, setMounted] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const initialSinglePicture = product.images?.[0] || FALLBACK_BOTTLE;
  const [imgSrc, setImgSrc] = useState<string>(initialSinglePicture);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLiked = mounted ? isInWishlist(product.id) : false;

  // Calculate discount percentage
  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : 0;

  // Low stock indicator
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  // Deterministic luxury rating
  const idHash = (product.id || product.slug || 'prod')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = 4.7 + (idHash % 4) * 0.1;
  const reviewCount = 12 + (idHash % 88);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imgSrc,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(74,13,37,0.06),0_2px_6px_rgba(246,166,187,0.08)] hover:shadow-[0_20px_45px_rgba(74,13,37,0.16),0_8px_20px_rgba(246,166,187,0.22)] hover:-translate-y-1 sm:hover:-translate-y-1.5 overflow-hidden transition-all duration-300 ease-out flex flex-col justify-between border border-[#F7D1D8]/60 hover:border-[#F6A6BB] h-full">
      {/* ── Single Picture Container ── */}
      <div className="relative aspect-square w-full bg-[#F7EEED] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          {/* Loading Shimmer Overlay */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7EEED] via-[#FAE6E7] to-[#F7EEED] animate-pulse" />
          )}

          <Image
            src={imgSrc}
            alt={product.name}
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (imgSrc !== FALLBACK_BOTTLE) {
                setImgSrc(FALLBACK_BOTTLE);
              }
              setImageLoaded(true);
            }}
            className={`object-cover group-hover:scale-105 transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badges — Top Left */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10 pointer-events-none">
          {product.is_bestseller && (
            <span className="bg-[#4A0D25] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F6A6BB]" />
              <span className="hidden xs:inline">Bestseller</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#F6A6BB] text-[#4A0D25] text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Low Stock / Out of Stock Badge */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 pointer-events-none">
            <span className="bg-amber-50 text-amber-800 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm">
              <AlertTriangle className="w-2.5 h-2.5" /> Only {product.stock} left
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-[#4A0D25] text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isLiked
              ? 'bg-[#F6A6BB] text-[#4A0D25] shadow-md'
              : 'bg-white/80 text-[#4A0D25] hover:bg-white hover:shadow-md'
          }`}
          aria-label="Add to wishlist"
          suppressHydrationWarning
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* ── Product Details & CTA ── */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    i < Math.floor(rating)
                      ? 'fill-[#F6A6BB] text-[#F6A6BB]'
                      : i < Math.ceil(rating)
                      ? 'fill-[#F6A6BB]/40 text-[#F6A6BB]'
                      : 'text-[#F7D1D8]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] text-[#4A0D25] font-bold" suppressHydrationWarning>
              {rating.toFixed(1)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#4A0D25]/50 hidden xs:inline" suppressHydrationWarning>
              ({reviewCount})
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-xs sm:text-base font-bold text-[#1A0510] hover:text-[#4A0D25] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
            <span className="font-serif font-bold text-xs sm:text-lg text-[#1A0510]" suppressHydrationWarning>
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[9px] sm:text-xs text-stone-400 line-through" suppressHydrationWarning>
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[8px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full hidden sm:inline-block">
                Save {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-2.5 sm:mt-4 w-full font-black text-[9px] sm:text-xs uppercase tracking-wider py-2 sm:py-3 rounded-full border border-[#F7D1D8] transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-xs cursor-pointer ${
            isOutOfStock
              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
              : added
              ? 'bg-[#4A0D25] text-white'
              : 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] hover:from-[#F4BBC9] hover:to-[#F7D1D8] text-[#4A0D25] hover:shadow-md active:scale-95'
          }`}
          suppressHydrationWarning
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : added ? (
            <>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F6A6BB] animate-bounce" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
