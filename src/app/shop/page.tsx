'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Search, Sparkles, SlidersHorizontal, Check, X, RotateCcw, ChevronDown } from 'lucide-react';

function normalizeCategory(cat: string | null): string {
  if (!cat) return 'All';
  try {
    const decoded = decodeURIComponent(cat.replace(/\+/g, ' ')).trim();
    const lower = decoded.toLowerCase();
    if (lower === 'all' || lower === '') return 'All';
    if (lower === 'tees' || lower === 't-shirts' || lower === 'tshirts' || lower === 'tops' || lower === 't-shirt') return 'Tees';
    if (lower === 'gym compression' || lower === 'compression' || lower === 'gym' || lower === 'activewear') return 'Gym Compression';
    if (lower === 'joggers' || lower === 'lowers' || lower === 'bottoms' || lower === 'bottomwear' || lower === 'pants') return 'Joggers';
    if (lower === 'shirts' || lower === 'polos' || lower === 'shirt' || lower === 'polo') return 'Shirts';
    if (lower === 'outerwear' || lower === 'hoodies' || lower === 'sweatshirts' || lower === 'hoodie' || lower === 'layers') return 'Outerwear';
    if (lower === 'custom b2b' || lower === 'b2b') return 'Custom B2B';
    return decoded;
  } catch (e) {
    return cat;
  }
}

