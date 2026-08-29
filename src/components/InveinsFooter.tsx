'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsShippingPolicyOpen } = useCart();

  return (
    <footer className="bg-[#171717] text-[#f5f4f0] pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[#262626]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-heading text-3xl font-extrabold tracking-tighter text-[#f5f4f0]">
                INVEINS
              </span>
            </Link>
            <p className="text-xs tracking-widest text-[#a3a3a3] uppercase font-medium">
              CLOTHES WITH A POINT OF VIEW.
            </p>
            <p className="text-xs text-[#737373] max-w-sm leading-relaxed">
              INVEINS makes considered essentials and modern layers for the everyday rotation. Useful forms, honest materials and architectural cuts.
            </p>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5f4f0]">EXPLORE</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="text-[#a3a3a3] hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/retail" className="text-[#a3a3a3] hover:text-white transition-colors">
                  Retail
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-[#a3a3a3] hover:text-white transition-colors">
                  Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5f4f0]">INFO</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-[#a3a3a3] hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#a3a3a3] hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsShippingPolicyOpen(true)}
                  className="text-[#a3a3a3] hover:text-white transition-colors text-left"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <Link href="/admin" className="text-[#737373] hover:text-white transition-colors flex items-center gap-1 text-[11px] pt-1">
                  <ShieldCheck size={12} /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Follow */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5f4f0]">CONTACT</h4>
            <ul className="space-y-2 text-xs text-[#a3a3a3]">
              <li>
                <a href="mailto:inveins24@gmail.com" className="hover:text-white transition-colors">
                  inveins24@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/917985232434" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: 7985232434
                </a>
              </li>
            </ul>

            <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5f4f0] pt-4">FOLLOW</h4>
            <div className="flex space-x-4 text-xs">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#a3a3a3] hover:text-white transition-colors">
                Instagram
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#a3a3a3] hover:text-white transition-colors">
                Facebook
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#737373] gap-4">
          <p>© 2025 INVEINS STUDIO. All rights reserved.</p>
          <p className="text-[11px] tracking-wider uppercase">Form Follows Feeling</p>
        </div>
      </div>
    </footer>
  );
};
