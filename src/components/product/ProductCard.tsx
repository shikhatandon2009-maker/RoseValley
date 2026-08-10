'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const isLiked = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop';

  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="group relative bg-white rounded-2xl shadow-xs hover:shadow-md overflow-hidden transition-all duration-300 flex flex-col justify-between">
      
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-stone-50 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.is_bestseller && (
            <span className="bg-[#4A0D25] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F6A6BB]" /> Bestseller
            </span>
          )}
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="bg-[#F6A6BB] text-[#4A0D25] text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked ? 'bg-[#F6A6BB] text-[#4A0D25]' : 'bg-white/80 text-[#4A0D25] hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Scent notes pills */}
          {product.scent_notes?.top && product.scent_notes.top.length > 0 && (
            <p className="text-[10px] text-[#4A0D25] font-extrabold tracking-wide uppercase mb-1 line-clamp-1">
              Notes: {product.scent_notes.top.slice(0, 2).join(' • ')}
            </p>
          )}

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-base font-bold text-[#1A0510] hover:text-[#4A0D25] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-serif font-bold text-base text-[#1A0510]" suppressHydrationWarning>
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-stone-400 line-through" suppressHydrationWarning>
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`mt-4 w-full font-extrabold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs ${
            added
              ? 'bg-[#D45A7A] text-white ring-1 ring-[#FFD700]'
              : 'bg-[#FAE6E7] hover:bg-[#F6A6BB] text-[#4A0D25]'
          }`}
        >
          {added ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700] animate-bounce" />
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
