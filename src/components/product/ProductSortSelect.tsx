'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export function ProductSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || '';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    if (e.target.value) {
      url.searchParams.set('sort', e.target.value);
    } else {
      url.searchParams.delete('sort');
    }
    router.push(url.pathname + url.search);
  };

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-[#F7EEED] border border-[#F7D1D8] rounded-full py-2.5 pl-9 pr-8 text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] cursor-pointer"
      >
        <option value="">Sort by</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="bestseller">Bestseller</option>
        <option value="newest">Newest First</option>
      </select>
      <ArrowUpDown className="w-3.5 h-3.5 text-[#4A0D25]/60 absolute left-3.5 top-3 pointer-events-none" />
    </div>
  );
}
