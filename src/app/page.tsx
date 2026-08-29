'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { CategoryStoryBar } from '@/components/CategoryStoryBar';
import { HeroSlider } from '@/components/HeroSlider';

export default function HomePage() {
  const { productsList } = useCart();
  const featuredProducts = productsList.slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION & CATEGORY TABS (NO GAP) */}
      <div className="space-y-4">
        <CategoryStoryBar />
        <HeroSlider />
      </div>

      {/* 3. VALUE PROPOSITION STRIP */}
      <section className="bg-white border-y border-[#e5e4df] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
              PREMIUM FABRICS
            </h4>
            <p className="text-[11px] text-[#737373]">280-420 GSM Organic Cotton</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
              EASY RETURNS
            </h4>
            <p className="text-[11px] text-[#737373]">7-Day Exchange & Returns</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
              EXPRESS 1-CLICK BUY
            </h4>
            <p className="text-[11px] text-[#737373]">10-Second Checkout + WhatsApp</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#171717]">
              PAN-INDIA DELIVERY
            </h4>
            <p className="text-[11px] text-[#737373]">Free shipping on orders over ₹4,000</p>
          </div>
        </div>
      </section>

      {/* 4. CLEAN FEATURED COLLECTION SHOWCASE ("THE NEW DROP") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e4df] pb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
              LIMITED RELEASE
            </span>
            <h2 className="font-heading font-extrabold text-3xl text-[#171717] tracking-tight mt-1">
              THE NEW DROP
            </h2>
            <p className="text-xs text-[#737373] mt-1">
              Considered wardrobe essentials. Designed to move with you.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#171717] hover:underline flex items-center gap-1"
          >
            VIEW ALL PIECES ({productsList.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. CLEAN "SHOP BY OCCASION" VISUAL GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
            STYLING BY PURPOSE
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-[#171717] tracking-tight mt-1">
            SHOP BY OCCASION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/shop" className="group relative aspect-[4/5] bg-black overflow-hidden block">
            <Image
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85"
              alt="Everyday Uniform"
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">01 / ESSENTIALS</span>
                <h3 className="font-heading font-extrabold text-2xl tracking-wider uppercase">EVERYDAY UNIFORM</h3>
              </div>
            </div>
          </Link>

          <Link href="/shop" className="group relative aspect-[4/5] bg-black overflow-hidden block">
            <Image
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85"
              alt="Studio & Work"
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">02 / STRUCTURED</span>
                <h3 className="font-heading font-extrabold text-2xl tracking-wider uppercase">STUDIO & WORK</h3>
              </div>
            </div>
          </Link>

          <Link href="/shop" className="group relative aspect-[4/5] bg-black overflow-hidden block">
            <Image
              src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85"
              alt="Weekend & Lounge"
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">03 / RELAXED</span>
                <h3 className="font-heading font-extrabold text-2xl tracking-wider uppercase">WEEKEND & LOUNGE</h3>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* 6. EDITORIAL LOOKBOOK STRIP */}
      <section className="bg-white border-y border-[#e5e4df] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase flex items-center gap-1">
                <Eye size={12} /> VISUAL ESSAY
              </span>
              <h2 className="font-heading font-extrabold text-3xl text-[#171717] tracking-tight mt-1">
                EDITORIAL LOOKBOOK: VIBRANT EXPRESSION
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-wider text-[#171717] hover:underline flex items-center gap-1"
            >
              SHOP ALL LOOKS <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="relative aspect-[3/4] bg-[#e5e4df] overflow-hidden group shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
                alt="Editorial look 1"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#171717]/90 text-[#f5f4f0] p-4 text-xs">
                <span className="text-[9px] font-bold tracking-widest text-amber-300 uppercase block mb-1">LOOK 01</span>
                <p className="font-bold">Architectural Terracotta Tee + Axis Denim</p>
              </div>
            </div>

            <div className="relative aspect-[3/4] bg-[#e5e4df] overflow-hidden group shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=85"
                alt="Editorial look 2"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#171717]/90 text-[#f5f4f0] p-4 text-xs">
                <span className="text-[9px] font-bold tracking-widest text-amber-300 uppercase block mb-1">LOOK 02</span>
                <p className="font-bold">Form Camel Twill Overshirt</p>
              </div>
            </div>

            <div className="relative aspect-[3/4] bg-[#e5e4df] overflow-hidden group shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85"
                alt="Editorial look 3"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#171717]/90 text-[#f5f4f0] p-4 text-xs">
                <span className="text-[9px] font-bold tracking-widest text-amber-300 uppercase block mb-1">LOOK 03</span>
                <p className="font-bold">Indigo Layered Studio Uniform</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. WHOLESALE B2B BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171717] text-[#f5f4f0] p-8 sm:p-12 border border-[#262626] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-bold tracking-widest text-[#a3a3a3] uppercase">
              FOR INDEPENDENT RETAILERS
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight">
              MAKE ROOM FOR BETTER BASICS.
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3a3] leading-relaxed">
              Bring the INVEINS point of view to your store. Thoughtful wholesale, dependable supply, and product that earns its place.
            </p>
          </div>
          <Link
            href="/wholesale"
            className="bg-[#f5f4f0] hover:bg-white text-[#171717] text-xs font-extrabold uppercase tracking-widest py-4 px-8 flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            WORK WITH US <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
