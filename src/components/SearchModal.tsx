'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, productsList } = useCart();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredProducts = productsList.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.tagline.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-2xl border border-[#e5e4df] shadow-2xl overflow-hidden">
        
        {/* Search Bar Input */}
        <div className="p-4 bg-white border-b border-[#e5e4df] flex items-center gap-3">
          <Search size={20} className="text-[#737373]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, collections, categories..."
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-[#171717] focus:outline-none placeholder-[#737373]"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#737373] hover:text-[#171717]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="text-center py-8">
              <p className="text-xs uppercase font-bold tracking-widest text-[#737373]">
                POPULAR SEARCHES
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Tees', 'Outerwear', 'Denim', 'Hoodie', 'Essentials'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-white border border-[#e5e4df] hover:border-[#171717] text-xs font-semibold text-[#171717] px-3.5 py-1.5 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#737373]">
              No products found matching "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#737373]">
                FOUND {filteredProducts.length} PRODUCTS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex gap-3 p-3 bg-white border border-[#e5e4df] hover:border-[#171717] transition-colors group"
                  >
                    <div className="relative w-16 h-20 bg-[#f0efe9] flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-heading font-bold text-sm text-[#171717] group-hover:underline">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#737373] line-clamp-1">{product.tagline}</p>
                      <p className="text-xs font-bold text-[#171717] mt-1">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
