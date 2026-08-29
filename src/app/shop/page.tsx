'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Search, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

function ShopContent() {
  const { productsList } = useCart();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedFit, setSelectedFit] = useState<string>('All');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'low-high' | 'high-low'>('newest');

  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      // Category Match
      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory ||
        (selectedCategory === 'T-shirts' && product.category === 'Tees') ||
        (selectedCategory === 'Essentials' && product.category === 'Tees');

      // Size Match
      const matchesSize = selectedSize === 'All' || product.sizes.includes(selectedSize);

      // Fit Match
      const matchesFit = selectedFit === 'All' || product.fit === selectedFit;

      // Occasion Match
      const matchesOccasion = selectedOccasion === 'All' || product.occasion === selectedOccasion;

      // Price Match
      const matchesPrice =
        priceRange === 'All' ||
        (priceRange === 'under2000' && product.price < 2000) ||
        (priceRange === '2000-3000' && product.price >= 2000 && product.price <= 3000) ||
        (priceRange === 'over3000' && product.price > 3000);

      // Search Match
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSize && matchesFit && matchesOccasion && matchesPrice && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      return 0;
    });
  }, [productsList, selectedCategory, selectedSize, selectedFit, selectedOccasion, priceRange, searchTerm, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setSelectedFit('All');
    setSelectedOccasion('All');
    setPriceRange('All');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedSize !== 'All' || selectedFit !== 'All' || selectedOccasion !== 'All' || priceRange !== 'All' || searchTerm !== '';

  return (
    <div className="space-y-8">
      
      {/* 1. "SHOP YOUR SIZE" QUICK BAR (Snitch Beater Feature) */}
      <div className="bg-white border border-[#e5e4df] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold tracking-widest text-[#171717] uppercase flex items-center gap-1.5">
            <Sparkles size={13} /> SHOP YOUR EXACT SIZE
          </span>
          {selectedSize !== 'All' && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
              FILTERED BY SIZE: {selectedSize}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'].map(sz => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`px-4 py-2 text-xs font-extrabold uppercase border transition-all ${
                selectedSize === sz
                  ? 'bg-[#171717] text-[#f5f4f0] border-[#171717] shadow-sm'
                  : 'bg-[#f5f4f0] text-[#171717] border-[#e5e4df] hover:border-[#171717]'
              }`}
            >
              {sz === 'All' ? 'ALL SIZES' : sz}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ADVANCED INTERACTIVE FILTERS STRIP */}
      <div className="bg-white border border-[#e5e4df] p-5 space-y-4">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search garments, materials, fits..."
              className="w-full bg-[#f5f4f0] border border-[#e5e4df] pl-9 pr-4 py-2.5 text-xs font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] hidden sm:inline">SORT BY:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#f5f4f0] border border-[#e5e4df] px-3 py-2 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
              >
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="low-high">PRICE: LOW TO HIGH</option>
                <option value="high-low">PRICE: HIGH TO LOW</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold uppercase underline text-red-700 hover:text-red-900"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </div>

        {/* Fit & Occasion Pill Badges */}
        <div className="pt-2 border-t border-[#e5e4df]/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Shop by Fit */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">SHOP BY FIT</span>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Architectural', 'Oversized', 'Structured', 'Relaxed Straight'].map(fit => (
                <button
                  key={fit}
                  onClick={() => setSelectedFit(fit)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase border transition-colors ${
                    selectedFit === fit ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-[#f5f4f0] text-[#171717] border-[#e5e4df]'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Shop by Occasion */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">SHOP BY OCCASION</span>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Everyday Uniform', 'Studio & Work', 'Weekend & Lounge'].map(occ => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase border transition-colors ${
                    selectedOccasion === occ ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-[#f5f4f0] text-[#171717] border-[#e5e4df]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Shop by Price */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">SHOP BY PRICE</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'ALL', val: 'All' },
                { label: '< ₹2k', val: 'under2000' },
                { label: '₹2k - ₹3k', val: '2000-3000' },
                { label: '₹3k+', val: 'over3000' },
              ].map(pr => (
                <button
                  key={pr.val}
                  onClick={() => setPriceRange(pr.val)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase border transition-colors ${
                    priceRange === pr.val ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-[#f5f4f0] text-[#171717] border-[#e5e4df]'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 3. CATALOG GRID */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#e5e4df] p-8 space-y-3">
          <p className="text-sm font-bold text-[#171717]">NO GARMENTS MATCH YOUR EXACT FILTERS</p>
          <p className="text-xs text-[#737373]">Try clearing selected size, fit, or price parameters.</p>
          <button
            onClick={resetAllFilters}
            className="bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-wider py-2.5 px-6"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>SHOWING {filteredProducts.length} CONSIDERED GARMENTS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header Banner */}
      <div className="border-b border-[#e5e4df] pb-6">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          CURATED COLLECTION
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          THE CATALOG
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2 max-w-lg">
          Filter by your exact size, fit, occasion, or price point for effortless wardrobe building.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-[#737373]">Loading products...</div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
