'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useCart();

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-xl border border-[#e5e4df] shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#171717]"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-2 mb-2 text-[#171717]">
          <Ruler size={20} />
          <h2 className="font-heading font-extrabold text-xl uppercase tracking-wider">
            SIZE GUIDE & MEASUREMENTS
          </h2>
        </div>
        <p className="text-xs text-[#737373] mb-6">
          All INVEINS garments are cut for a relaxed, considered drape. Compare measurements against your best-fitting clothes.
        </p>

        {/* Tops Sizing Table */}
        <div className="bg-white border border-[#e5e4df] overflow-x-auto mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#171717] text-[#f5f4f0] font-bold uppercase">
              <tr>
                <th className="p-3">Size</th>
                <th className="p-3">Chest (in)</th>
                <th className="p-3">Length (in)</th>
                <th className="p-3">Shoulder (in)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e4df] text-[#171717]">
              <tr><td className="p-3 font-bold">XS</td><td className="p-3">38"</td><td className="p-3">27"</td><td className="p-3">18.5"</td></tr>
              <tr><td className="p-3 font-bold">S</td><td className="p-3">40"</td><td className="p-3">28"</td><td className="p-3">19.5"</td></tr>
              <tr><td className="p-3 font-bold">M</td><td className="p-3">42"</td><td className="p-3">29"</td><td className="p-3">20.5"</td></tr>
              <tr><td className="p-3 font-bold">L</td><td className="p-3">44"</td><td className="p-3">30"</td><td className="p-3">21.5"</td></tr>
              <tr><td className="p-3 font-bold">XL</td><td className="p-3">46"</td><td className="p-3">31"</td><td className="p-3">22.5"</td></tr>
              <tr><td className="p-3 font-bold">XXL</td><td className="p-3">48"</td><td className="p-3">31.5"</td><td className="p-3">23.5"</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 text-[11px] text-amber-900 leading-relaxed">
          <strong>FIT TIP:</strong> If you prefer an architectural, boxy oversized look, stay true to your standard size. For a more tailored fit, size down one step.
        </div>
      </div>
    </div>
  );
};
