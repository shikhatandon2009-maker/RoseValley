'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, User, Phone, Lock, Sparkles, Key, CheckCircle2 } from 'lucide-react';

function RegisterContent() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [generatePasswordMode, setGeneratePasswordMode] = useState(false);
  const [generatedPassResult, setGeneratedPassResult] = useState<string | null>(null);
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password: generatePasswordMode ? undefined : password,
          generatePassword: generatePasswordMode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      if (data.generatedPassword) {
        setGeneratedPassResult(data.generatedPassword);
      } else {
        router.push(redirectTarget);
        router.refresh();
      }
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
            <Sparkles className="w-3.5 h-3.5" /> Luxury Membership
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#7A1840]">Create Your Account</h1>
          <p className="text-xs text-[#5A1030]">Join RoseOil.in for exclusive botanical offers and order history.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {generatedPassResult ? (
          <div className="p-6 bg-white/90 rounded-2xl border border-[#E08A9A] space-y-4 text-center animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-serif font-bold text-[#7A1840] text-base">Account Created Successfully!</h3>
            <p className="text-xs text-[#5A1030]">
              We generated a crypto-secure password for your account and sent a confirmation copy to your email:
            </p>
            <div className="p-3 bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl font-mono text-sm font-bold text-[#5A1030] select-all">
              {generatedPassResult}
            </div>
            <p className="text-[11px] text-[#9A2048]">
              (Please copy this password now. You will be prompted to update it under Account Settings.)
            </p>
            <Link
              href="/account"
              className="inline-block w-full bg-[#D45A7A] text-white py-3 rounded-xl font-semibold text-xs shadow-luxury"
            >
              Continue to Account Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#7A1840]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Victoria Sterling"
                  className="w-full bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
                />
                <User className="w-4 h-4 text-[#9A2048] absolute left-3 top-3" />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-[#7A1840]">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
                />
                <Phone className="w-4 h-4 text-[#9A2048] absolute left-3 top-3" />
              </div>
            </div>

            {/* Toggle: Generate Password Option */}
            <div className="p-3 bg-white/60 rounded-xl border border-[#E8B8B8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#D45A7A]" />
                <span className="text-xs font-semibold text-[#5A1030]">Generate Secure Password</span>
              </div>
              <input
                type="checkbox"
                checked={generatePasswordMode}
                onChange={(e) => setGeneratePasswordMode(e.target.checked)}
                className="w-4 h-4 accent-[#D45A7A] cursor-pointer"
              />
            </div>

            {!generatePasswordMode && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#7A1840]">Choose Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required={!generatePasswordMode}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8E8E8] border border-[#E8B8B8] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#5A1030] focus:outline-none focus:ring-1 focus:ring-[#D45A7A]"
                  />
                  <Lock className="w-4 h-4 text-[#9A2048] absolute left-3 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D45A7A] hover:bg-[#C94A6A] text-white py-3 rounded-xl font-semibold text-xs shadow-luxury flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#F2D4D4] text-xs text-[#5A1030]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#D45A7A] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
