'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const TABS = [
  { name: 'Discover', category: 'All' },
  { name: 'T-shirts', category: 'Tees' },
  { name: 'Shirts', category: 'Shirts' },
  { name: 'Joggers', category: 'Joggers' },
  { name: 'Cargos', category: 'Cargos' },
  { name: 'Jeans', category: 'Jeans' },
  { name: 'Gym Compression', category: 'Gym Compression' },
];

export const CategoryStoryBar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Discover');

  return (
    <div className="bg-white border-y border-[#e5e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-3 font-heading font-medium text-sm text-[#171717]">
          {TABS.map(tab => {
            const isActive = activeTab === tab.name;
            return (
              <Link
                key={tab.name}
                href={tab.name === 'Discover' ? '/shop' : `/shop?category=${encodeURIComponent(tab.category)}`}
                onClick={() => setActiveTab(tab.name)}
                className={`relative whitespace-nowrap pb-1.5 transition-colors ${
                  isActive ? 'font-bold text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                {tab.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e11d48] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
