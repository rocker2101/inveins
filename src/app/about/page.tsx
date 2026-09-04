'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          THE BRAND
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#171717] tracking-tight mt-1">
          BUILT FOR THE IN-BETWEEN.
        </h1>
        <p className="text-xs sm:text-base text-[#737373] mt-3 leading-relaxed">
          INVEINS makes clothing for the spaces between plans — the pieces you reach for without thinking, made with enough intention to keep thinking about.
        </p>
      </div>

      {/* Hero Editorial Image Showcase */}
      <div className="relative aspect-[16/9] w-full bg-[#e5e4df] border border-[#e5e4df] overflow-hidden">
        <Image
          src="https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg"
          alt="INVEINS Kanpur Studio Production"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 border border-[#e5e4df]">
        <div className="space-y-4">
          <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
            EDITED, NOT ENDLESS.
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            We believe getting dressed can be simple and still mean something. Our collections are edited, not endless: useful forms, honest materials and subtle details that reward a closer look.
          </p>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            Every piece begins with a question: <em>will this earn its place?</em> If the answer is yes, we make it in limited runs and keep the focus on how it feels to wear.
          </p>
        </div>

        <div className="bg-[#f5f4f0] p-8 border border-[#e5e4df] space-y-4 text-center">
          <span className="font-heading font-bold text-xs uppercase tracking-widest text-[#737373]">
            BRAND MANIFESTO
          </span>
          <h3 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717]">
            DESIGNED WITH INTENTION / MADE TO MOVE
          </h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
            Minimalist cut lines, heavyweight organic textiles, and precision manufacturing across small-batch artisan workshops.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-6 hover:bg-black transition-colors"
            >
              EXPLORE THE COLLECTION <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
