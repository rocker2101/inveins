'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CATEGORY_TABS = [
  { name: 'All Pieces', category: 'All' },
  { name: 'Heavyweight Tees', category: 'Tees' },
  { name: 'Gym Compression', category: 'Gym Compression' },
  { name: 'Baggies & Lowers', category: 'Joggers' },
  { name: 'Polos & Shirts', category: 'Shirts' },
  { name: 'Outerwear & Hoodies', category: 'Outerwear' },
  { name: 'Custom B2B Services', category: 'Custom B2B' },
];

function CategoryStoryBarInner() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category') || 'All';
  const [activeCategory, setActiveCategory] = useState(currentCategory);

  return (
    <div className="bg-[#faf9f5] border-y border-[#e6e2d8] sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-2.5 scrollbar-none text-xs uppercase tracking-wider font-bold">
          {CATEGORY_TABS.map(tab => {
            const isMatch = activeCategory === tab.category || (tab.category === 'All' && activeCategory === 'All');
            return (
              <Link
                key={tab.name}
                href={tab.category === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(tab.category)}`}
                onClick={() => setActiveCategory(tab.category)}
                className={`relative whitespace-nowrap py-1.5 px-1 transition-colors flex items-center gap-1.5 ${
                  isMatch
                    ? 'text-[#141413]'
                    : 'text-[#6c6a64] hover:text-[#141413]'
                }`}
              >
                <span>{tab.name}</span>
                {isMatch && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#cc785c]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const CategoryStoryBar: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="bg-[#faf9f5] border-y border-[#e6e2d8] h-10" />
    }>
      <CategoryStoryBarInner />
    </Suspense>
  );
};
