'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const POPULAR_SEARCHES = [
  'Heavyweight Tee',
  'Acid Wash',
  'Gym Compression',
  'French Terry Lowers',
  'Overshirt',
  'Organic Bamboo',
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, productsList, openQuickView } = useCart();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = productsList.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.tagline.toLowerCase().includes(query.toLowerCase()) ||
    (p.fit && p.fit.toLowerCase().includes(query.toLowerCase())) ||
    (p.occasion && p.occasion.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#faf9f5] md:bg-black/60 md:backdrop-blur-xs flex flex-col md:items-center md:justify-start md:pt-16 md:px-4 animate-fade-in overflow-hidden"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="bg-[#faf9f5] w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl md:border md:border-[#e6e2d8] md:shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#e6e2d8] flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Search size={22} className="text-[#6c6a64] flex-shrink-0 ml-1" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search garment, material, GSM, fit..."
            autoFocus
            className="w-full bg-transparent text-base sm:text-sm font-semibold text-[#141413] focus:outline-none placeholder-[#6c6a64] py-2"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-bold text-[#6c6a64] hover:text-[#141413]"
              aria-label="Clear Search text"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6c6a64] hover:text-[#141413] active:bg-neutral-100 transition-colors"
            aria-label="Close Search"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto pb-safe">
          {query.trim() === '' ? (
            <div className="space-y-6 py-2 sm:py-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest text-[#6c6a64] mb-3">
                  <TrendingUp size={14} className="text-[#cc785c]" />
                  <span>TRENDING SEARCHES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="bg-white border border-[#e6e2d8] hover:border-[#141413] active:bg-[#f4f1ea] text-xs font-bold text-[#141413] px-3.5 py-2.5 min-h-[40px] transition-colors flex items-center gap-1.5"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#e6e2d8] pt-4">
                <span className="text-[10px] font-bold tracking-widest text-[#6c6a64] uppercase block mb-3">
                  BROWSE BY CORE CATEGORY
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Tees & Tops', cat: 'Tees' },
                    { label: 'Gym Compression', cat: 'Gym Compression' },
                    { label: 'French Terry Lowers', cat: 'Joggers' },
                    { label: 'Overshirts', cat: 'Shirts' },
                  ].map(c => (
                    <Link
                      key={c.label}
                      href={`/shop?category=${encodeURIComponent(c.cat)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="p-3 bg-white border border-[#e6e2d8] text-center text-xs font-bold text-[#141413] hover:border-[#141413] active:bg-[#f4f1ea] transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm font-bold text-[#141413]">
                No garments found for "{query}".
              </p>
              <p className="text-xs text-[#6c6a64]">
                Try checking for typos or searching by general category like "Tee", "Compression", or "Joggers".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#6c6a64]">
                  MATCHING PIECES ({filteredProducts.length})
                </span>
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-[#cc785c] hover:underline flex items-center gap-1"
                >
                  View all in catalog <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.slice(0, 8).map(product => (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 bg-white border border-[#e6e2d8] hover:border-[#141413] transition-colors group"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="relative w-16 h-20 bg-[#f4f1ea] flex-shrink-0 overflow-hidden block"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#6c6a64]">
                          {product.category}
                        </span>
                        <Link
                          href={`/product/${product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <h4 className="font-heading font-extrabold text-xs text-[#141413] group-hover:text-[#cc785c] transition-colors line-clamp-1">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-[#6c6a64] line-clamp-1 mt-0.5">
                          {product.tagline}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs font-extrabold text-[#141413]">
                          {product.currency}{product.price.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => {
                            setIsSearchOpen(false);
                            openQuickView(product);
                          }}
                          className="text-[10px] font-bold uppercase tracking-wider text-[#141413] hover:underline"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
