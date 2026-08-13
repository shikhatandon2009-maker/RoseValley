'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Sparkles, Eye, AlertTriangle } from 'lucide-react';
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
    images: string[];
    scent_notes?: { top?: string[]; heart?: string[]; base?: string[] };
    is_featured?: boolean;
    is_bestseller?: boolean;
    stock?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const isLiked = isInWishlist(product.id);
  const primaryImage = (product.images && product.images[0]) || '';

  const [added, setAdded] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // Calculate discount percentage
  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  // Low stock indicator
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  // Static rating (4.7 - 5.0 range for luxury brand feel)
  const rating = 4.7 + (parseInt(product.id.slice(-2), 16) % 4) * 0.1;
  const reviewCount = 12 + (parseInt(product.id.slice(-3), 16) % 88);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage,
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
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-luxury overflow-hidden transition-all duration-300 flex flex-col justify-between border border-transparent hover:border-[#F7D1D8]"
      onMouseEnter={() => setShowQuickView(true)}
      onMouseLeave={() => setShowQuickView(false)}
    >
      
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#F7EEED] overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Badges — Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_bestseller && (
            <span className="bg-[#4A0D25] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F6A6BB]" /> Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#F6A6BB] text-[#4A0D25] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Low Stock / Out of Stock Badge — Top Right below wishlist */}
        {isLowStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-amber-50 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-sm">
              <AlertTriangle className="w-2.5 h-2.5" /> Only {product.stock} left
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-[#4A0D25] text-white text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked ? 'bg-[#F6A6BB] text-[#4A0D25] shadow-md' : 'bg-white/80 text-[#4A0D25] hover:bg-white hover:shadow-md'
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay */}
        {showQuickView && product.scent_notes && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A0510]/80 via-[#1A0510]/40 to-transparent p-4 pt-10 transition-all duration-300 z-10">
            <div className="flex flex-wrap gap-1.5">
              {product.scent_notes.top?.slice(0, 2).map((note, i) => (
                <span key={`t-${i}`} className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold">
                  {note}
                </span>
              ))}
              {product.scent_notes.heart?.slice(0, 1).map((note, i) => (
                <span key={`h-${i}`} className="px-2 py-0.5 rounded-full bg-[#F6A6BB]/30 backdrop-blur-sm text-white text-[9px] font-bold">
                  {note}
                </span>
              ))}
              {product.scent_notes.base?.slice(0, 1).map((note, i) => (
                <span key={`b-${i}`} className="px-2 py-0.5 rounded-full bg-[#4A0D25]/30 backdrop-blur-sm text-white text-[9px] font-bold">
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-[#F6A6BB] text-[#F6A6BB]' : i < Math.ceil(rating) ? 'fill-[#F6A6BB]/40 text-[#F6A6BB]' : 'text-[#F7D1D8]'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#4A0D25] font-bold">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-[#4A0D25]/50">({reviewCount})</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-base font-bold text-[#1A0510] hover:text-[#4A0D25] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-serif font-bold text-lg text-[#1A0510]" suppressHydrationWarning>
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-stone-400 line-through" suppressHydrationWarning>
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                Save {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-4 w-full font-black text-xs uppercase tracking-wider py-3 rounded-full border border-[#F7D1D8] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
            isOutOfStock
              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
              : added
              ? 'bg-[#4A0D25] text-white'
              : 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] hover:from-[#F4BBC9] hover:to-[#F7D1D8] text-[#4A0D25] hover:shadow-md'
          }`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : added ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB] animate-bounce" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
