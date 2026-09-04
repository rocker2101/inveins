'use client';

import React from 'react';
import { X, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const ShippingPolicyModal: React.FC = () => {
  const { isShippingPolicyOpen, setIsShippingPolicyOpen } = useCart();

  if (!isShippingPolicyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-xl border border-[#e5e4df] shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={() => setIsShippingPolicyOpen(false)}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#171717]"
        >
          <X size={22} />
        </button>

        <h2 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717] mb-6">
          SHIPPING & DELIVERY POLICY
        </h2>

        <div className="space-y-6 text-xs text-[#171717] leading-relaxed">
          <div className="flex gap-4 p-4 bg-white border border-[#e5e4df]">
            <Truck size={24} className="text-[#171717] flex-shrink-0" />
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-1">PAN-INDIA DELIVERY</h3>
              <p className="text-[#737373]">
                Complimentary standard shipping on all orders over ₹999. Orders under ₹999 incur a flat ₹70 delivery charge. Orders are dispatched within 24-48 business hours.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-white border border-[#e5e4df]">
            <ShieldCheck size={24} className="text-[#171717] flex-shrink-0" />
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-1">PACKAGING & DISPATCH</h3>
              <p className="text-[#737373]">
                Every item is shipped in eco-conscious recylable matte packaging with protective garment covers. Tracking links sent via SMS and Email upon dispatch.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-white border border-[#e5e4df]">
            <RefreshCw size={24} className="text-[#171717] flex-shrink-0" />
            <div>
              <h3 className="font-bold uppercase tracking-wider mb-1">EASY 7-DAY RETURNS & EXCHANGES</h3>
              <p className="text-[#737373]">
                Unworn items with tags attached can be exchanged for alternate sizes or refunded to store credit within 7 days of delivery.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsShippingPolicyOpen(false)}
          className="mt-6 w-full bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 hover:bg-black transition-colors"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
