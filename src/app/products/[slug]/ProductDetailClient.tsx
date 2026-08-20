'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingBag, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, ThumbsUp, Send, Maximize2, X, ChevronLeft, ChevronRight, Flame, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';

interface ProductDetailClientProps {
  product: any;
  variants: any[];
  initialReviews: any[];
  initialQuestions: any[];
}

export function ProductDetailClient({ product, variants, initialReviews, initialQuestions }: ProductDetailClientProps) {
  // Extract category info for breadcrumb
  const categoryName = product.category?.name || product.category_name || (product.categories && product.categories[0]?.name) || 'Collection';
  const categorySlug = product.category?.slug || product.category_slug || (product.categories && product.categories[0]?.slug) || '';

  // Deduplicate variants by name and price in case multiple duplicate entries exist in DB
  const uniqueVariants = React.useMemo(() => {
    const seen = new Set<string>();
    return (variants || []).filter((v) => {
      const key = `${(v.name || '').trim().toLowerCase()}_${Number(v.price)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [variants]);

  // Minimum variant price for luxury "From ₹..." starting presentation
  const minPrice = React.useMemo(() => {
    if (!uniqueVariants.length) return Number(product.price) || 0;
    return Math.min(...uniqueVariants.map((v) => Number(v.price) || 0));
  }, [uniqueVariants, product.price]);

  // Group variants into Sample, Retail / Standard, and Bulk / Reserve
  const groupedVariants = React.useMemo(() => {
    if (uniqueVariants.length <= 3) return null;

    const groups: { [key: string]: typeof uniqueVariants } = {
      'Discovery & Samples': [],
      'Artisanal Flacons': [],
      'Reserve & Bulk': [],
    };

    uniqueVariants.forEach((v) => {
      const n = (v.name || '').toLowerCase();
      if (n.includes('sample') || n.includes('tester') || n.includes('2ml') || n.includes('3ml') || n.includes('5ml')) {
        groups['Discovery & Samples'].push(v);
      } else if (n.includes('250ml') || n.includes('500ml') || n.includes('1kg') || n.includes('5kg') || n.includes('bulk') || n.includes('deg') || n.includes('tin') || n.includes('liter') || n.includes('litre')) {
        groups['Reserve & Bulk'].push(v);
      } else {
        groups['Artisanal Flacons'].push(v);
      }
    });

    const hasAnyGrouping = Object.values(groups).filter((list) => list.length > 0).length > 1;
    return hasAnyGrouping ? groups : null;
  }, [uniqueVariants]);

  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(uniqueVariants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'story' | 'notes' | 'ingredients' | 'reviews' | 'qa'>('story');

  // Add to Cart Flying Animation state
  const [isFlying, setIsFlying] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Interactive Image Hover Magnifier & 3D Tilt State
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Show sticky bottom bar on scroll past hero purchase block
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reviews state
  const [reviews, setReviews] = useState(initialReviews);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Q&A state
  const [questions, setQuestions] = useState(initialQuestions);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  const { addItem, toggleCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  const isLiked = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = () => {
    // Add item to cart state without opening sidebar cart immediately
    const itemId = selectedVariant ? `${product.id}_${selectedVariant.id}` : product.id;
    const selectedImg = selectedImage || (product.images && product.images[0]) || '';

    addItem({
      id: itemId,
      productId: product.id,
      variantId: selectedVariant ? `${product.id}_${selectedVariant.id}` : undefined,
      name: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      image: selectedImg,
    }, quantity, false);

    setIsFlying(true);
    setAddedSuccess(true);

    // Open sidebar cart after smooth animation completes
    setTimeout(() => {
      setIsFlying(false);
      toggleCart(true);
    }, 1050);

    setTimeout(() => {
      setAddedSuccess(false);
    }, 2400);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev = {
      id: Date.now().toString(),
      rating: newRating,
      title: 'Customer Experience',
      comment: newComment,
      status: 'approved',
      is_verified_purchase: true,
      users: { full_name: 'You (Verified Buyer)' },
      created_at: new Date().toISOString(),
    };

    setReviews([newRev, ...reviews]);
    setNewComment('');
    setReviewSubmitted(true);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQ = {
      id: Date.now().toString(),
      question: newQuestion,
      users: { full_name: 'You' },
      product_answers: [],
      created_at: new Date().toISOString(),
    };

    setQuestions([newQ, ...questions]);
    setNewQuestion('');
    setQuestionSubmitted(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 relative overflow-x-hidden">

      {/* Soft Luxury Floral Ambiance Accents */}
      <img
        src="/Hero/CollectionHero/floral-corner.png"
        alt=""
        className="absolute top-0 left-0 w-44 sm:w-72 md:w-88 opacity-20 pointer-events-none select-none -translate-x-[20%] -translate-y-[15%] rotate-[-8deg] filter blur-[0.2px] z-0"
      />
      <img
        src="/Hero/CollectionHero/floral-corner.png"
        alt=""
        className="absolute top-1/3 right-0 w-44 sm:w-80 md:w-96 opacity-15 pointer-events-none select-none translate-x-[20%] rotate-[165deg] scale-x-[-1] filter blur-[0.2px] z-0"
      />

      {/* Breadcrumb Navigation: Home >> [Category Name] >> Product Name */}
      <nav aria-label="Breadcrumb" className="w-full flex items-center flex-wrap gap-1.5 text-xs text-[#7A1840]/70 font-medium py-1 relative z-10">
        <Link href="/" className="hover:text-[#4A0D25] hover:underline transition-colors flex items-center gap-1 font-semibold">
          <span>Home</span>
        </Link>
        <span className="text-[#D45A7A] text-[10px] font-bold">&gt;&gt;</span>
        <Link
          href={categorySlug ? `/products?category=${categorySlug}` : '/products'}
          className="hover:text-[#4A0D25] hover:underline transition-colors capitalize font-semibold"
        >
          {categoryName}
        </Link>
        <span className="text-[#D45A7A] text-[10px] font-bold">&gt;&gt;</span>
        <span className="text-[#4A0D25] font-bold truncate max-w-[200px] sm:max-w-md" title={product.name}>
          {product.name}
        </span>
      </nav>

      {/* SPECTACULAR LUXURY FLYING BOTTLE ANIMATION TO CART */}
      <AnimatePresence>
        {isFlying && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-[99999]">
            <motion.div
              initial={{
                position: 'absolute',
                left: '30%',
                top: '40%',
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                left: ['30%', '55%', '85%'],
                top: ['40%', '18%', '3.5%'],
                scale: [1, 1.3, 0.2],
                rotate: [0, 180, 360],
                opacity: [1, 1, 0.2],
              }}
              transition={{
                duration: 1.1,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="flex items-center justify-center"
            >
              {/* Pulsing Rose-Gold Aura behind flying bottle */}
              <div className="absolute w-36 h-36 bg-gradient-radial from-[#D45A7A] via-[#F6A6BB]/70 to-transparent rounded-full blur-2xl animate-ping" />
              <div className="absolute w-24 h-24 bg-[#FFD700]/40 rounded-full blur-xl animate-pulse" />
              
              {/* Flying Bottle Image */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-[0_0_40px_rgba(212,90,122,0.9)]">
                <Image
                  src={selectedImage || product.images?.[0]}
                  alt="Flying Bottle"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Sparkle Particle Trail */}
              <motion.div
                animate={{ scale: [0.8, 1.6, 0], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="absolute -bottom-4 text-[#D45A7A]"
              >
                <Sparkles className="w-8 h-8 fill-[#D45A7A]" />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start w-full relative z-10">
        
        {/* Left: Gallery with Hero-Style Aura Glow & No Borders */}
        <div className="space-y-4 w-full overflow-hidden">
          <div className="relative aspect-square w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden rounded-3xl">
            
            {/* Background Watermark Text - Strictly behind everything (z-0) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-full flex justify-center text-center pointer-events-none overflow-hidden opacity-15 z-0 px-2">
              <span className="font-serif text-2xl sm:text-5xl font-black uppercase tracking-wider text-[#1A0510] leading-tight text-center truncate block select-none">
                {product.name}
              </span>
            </div>

            {/* Pinkish Radial Aura Glow (Hero Style) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[420px] sm:h-[420px] bg-gradient-radial from-[#F6A6BB]/50 via-[#F4BBC9]/30 to-transparent rounded-full blur-[50px] sm:blur-[90px] pointer-events-none z-0 animate-pulse" />

            {/* Studio Ground Shadow */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-[#4A0D25]/15 rounded-full blur-xl pointer-events-none z-10" />

            {/* Interactive 3D Parallax & Cursor-Tracking Magnified Bottle Image Container */}
            <div
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full h-full z-30 flex items-center justify-center cursor-zoom-in group select-none overflow-hidden rounded-3xl"
            >
              {/* 3D Parallax Tilt Layer */}
              <div
                className="relative w-full h-full transition-transform duration-200 ease-out flex items-center justify-center"
                style={{
                  transform: isHovered
                    ? `perspective(1000px) rotateX(${(zoomPos.y - 50) * -0.12}deg) rotateY(${(zoomPos.x - 50) * 0.12}deg) scale(1.03)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                }}
              >
                <Image
                  src={selectedImage || product.images?.[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_50px_rgba(74,13,37,0.18)] transition-transform duration-300 ease-out p-4"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isHovered ? 'scale(2.5)' : 'scale(1)',
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Cursor-Tracking Magnifier Loupe Indicator */}
              <div
                className={`absolute pointer-events-none transition-opacity duration-300 z-40 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${zoomPos.x}%`,
                  top: `${zoomPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-20 h-20 rounded-full border-2 border-[#F6A6BB] bg-white/20 backdrop-blur-xs shadow-[0_0_30px_rgba(246,166,187,0.6)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#4A0D25] animate-ping" />
                </div>
              </div>

              {/* 4K Lightbox Badge */}
              <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-40">
                <Maximize2 className="w-3.5 h-3.5 text-[#F6A6BB]" /> Click for 4K View
              </span>

              {/* Dynamic Store Badges (Admin Section 6) */}
              <div className="absolute top-3 left-3 z-40 flex flex-col gap-1.5 pointer-events-none">
                {product.is_bestseller && (
                  <span className="bg-[#4A0D25] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#F6A6BB] fill-[#F6A6BB]" /> Bestseller
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-700" /> Featured Heritage
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 justify-center pt-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all p-1 bg-gradient-to-b from-[#FFF5F6] to-[#FAE6E7] ${
                    selectedImage === img ? 'ring-2 ring-[#D45A7A] scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6 sm:space-y-7">
          <div>
            {/* Trust & Heritage Subheading Row with Dynamic Store Badges */}
            <div className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs text-[#7A1840]/80 font-medium tracking-wide">
              <span className="flex items-center gap-1 text-[#9A2048] font-semibold">
                <Star className="w-3.5 h-3.5 fill-[#D45A7A] text-[#D45A7A]" /> 4.9 (28 Reviews)
              </span>
              <span className="text-[#D45A7A]/40 font-serif">·</span>
              {product.is_bestseller ? (
                <span className="bg-[#4A0D25] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F6A6BB] fill-[#F6A6BB]" /> Bestseller
                </span>
              ) : product.is_featured ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-700" /> Imperial Selection
                </span>
              ) : (
                <span className="text-[#4A0D25] uppercase tracking-wider font-bold text-[10px] sm:text-[11px]">
                  Artisanal Parfum
                </span>
              )}
              <span className="text-[#D45A7A]/40 font-serif">·</span>
              <span className="text-[#7A1840]/90">
                Hydro-distilled in Kannauj
              </span>
            </div>

            {/* Thin Executive Title */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-[#1A0510] leading-[1.05] sm:leading-[0.95] mt-2">
              {product.name}
            </h1>

            {/* Price Presentation */}
            <div className="flex items-baseline flex-wrap gap-3 mt-3.5">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#1A0510]" suppressHydrationWarning>
                {formatPrice(currentPrice)}
              </span>
              {product.compare_at_price && Number(product.compare_at_price) > Number(currentPrice) && (
                <span className="text-sm sm:text-base text-[#9A2048]/50 line-through font-light" suppressHydrationWarning>
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
              {uniqueVariants.length > 1 && (
                <span className="text-xs text-[#7A1840]/75 font-medium ml-1">
                  · From {formatPrice(minPrice)} (Sample)
                </span>
              )}
            </div>
          </div>

          {/* Clean Short 1-2 Line Excerpt Below Price */}
          <p className="text-xs sm:text-sm text-[#4A0D25]/90 leading-relaxed font-normal border-y border-[#F7D1D8]/60 py-3 my-2">
            {(() => {
              if (!product.description) return '100% Pure botanical hydro-distillate hand-crafted in traditional Kannauj copper deg stills.';
              const sentences = product.description.trim().split(/(?<=[.!?])\s+/);
              const firstSentence = sentences[0] || product.description;
              if (firstSentence.length > 160) {
                return firstSentence.slice(0, 150) + '...';
              }
              return firstSentence;
            })()}
          </p>

          {/* Variant / Size Selector */}
          {uniqueVariants.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7A1840]">
                  Select Size / Bottle Format
                </label>
                {selectedVariant && (
                  <span className="text-[11px] text-[#4A0D25]/75 font-medium">
                    Selected: <strong className="text-[#1A0510] font-semibold">{selectedVariant.name}</strong>
                  </span>
                )}
              </div>

              {groupedVariants ? (
                <div className="space-y-3.5">
                  {Object.entries(groupedVariants).map(([groupTitle, groupItems]) => {
                    if (!groupItems.length) return null;
                    return (
                      <div key={groupTitle} className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A2048]/80 block">
                          {groupTitle}
                        </span>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {groupItems.map((v) => {
                            const isSelected = selectedVariant?.id === v.id || (selectedVariant?.name === v.name && selectedVariant?.price === v.price);
                            return (
                              <button
                                key={v.id || `${v.name}_${v.price}`}
                                onClick={() => setSelectedVariant(v)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-[#4A0D25] text-white border-[#4A0D25] shadow-sm ring-2 ring-[#F6A6BB]/50 scale-[1.02]'
                                    : 'bg-white/90 hover:bg-white text-[#1A0510] border-[#F7D1D8] hover:border-[#D45A7A]'
                                }`}
                                suppressHydrationWarning
                              >
                                <span className="font-semibold">{v.name}</span>
                                <span className={`text-[11px] ${isSelected ? 'text-[#F6A6BB]' : 'text-[#7A1840]/75'}`}>
                                  {formatPrice(v.price)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {uniqueVariants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id || (selectedVariant?.name === v.name && selectedVariant?.price === v.price);
                    return (
                      <button
                        key={v.id || `${v.name}_${v.price}`}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#4A0D25] text-white border-[#4A0D25] shadow-sm ring-2 ring-[#F6A6BB]/50 scale-[1.02]'
                            : 'bg-white/90 hover:bg-white text-[#1A0510] border-[#F7D1D8] hover:border-[#D45A7A]'
                        }`}
                        suppressHydrationWarning
                      >
                        <span className="font-semibold">{v.name}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-[#F6A6BB]' : 'text-[#7A1840]/75'}`}>
                          {formatPrice(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quantity & CTA Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 border-t border-[#F2D4D4]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center border border-[#E8B8B8] rounded-xl bg-white text-xs px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 sm:py-2 text-[#5A1030] font-bold hover:text-[#D45A7A] transition-colors"
                >
                  -
                </button>
                <span className="px-3.5 font-semibold text-[#5A1030]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 sm:py-2 text-[#5A1030] font-bold hover:text-[#D45A7A] transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 sm:p-3.5 rounded-xl border transition-all sm:hidden ${
                  isLiked ? 'bg-[#D45A7A] text-white border-[#D45A7A]' : 'bg-white text-[#5A1030] border-[#E8B8B8]'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addedSuccess}
              className={`flex-1 w-full py-3 sm:py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-[#F7D1D8] cursor-pointer ${
                addedSuccess
                  ? 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] text-[#4A0D25] scale-[1.02]'
                  : 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] hover:from-[#F4BBC9] hover:to-[#F7D1D8] text-[#4A0D25] hover:scale-[1.01]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#4A0D25] animate-bounce" />
                  <span className="font-black tracking-wide text-[#4A0D25]">Added to Cart!</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#4A0D25] animate-spin" />
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#4A0D25]" />
                  <span>Add to Shopping Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`hidden sm:block p-3.5 rounded-xl border transition-all ${
                isLiked ? 'bg-[#D45A7A] text-white border-[#D45A7A]' : 'bg-white text-[#5A1030] border-[#E8B8B8]'
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 text-[10px] sm:text-[11px] text-[#7A1840]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D45A7A] shrink-0" />
              <span>Complimentary 2ml Sampler</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D45A7A] shrink-0" />
              <span>Express Insured Shipping</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs: Story, Scent Notes, Ingredients, Reviews, Q&A */}
      <div className="space-y-6 sm:space-y-8 w-full overflow-hidden">
        <div className="flex border-b border-[#F7D1D8] overflow-x-auto gap-3 sm:gap-8 pb-1 scrollbar-none touch-pan-x w-full max-w-full -mx-1 px-1">
          {(['story', 'notes', 'ingredients', 'reviews', 'qa'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab
                  ? 'border-[#F6A6BB] text-[#4A0D25]'
                  : 'border-transparent text-[#4A0D25]/50 hover:text-[#4A0D25]'
              }`}
            >
              {tab === 'story' && 'Story & Details'}
              {tab === 'notes' && 'Olfactory Notes'}
              {tab === 'ingredients' && 'Ingredients & Origin'}
              {tab === 'reviews' && `Reviews (${reviews.length})`}
              {tab === 'qa' && `Q&A (${questions.length})`}
            </button>
          ))}
        </div>

        {/* Tab 0: Story */}
        {activeTab === 'story' && (
          <div className="p-4 sm:p-8 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-4 animate-in fade-in shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FAE6E7] text-[#4A0D25] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                400-Year Deg-Bhapka Hydro-Distillate
              </span>
              <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                100% Alcohol-Free Pure Elixir
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A0510]">{product.name}</h3>
            <div className="text-xs sm:text-sm text-[#4A0D25] leading-relaxed whitespace-pre-line font-serif space-y-3">
              {product.description || `${product.name} is a rare, hydro-distilled artisanal fragrance created using 400-year-old copper Deg-Bhapka stills in Kannauj.`}
            </div>
          </div>
        )}

        {/* Tab 1: Olfactory Scent Notes */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in">
            <div className="p-4 sm:p-6 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#4A0D25] font-black">Top Notes</span>
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#1A0510]">Opening Impression</h4>
              <p className="text-xs text-[#4A0D25]/80 font-medium">Bright, volatile aromatics dancing for the first 15–30 minutes.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(product.scent_notes?.top || [product.name + ' Essence']).map((n: string) => (
                  <span key={n} className="bg-[#FAE6E7] text-[#4A0D25] text-xs px-2.5 py-1 rounded-full font-bold">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#4A0D25] font-black">Heart Notes</span>
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#1A0510]">The Master Floral Core</h4>
              <p className="text-xs text-[#4A0D25]/80 font-medium">The true identity and signature bouquet unfurling over 2–4 hours.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(product.scent_notes?.heart || [product.name + ' Pure Heart']).map((n: string) => (
                  <span key={n} className="bg-[#FAE6E7] text-[#4A0D25] text-xs px-2.5 py-1 rounded-full font-bold">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-2 shadow-xs">
              <span className="text-[10px] uppercase tracking-widest text-[#4A0D25] font-black">Soul Notes</span>
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#1A0510]">Base Drydown Notes</h4>
              <p className="text-xs text-[#4A0D25]/80 font-medium">Rich, enduring trail lingering on skin for 10+ hours.</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(product.scent_notes?.base || [product.name + ' Royal Base']).map((n: string) => (
                  <span key={n} className="bg-[#FAE6E7] text-[#4A0D25] text-xs px-2.5 py-1 rounded-full font-bold">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="p-4 sm:p-8 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-4 animate-in fade-in shadow-xs">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A0510]">100% Transparent Formula</h3>
            <p className="text-xs text-[#4A0D25] leading-relaxed font-medium">
              We list every single ingredient. Formulated without phthalates, synthetic dyes, parabens, or animal products.
            </p>
            <ul className="list-disc list-inside text-xs text-[#4A0D25] space-y-1 font-mono">
              {(product.ingredients || ['Pure Essential Oil Extract', 'Botanical Carrier Elixir', 'Distilled Floral Nectar']).map((ing: string, i: number) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in">
            {/* Submit Review Box */}
            <form onSubmit={handleReviewSubmit} className="p-4 sm:p-6 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-4 shadow-xs">
              <h4 className="font-serif font-bold text-[#1A0510]">Write a Customer Review</h4>
              {reviewSubmitted ? (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Your review has been submitted for moderation and verified.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#4A0D25] font-bold">Rating:</span>
                    <div className="flex gap-1 text-[#F6A6BB]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`w-5 h-5 cursor-pointer ${star <= newRating ? 'fill-current' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this fragrance..."
                    className="w-full p-3 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl text-xs text-[#1A0510] placeholder-[#4A0D25]/50 focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                  />
                  <button
                    type="submit"
                    className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Submit Verified Review
                  </button>
                </>
              )}
            </form>

            {/* Reviews List */}
            <div className="space-y-3 sm:space-y-4">
              {reviews.map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="p-3.5 sm:p-5 bg-white/80 rounded-2xl border border-[#F7D1D8] space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-extrabold text-xs text-[#1A0510]">
                        {rev.users?.full_name || rev.name || 'Fragrance Collector'}
                      </span>
                      {(rev.is_verified_purchase || rev.verified) && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Buyer
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400 font-medium ml-1">{rev.date || 'Verified'}</span>
                    </div>
                    <div className="flex text-[#F6A6BB]">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  {rev.title && <h5 className="font-serif font-bold text-xs text-[#4A0D25]">{rev.title}</h5>}
                  <p className="text-xs text-[#1A0510] leading-relaxed">{rev.comment || rev.review}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Q&A */}
        {activeTab === 'qa' && (
          <div className="space-y-8 animate-in fade-in">
            <form onSubmit={handleQuestionSubmit} className="p-6 bg-white/80 rounded-2xl border border-[#E8B8B8] space-y-3">
              <h4 className="font-serif font-bold text-[#7A1840]">Ask a Question About This Scent</h4>
              {questionSubmitted ? (
                <p className="text-xs text-emerald-700">Your question has been posted!</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. Is this fragrance suitable for evening wear?"
                    className="flex-1 p-3 bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#D45A7A] hover:bg-[#C94A6A] text-white text-xs font-semibold py-3 px-5 rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Ask
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-4">
              {questions.map((q: any) => (
                <div key={q.id} className="p-5 bg-white/60 rounded-2xl border border-[#E8B8B8] space-y-3">
                  <p className="font-serif font-semibold text-xs text-[#7A1840]">Q: {q.question}</p>
                  {q.product_answers?.map((ans: any) => (
                    <div key={ans.id} className="pl-4 border-l-2 border-[#D45A7A] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#5A1030]">{ans.users?.full_name || 'Master Perfumer'}</span>
                        {ans.is_official && (
                          <span className="bg-[#B03060] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Official Answer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A1030]">{ans.answer}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM BAR FOR ADD TO CART ON SCROLL */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F7D1D8] shadow-[0_-10px_30px_rgba(74,13,37,0.12)] px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
              {/* Left: Product Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#FAE6E7] border border-[#F7D1D8] flex-shrink-0 hidden sm:block">
                  <Image
                    src={selectedImage || (product.images && product.images[0]) || ''}
                    alt={product.name}
                    fill
                    className="object-contain p-1 mix-blend-multiply"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-extrabold text-xs sm:text-sm text-[#1A0510] truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs font-bold text-[#4A0D25]" suppressHydrationWarning>
                    {selectedVariant ? selectedVariant.name + ' — ' : ''}{formatPrice(currentPrice)}
                  </p>
                </div>
              </div>

              {/* Right: Quantity Selector + Add to Cart */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Quantity Selector: - 1 + */}
                <div className="flex items-center border border-[#F7D1D8] rounded-xl bg-white text-xs px-1 py-0.5 shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-[#4A0D25] font-extrabold hover:text-[#F6A6BB] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-2 font-bold text-[#1A0510]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-[#4A0D25] font-extrabold hover:text-[#F6A6BB] transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Shopping Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedSuccess}
                  className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 sm:gap-2 transition-all transform active:scale-95 whitespace-nowrap border border-[#F7D1D8] cursor-pointer ${
                    addedSuccess
                      ? 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] text-[#4A0D25]'
                      : 'bg-gradient-to-r from-[#F6A6BB] to-[#F4BBC9] hover:from-[#F4BBC9] hover:to-[#F7D1D8] text-[#4A0D25]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A0D25]" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A0D25]" />
                      <span className="hidden sm:inline">Add to Shopping Cart</span>
                      <span className="sm:hidden">Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FULL-SCREEN 4K LIGHTBOX MODAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-50 border border-white/20"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Display */}
            <div
              className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage || product.images?.[0]}
                alt={product.name}
                fill
                className="object-contain p-4 drop-shadow-[0_0_60px_rgba(246,166,187,0.4)]"
                sizes="100vw"
              />
            </div>

            {/* Image Gallery Switcher Bar at Bottom */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 z-50">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(img);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden transition-all ${
                      selectedImage === img ? 'ring-2 ring-[#F6A6BB] scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Gallery ${idx}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
