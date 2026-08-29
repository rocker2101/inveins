'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Search } from 'lucide-react';

export default function RetailPage() {
  const { productsList } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'low-high' | 'high-low'>('newest');

  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory ||
        (selectedCategory === 'Essentials' && product.category === 'Tees') ||
        (selectedCategory === 'Layers' && (product.category === 'Outerwear' || product.category === 'Layers')) ||
        (selectedCategory === 'Bottoms' && product.category === 'Denim');

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      return 0;
    });
  }, [productsList, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Page Header Banner */}
      <div className="border-b border-[#e5e4df] pb-6">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          INDIVIDUAL COLLECTION
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          RETAIL
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2 max-w-lg">
          The complete INVEINS collection, made for your everyday rotation.
        </p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 border border-[#e5e4df]">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search the collection..."
            className="w-full bg-[#f5f4f0] border border-[#e5e4df] pl-9 pr-4 py-2 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#f5f4f0] border border-[#e5e4df] px-3 py-2 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
          >
            <option value="All">All</option>
            <option value="Essentials">Essentials</option>
            <option value="Layers">Layers</option>
            <option value="Bottoms">Bottoms</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#f5f4f0] border border-[#e5e4df] px-3 py-2 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
          >
            <option value="newest">Newest</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>

        </div>

      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}
