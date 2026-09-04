'use client';

import React, { useState } from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useCart();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [activeTab, setActiveTab] = useState<'tees' | 'lowers' | 'compression'>('tees');

  if (!isSizeGuideOpen) return null;

  const toUnit = (inchesVal: number) => {
    return unit === 'in' ? `${inchesVal}"` : `${Math.round(inchesVal * 2.54)} cm`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setIsSizeGuideOpen(false)}
    >
      <div 
        className="bg-[#faf9f5] w-full max-w-2xl border border-[#e6e2d8] shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          className="absolute top-4 right-4 p-1 text-[#6c6a64] hover:text-[#141413] rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Close Size Guide"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1 text-[#141413]">
          <Ruler size={20} className="text-[#cc785c]" />
          <h2 className="font-heading font-extrabold text-xl uppercase tracking-wider">
            SIZE GUIDE & EXACT MEASUREMENTS
          </h2>
        </div>
        <p className="text-xs text-[#6c6a64] mb-5">
          All INVEINS garments are cut for a considered architectural drape. Compare these measurements with your best-fitting clothes.
        </p>

        {/* Unit Toggle and Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#e6e2d8] pb-3">
          <div className="flex gap-2">
            {[
              { id: 'tees', label: 'Tees & Shirts' },
              { id: 'lowers', label: 'Lowers & Pants' },
              { id: 'compression', label: 'Gym Compression' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#141413] text-[#faf9f5]'
                    : 'bg-white border border-[#e6e2d8] text-[#6c6a64] hover:text-[#141413]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#e6e2d8] p-0.5 self-start sm:self-auto">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-bold ${unit === 'in' ? 'bg-[#141413] text-white' : 'text-[#6c6a64]'}`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-bold ${unit === 'cm' ? 'bg-[#141413] text-white' : 'text-[#6c6a64]'}`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Sizing Tables */}
        {activeTab === 'tees' && (
          <div className="bg-white border border-[#e6e2d8] overflow-x-auto mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141413] text-[#faf9f5] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Chest</th>
                  <th className="p-3">Length</th>
                  <th className="p-3">Shoulder</th>
                  <th className="p-3">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8] text-[#141413]">
                <tr><td className="p-3 font-bold">XS</td><td className="p-3">{toUnit(38)}</td><td className="p-3">{toUnit(27)}</td><td className="p-3">{toUnit(18.5)}</td><td className="p-3">{toUnit(8.5)}</td></tr>
                <tr><td className="p-3 font-bold">S</td><td className="p-3">{toUnit(40)}</td><td className="p-3">{toUnit(28)}</td><td className="p-3">{toUnit(19.5)}</td><td className="p-3">{toUnit(9)}</td></tr>
                <tr><td className="p-3 font-bold">M</td><td className="p-3">{toUnit(42)}</td><td className="p-3">{toUnit(29)}</td><td className="p-3">{toUnit(20.5)}</td><td className="p-3">{toUnit(9.5)}</td></tr>
                <tr><td className="p-3 font-bold">L</td><td className="p-3">{toUnit(44)}</td><td className="p-3">{toUnit(30)}</td><td className="p-3">{toUnit(21.5)}</td><td className="p-3">{toUnit(10)}</td></tr>
                <tr><td className="p-3 font-bold">XL</td><td className="p-3">{toUnit(46)}</td><td className="p-3">{toUnit(31)}</td><td className="p-3">{toUnit(22.5)}</td><td className="p-3">{toUnit(10.5)}</td></tr>
                <tr><td className="p-3 font-bold">XXL</td><td className="p-3">{toUnit(48)}</td><td className="p-3">{toUnit(31.5)}</td><td className="p-3">{toUnit(23.5)}</td><td className="p-3">{toUnit(11)}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'lowers' && (
          <div className="bg-white border border-[#e6e2d8] overflow-x-auto mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141413] text-[#faf9f5] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Waist Size</th>
                  <th className="p-3">Waist (Relaxed)</th>
                  <th className="p-3">Waist (Stretched)</th>
                  <th className="p-3">Inseam Length</th>
                  <th className="p-3">Thigh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8] text-[#141413]">
                <tr><td className="p-3 font-bold">28 - 30 (S)</td><td className="p-3">{toUnit(28)}</td><td className="p-3">{toUnit(34)}</td><td className="p-3">{toUnit(30)}</td><td className="p-3">{toUnit(24)}</td></tr>
                <tr><td className="p-3 font-bold">30 - 32 (M)</td><td className="p-3">{toUnit(30)}</td><td className="p-3">{toUnit(36)}</td><td className="p-3">{toUnit(30.5)}</td><td className="p-3">{toUnit(25)}</td></tr>
                <tr><td className="p-3 font-bold">32 - 34 (L)</td><td className="p-3">{toUnit(32)}</td><td className="p-3">{toUnit(38)}</td><td className="p-3">{toUnit(31)}</td><td className="p-3">{toUnit(26)}</td></tr>
                <tr><td className="p-3 font-bold">34 - 36 (XL)</td><td className="p-3">{toUnit(34)}</td><td className="p-3">{toUnit(40)}</td><td className="p-3">{toUnit(31.5)}</td><td className="p-3">{toUnit(27)}</td></tr>
                <tr><td className="p-3 font-bold">36 - 38 (XXL)</td><td className="p-3">{toUnit(36)}</td><td className="p-3">{toUnit(42)}</td><td className="p-3">{toUnit(32)}</td><td className="p-3">{toUnit(28)}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'compression' && (
          <div className="bg-white border border-[#e6e2d8] overflow-x-auto mb-5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141413] text-[#faf9f5] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Chest (Body)</th>
                  <th className="p-3">Compression Fit</th>
                  <th className="p-3">Recommended Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e2d8] text-[#141413]">
                <tr><td className="p-3 font-bold">S</td><td className="p-3">{toUnit(36)} - {toUnit(38)}</td><td className="p-3">Form-Locking</td><td className="p-3">55 - 65 kg</td></tr>
                <tr><td className="p-3 font-bold">M</td><td className="p-3">{toUnit(38)} - {toUnit(40)}</td><td className="p-3">Form-Locking</td><td className="p-3">65 - 75 kg</td></tr>
                <tr><td className="p-3 font-bold">L</td><td className="p-3">{toUnit(40)} - {toUnit(42)}</td><td className="p-3">Form-Locking</td><td className="p-3">75 - 85 kg</td></tr>
                <tr><td className="p-3 font-bold">XL</td><td className="p-3">{toUnit(42)} - {toUnit(44)}</td><td className="p-3">Form-Locking</td><td className="p-3">85 - 95 kg</td></tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#faf5ee] border border-[#e6e2d8] p-4 text-xs text-[#141413] space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-[#cc785c]">
            <CheckCircle2 size={14} /> FIT PHILOSOPHY:
          </div>
          <p className="text-[#6c6a64] leading-relaxed">
            • <strong>Heavyweight Tees</strong>: Designed with pre-shrunk 280-320 GSM organic cotton with relaxed dropped shoulders. Choose your regular size for an intentional boxy fit.
            <br />
            • <strong>Gym Compression</strong>: Cut from high-recovery Spandex blend. Fits true to skin. If you prefer a lighter compression feel, choose one size up.
          </p>
        </div>
      </div>
    </div>
  );
};
