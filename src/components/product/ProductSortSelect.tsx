'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { id: '', label: 'Default Sorting' },
  { id: 'bestseller', label: 'Bestseller First' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'newest', label: 'Newest First' },
  { id: 'name-asc', label: 'Alphabetical: A → Z' },
];

export function ProductSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentSort = mounted ? (searchParams.get('sort') || '') : '';
  const activeOption = SORT_OPTIONS.find((o) => o.id === currentSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (sortId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortId) {
      params.set('sort', sortId);
    } else {
      params.delete('sort');
    }
    setIsOpen(false);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2.5 px-4 text-xs font-bold text-[#1A0510] opacity-80">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#F6A6BB]" />
        <span>Sort by</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#4A0D25]/60" />
      </div>
    );
  }

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-[#F7EEED] hover:bg-[#FAE6E7] border border-[#F7D1D8] rounded-full py-2.5 px-4 text-xs font-bold text-[#1A0510] transition-all shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-[#F6A6BB]" />
        <span>{activeOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#4A0D25]/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#F7D1D8] shadow-luxury p-1.5 z-50 animate-fadeInUp">
          <div className="text-[10px] font-extrabold text-[#4A0D25]/50 uppercase tracking-widest px-3 py-1.5">
            Sort Products
          </div>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.id === currentSort;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAE6E7] text-[#4A0D25] font-bold'
                    : 'text-[#1A0510] hover:bg-[#F7EEED]'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#F6A6BB]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
