'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, Truck, RotateCcw, Lock, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsShippingPolicyOpen } = useCart();

  return (
    <footer className="bg-[#141413] text-[#faf9f5] pt-16 pb-12 border-t border-[#2a2927]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Value Propositions Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-[#2a2927] text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-800 text-[#cc785c]">
              <Truck size={18} />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">PAN-INDIA EXPRESS</h5>
              <p className="text-[11px] text-neutral-400">Free delivery on orders ₹999+</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-800 text-[#cc785c]">
              <RotateCcw size={18} />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">7-DAY EXCHANGE</h5>
              <p className="text-[11px] text-neutral-400">Hassle-free size exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-800 text-[#cc785c]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">HEAVYWEIGHT FABRICS</h5>
              <p className="text-[11px] text-neutral-400">280–420 GSM custom-knit textiles</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-800 text-[#cc785c]">
              <Lock size={18} />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">VERIFIED BUSINESS</h5>
              <p className="text-[11px] text-neutral-400">GST: 09CLWPV7429M2ZO • UDYAM-UP-43-0147583</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-[#2a2927]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-10 w-36 flex items-center">
                <Image
                  src="/images/logo/inveins-logo-light.png"
                  alt="Inveins™"
                  fill
                  sizes="150px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs tracking-widest text-[#cc785c] uppercase font-bold">
              FORM FOLLOWS FEELING.
            </p>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              INVEINS creates architectural wardrobe essentials, heavyweight French Terry tees, and form-locking gym compression wear. Engineered in Kanpur with honest textiles and modern cuts.
            </p>
            <div className="pt-1 text-[11px] text-neutral-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#cc785c]" /> E 48, K D A Colony, Daheli Sujanpur, Kanpur 208013
              </p>
              <p className="text-neutral-400">Shaurya Vishnoi (Founder & Craftsman)</p>
            </div>

            {/* Founder Profile Badge with Photo */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#cc785c]/60 flex-shrink-0 shadow-md bg-neutral-900">
                <Image
                  src="/images/founder.jpg"
                  alt="INVEINS Founder"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 text-[11px]">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#cc785c] block">
                  FOUNDER & CRAFTSMAN
                </span>
                <span className="text-xs font-bold text-white block">
                  INVEINS Studio Kanpur
                </span>
                <Link
                  href="/about"
                  className="text-[10px] text-neutral-400 hover:text-[#cc785c] transition-colors inline-block"
                >
                  Read The Founder's Vision →
                </Link>
              </div>
            </div>
          </div>

          {/* Column 1: Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">COLLECTIONS</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=Tees" className="text-neutral-400 hover:text-white transition-colors">
                  Heavyweight Tees
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Gym+Compression" className="text-neutral-400 hover:text-white transition-colors">
                  Gym Compression Wear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Joggers" className="text-neutral-400 hover:text-white transition-colors">
                  French Terry Lowers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Shirts" className="text-neutral-400 hover:text-white transition-colors">
                  Overshirts & Polos
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Outerwear" className="text-neutral-400 hover:text-white transition-colors">
                  Winter Outerwear
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-[#cc785c] hover:underline font-bold transition-colors">
                  View All Pieces
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Care & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">CUSTOMER CARE</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About INVEINS
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors font-medium">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                  Contact Studio
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-neutral-400 hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-[#cc785c] hover:underline font-bold transition-colors">
                  Wholesale & Custom DTF
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Administration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">DIRECT REACH</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <a href="mailto:inveins24@gmail.com" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail size={13} className="text-[#cc785c]" /> inveins24@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/917985232434" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Phone size={13} className="text-[#15803D]" /> WhatsApp: +91 7985232434
                </a>
              </li>
              <li className="pt-2">
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white py-1 px-2.5 bg-neutral-900 border border-neutral-800 transition-colors"
                >
                  <ShieldCheck size={13} /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} INVEINS. All rights reserved. GST: 09CLWPV7429M2ZO • Udyam: UDYAM-UP-43-0147583.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">
              Refund & Cancellation
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <a 
              href="https://www.indiamart.com/inveins/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors text-neutral-500"
            >
              IndiaMART Profile
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
