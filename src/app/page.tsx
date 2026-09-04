'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Eye, ShieldCheck, Check, Truck, RotateCcw, Zap, Star, ChevronRight, Mail } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { InfinityDraggableSlider } from '@/components/InfinityDraggableSlider';

export default function HomePage() {
  const { productsList } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Filter curated collections
  const newDropProducts = productsList.filter(p => p.badge === 'NEW' || p.badge === 'HOT').slice(0, 4);
  const bestsellerProducts = productsList.filter(p => p.badge === 'BESTSELLER' || p.badge === 'HOT').slice(0, 4);
  const compressionProducts = productsList.filter(p => p.category === 'Gym Compression').slice(0, 4);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  return (
    <div className="space-y-16 pb-20 pt-2 sm:pt-4">
      
      {/* 1. TOP LOOKBOOK INFINITY DRAGGABLE SLIDER */}
      <InfinityDraggableSlider />

      {/* 2. VISUAL CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-[#e6e2d8] pb-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
              CURATED ESSENTIALS
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:text-[#cc785c] flex items-center gap-1"
          >
            All Collections <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'HEAVYWEIGHT TEES',
              desc: '280-320 GSM French Terry & Acid Wash',
              image: '/images/categories/heavyweight-tees.png',
              href: '/shop?category=Tees',
            },
            {
              title: 'GYM COMPRESSION',
              desc: '4-Way Stretch Spandex Recovery Blends',
              image: '/images/categories/gym-compression.png',
              href: '/shop?category=Gym+Compression',
            },
            {
              title: 'FRENCH TERRY LOWERS',
              desc: 'Straight-Fit Baggies & Bamboo Pants',
              image: '/images/categories/french-terry-lowers.png',
              href: '/shop?category=Joggers',
            },
            {
              title: 'HOODIES & POLOS',
              desc: '430 GSM Loopknit Cotton & Knitted Polos',
              image: '/images/categories/hoodies-and-polos.png',
              href: '/shop?category=Outerwear',
            },
          ].map(cat => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative aspect-[3/4] bg-neutral-900 overflow-hidden block border border-[#e6e2d8]"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="font-heading font-extrabold text-lg tracking-tight text-white group-hover:text-[#cc785c] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-neutral-300 mt-0.5">{cat.desc}</p>
                <div className="pt-3 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  <span>Explore Line</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. THE NEW DROP (FEATURED COLLECTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e6e2d8] pb-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#cc785c] uppercase flex items-center gap-1">
              <Sparkles size={12} /> LIMITED RELEASE • 2025
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
              THE NEW DROP
            </h2>
            <p className="text-xs text-[#6c6a64] mt-1">
              Considered wardrobe foundations. Architectural drape, zero cling.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:text-[#cc785c] flex items-center gap-1"
          >
            VIEW ALL GARMENTS ({productsList.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newDropProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. GYM COMPRESSION & ACTIVEWEAR SPOTLIGHT */}
      <section className="bg-white border-y border-[#e6e2d8] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-[#15803D] uppercase flex items-center gap-1">
                <Zap size={12} className="fill-[#15803D]" /> HIGH-PERFORMANCE RECOVERY
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
                GYM COMPRESSION & ACTIVE
              </h2>
              <p className="text-xs text-[#6c6a64] mt-1">
                Form-locking Spandex & Poly-Cotton blends engineered for muscular support and thermoregulation.
              </p>
            </div>
            <Link
              href="/shop?category=Gym+Compression"
              className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:text-[#cc785c] flex items-center gap-1"
            >
              SHOP ACTIVEWEAR <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {compressionProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. BESTSELLERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e6e2d8] pb-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
              HIGH CONVERSION EDIT
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
              COMMUNITY BESTSELLERS
            </h2>
            <p className="text-xs text-[#6c6a64] mt-1">
              The highest-rated silhouettes trusted by modern Indian shoppers.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:text-[#cc785c] flex items-center gap-1"
          >
            SEE ALL BESTSELLERS <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. "STYLING BY PURPOSE" EDITORIAL LOOKBOOK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
            STYLING BY PURPOSE
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
            WEAR IT EVERYWHERE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/shop?occasion=Everyday+Uniform"
            className="group relative aspect-[646/381] bg-neutral-900 overflow-hidden block border border-[#e6e2d8] rounded-xl sm:rounded-2xl shadow-xs"
          >
            <Image
              src="/images/styling/everyday-uniform.png"
              alt="Everyday Uniform - 01 / ESSENTIALS"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>

          <Link
            href="/shop?occasion=Studio+%26+Work"
            className="group relative aspect-[646/381] bg-neutral-900 overflow-hidden block border border-[#e6e2d8] rounded-xl sm:rounded-2xl shadow-xs"
          >
            <Image
              src="/images/styling/studio-and-work.png"
              alt="Studio & Work - 02 / STRUCTURED"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>

          <Link
            href="/shop?occasion=Weekend+%26+Lounge"
            className="group relative aspect-[646/381] bg-neutral-900 overflow-hidden block border border-[#e6e2d8] rounded-xl sm:rounded-2xl shadow-xs"
          >
            <Image
              src="/images/styling/weekend-and-lounge.png"
              alt="Weekend & Lounge - 03 / RELAXED"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>
        </div>
      </section>

      {/* 8. BRAND STORY EDITORIAL (KANPUR HERITAGE) */}
      <section className="bg-white border-y border-[#e6e2d8] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 relative aspect-[4/5] bg-[#f4f1ea] overflow-hidden border border-[#e6e2d8]">
              <Image
                src="https://5.imimg.com/data5/SELLER/Default/2026/3/590934041/EV/YM/MP/180956315/embroidery-500x500.jpeg"
                alt="INVEINS Kanpur Studio Craftsmanship"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 p-3 text-xs border border-[#e6e2d8]">
                <span className="font-bold uppercase tracking-wider text-[#141413]">KANPUR WORKSHOP</span>
                <p className="text-[10px] text-[#6c6a64]">Direct-to-Consumer & B2B Solutions</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 lg:pl-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-widest text-[#cc785c] uppercase">
                  THE INVEINS PHILOSOPHY
                </span>
                <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight leading-tight">
                  CLOTHES CRAFTED WITH HONEST FABRICS & A POINT OF VIEW.
                </h2>
              </div>

              <p className="text-sm text-[#6c6a64] leading-relaxed">
                Founded in Kanpur — India's premier industrial and textile hub — <strong>INVEINS</strong> was built on a simple premise: everyday Indian apparel should possess the structural integrity of architectural design and the comfort of premium natural fibers.
              </p>

              <p className="text-sm text-[#6c6a64] leading-relaxed">
                We custom-knit our French Terry cotton between 280 and 420 GSM to ensure clothes fall cleanly away from the body without clinging. From hand-washed acid finishes to form-locking gym compression wear, every seam is reinforced with double-needle construction.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e6e2d8]">
                <div>
                  <h4 className="font-heading font-extrabold text-xl text-[#141413]">280–420</h4>
                  <p className="text-[11px] text-[#6c6a64] uppercase font-bold tracking-wider">GSM Organic Knit</p>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xl text-[#141413]">100%</h4>
                  <p className="text-[11px] text-[#6c6a64] uppercase font-bold tracking-wider">Pre-Shrunk Weave</p>
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xl text-[#141413]">09CLWPV</h4>
                  <p className="text-[11px] text-[#6c6a64] uppercase font-bold tracking-wider">GST Registered</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-[#141413] hover:bg-black text-[#faf9f5] text-xs font-bold uppercase tracking-widest py-3.5 px-6 transition-colors shadow-sm"
                >
                  Read Our Complete Story <ArrowRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. B2B & WHOLESALE CUSTOM APPAREL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#141413] text-[#faf9f5] p-8 sm:p-12 border border-[#2a2927] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-extrabold tracking-widest text-[#cc785c] uppercase flex items-center gap-1.5">
              <ShieldCheck size={14} /> B2B & CUSTOM MERCHANDISING
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              CUSTOM DTF, EMBROIDERY & BULK SUPPLY.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Equip your brand, gym, or team with our signature heavyweight blanks. We provide high-density DTF printing, precision machine embroidery, and sublimation with dependable Kanpur factory delivery.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/wholesale"
              className="bg-[#faf9f5] hover:bg-white text-[#141413] text-xs font-extrabold uppercase tracking-widest py-4 px-8 text-center transition-colors"
            >
              Wholesale Catalog
            </Link>
            <a
              href="https://wa.me/917985232434?text=Hi%20INVEINS%20team%2C%20I%20am%20interested%20in%20custom%20apparel%20printing%20and%20bulk%20wholesale."
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#faf9f5]/50 hover:border-white text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest py-4 px-6 text-center transition-colors flex items-center justify-center gap-2"
            >
              WhatsApp B2B Desk
            </a>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER & VIP ACCESS */}
      <section className="bg-[#f4f1ea] border-y border-[#e6e2d8] py-14">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
            COMMUNITY & DROPS
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight">
            BE FIRST IN LINE FOR LIMITED DROPS.
          </h2>
          <p className="text-xs text-[#6c6a64] max-w-md mx-auto leading-relaxed">
            Get first access to limited 50-piece drops, private sample sales, and 10% off your first rotation piece.
          </p>

          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 px-4 py-3 bg-white border border-[#e6e2d8] text-xs font-semibold text-[#141413] placeholder-[#6c6a64] focus:outline-none focus:border-[#141413]"
            />
            <button
              type="submit"
              className="py-3 px-6 bg-[#141413] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
            >
              <Mail size={14} /> Join
            </button>
          </form>

          {newsletterSubscribed && (
            <p className="text-xs font-bold text-[#15803D] animate-fade-in flex items-center justify-center gap-1">
              <Check size={14} /> Welcome to the INVEINS rotation. Use code FIRST10 for 10% off.
            </p>
          )}

          <p className="text-[10px] text-[#6c6a64]">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

    </div>
  );
}
