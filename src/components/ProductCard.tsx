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
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleCardWishlist}
            className={`p-2 rounded-full transition-all duration-200 shadow-sm ${
              isWish
                ? 'bg-red-50 text-red-600'
                : 'bg-white/90 hover:bg-white text-[#141413] hover:text-[#cc785c]'
            }`}
            aria-label={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={15} fill={isWish ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleCardQuickView}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-[#141413] hover:text-black transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Quick Preview"
          >
            <Eye size={15} />
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
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#6c6a64] mb-1">
            <span>{product.category}</span>
            {product.fit && <span>{product.fit}</span>}
          </div>

          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#141413] group-hover:text-[#cc785c] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-[#6c6a64] mt-1 line-clamp-2 leading-relaxed hidden sm:block">
            {product.tagline}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#e6e2d8]/60 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-sm sm:text-base text-[#141413]">
              {product.currency}{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#6c6a64] font-medium">
              Tax Incl.
            </span>
          </div>

          {!isSoldOut ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={(e) => handleQuickAdd(e, selectedSize)}
                className="w-full py-2 px-2 bg-white border border-[#141413] hover:bg-[#faf9f5] text-[#141413] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
              >
                <ShoppingBag size={12} />
                Bag
              </button>

              <button
                onClick={() => openExpressBuy(product, selectedSize)}
                className="w-full py-2 px-2 bg-[#141413] hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
              >
                <Zap size={12} className="text-[#cc785c] fill-[#cc785c]" />
                1-Click
              </button>
            </div>
          ) : (
            <div className="w-full py-2 text-center bg-neutral-100 text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
              SOLD OUT
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
