'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Zap, Heart, Eye, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openExpressBuy, openQuickView, addToCart, isInWishlist, toggleWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const isSoldOut = product.badge === 'SOLD OUT' || product.availableStock === 0;
  const isWish = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addToCart(product, size);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1200);
  };

  const handleCardWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCardQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div 
      className="group relative flex flex-col bg-white border border-[#e6e2d8] overflow-hidden hover:border-[#141413] transition-all duration-300 shadow-xs hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#f4f1ea] overflow-hidden">
        <Link href={`/product/${product.id}`} className="relative block w-full h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
        
        {/* Status Badge */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-widest px-2 py-0.5 uppercase ${
              product.badge === 'HOT' ? 'bg-[#cc785c] text-white' :
              product.badge === 'NEW' ? 'bg-[#141413] text-white' :
              product.badge === 'BESTSELLER' ? 'bg-[#15803D] text-white' :
              product.badge === 'LIMITED' ? 'bg-amber-800 text-white' :
              'bg-neutral-600 text-white'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Top-Right Floating Controls (Wishlist & Quick View) */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleCardWishlist}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all duration-200 shadow-sm ${
              isWish
                ? 'bg-red-50 text-red-600 shadow-md'
                : 'bg-white/95 hover:bg-white text-[#141413] hover:text-[#cc785c]'
            }`}
            aria-label={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={18} fill={isWish ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleCardQuickView}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/95 hover:bg-white text-[#141413] hover:text-black transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Quick Preview"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Quick Size Pill Overlay on Hover */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
            <div className="text-[10px] text-white/90 font-bold uppercase tracking-wider mb-1.5 text-center">
              Quick Add Size:
            </div>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {product.sizes.slice(0, 5).map(size => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className="px-2 py-1 text-[10px] font-bold bg-white/90 hover:bg-white text-[#141413] hover:bg-[#cc785c] hover:text-white transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Added Notification Toast on Card */}
        {addedNotice && (
          <div className="absolute inset-0 z-20 bg-black/75 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest gap-1.5 animate-fade-in">
            <Check size={16} className="text-[#cc785c]" />
            Added to Bag
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between space-y-2 sm:space-y-3">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6c6a64] mb-1">
            <span className="truncate">{product.category}</span>
            {product.fit && <span className="truncate ml-1">{product.fit}</span>}
          </div>

          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-heading font-extrabold text-xs sm:text-base text-[#141413] group-hover:text-[#cc785c] transition-colors line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-[#6c6a64] mt-1 line-clamp-2 leading-relaxed hidden sm:block">
            {product.tagline}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#e6e2d8]/60 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-xs sm:text-base text-[#141413]">
              {product.currency}{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#6c6a64] font-medium">
              Tax Incl.
            </span>
          </div>

          {/* Mobile Size Selection Pills */}
          {!isSoldOut && product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar sm:hidden">
              <span className="text-[9px] font-bold uppercase text-[#6c6a64] flex-shrink-0 mr-0.5">Size:</span>
              {product.sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 border flex-shrink-0 transition-colors ${
                    selectedSize === sz
                      ? 'border-[#141413] bg-[#141413] text-white'
                      : 'border-[#e6e2d8] bg-white text-[#6c6a64]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}

          {!isSoldOut ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={(e) => handleQuickAdd(e, selectedSize)}
                className="w-full min-h-[40px] sm:min-h-[38px] py-2 px-1 sm:px-2 bg-white border border-[#141413] hover:bg-[#faf9f5] active:bg-[#f4f1ea] text-[#141413] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                aria-label={`Add ${selectedSize} to bag`}
              >
                <ShoppingBag size={13} />
                Bag
              </button>

              <button
                onClick={() => openExpressBuy(product, selectedSize)}
                className="w-full min-h-[40px] sm:min-h-[38px] py-2 px-1 sm:px-2 bg-[#141413] hover:bg-black active:bg-neutral-800 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                aria-label={`1-Click Buy ${selectedSize}`}
              >
                <Zap size={13} className="text-[#cc785c] fill-[#cc785c]" />
                1-Click
              </button>
            </div>
          ) : (
            <div className="w-full min-h-[40px] flex items-center justify-center py-2 text-center bg-neutral-100 text-neutral-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              SOLD OUT
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
