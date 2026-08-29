'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    subtotal,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    removeFromCart,
    updateQuantity,
    setIsCheckoutOpen
  } = useCart();

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-6">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          YOUR SELECTION
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          BAG
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center bg-white border border-[#e5e4df] p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f5f4f0] border border-[#e5e4df] flex items-center justify-center mx-auto text-[#737373]">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-heading font-bold text-xl text-[#171717] uppercase tracking-wider">
            YOUR BAG IS WAITING FOR SOMETHING GOOD.
          </h2>
          <p className="text-xs text-[#737373] max-w-sm mx-auto">
            Explore our latest drop of considered essentials, heavyweight tees, and architectural layers.
          </p>
          <div className="pt-2">
            <Link
              href="/retail"
              className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3.5 px-8 hover:bg-black transition-colors"
            >
              SHOP THE COLLECTION <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Item List Table */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free Shipping Progress Meter */}
            <div className="bg-white border border-[#e5e4df] p-4 text-xs">
              {amountNeededForFreeShipping > 0 ? (
                <p className="mb-2 text-[#171717]">
                  Add <span className="font-bold">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more for <span className="font-bold underline">Complimentary Shipping</span>
                </p>
              ) : (
                <p className="mb-2 font-bold text-emerald-700">
                  ✓ You have unlocked Complimentary Express Shipping!
                </p>
              )}
              <div className="w-full bg-[#f5f4f0] h-2 rounded-full overflow-hidden border border-[#e5e4df]">
                <div
                  className="bg-[#171717] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-[#e5e4df] divide-y divide-[#e5e4df]">
              {items.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-24 bg-[#f0efe9] flex-shrink-0 border border-[#e5e4df]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#171717]">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Size: <span className="font-bold text-[#171717]">{item.selectedSize}</span>
                      </p>
                      <p className="text-xs font-bold text-[#171717] mt-1">
                        ₹{item.product.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e5e4df]">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#e5e4df] bg-[#f5f4f0]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                        className="p-2 text-[#737373] hover:text-[#171717]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#171717]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                        className="p-2 text-[#737373] hover:text-[#171717]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-extrabold text-sm text-[#171717]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="text-[#737373] hover:text-red-600 p-2 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-white border border-[#e5e4df] p-6 space-y-6">
            <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-[#171717] border-b border-[#e5e4df] pb-4">
              ORDER SUMMARY
            </h3>

            <div className="space-y-3 text-xs text-[#737373]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-bold text-[#171717]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pan-India Shipping</span>
                <span className="font-bold text-[#171717]">
                  {amountNeededForFreeShipping === 0 ? 'FREE' : '₹150'}
                </span>
              </div>
              <div className="border-t border-[#e5e4df] pt-3 flex justify-between text-sm font-extrabold text-[#171717]">
                <span>TOTAL DUE</span>
                <span>₹{(subtotal + (amountNeededForFreeShipping === 0 ? 0 : 150)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <ShieldCheck size={16} /> PROCEED TO CHECKOUT
            </button>

            <div className="text-[11px] text-[#737373] space-y-2 pt-2 border-t border-[#e5e4df]">
              <p>✓ Complimentary shipping on orders over ₹4,000</p>
              <p>✓ 7-day hassle-free returns & exchanges</p>
              <p>✓ Encrypted SSL checkout</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
