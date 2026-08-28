import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENCY_SYMBOLS } from '../lib/constants';

export interface CurrencyState {
  currency: string;
  rates: Record<string, number>;
  setCurrency: (code: string) => void;
  setRates: (rates: Record<string, number>) => void;
  formatPrice: (amountInINR: number) => string;
}

export const useCurrencyStoreBase = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      rates: { INR: 1.0, USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044 },
      setCurrency: (code) => set({ currency: code }),
      setRates: (rates) => set({ rates }),
      formatPrice: (amountInINR: number) => {
        const { currency, rates } = get();
        const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
        const rate = rates[currency] || (currency === 'GBP' ? 0.0095 : 0.012);
        const converted = amountInINR * rate;

        if (currency === 'INR') {
          return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        }
        return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    }),
    {
      name: 'roseoil_currency_setting',
    }
  )
);

export function useCurrencyStore() {
  const store = useCurrencyStoreBase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return {
      ...store,
      currency: 'INR',
      formatPrice: (amountInINR: number) => {
        return `₹${amountInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      },
    };
  }

  return store;
}
