'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-[#E8B8B8] shadow-luxury space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#B03060] font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Client Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#7A1840]">Sign In to Your Account</h1>
          <p className="text-xs text-[#5A1030]">Access your order tracking, wishlist, and fragrance preferences.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#7A1840]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="victoria@example.com"
                className="w-full bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
              />
              <Mail className="w-4 h-4 text-[#9A2048] absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#7A1840]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#D45A7A] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
              />
              <Lock className="w-4 h-4 text-[#9A2048] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D45A7A] hover:bg-[#C94A6A] text-white py-3 rounded-xl font-semibold text-xs shadow-luxury flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#F2D4D4] text-xs text-[#5A1030]">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-[#D45A7A] hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
