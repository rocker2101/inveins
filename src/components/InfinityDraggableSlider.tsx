'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, MoveHorizontal } from 'lucide-react';

export interface LookbookCard {
  id: string;
  title: string;
  category: string;
  specs: string;
  price: string;
  image: string;
  href: string;
  tilt: string;
}

const LOOKBOOK_CARDS: LookbookCard[] = [
  {
    id: 'acid-wash-tee',
    title: 'Acid Wash Heavyweight Tee',
    category: 'HEAVYWEIGHT TEES',
    specs: '280 GSM French Terry • Drop Shoulder',
    price: '₹250',
    image: '/images/lookbook/acid-wash-tee.jpg',
    href: '/product/imported-oversized-acid-wash-french-terry-tshirt',
    tilt: '-rotate-6 hover:-rotate-1',
  },
  {
    id: 'french-terry-lowers',
    title: 'French Terry Baggy Lowers',
    category: 'BAGGY LOWERS',
    specs: '320 GSM Cotton • Relaxed Drape',
    price: '₹349',
    image: '/images/lookbook/french-terry-lowers.jpg',
    href: '/product/imported-french-terry-straight-fit-baggy-lowers',
    tilt: 'rotate-4 hover:rotate-0',
  },
  {
    id: 'cream-hoodie',
    title: 'Drop-Shoulder Pullover Hoodie',
    category: 'HOODIES & LAYERS',
    specs: '430 GSM Heavy Brushed Loopknit',
    price: '₹499',
    image: '/images/lookbook/cream-hoodie.jpg',
    href: '/product/cotton-men-drop-shoulder-pullover-hoodie',
    tilt: '-rotate-3 hover:rotate-0',
  },
  {
    id: 'knitted-polo',
    title: 'Luxury Heavy Piqué Polo',
    category: 'SHIRTS & POLOS',
    specs: '260 GSM Double-Knit Combed Cotton',
    price: '₹249',
    image: '/images/lookbook/knitted-polo.jpg',
    href: '/product/imported-premium-polo-tshirt',
    tilt: 'rotate-5 hover:rotate-1',
  },
];

// Tripled to create an uninterrupted infinite track
const INFINITE_CARDS = [
  ...LOOKBOOK_CARDS.map(c => ({ ...c, id: `${c.id}-1` })),
  ...LOOKBOOK_CARDS.map(c => ({ ...c, id: `${c.id}-2` })),
  ...LOOKBOOK_CARDS.map(c => ({ ...c, id: `${c.id}-3` })),
  ...LOOKBOOK_CARDS.map(c => ({ ...c, id: `${c.id}-4` })),
];

export const InfinityDraggableSlider: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  // Smooth continuous auto-sliding ticker
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let reqId: number;

    const animate = () => {
      if (!isDragging && !isHovered && el) {
        el.scrollLeft += 1.0;

        // Infinite loop wrap point: smoothly reset when reached halfway
        const resetPoint = el.scrollWidth / 2;
        if (el.scrollLeft >= resetPoint) {
          el.scrollLeft -= LOOKBOOK_CARDS.length * 320;
        }
      }
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [isDragging, isHovered]);

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Screen Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.touches[0].pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const scrollByOffset = (offset: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full max-w-[1560px] mx-auto px-2 sm:px-4 select-none">
      <div className="relative w-full bg-[#EAE8E3] rounded-[20px] sm:rounded-[28px] py-3 sm:py-4 overflow-hidden border border-[#141413]/5 shadow-sm">
        
        {/* Draggable Tilted Cards Track — Right at the top, perfectly centered */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setIsHovered(false);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`flex items-center gap-4 sm:gap-5 md:gap-6 px-4 sm:px-6 py-3 sm:py-4 overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {INFINITE_CARDS.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              className="flex-shrink-0 group"
            >
              <Link
                href={card.href}
                onClick={e => {
                  if (hasMoved) {
                    e.preventDefault();
                  }
                }}
                className={`block relative w-[230px] sm:w-[270px] md:w-[310px] h-[330px] sm:h-[390px] md:h-[430px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-neutral-900 shadow-xl sm:shadow-2xl transition-all duration-300 transform ${card.tilt}`}
              >
                {/* Clean Editorial Fashion Image */}
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 230px, (max-width: 1024px) 270px, 310px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority={idx < 4}
                />

                {/* Sleek Floating Pill at Bottom */}
                <div className="absolute inset-x-2.5 bottom-2.5 sm:bottom-3 p-2.5 sm:p-3 bg-black/80 backdrop-blur-md border border-white/15 rounded-[18px] text-white transition-all duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-neutral-300 truncate">
                      {card.category}
                    </span>
                    <span className="px-2 py-0.5 bg-[#cc785c] text-white text-[10px] font-black rounded-full">
                      {card.price}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm text-white tracking-tight truncate mt-0.5">
                    {card.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Subtle Bottom Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => scrollByOffset(-320)}
            className="w-8 h-8 rounded-full bg-white/90 border border-[#141413]/10 text-[#141413] hover:bg-[#141413] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-mono font-extrabold text-[#6c6a64] tracking-widest uppercase">
            TOUCH / DRAG TO EXPLORE
          </span>
          <button
            onClick={() => scrollByOffset(320)}
            className="w-8 h-8 rounded-full bg-white/90 border border-[#141413]/10 text-[#141413] hover:bg-[#141413] hover:text-white transition-all shadow-xs flex items-center justify-center cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
