'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openExpressBuy } = useCart();
  const defaultSize = product.sizes[0] || 'M';
  const isSoldOut = product.badge === 'SOLD OUT' || product.availableStock === 0;

  return (
    <div className="group flex flex-col bg-white border border-[#e5e4df] rounded-none overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#f0efe9] overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Status Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 uppercase ${
              product.badge === 'NEW' ? 'bg-[#171717] text-[#f5f4f0]' :
              product.badge === 'LIMITED' ? 'bg-amber-900 text-amber-100' :
              'bg-neutral-300 text-neutral-700'
            }`}>
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading font-bold text-base text-[#171717] group-hover:text-black">
              {product.name}
            </h3>
            <span className="font-bold text-sm text-[#171717]">
              {product.currency}{product.price.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-1 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Action Controls (Express Buy & View) */}
        <div className="pt-2 flex flex-col gap-2">
          {!isSoldOut ? (
            <button
              onClick={() => openExpressBuy(product, defaultSize)}
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Zap size={14} className="fill-[#f5f4f0]" /> 1-CLICK EXPRESS BUY
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-widest py-2.5 cursor-not-allowed text-center"
            >
              OUT OF STOCK
            </button>
          )}

          <Link
            href={`/product/${product.id}`}
            className="w-full text-center border border-[#e5e4df] hover:border-[#171717] text-[#171717] text-[11px] font-bold uppercase tracking-wider py-2 px-3 transition-colors"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </div>
  );
};
