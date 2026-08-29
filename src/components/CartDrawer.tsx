'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    setIsCheckoutOpen
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#f5f4f0] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e4df] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#171717]" />
              <h2 className="font-heading font-bold text-lg uppercase tracking-wider text-[#171717]">
                YOUR SELECTION ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#737373] hover:text-[#171717] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#171717] text-[#f5f4f0] p-4 text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <p className="mb-2">
                Add <span className="font-bold">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more for <span className="font-bold underline">Complimentary Shipping</span>
              </p>
            ) : (
              <p className="mb-2 font-bold text-emerald-400">
                ✓ You have unlocked Complimentary Shipping!
              </p>
            )}
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#e5e4df] flex items-center justify-center mx-auto text-[#737373]">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-heading font-bold text-lg text-[#171717]">
                  YOUR BAG IS WAITING
                </h3>
                <p className="text-xs text-[#737373] max-w-xs mx-auto">
                  Your bag is waiting for something good. Explore our considered collection.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-wider py-3 px-6 hover:bg-black transition-colors"
                >
                  SHOP COLLECTION <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex gap-4 p-3 bg-white border border-[#e5e4df]">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-[#f0efe9] flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-heading font-bold text-sm text-[#171717]">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                          className="text-[#737373] hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Size: <span className="font-bold text-[#171717]">{item.selectedSize}</span>
                      </p>
                      <p className="text-xs font-bold text-[#171717] mt-1">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center border border-[#e5e4df]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-1 text-[#737373] hover:text-[#171717]"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#171717]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-1 text-[#737373] hover:text-[#171717]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-[#171717] ml-auto">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#e5e4df] space-y-4">
              <div className="space-y-1.5 text-xs text-[#737373]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#171717] text-sm">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-[#171717]">
                    {amountNeededForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 transition-colors"
              >
                PROCEED TO CHECKOUT <ArrowRight size={16} />
              </button>

              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block text-center text-xs text-[#737373] hover:text-[#171717] underline uppercase font-semibold tracking-wider"
              >
                VIEW DETAILED BAG
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