function ShopContent() {
  const { productsList } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => normalizeCategory(searchParams.get('category')));
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedFit, setSelectedFit] = useState<string>('All');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'low-high' | 'high-low'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state whenever URL query params change (e.g. user clicks a category in header mega-menu while already on /shop)
  useEffect(() => {
    const rawCat = searchParams.get('category');
    setSelectedCategory(normalizeCategory(rawCat));

    const q = searchParams.get('search') || searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSelectCategory = (catValue: string) => {
    setSelectedCategory(catValue);
    const params = new URLSearchParams(searchParams.toString());
    if (catValue === 'All') {
      params.delete('category');
    } else {
      params.set('category', catValue);
    }
    const qs = params.toString();
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  };

  const categoriesList = [
    { label: 'All Garments', value: 'All' },
    { label: 'Tees & Tops', value: 'Tees' },
    { label: 'Gym Compression', value: 'Gym Compression' },
    { label: 'Lowers & Joggers', value: 'Joggers' },
    { label: 'Shirts & Polos', value: 'Shirts' },
    { label: 'Hoodies & Layers', value: 'Outerwear' },
    { label: 'Custom B2B Services', value: 'Custom B2B' },
  ];

  const filteredProducts = useMemo(() => {
    const normSelected = selectedCategory.trim().toLowerCase();

    return productsList.filter(product => {
      const normProdCat = product.category.trim().toLowerCase();

      const matchesCategory =
        selectedCategory === 'All' ||
        normProdCat === normSelected ||
        (normSelected === 'tees' && (normProdCat === 'tees' || normProdCat === 't-shirts')) ||
        (normSelected === 'gym compression' && normProdCat === 'gym compression') ||
        (normSelected === 'joggers' && normProdCat === 'joggers') ||
        (normSelected === 'shirts' && normProdCat === 'shirts') ||
        (normSelected === 'outerwear' && normProdCat === 'outerwear');

      const matchesSize = selectedSize === 'All' || product.sizes.includes(selectedSize);
      const matchesFit = selectedFit === 'All' || product.fit === selectedFit;
      const matchesOccasion = selectedOccasion === 'All' || product.occasion === selectedOccasion;

      const matchesPrice =
        priceRange === 'All' ||
        (priceRange === 'under200' && product.price < 200) ||
        (priceRange === '200-300' && product.price >= 200 && product.price <= 300) ||
        (priceRange === 'over300' && product.price > 300);

      const matchesSearch =
        searchTerm.trim() === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

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
    router.replace('/shop', { scroll: false });
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    selectedSize !== 'All' || 
    selectedFit !== 'All' || 
    selectedOccasion !== 'All' || 
    priceRange !== 'All' || 
    searchTerm !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumbs & Header */}
      <div className="border-b border-[#e6e2d8] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6c6a64]">
          <Link href="/" className="hover:text-[#141413]">Home</Link>
          <span>/</span>
          <span className="text-[#141413]">Catalog</span>
          {selectedCategory !== 'All' && (
            <>
              <span>/</span>
              <span className="text-[#cc785c]">
                {categoriesList.find(c => c.value.toLowerCase() === selectedCategory.toLowerCase())?.label || selectedCategory}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight">
            THE CATALOG
          </h1>
          <span className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">
            Showing {filteredProducts.length} Considered Pieces
          </span>
        </div>
      </div>

      {/* Category Horizontal Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoriesList.map(cat => {
          const isActive =
            (cat.value === 'All' && selectedCategory === 'All') ||
            selectedCategory.toLowerCase() === cat.value.toLowerCase();
          return (
            <button
              key={cat.value}
              onClick={() => handleSelectCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-[#141413] text-[#faf9f5] shadow-xs'
                  : 'bg-white border border-[#e6e2d8] text-[#141413] hover:border-[#141413]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar: Search, Mobile Filter Drawer Trigger, Sort Dropdown */}
      <div className="bg-white border border-[#e6e2d8] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6c6a64]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filter by name, GSM, material..."
            className="w-full pl-10 pr-4 py-2 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-semibold text-[#141413] placeholder-[#6c6a64] focus:outline-none focus:border-[#141413]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6c6a64] hover:text-[#141413]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Size Filter Selector (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c6a64] mr-1">
            Size:
          </span>
          {['All', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`px-2.5 py-1 text-xs font-bold transition-all ${
                selectedSize === sz
                  ? 'bg-[#141413] text-white'
                  : 'bg-[#faf9f5] border border-[#e6e2d8] text-[#141413] hover:border-[#141413]'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Controls: Mobile Filter Drawer & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-bold uppercase tracking-wider text-[#141413]"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#cc785c]" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6c6a64] hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-bold uppercase tracking-wider text-[#141413] focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6c6a64]">
            Active Filters:
          </span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e6e2d8] font-bold text-[#141413]">
              Category: {categoriesList.find(c => c.value.toLowerCase() === selectedCategory.toLowerCase())?.label || selectedCategory}
              <button onClick={() => handleSelectCategory('All')}><X size={12} /></button>
            </span>
          )}
          {selectedSize !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e6e2d8] font-bold text-[#141413]">
              Size: {selectedSize}
              <button onClick={() => setSelectedSize('All')}><X size={12} /></button>
            </span>
          )}
          {selectedFit !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e6e2d8] font-bold text-[#141413]">
              Fit: {selectedFit}
              <button onClick={() => setSelectedFit('All')}><X size={12} /></button>
            </span>
          )}
          {priceRange !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e6e2d8] font-bold text-[#141413]">
              Price: {priceRange}
              <button onClick={() => setPriceRange('All')}><X size={12} /></button>
            </span>
          )}
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e6e2d8] font-bold text-[#141413]">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}><X size={12} /></button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-[11px] font-bold text-[#cc785c] hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw size={12} /> Clear All
          </button>
        </div>
      )}

      {/* Main Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center bg-white border border-[#e6e2d8] p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-[#e6e2d8] flex items-center justify-center mx-auto text-[#6c6a64]">
            <Search size={26} />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#141413]">
            NO PIECES MATCH YOUR FILTERS
          </h2>
          <p className="text-xs text-[#6c6a64] max-w-sm mx-auto">
            Try resetting some filters or searching for another silhouette or fabric.
          </p>
          <div className="pt-2">
            <button
              onClick={resetAllFilters}
              className="py-3 px-6 bg-[#141413] hover:bg-black text-[#faf9f5] text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in lg:hidden">
          <div 
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-[#faf9f5] shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-4">
                <h3 className="font-heading font-extrabold text-base uppercase tracking-wider text-[#141413]">
                  FILTER PRODUCTS
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-[#6c6a64] hover:text-[#141413]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  SHOP BY CATEGORY
                </span>
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map(cat => {
                    const isActive =
                      (cat.value === 'All' && selectedCategory === 'All') ||
                      selectedCategory.toLowerCase() === cat.value.toLowerCase();
                    return (
                      <button
                        key={cat.value}
                        onClick={() => handleSelectCategory(cat.value)}
                        className={`px-3 py-1.5 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#141413] text-white'
                            : 'bg-white border border-[#e6e2d8] text-[#141413]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fit Filter */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  SHOP BY FIT
                </span>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Architectural', 'Oversized', 'Structured', 'Slim Fit'].map(fit => (
                    <button
                      key={fit}
                      onClick={() => setSelectedFit(fit)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedFit === fit
                          ? 'bg-[#141413] text-white'
                          : 'bg-white border border-[#e6e2d8] text-[#141413]'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  PRICE RANGE
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', val: 'All' },
                    { label: '< ₹200', val: 'under200' },
                    { label: '₹200 - ₹300', val: '200-300' },
                    { label: '₹300+', val: 'over300' },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setPriceRange(p.val)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${
                        priceRange === p.val
                          ? 'bg-[#141413] text-white'
                          : 'bg-white border border-[#e6e2d8] text-[#141413]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Filter */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  OCCASION
                </span>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Everyday Uniform', 'Studio & Work', 'Weekend & Lounge', 'Gym & Active'].map(occ => (
                    <button
                      key={occ}
                      onClick={() => setSelectedOccasion(occ)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedOccasion === occ
                          ? 'bg-[#141413] text-white'
                          : 'bg-white border border-[#e6e2d8] text-[#141413]'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#e6e2d8] space-y-2">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest"
                >
                  APPLY FILTERS ({filteredProducts.length})
                </button>
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2.5 bg-white border border-[#e6e2d8] text-xs font-bold uppercase tracking-widest text-[#6c6a64]"
                >
                  RESET ALL
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase font-bold tracking-widest text-[#6c6a64]">Loading catalog...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
