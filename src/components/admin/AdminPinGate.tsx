'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Sparkles, KeyRound, AlertCircle, LogOut } from 'lucide-react';

const CORRECT_PIN = '198411';
const STORAGE_KEY = 'rv_admin_pin_unlocked_198411';

export function AdminPinGate({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedPin = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (savedPin === CORRECT_PIN) {
      setUnlocked(true);
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullPin = newPin.join('');
    if (fullPin.length === 6) {
      if (fullPin === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, CORRECT_PIN);
        sessionStorage.setItem(STORAGE_KEY, CORRECT_PIN);
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPin(['', '', '', '', '', '']);
  };

  if (!mounted) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex items-center justify-center p-4 selection:bg-[#F6A6BB] selection:text-neutral-950">
        <div className="w-full max-w-md bg-white border-2 border-[#F7D1D8] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-center relative overflow-hidden animate-fade-in">
          {/* Ambient Decorative Accents */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#F6A6BB]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#F4BBC9]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#F6A6BB] via-[#F4BBC9] to-[#F7D1D8] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#4A0D25] rounded-[22px] flex items-center justify-center">
                <Lock className={`w-8 h-8 ${error ? 'text-rose-400 animate-bounce' : 'text-[#F6A6BB]'}`} />
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#F6A6BB] text-[#4A0D25] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#4A0D25]" />
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl tracking-wider text-[#1A0510]">
              ROSE VALLEY KANNAUJ
            </h1>
            <p className="text-xs uppercase font-black tracking-widest text-[#4A0D25]">
              Admin Security Gate
            </p>
            <p className="text-xs text-[#4A0D25] font-bold max-w-xs mx-auto">
              Enter 6-digit security PIN to access Executive Suite
            </p>
          </div>

          {/* PIN Input Grid */}
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-serif text-2xl font-black rounded-2xl bg-[#FAE6E7] border-2 transition-all duration-200 focus:outline-none ${
                    error
                      ? 'border-rose-500 text-rose-600 bg-rose-50 animate-pulse'
                      : digit
                      ? 'border-[#F6A6BB] text-[#1A0510] bg-white shadow-md'
                      : 'border-[#F7D1D8] text-[#1A0510] focus:border-[#F6A6BB] focus:bg-white'
                  }`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-black animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Invalid Security PIN. Please try again.
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="pt-4 border-t border-[#F7D1D8] flex items-center justify-center gap-1.5 text-xs font-black text-[#4A0D25]">
            <ShieldCheck className="w-4 h-4 text-[#F6A6BB]" />
            <span>Encrypted Administrator Access</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Top Header Lock Button injection context */}
      <div className="fixed top-3.5 right-4 z-50">
        <button
          onClick={handleLock}
          className="px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] font-black text-xs flex items-center gap-1.5 transition-all shadow-xs"
          title="Lock Admin Portal"
        >
          <Lock className="w-3.5 h-3.5 text-[#4A0D25]" />
          <span>Lock Portal</span>
        </button>
      </div>

      {children}
    </div>
  );
}
