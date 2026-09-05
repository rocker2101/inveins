'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Heart, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    coupon,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const itemList = items.map(i => `• ${i.product.name} (Size: ${i.selectedSize}) x${i.quantity} = ₹${i.product.price * i.quantity}`).join('%0A');
    const msg = `Hi INVEINS! I would like to place an express order:%0A%0A${itemList}%0A%0A*Total: ₹${grandTotal.toLocaleString('en-IN')}*%0A%0APlease share delivery timeline and payment details.`;
    window.open(`https://wa.me/917985232434?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf9f5] shadow-2xl flex flex-col border-l border-[#e6e2d8]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#e6e2d8] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#141413]" />
              <h2 className="font-heading font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#141413]">
                BAG SELECTION ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#6c6a64] hover:text-[#141413] rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Close Bag"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#141413] text-[#faf9f5] p-4 text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <p className="mb-2 text-[11px]">
                Add <span className="font-extrabold text-white">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more for <span className="font-bold text-[#cc785c]">Free Express Shipping</span>
              </p>
            ) : (
              <p className="mb-2 font-bold text-emerald-400 text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} /> You have unlocked Free Pan-India Delivery!
              </p>
            )}
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#cc785c] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4f1ea] border border-[#e6e2d8] flex items-center justify-center mx-auto text-[#6c6a64]">
                  <ShoppingBag size={26} />
                </div>
                <h3 className="font-heading font-extrabold text-base text-[#141413]">
                  YOUR BAG IS WAITING
                </h3>
                <p className="text-xs text-[#6c6a64] max-w-xs mx-auto">
                  Explore our latest drop of heavyweight essentials and performance wear.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 bg-[#141413] text-[#faf9f5] text-xs font-bold uppercase tracking-widest py-3 px-6 hover:bg-black transition-colors shadow-sm"
                >
                  SHOP CATALOG <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              items.map((item, idx) => {
                const isWish = isInWishlist(item.product.id);
                return (
                  <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex gap-3 p-3 bg-white border border-[#e6e2d8]">
                    <div className="relative w-20 h-24 bg-[#f4f1ea] flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-heading font-extrabold text-xs text-[#141413] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="text-[#6c6a64] hover:text-red-600 min-h-[36px] min-w-[36px] flex items-center justify-center -mr-1 -mt-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#f4f1ea] text-[#141413] border border-[#e6e2d8]">
                            Size: {item.selectedSize}
                          </span>
                          <button
                            onClick={() => toggleWishlist(item.product.id)}
                            className={`text-[10px] font-semibold flex items-center gap-1 hover:underline min-h-[32px] py-1 ${
                              isWish ? 'text-red-600' : 'text-[#6c6a64]'
                            }`}
                          >
                            <Heart size={12} fill={isWish ? 'currentColor' : 'none'} />
                            {isWish ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#e6e2d8] bg-[#faf9f5]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-white active:bg-neutral-200 text-[#141413] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#141413]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-white active:bg-neutral-200 text-[#141413] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-heading font-extrabold text-xs sm:text-sm text-[#141413]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout CTAs */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#e6e2d8] bg-white space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#6c6a64]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#141413]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount ({coupon.code})</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6c6a64]">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? <span className="text-[#15803D]">Free</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#141413] pt-1.5 border-t border-[#e6e2d8]">
                  <span>Estimated Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full min-h-[48px] bg-[#141413] hover:bg-black active:bg-neutral-800 text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full min-h-[44px] bg-[#15803D] hover:bg-[#166534] active:bg-green-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap size={14} className="fill-white" />
                  1-Click WhatsApp Order
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-block min-h-[36px] py-1 text-xs font-bold text-[#6c6a64] hover:text-[#141413] underline underline-offset-2"
                  >
                    View Full Cart Page
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#6c6a64]">
                <ShieldCheck size={13} className="text-[#15803D]" />
                <span>Encrypted 256-Bit SSL Checkout • 7-Day Free Exchange</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
