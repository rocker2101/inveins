'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Heart, Zap, Tag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    removeFromCart,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
    if (res.success) setCouponInput('');
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const itemList = items.map(i => `• ${i.product.name} (Size: ${i.selectedSize}) x${i.quantity} = ₹${i.product.price * i.quantity}`).join('%0A');
    const msg = `Hi INVEINS! I want to confirm my bag order:%0A%0A${itemList}%0A%0A*Grand Total: ₹${grandTotal.toLocaleString('en-IN')}*%0A%0APlease process my express delivery.`;
    window.open(`https://wa.me/917985232434?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#e6e2d8] pb-6">
        <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
          YOUR SELECTION
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight mt-1">
          SHOPPING BAG
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center bg-white border border-[#e6e2d8] p-8 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-[#e6e2d8] flex items-center justify-center mx-auto text-[#6c6a64]">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[#141413] uppercase tracking-wider">
            YOUR BAG IS EMPTY
          </h2>
          <p className="text-xs text-[#6c6a64] max-w-sm mx-auto">
            Explore our curated drop of heavyweight tees, gym activewear, and architectural layers.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#141413] text-[#faf9f5] text-xs font-bold uppercase tracking-widest py-3.5 px-8 hover:bg-black transition-colors"
            >
              SHOP CATALOG <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Item List Table */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free Shipping Progress Meter */}
            <div className="bg-white border border-[#e6e2d8] p-4 text-xs">
              {amountNeededForFreeShipping > 0 ? (
                <p className="mb-2 text-[#141413]">
                  Add <span className="font-extrabold text-[#cc785c]">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more for <span className="font-bold underline">Free Pan-India Delivery</span>
                </p>
              ) : (
                <p className="mb-2 font-bold text-[#15803D] flex items-center gap-1.5">
                  <ShieldCheck size={15} /> You have unlocked Free Pan-India Express Delivery!
                </p>
              )}
              <div className="w-full bg-[#faf9f5] h-2 rounded-full overflow-hidden border border-[#e6e2d8]">
                <div
                  className="bg-[#cc785c] h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items Container */}
            <div className="bg-white border border-[#e6e2d8] divide-y divide-[#e6e2d8]">
              {items.map((item, idx) => {
                const isWish = isInWishlist(item.product.id);
                return (
                  <div 
                    key={`${item.product.id}-${item.selectedSize}-${idx}`} 
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex gap-4 items-center">
                      <Link 
                        href={`/product/${item.product.id}`}
                        className="relative w-20 h-24 bg-[#f4f1ea] flex-shrink-0 border border-[#e6e2d8] overflow-hidden"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="space-y-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#141413] hover:underline">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#6c6a64]">
                          Size: <span className="font-bold text-[#141413]">{item.selectedSize}</span>
                        </p>
                        <p className="text-xs font-bold text-[#141413]">
                          ₹{item.product.price.toLocaleString('en-IN')} each
                        </p>
                        <button
                          onClick={() => toggleWishlist(item.product.id)}
                          className={`text-[11px] font-semibold flex items-center gap-1 pt-1 ${
                            isWish ? 'text-red-600' : 'text-[#6c6a64] hover:text-[#141413]'
                          }`}
                        >
                          <Heart size={12} fill={isWish ? 'currentColor' : 'none'} />
                          {isWish ? 'Saved in Wishlist' : 'Move to Wishlist'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e6e2d8]">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#e6e2d8] bg-[#faf9f5]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-1.5 hover:bg-white text-[#141413] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#141413]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-1.5 hover:bg-white text-[#141413] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-heading font-extrabold text-sm text-[#141413]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-[#6c6a64] hover:text-red-600 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back to Shopping */}
            <div className="pt-2">
              <Link
                href="/shop"
                className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:underline flex items-center gap-1.5"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Promo Code Box */}
            <div className="bg-white border border-[#e6e2d8] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#141413]">
                <Tag size={15} className="text-[#cc785c]" />
                <span>HAVE A PROMO CODE?</span>
              </div>

              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#15803D]">
                  <span>Applied: {coupon.code} ({coupon.discountPercent}% off)</span>
                  <button onClick={removeCoupon} className="text-red-600 hover:underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="e.g. FIRST10"
                    className="flex-1 px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-bold uppercase focus:outline-none focus:border-[#141413]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#141413] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponMessage && (
                <p className={`text-[11px] font-bold ${couponMessage.success ? 'text-[#15803D]' : 'text-[#c64545]'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-[#e6e2d8] p-6 space-y-4 shadow-sm">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#141413] border-b border-[#e6e2d8] pb-3">
                ORDER SUMMARY
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#6c6a64]">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-[#141413]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount ({coupon.discountPercent}%)</span>
                    <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6c6a64]">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-[#15803D]">Complimentary</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-[#141413] pt-3 border-t border-[#e6e2d8]">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-[#6c6a64]">
                  Includes all applicable GST & Pan-India taxes.
                </p>
              </div>

              {/* Checkout CTAs */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-[#141413] hover:bg-black text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap size={14} className="fill-white" />
                  Instant WhatsApp Checkout
                </button>
              </div>

              <div className="pt-2 text-[10px] text-[#6c6a64] space-y-1 text-center">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-[#15803D]" /> 256-Bit SSL Encrypted Checkout
                </p>
                <p>7-Day Hassle-Free Size & Fit Exchanges</p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
