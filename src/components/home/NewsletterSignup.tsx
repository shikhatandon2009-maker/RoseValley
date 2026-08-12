'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="py-14 bg-[#4A0D25] text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at center, #F6A6BB 0%, transparent 70%)' }} />
      <div className="max-w-2xl mx-auto px-4 relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-extrabold uppercase tracking-widest">
          <Mail className="w-3.5 h-3.5 text-[#F6A6BB]" /> Exclusive Access
        </div>
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white">
          Get 15% Off Your First Order
        </h2>
        <p className="text-sm text-white/70 font-medium max-w-lg mx-auto">
          Join our private mailing list for early access to new harvests, exclusive attar releases, and heritage collection drops.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold max-w-md mx-auto">
            ✓ Welcome! Check your inbox for your 15% discount code.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] focus:border-transparent"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-6 py-3 rounded-full bg-[#F6A6BB] text-[#4A0D25] font-extrabold text-xs uppercase tracking-widest hover:bg-[#F4BBC9] transition-all shadow-md"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="text-[10px] text-white/40 font-medium">No spam. Unsubscribe anytime. We respect your privacy.</p>
      </div>
    </section>
  );
}
