'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { wishlist, productsList, toggleWishlist, addToCart } = useCart();

  const savedProducts = productsList.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#e6e2d8] pb-6 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
            SAVED PIECES
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight mt-1">
            WISHLIST
          </h1>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#6c6a64]">
          {savedProducts.length} Items Saved
        </span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="py-24 text-center bg-white border border-[#e6e2d8] p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-[#e6e2d8] flex items-center justify-center mx-auto text-[#6c6a64]">
            <Heart size={28} />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#141413]">
            NO SAVED PIECES YET
          </h2>
          <p className="text-xs text-[#6c6a64] max-w-sm mx-auto">
            Tap the heart icon on any product in our catalog to save it to your wishlist for later.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#141413] text-[#faf9f5] text-xs font-bold uppercase tracking-widest py-3.5 px-8 hover:bg-black transition-colors"
            >
              EXPLORE CATALOG <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedProducts.map(product => (
            <div 
              key={product.id}
              className="group flex flex-col bg-white border border-[#e6e2d8] overflow-hidden hover:border-[#141413] transition-all"
            >
              <div className="relative aspect-[3/4] w-full bg-[#f4f1ea] overflow-hidden">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6c6a64]">
                    {product.category}
                  </span>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-heading font-extrabold text-sm text-[#141413] line-clamp-1 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-extrabold text-[#141413] mt-1">
                    {product.currency}{product.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e6e2d8] space-y-1.5">
                  <button
                    onClick={() => {
                      addToCart(product, product.sizes[0] || 'M');
                      toggleWishlist(product.id);
                    }}
                    className="w-full py-2 bg-[#141413] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag size={12} />
                    Move to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
