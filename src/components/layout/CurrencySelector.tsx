'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrencyStore } from '@/store/currency-store';
import { Globe, ChevronDown, Check } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  ];

  const activeCode = mounted ? currency : 'INR';
  const currentOption = options.find((opt) => opt.code === activeCode) || options[0];

  // Click-outside listener to close currency dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Luxury Cart-Style Pill Capsule Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="luxury-currency-btn"
        aria-label="Select Currency"
      >
        <Globe className="w-4 h-4 text-[#4A0D25]" />
        <span className="font-medium" suppressHydrationWarning>
          {currentOption.code} ({currentOption.symbol})
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Currency Dropdown Menu matching Cart Preview */}
      {open && (
        <div className="luxury-currency-dropdown-menu">
          <div className="luxury-currency-dropdown-header">
            <span className="luxury-currency-dropdown-title">Select Currency</span>
            <span className="luxury-currency-dropdown-badge">LIVE RATES</span>
          </div>

          <div className="luxury-currency-dropdown-list">
            {options.map((opt) => {
              const isSelected = opt.code === currency;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setCurrency(opt.code);
                    setOpen(false);
                  }}
                  className={`luxury-currency-option-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.flag}</span>
                    <div className="flex flex-direction-column text-left">
                      <span className="luxury-currency-code">{opt.code} ({opt.symbol})</span>
                      <span className="luxury-currency-name">{opt.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#4A0D25]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
