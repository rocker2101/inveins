'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Zap, Heart, Check, ArrowRight, ShieldCheck, Ruler } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    openExpressBuy,
    isInWishlist,
    toggleWishlist,
    setIsSizeGuideOpen,
  } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!quickViewProduct) return null;

  const currentSize = selectedSize || quickViewProduct.sizes[0] || 'M';
  const isWish = isInWishlist(quickViewProduct.id);
  const isSoldOut = quickViewProduct.availableStock === 0 || quickViewProduct.badge === 'SOLD OUT';

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(quickViewProduct, currentSize);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      closeQuickView();
    }, 900);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    closeQuickView();
    openExpressBuy(quickViewProduct, currentSize);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-[#faf9f5] border border-[#e6e2d8] shadow-2xl overflow-hidden animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-2.5 right-2.5 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/90 hover:bg-white text-[#141413] transition-colors rounded-full shadow-sm"
          aria-label="Close Quick View"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Product Image Column */}
          <div className="relative aspect-[3/4] md:aspect-auto bg-[#f0ede6] min-h-[300px] md:min-h-[460px]">
            <Image
              src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {quickViewProduct.badge && (
              <span className={`absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase ${
                quickViewProduct.badge === 'HOT' ? 'bg-[#cc785c] text-white' :
                quickViewProduct.badge === 'NEW' ? 'bg-[#141413] text-white' :
                quickViewProduct.badge === 'SOLD OUT' ? 'bg-neutral-600 text-white' :
                'bg-[#141413] text-white'
              }`}>
                {quickViewProduct.badge}
              </span>
            )}
            <button
              onClick={() => toggleWishlist(quickViewProduct.id)}
              className={`absolute top-2.5 right-14 md:right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                isWish ? 'bg-red-50 text-red-600' : 'bg-white/90 hover:bg-white text-[#141413]'
              }`}
              title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={18} fill={isWish ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Product Details Column */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#6c6a64] uppercase">
                  {quickViewProduct.category} {quickViewProduct.fit && `• ${quickViewProduct.fit}`}
                </span>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#141413] tracking-tight mt-1">
                  {quickViewProduct.name}
                </h3>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-lg sm:text-xl font-bold text-[#141413]">
                    {quickViewProduct.currency}{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#15803D] font-semibold flex items-center gap-1">
                    <Check size={12} /> In Stock ({quickViewProduct.availableStock} available)
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#6c6a64] leading-relaxed">
                {quickViewProduct.tagline || quickViewProduct.description}
              </p>

              {/* Size Selector */}
              <div className="space-y-2 pt-2 border-t border-[#e6e2d8]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    Select Size: <span className="text-[#cc785c] font-black">{currentSize}</span>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] text-[#6c6a64] hover:text-[#141413] flex items-center gap-1 underline underline-offset-2 min-h-[36px]"
                  >
                    <Ruler size={13} /> Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map(size => {
                    const isSelected = size === currentSize;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-11 px-3 text-xs font-bold transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#141413] text-[#faf9f5] shadow-sm'
                            : 'bg-white border border-[#e6e2d8] text-[#141413] hover:border-[#141413]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Key Specs */}
              {quickViewProduct.details && quickViewProduct.details.length > 0 && (
                <div className="space-y-1.5 pt-2 text-[11px] text-[#6c6a64]">
                  {quickViewProduct.details.slice(0, 3).map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c]" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-[#e6e2d8]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className="w-full min-h-[46px] py-2.5 px-3 bg-white border border-[#141413] text-[#141413] hover:bg-[#141413] hover:text-white active:bg-neutral-100 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShoppingBag size={14} />
                  {addedNotice ? 'ADDED!' : 'ADD TO BAG'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isSoldOut}
                  className="w-full min-h-[46px] py-2.5 px-3 bg-[#141413] hover:bg-black active:bg-neutral-800 text-[#faf9f5] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <Zap size={14} className="text-[#cc785c] fill-[#cc785c]" />
                  BUY NOW
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6c6a64] pt-1">
                <Link
                  href={`/product/${quickViewProduct.id}`}
                  onClick={closeQuickView}
                  className="hover:text-[#141413] font-semibold flex items-center gap-1 underline underline-offset-2"
                >
                  View Full Product Details <ArrowRight size={13} />
                </Link>
                <span className="flex items-center gap-1 text-[10px]">
                  <ShieldCheck size={13} className="text-[#15803D]" /> 7-Day Free Exchange
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
