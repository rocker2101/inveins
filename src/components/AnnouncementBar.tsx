'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export const AnnouncementBar: React.FC = () => {
  const { setIsShippingPolicyOpen } = useCart();

  return (
    <div className="bg-[#171717] text-[#f5f4f0] text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
      <span>Complimentary shipping on orders over ₹4,000</span>
      <button 
        onClick={() => setIsShippingPolicyOpen(true)}
        className="underline text-neutral-400 hover:text-white transition-colors text-[11px]"
      >
        Details
      </button>
    </div>
  );
};
