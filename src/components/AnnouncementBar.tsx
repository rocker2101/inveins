'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Truck, ShieldCheck, Zap } from 'lucide-react';

const MESSAGES = [
  { text: 'Complimentary Pan-India Express Shipping on orders above ₹999', icon: Truck },
  { text: 'Instant 1-Click WhatsApp Express Buy Available on all pieces', icon: Zap },
  { text: 'Direct from Kanpur Studio • Verified GST: 09CLWPV7429M2ZO', icon: ShieldCheck },
];

export const AnnouncementBar: React.FC = () => {
  const { setIsShippingPolicyOpen } = useCart();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = MESSAGES[index];
  const IconComponent = current.icon;

  return (
    <div className="bg-[#141413] text-[#faf9f5] text-[11px] sm:text-xs py-2 px-4 font-medium tracking-wide flex items-center justify-between transition-all">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <IconComponent size={13} className="text-[#cc785c]" />
          <span>{current.text}</span>
          <button 
            onClick={() => setIsShippingPolicyOpen(true)}
            className="underline text-neutral-400 hover:text-white transition-colors text-[10px] ml-1"
          >
            Policy
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[10px] text-neutral-400 font-mono">
          <span>KANPUR, UP</span>
          <span>•</span>
          <span>EST. 2025</span>
        </div>
      </div>
    </div>
  );
};
