'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Send, Building2, Package, ShieldCheck, Clock } from 'lucide-react';

export default function WholesalePage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    cityCountry: '',
    productInterest: '',
    quantity: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          FOR STORES, RESELLERS & BULK BUYERS
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#171717] tracking-tight mt-1">
          INVEINS WHOLESALE
        </h1>
        <p className="text-xs sm:text-base text-[#737373] mt-3 leading-relaxed">
          Thoughtful product, dependable supply and flexible quantities for businesses with a clear point of view.
        </p>
      </div>

      {/* 4 Wholesale Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">01</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            BULK PRICING
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Clear margins that make sense for independent retail and store partners.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">02</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            QUALITY PRODUCT
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            A considered collection designed to earn repeat customers for your brand.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">03</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            RELIABLE SUPPLY
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Consistent communication from first enquiry to final doorstep delivery.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">04</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            FLEXIBLE QUANTITIES
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Start with the right volume for your store and scale seamlessly as you grow.
          </p>
        </div>
      </div>

      {/* Real IndiaMART B2B Services Showcase */}
      <div className="space-y-6">
        <div className="border-b border-[#e5e4df] pb-4">
          <span className="text-[10px] font-bold tracking-widest text-[#cc785c] uppercase">
            KANPUR FACTORY PRODUCTION
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
            CUSTOM MERCHANDISING & B2B APPAREL
          </h2>
          <p className="text-xs text-[#6c6a64] mt-1">
            Genuine manufacturing capabilities directly from our Kanpur studio. High-definition prints, embroidery, and blank supplies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'T-Shirt DTF Printing Service',
              price: '₹100 / piece',
              moq: 'MOQ: 50 Pieces',
              image: 'https://5.imimg.com/data5/SELLER/Default/2026/3/590885404/MA/PR/OG/180956315/t-shirt-printing-services-500x500.jpeg',
              desc: 'High-density Direct-to-Film transfer with vibrant multi-color reproduction on combed cotton and French Terry.',
            },
            {
              title: 'Machine Embroidery Service',
              price: '₹150 / piece',
              moq: 'MOQ: 50 Pieces',
              image: 'https://5.imimg.com/data5/SELLER/Default/2026/3/590934041/EV/YM/MP/180956315/embroidery-500x500.jpeg',
              desc: 'Precision computerized multi-head embroidery for chest insignia, sleeve badges, and back artwork.',
            },
            {
              title: 'Jersey Customization Service',
              price: '₹450 / piece',
              moq: 'MOQ: 15 Pieces',
              image: 'https://5.imimg.com/data5/SELLER/Default/2026/4/598343279/DS/SE/FU/180956315/imported-jersey-customization-500x500.jpeg',
              desc: 'Sublimation printing, personalized squad numbering, names, and team crests for athletic clubs.',
            },
            {
              title: 'Promotional Bio-Washed Tees',
              price: '₹210 / piece',
              moq: 'MOQ: 100 Pieces',
              image: 'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg',
              desc: '180–200 GSM 100% bio-washed cotton blanks ready for corporate branding and startup merchandise.',
            },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#e5e4df] overflow-hidden flex flex-col group">
              <div className="relative aspect-square w-full bg-[#f4f1ea] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-[#141413] text-[#faf9f5] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5">
                  {item.moq}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-[#141413] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#6c6a64] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#e5e4df] flex items-center justify-between">
                  <span className="font-heading font-extrabold text-xs text-[#cc785c]">
                    {item.price}
                  </span>
                  <a
                    href={`https://wa.me/917985232434?text=${encodeURIComponent(`Hi INVEINS, I want to inquire about bulk ordering for ${item.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-extrabold uppercase tracking-wider text-[#141413] hover:text-[#cc785c]"
                  >
                    Quick WhatsApp MOQ &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Form Section */}
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 border border-[#e5e4df] shadow-sm">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
              ENQUIRY SUBMITTED!
            </h2>
            <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
              Thank you for reaching out, <strong>{formData.name}</strong> ({formData.company}). Our B2B representative will review your request and get back to <strong>{formData.email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-8 hover:bg-black transition-colors"
            >
              SUBMIT ANOTHER ENQUIRY
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-[#e5e4df] pb-4 mb-6">
              <h2 className="font-heading font-bold text-xl uppercase tracking-wider text-[#171717]">
                WHOLESALE ENQUIRY FORM
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Fill out the details below and our team will provide wholesale catalog & pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  COMPANY NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Store / Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  EMAIL *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="name@business.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  PHONE *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="+91 90000 00000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  CITY / COUNTRY *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cityCountry}
                  onChange={e => setFormData({ ...formData, cityCountry: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Mumbai, India"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  APPROX. QUANTITY *
                </label>
                <input
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="e.g. 50-100 pieces"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                PRODUCT INTEREST *
              </label>
              <input
                type="text"
                required
                value={formData.productInterest}
                onChange={e => setFormData({ ...formData, productInterest: e.target.value })}
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                placeholder="e.g. Essential Tees & Studio Hoodies"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                MESSAGE *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                placeholder="Tell us about your store, location, and requirements..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={15} /> SUBMIT WHOLESALE ENQUIRY
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
