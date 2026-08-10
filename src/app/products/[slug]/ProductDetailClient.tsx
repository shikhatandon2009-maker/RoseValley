'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingBag, CheckCircle2, ShieldCheck, Sparkles, MessageSquare, ThumbsUp, Send } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'notes' | 'ingredients' | 'reviews' | 'qa'>('notes');

  // Add to Cart Flying Animation state
  const [isFlying, setIsFlying] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

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
    addItem({
      id: itemId,
      productId: product.id,
      variantId: selectedVariant ? `${product.id}_${selectedVariant.id}` : undefined,
      name: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      image: selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 relative">

      {/* SPECTACULAR LUXURY FLYING BOTTLE ANIMATION TO CART */}
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{
              position: 'fixed',
              left: '30%',
              top: '40%',
              scale: 1,
              opacity: 1,
              rotate: 0,
              zIndex: 99999,
            }}
            animate={{
              left: ['30%', '55%', '88%'],
              top: ['40%', '18%', '3.5%'],
              scale: [1, 1.3, 0.2],
              rotate: [0, 180, 360],
              opacity: [1, 1, 0.2],
            }}
            transition={{
              duration: 1.1,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="pointer-events-none flex items-center justify-center"
          >
            {/* Pulsing Rose-Gold Aura behind flying bottle */}
            <div className="absolute w-36 h-36 bg-gradient-radial from-[#D45A7A] via-[#F6A6BB]/70 to-transparent rounded-full blur-2xl animate-ping" />
            <div className="absolute w-24 h-24 bg-[#FFD700]/40 rounded-full blur-xl animate-pulse" />
            
            {/* Flying Bottle Image */}
            <div className="relative w-32 h-32 drop-shadow-[0_0_40px_rgba(212,90,122,0.9)]">
              <Image
                src={selectedImage || product.images?.[0]}
                alt="Flying Bottle"
                fill
                className="object-contain mix-blend-multiply"
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
        )}
      </AnimatePresence>
      
      {/* Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Gallery with Hero-Style Aura Glow & No Borders */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full flex items-center justify-center p-4">
            
            {/* Background Watermark Text - Strictly behind everything (z-0) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center text-center pointer-events-none overflow-hidden opacity-15 z-0">
              <span className="font-serif text-3xl sm:text-5xl font-black uppercase tracking-[0.15em] text-[#1A0510] leading-tight text-center block select-none">
                {product.name}
              </span>
            </div>

            {/* Pinkish Radial Aura Glow (Hero Style) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] bg-gradient-radial from-[#F6A6BB]/50 via-[#F4BBC9]/30 to-transparent rounded-full blur-[90px] pointer-events-none z-0 animate-pulse" />

            {/* Studio Ground Shadow */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-[#4A0D25]/15 rounded-full blur-xl pointer-events-none z-10" />

            {/* Main Product Bottle Image Container (z-30) with 200% Hover Zoom */}
            <div className="relative w-full h-full z-30 flex items-center justify-center cursor-zoom-in group">
              <Image
                src={selectedImage || product.images?.[0]}
                alt={product.name}
                fill
                priority
                className="object-contain mix-blend-multiply drop-shadow-[0_0_80px_rgba(246,166,187,0.5)] group-hover:scale-[2.0] transition-transform duration-500 ease-out z-30 relative p-4 origin-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-contain p-1 mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#B03060] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Artisanal Parfum
              </span>
              <span className="text-xs text-[#9A2048] flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 fill-current text-[#D45A7A]" /> 4.9 (28 Reviews)
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#7A1840] mt-2">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="font-serif font-bold text-2xl text-[#5A1030]">
                {formatPrice(currentPrice)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-[#9A2048]/60 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5A1030] leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#7A1840]">Select Size / Bottle Format</label>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-[#D45A7A] text-white border-[#D45A7A] shadow-sm'
                        : 'bg-white text-[#5A1030] border-[#E8B8B8] hover:border-[#D45A7A]'
                    }`}
                  >
                    {v.name} — {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#F2D4D4]">
            <div className="flex items-center border border-[#E8B8B8] rounded-xl bg-white text-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-[#5A1030] font-bold hover:text-[#D45A7A]"
              >
                -
              </button>
              <span className="px-4 font-semibold text-[#5A1030]">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-[#5A1030] font-bold hover:text-[#D45A7A]"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addedSuccess}
              className={`flex-1 w-full py-3.5 rounded-xl font-semibold text-sm shadow-luxury flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                addedSuccess
                  ? 'bg-gradient-to-r from-[#D45A7A] to-[#B03060] text-white scale-[1.02] ring-2 ring-[#FFD700]'
                  : 'bg-[#D45A7A] hover:bg-[#C94A6A] text-white hover:scale-[1.01]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#FFD700] animate-bounce" />
                  <span className="font-bold tracking-wide text-white">Added to Cart!</span>
                  <Sparkles className="w-4 h-4 text-[#FFD700] animate-spin" />
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3.5 rounded-xl border transition-all ${
                isLiked ? 'bg-[#D45A7A] text-white border-[#D45A7A]' : 'bg-white text-[#5A1030] border-[#E8B8B8]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 text-[11px] text-[#7A1840]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D45A7A]" />
              <span>Complimentary 2ml Sampler Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D45A7A]" />
              <span>Express Insured Shipping</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs: Scent Notes, Ingredients, Reviews, Q&A */}
      <div className="space-y-8">
        <div className="flex border-b border-[#E8B8B8] overflow-x-auto gap-8">
          {(['notes', 'ingredients', 'reviews', 'qa'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#D45A7A] text-[#7A1840]'
                  : 'border-transparent text-[#9A2048]/60 hover:text-[#7A1840]'
              }`}
            >
              {tab === 'notes' && 'Olfactory Notes'}
              {tab === 'ingredients' && 'Ingredients & Origin'}
              {tab === 'reviews' && `Verified Reviews (${reviews.length})`}
              {tab === 'qa' && `Q&A (${questions.length})`}
            </button>
          ))}
        </div>

        {/* Tab 1: Olfactory Scent Notes */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="p-6 bg-white/70 rounded-2xl border border-[#E8B8B8] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#B03060] font-bold">Head Notes</span>
              <h4 className="font-serif text-lg font-bold text-[#5A1030]">Top Scent Notes</h4>
              <p className="text-xs text-[#7A1840]">The immediate sensory impression upon application.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.scent_notes?.top?.map((n: string) => (
                  <span key={n} className="bg-[#F8E8E8] text-[#9A2048] text-xs px-3 py-1 rounded-full font-medium">
                    {n}
                  </span>
                )) || <span className="text-xs text-gray-500">Fresh Bergamot, Pink Pepper</span>}
              </div>
            </div>

            <div className="p-6 bg-white/70 rounded-2xl border border-[#E8B8B8] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#B03060] font-bold">Heart Notes</span>
              <h4 className="font-serif text-lg font-bold text-[#5A1030]">Heart / Body Notes</h4>
              <p className="text-xs text-[#7A1840]">The soul of the fragrance emerging after 15 minutes.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.scent_notes?.heart?.map((n: string) => (
                  <span key={n} className="bg-[#F8E8E8] text-[#9A2048] text-xs px-3 py-1 rounded-full font-medium">
                    {n}
                  </span>
                )) || <span className="text-xs text-gray-500">Bulgarian Rose, Jasmine</span>}
              </div>
            </div>

            <div className="p-6 bg-white/70 rounded-2xl border border-[#E8B8B8] space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#B03060] font-bold">Soul Notes</span>
              <h4 className="font-serif text-lg font-bold text-[#5A1030]">Base Drydown Notes</h4>
              <p className="text-xs text-[#7A1840]">Rich, enduring trail lingering for 10+ hours.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.scent_notes?.base?.map((n: string) => (
                  <span key={n} className="bg-[#F8E8E8] text-[#9A2048] text-xs px-3 py-1 rounded-full font-medium">
                    {n}
                  </span>
                )) || <span className="text-xs text-gray-500">Velvet Oud, Golden Amber</span>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className="glass-panel p-8 rounded-2xl border border-[#E8B8B8] space-y-4 animate-in fade-in">
            <h3 className="font-serif text-xl font-bold text-[#7A1840]">100% Transparent Formula</h3>
            <p className="text-xs text-[#5A1030] leading-relaxed">
              We list every single ingredient. Formulated without phthalates, synthetic dyes, parabens, or animal products.
            </p>
            <ul className="list-disc list-inside text-xs text-[#7A1840] space-y-1 font-mono">
              {product.ingredients?.map((ing: string, i: number) => (
                <li key={i}>{ing}</li>
              )) || <li>Organic Cane Alcohol, Parfum (Pure Essential Oil Extracts), Water</li>}
            </ul>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Submit Review Box */}
            <form onSubmit={handleReviewSubmit} className="p-6 bg-white/80 rounded-2xl border border-[#E8B8B8] space-y-4">
              <h4 className="font-serif font-bold text-[#7A1840]">Write a Customer Review</h4>
              {reviewSubmitted ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your review has been submitted for moderation and verified.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5A1030]">Rating:</span>
                    <div className="flex gap-1 text-[#D45A7A]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`w-5 h-5 cursor-pointer ${star <= newRating ? 'fill-current' : 'text-[#E8B8B8]'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this fragrance..."
                    className="w-full p-3 bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl text-xs text-[#5A1030] placeholder-[#9A2048]/60 focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#D45A7A] hover:bg-[#C94A6A] text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-all"
                  >
                    Submit Verified Review
                  </button>
                </>
              )}
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev: any) => (
                <div key={rev.id} className="p-5 bg-white/60 rounded-2xl border border-[#E8B8B8] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-semibold text-xs text-[#5A1030]">
                        {rev.users?.full_name || 'Anonymous Collector'}
                      </span>
                      {rev.is_verified_purchase && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex text-[#D45A7A]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#5A1030]">{rev.comment}</p>
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
    </div>
  );
}
