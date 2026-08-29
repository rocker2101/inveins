'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'VIBRANT NEW DROP / 2025',
    title: 'FORM FOLLOWS FEELING.',
    subtitle: 'High-contrast architectural shapes, 280 GSM organic combed cotton.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
    badge: 'DROP 001',
    ctaPrimary: 'SHOP RETAIL',
    ctaPrimaryHref: '/retail',
    ctaSecondary: 'WHOLESALE',
    ctaSecondaryHref: '/wholesale',
  },
  {
    id: 2,
    tag: 'OUTERWEAR COLLECTION',
    title: 'BRUSHED TWILL OVERSHIRTS.',
    subtitle: '380 GSM heavy cotton twill designed for natural layering.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=85',
    badge: 'LIMITED EDITION',
    ctaPrimary: 'EXPLORE OVERSHIRTS',
    ctaPrimaryHref: '/shop?category=Outerwear',
    ctaSecondary: 'VIEW ALL',
    ctaSecondaryHref: '/shop',
  },
  {
    id: 3,
    tag: 'SELVEDGE DENIM',
    title: 'VINTAGE STONEWASH CUTS.',
    subtitle: '13.5oz non-stretch Japanese selvedge with architectural straight leg taper.',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=85',
    badge: 'MUST HAVE',
    ctaPrimary: 'SHOP DENIM',
    ctaPrimaryHref: '/shop?category=Denim',
    ctaSecondary: 'VIEW ALL',
    ctaSecondaryHref: '/shop',
  },
];

export const HeroSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIdx(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIdx];

  return (
    <section className="relative pt-0 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative w-full bg-[#e5e4df] border border-[#e5e4df] overflow-hidden shadow-2xl min-h-[520px] sm:min-h-[600px] flex items-center">
        
        {/* Background Image Carousel */}
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover"
            />
            {/* Soft overlay gradient for vibrant contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
          </div>
        ))}

        {/* Slide Overlay Text & Content */}
        <div className="relative z-20 max-w-2xl p-6 sm:p-12 lg:p-16 space-y-6 text-[#f5f4f0]">
          
          <div className="inline-flex items-center gap-2 bg-[#f5f4f0] text-[#171717] text-[11px] font-extrabold tracking-widest px-3 py-1 uppercase shadow-sm">
            <Sparkles size={13} /> {currentSlide.tag}
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-white leading-[0.95] drop-shadow-md">
            {currentSlide.title}
          </h1>

          <p className="text-xs sm:text-base text-neutral-200 max-w-lg leading-relaxed font-medium">
            {currentSlide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={currentSlide.ctaPrimaryHref}
              className="bg-[#f5f4f0] hover:bg-white text-[#171717] text-xs font-extrabold uppercase tracking-widest py-4 px-8 flex items-center gap-2 transition-all shadow-md"
            >
              {currentSlide.ctaPrimary} <ArrowRight size={16} />
            </Link>
            <Link
              href={currentSlide.ctaSecondaryHref}
              className="border-2 border-[#f5f4f0] text-[#f5f4f0] hover:bg-[#f5f4f0] hover:text-[#171717] text-xs font-extrabold uppercase tracking-widest py-3.5 px-8 transition-colors"
            >
              {currentSlide.ctaSecondary}
            </Link>
          </div>

        </div>

        {/* Badge in Top Right */}
        <div className="absolute top-6 right-6 z-20 bg-[#171717]/90 text-[#f5f4f0] text-[10px] font-extrabold tracking-widest px-3.5 py-1.5 uppercase border border-[#444] hidden sm:block">
          {currentSlide.badge}
        </div>

        {/* Navigation Arrows (Left / Right) */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Indicators Bar (Bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 transition-all rounded-full ${
                idx === currentIdx ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
