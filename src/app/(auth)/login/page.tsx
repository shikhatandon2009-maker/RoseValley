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
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server error (${res.status}). Please try again.` };
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F7EEED]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border-2 border-[#F7D1D8] shadow-xl space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#4A0D25] font-black flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Client Portal
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#1A0510]">Sign In to Your Account</h1>
          <p className="text-xs text-[#4A0D25] font-medium">Access your order tracking, wishlist, and fragrance preferences.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        {/* Demo Quick Fill Buttons */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8]">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#4A0D25] block">Quick Demo Login:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@maisonessence.com', 'admin123')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[11px] font-bold text-[#4A0D25] hover:bg-[#F6A6BB] transition-colors shadow-2xs cursor-pointer"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('victoria@example.com', 'customer123')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[11px] font-bold text-[#4A0D25] hover:bg-[#F6A6BB] transition-colors shadow-2xs cursor-pointer"
            >
              Customer Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#4A0D25]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="victoria@example.com"
                className="w-full bg-[#F7EEED] border border-[#F7D1D8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
              />
              <Mail className="w-4 h-4 text-[#4A0D25]/60 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#4A0D25]">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#4A0D25] font-bold hover:underline">
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
                className="w-full bg-[#F7EEED] border border-[#F7D1D8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
              />
              <Lock className="w-4 h-4 text-[#4A0D25]/60 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#F7D1D8] text-xs text-[#4A0D25] font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-[#4A0D25] underline hover:text-[#F6A6BB]">
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
