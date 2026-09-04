'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'NEW DROP • 280 GSM ACID WASH',
    title: 'FORM FOLLOWS FEELING.',
    subtitle: 'Heavyweight 280 GSM imported French Terry acid wash tee with an architectural boxy drape. Individually finished in Kanpur.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg',
    badge: 'DROP 2025',
    ctaPrimary: 'EXPLORE TEES',
    ctaPrimaryHref: '/shop?category=Tees',
    ctaSecondary: 'VIEW ITEM',
    ctaSecondaryHref: '/product/imported-oversized-acid-wash-french-terry-tshirt',
  },
  {
    id: 2,
    tag: 'PERFORMANCE ACTIVEWEAR',
    title: 'SPANDEX COMPRESSION.',
    subtitle: 'Form-locking 4-way stretch gym compression t-shirts and tighties. Engineered for muscular stability and thermoregulation.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2026/1/581297592/DC/TH/EQ/180956315/gym-compression-t-shirt-500x500.jpeg',
    badge: 'GYM ACTIVE',
    ctaPrimary: 'SHOP COMPRESSION',
    ctaPrimaryHref: '/shop?category=Gym+Compression',
    ctaSecondary: 'VIEW TIGHTIES',
    ctaSecondaryHref: '/product/black-spandex-blend-gym-tighty',
  },
  {
    id: 3,
    tag: 'CONSIDERED BOTTOMS',
    title: 'FRENCH TERRY LOWERS.',
    subtitle: 'Imported straight-fit baggie lowers and organic antibacterial bamboo pants tailored for effortless street mobility.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2026/2/587978257/VO/TH/TG/180956315/straight-fit-baggy-lowers-500x500.jpeg',
    badge: 'BAGGY FIT',
    ctaPrimary: 'SHOP LOWERS',
    ctaPrimaryHref: '/shop?category=Joggers',
    ctaSecondary: 'VIEW BAGGIES',
    ctaSecondaryHref: '/product/imported-french-terry-straight-fit-baggy-lowers',
  },
  {
    id: 4,
    tag: 'B2B & WHOLESALE SERVICES',
    title: 'CUSTOM DTF & EMBROIDERY.',
    subtitle: 'Direct manufacturing from Kanpur: High-density DTF printing, Sublimation, and precision machine embroidery with flexible MOQs.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg',
    badge: 'WHOLESALE B2B',
    ctaPrimary: 'B2B SERVICES',
    ctaPrimaryHref: '/wholesale',
    ctaSecondary: 'WHATSAPP DESK',
    ctaSecondaryHref: 'https://wa.me/917985232434?text=Hi%20INVEINS%2C%20I%20want%20to%20inquire%20about%20custom%20apparel%20or%20wholesale%20orders.',
  },
];

export const HeroSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIdx(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIdx];

  return (
    <section className="relative pt-0 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div 
        className="relative w-full bg-[#141413] border border-[#e6e2d8] overflow-hidden shadow-2xl min-h-[520px] sm:min-h-[620px] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Slide Images with Crossfade */}
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
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Cinematic Gradient Mask for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 sm:to-transparent" />
          </div>
        ))}

        {/* Slide Foreground Content */}
        <div className="relative z-20 max-w-2xl p-6 sm:p-12 lg:p-16 space-y-6 text-[#faf9f5]">
          
          <div className="inline-flex items-center gap-2 bg-[#faf9f5] text-[#141413] text-[10px] sm:text-[11px] font-extrabold tracking-widest px-3 py-1 uppercase shadow-sm">
            <Sparkles size={13} className="text-[#cc785c]" /> {currentSlide.tag}
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-white leading-[0.95] drop-shadow-md">
            {currentSlide.title}
          </h1>

          <p className="text-sm sm:text-base text-[#e6e2d8] max-w-xl leading-relaxed">
            {currentSlide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <Link
              href={currentSlide.ctaPrimaryHref}
              className="bg-[#faf9f5] hover:bg-white text-[#141413] text-xs font-extrabold uppercase tracking-widest py-3.5 px-7 shadow-lg flex items-center gap-2 transition-all hover:gap-3"
            >
              <span>{currentSlide.ctaPrimary}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href={currentSlide.ctaSecondaryHref}
              className="border border-[#faf9f5]/60 hover:border-white text-white hover:bg-white/10 text-xs font-bold uppercase tracking-widest py-3.5 px-6 transition-colors"
            >
              {currentSlide.ctaSecondary}
            </Link>
          </div>

          {/* Quick highlights indicator */}
          <div className="pt-4 flex items-center gap-4 text-[11px] text-neutral-300 font-medium">
            <span className="flex items-center gap-1">
              <Zap size={13} className="text-[#cc785c]" /> 10-Second 1-Click Buy
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#15803D]" /> Pan-India Express
            </span>
          </div>
        </div>

        {/* Slider Controls (Prev / Next Buttons) */}
        <div className="absolute right-6 bottom-6 z-30 flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-white/20 transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 transition-all rounded-full ${
                  idx === currentIdx ? 'w-6 bg-[#cc785c]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center border border-white/20 transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};
