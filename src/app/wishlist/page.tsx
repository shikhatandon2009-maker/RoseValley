'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { useCurrencyStore } from '@/store/currency-store';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

export default function WishlistPage() {
  const { productIds, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        if (res.ok && data.products) {
          setProducts(data.products);
        } else {
          // Fallback demo products if API empty
          setProducts([
            {
              id: 'p1111111-1111-1111-1111-111111111111',
              name: 'Rose Royale Eau de Parfum',
              slug: 'rose-royale-eau-de-parfum',
              price: 4800,
              compare_at_price: 5500,
              images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
            },
            {
              id: 'p2222222-2222-2222-2222-222222222222',
              name: 'Velvet Amber & Vanilla Oil Blend',
              slug: 'velvet-amber-vanilla-oil-blend',
              price: 3200,
              compare_at_price: 3800,
              images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1000&auto=format&fit=crop'],
            },
            {
              id: 'p3333333-3333-3333-3333-333333333333',
              name: 'Midnight Jasmine & Bergamot Cologne',
              slug: 'midnight-jasmine-bergamot-cologne',
              price: 4200,
              compare_at_price: 4900,
              images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'],
            },
            {
              id: 'bc94ff96-1ef3-48cd-9975-529c5d6d4e2f',
              name: 'Shamama Kannauj',
              slug: 'shamama-perfume-Kannauj',
              price: 4800,
              compare_at_price: 5500,
              images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
            },
            {
              id: '444bac87-5c75-4e01-b2fa-8f787e933224',
              name: 'Kadam Attar',
              slug: 'kadam-attar',
              price: 4800,
              compare_at_price: 5500,
              images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'],
            },
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const wishlistedProducts = products.filter((p) => productIds.includes(p.id));

  const handleAddToCart = (p: any) => {
    addItem({
      id: p.id,
      productId: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
    }, 1);

    setAddedItemIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [p.id]: false }));
    }, 2500);
  };

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      addItem({
        id: p.id,
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop',
      }, 1);
    });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#5A1030] flex flex-col justify-between font-sans">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8B8B8] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D45A7A] uppercase tracking-widest">
              <Heart className="w-4 h-4 text-[#D45A7A] fill-current" /> Private Collection
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#7A1840] mt-1">
              Your Saved Wishlist
            </h1>
            <p className="text-xs text-[#9A2048] mt-1">
              Keep track of your favorite Kannauj hydro-distilled attars and artisanal perfumes.
            </p>
          </div>

          {wishlistedProducts.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="px-6 py-3 rounded-full bg-gradient-dark-luxury text-white text-xs font-bold shadow-luxury hover:bg-[#7A1840] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#E8B8B8]" /> Move All Items to Shopping Cart
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-[#F2D4D4] space-y-3">
            <Sparkles className="w-8 h-8 text-[#D45A7A] animate-spin mx-auto" />
            <p className="text-xs text-[#9A2048]">Loading saved fragrances...</p>
          </div>
        ) : wishlistedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#E8B8B8] p-8 space-y-4 shadow-sm">
            <Heart className="w-12 h-12 text-[#E8B8B8] mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-[#7A1840]">Your Wishlist is Empty</h3>
            <p className="text-xs text-[#9A2048] max-w-md mx-auto leading-relaxed">
              Explore our master perfume catalog and click the heart icon on any attar or essential oil to save it to your private collection.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#D45A7A] hover:bg-[#C94A6A] text-white font-semibold text-xs transition-all shadow-md"
              >
                Explore Scent Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedProducts.map((p) => {
              const isAdded = addedItemIds[p.id];

              return (
                <div
                  key={p.id}
                  className="bg-white/90 rounded-3xl border border-[#E8B8B8] p-5 shadow-luxury flex flex-col justify-between space-y-4 transition-all hover:border-[#D45A7A] group"
                >
                  <div className="space-y-4">
                    {/* Image Container */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F8E8E8] border border-[#F2D4D4]">
                      <Image
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop'}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#D45A7A] hover:bg-rose-50 border border-[#E8B8B8] shadow-sm transition-all"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#B03060] font-bold">Artisanal Perfume</span>
                      <h3 className="font-serif font-bold text-lg text-[#7A1840] group-hover:text-[#D45A7A] transition-colors mt-0.5">
                        <Link href={`/products/${p.slug}`}>{p.name}</Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-serif font-bold text-base text-[#5A1030]">
                          {formatPrice(p.price)}
                        </span>
                        {p.compare_at_price && (
                          <span className="line-through text-xs text-[#9A2048]/50">
                            {formatPrice(p.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#F2D4D4] flex items-center gap-3">
                    <button
                      onClick={() => handleAddToCart(p)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#7A1840] hover:bg-[#5A1030] text-white shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#E8B8B8]" /> Move to Shopping Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <LuxuryFooter />
    </div>
  );
}
