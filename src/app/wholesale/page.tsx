'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Send,
  Building2,
  Package,
  ShieldCheck,
  Clock,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Phone,
  Mail,
  Loader2,
  Filter,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { sanitizeString } from '@/lib/sanitize';
import { WholesaleProduct } from '@/types/wholesale';

export default function WholesalePage() {
  const { addWholesaleEnquiry } = useCart();

  // Products from API
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Estimate Modal State
  const [selectedProductForEstimate, setSelectedProductForEstimate] = useState<WholesaleProduct | null>(null);
  const [modalFormData, setModalFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    cityCountry: '',
    quantity: '50-100 Pieces',
    customizationInterest: '',
    message: '',
    company_website_hp: '', // Honeypot
  });
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [modalError, setModalError] = useState('');

  // General Bottom Form State
  const [generalSubmitted, setGeneralSubmitted] = useState(false);
  const [isGeneralSubmitting, setIsGeneralSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [generalFormData, setGeneralFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    cityCountry: '',
    productInterest: '',
    quantity: '100 Pieces',
    message: '',
    company_website_hp: '', // Honeypot
  });

  // Fetch Wholesale Products
  useEffect(() => {
    async function loadWholesaleProducts() {
      try {
        const res = await fetch('/api/wholesale/products', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load wholesale products:', err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadWholesaleProducts();
  }, []);

  // Categories list derived dynamically from products
  const categoriesList = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Open estimate modal for specific product
  const handleOpenEstimate = (prod: WholesaleProduct) => {
    setSelectedProductForEstimate(prod);
    setModalFormData(prev => ({
      ...prev,
      quantity: prod.moq ? `MOQ: ${prod.moq}` : '50 Pieces',
      customizationInterest: prod.customizationOptions?.[0] || 'Bulk blanks',
      message: `Looking for an estimate for "${prod.name}" (MOQ: ${prod.moq}).`,
    }));
    setModalSubmitted(false);
    setModalError('');
  };

  const handleCloseEstimateModal = () => {
    setSelectedProductForEstimate(null);
    setModalSubmitted(false);
    setModalError('');
  };

  // Handle Modal Estimate Submission
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForEstimate) return;

    if (modalFormData.company_website_hp) {
      return; // Honeypot bot rejection
    }

    setIsModalSubmitting(true);
    setModalError('');

    const formattedInterest = `${selectedProductForEstimate.name} [MOQ: ${selectedProductForEstimate.moq}]`;
    const formattedMessage = [
      modalFormData.customizationInterest ? `Customization: ${modalFormData.customizationInterest}` : '',
      modalFormData.message ? `Notes: ${modalFormData.message}` : '',
    ].filter(Boolean).join(' | ');

    const res = await addWholesaleEnquiry({
      name: sanitizeString(modalFormData.name),
      company: sanitizeString(modalFormData.company),
      email: sanitizeString(modalFormData.email),
      phone: sanitizeString(modalFormData.phone),
      cityCountry: sanitizeString(modalFormData.cityCountry),
      productInterest: sanitizeString(formattedInterest),
      quantity: sanitizeString(modalFormData.quantity),
      message: sanitizeString(formattedMessage),
    });

    setIsModalSubmitting(false);

    if (res.success) {
      setModalSubmitted(true);
    } else {
      setModalError(res.message || 'Failed to submit estimate inquiry. Please check your details.');
    }
  };

  // Handle General Bottom Form Submit
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generalFormData.company_website_hp) return;

    setIsGeneralSubmitting(true);
    setGeneralError('');

    const res = await addWholesaleEnquiry({
      name: sanitizeString(generalFormData.name),
      company: sanitizeString(generalFormData.company),
      email: sanitizeString(generalFormData.email),
      phone: sanitizeString(generalFormData.phone),
      cityCountry: sanitizeString(generalFormData.cityCountry),
      productInterest: sanitizeString(generalFormData.productInterest || 'General B2B Custom Apparel'),
      quantity: sanitizeString(generalFormData.quantity),
      message: sanitizeString(generalFormData.message),
    });

    setIsGeneralSubmitting(false);

    if (res.success) {
      setGeneralSubmitted(true);
    } else {
      setGeneralError(res.message || 'Failed to submit enquiry. Please check your details.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          FOR STORES, RESELLERS & BULK BUYERS • KANPUR APPAREL FACTORY
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#171717] tracking-tight mt-1">
          INVEINS WHOLESALE
        </h1>
        <p className="text-xs sm:text-base text-[#737373] mt-3 leading-relaxed">
          Premium heavyweight blanks, computerized embroidery, and direct DTF printing engineered for independent brands and store partners. Get custom volume estimates tailored to your production run.
        </p>
      </div>

      {/* 4 Wholesale Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">01</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            ESTIMATE ON DEMAND
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Transparent, factory-direct quotation tiers based on your exact quantity and print requirements.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">02</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            HEAVYWEIGHT TEXTILES
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            180–240 GSM combed cotton blanks and 380 GSM French Terry crafted for repeat brand loyalty.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">03</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            IN-HOUSE PRINT & EMBROIDERY
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Industrial Tajima multi-head embroidery and ultra-vibrant DTF machinery direct from Kanpur.
          </p>
        </div>

        <div className="bg-white p-6 border border-[#e5e4df] space-y-2">
          <span className="font-heading font-extrabold text-2xl text-[#737373]">04</span>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-[#171717]">
            FLEXIBLE B2B QUANTITIES
          </h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Accessible MOQs starting at 30–50 pieces so independent labels can launch without holding dead stock.
          </p>
        </div>
      </div>

      {/* WHOLESALE PRODUCTS CATALOG SECTION */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e4df] pb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#cc785c] uppercase">
              B2B CATALOG & MANUFACTURING SPECIFICATIONS
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
              WHOLESALE PRODUCTS & BLANKS
            </h2>
            <p className="text-xs text-[#6c6a64] mt-1">
              Select any garment or service to view factory specifications and request an instant production estimate.
            </p>
          </div>

          {/* Category Filter Pills */}
          {categoriesList.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-[#737373] border-[#e5e4df] hover:border-[#171717] hover:text-[#171717]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoadingProducts ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#737373]">
            <Loader2 size={24} className="animate-spin text-[#171717]" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading Wholesale Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373]">
            No wholesale products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(item => {
              const mainImg = item.images?.[0] || 'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg';
              const waText = `Hi INVEINS, I want to inquire about wholesale quote and estimate for: ${item.name} (${item.moq ? `MOQ: ${item.moq}` : ''}).`;
              const waUrl = `https://wa.me/917985232434?text=${encodeURIComponent(waText)}`;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#e5e4df] overflow-hidden flex flex-col group hover:border-[#171717] transition-all duration-300 shadow-xs"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-square w-full bg-[#f4f1ea] overflow-hidden">
                    <Image
                      src={mainImg}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
                      {item.moq && (
                        <span className="bg-[#141413] text-[#faf9f5] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                          MOQ: {item.moq}
                        </span>
                      )}
                      {item.badge && (
                        <span className="bg-[#cc785c] text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {item.gsm && (
                      <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#171717] border border-[#e5e4df] text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wide">
                        {item.gsm}
                      </span>
                    )}
                  </div>

                  {/* Product Details (Strictly No Retail Price!) */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-[#cc785c] uppercase tracking-wider">
                        {item.category}
                      </div>

                      <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#141413] leading-snug line-clamp-2">
                        {item.name}
                      </h3>

                      {item.tagline && (
                        <p className="text-[11px] text-[#6c6a64] line-clamp-2 leading-relaxed">
                          {item.tagline}
                        </p>
                      )}

                      {/* Sizes Chips */}
                      {item.availableSizes && item.availableSizes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-[#737373]">
                          <span className="font-semibold uppercase tracking-wider text-[9px]">Sizes:</span>
                          {item.availableSizes.slice(0, 4).map(sz => (
                            <span key={sz} className="px-1.5 py-0.2 bg-[#f5f4f0] border border-[#e5e4df] font-mono font-bold text-[#171717]">
                              {sz}
                            </span>
                          ))}
                          {item.availableSizes.length > 4 && (
                            <span className="text-[9px] font-semibold text-[#737373]">
                              +{item.availableSizes.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing Display: NO PRICE DIGIT - ESTIMATE ON REQUEST */}
                    <div className="pt-3 border-t border-[#e5e4df] space-y-3">
                      <div className="bg-[#faf9f5] border border-[#e5e4df] p-2.5 rounded-none flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-[#737373]">
                            PRICING
                          </div>
                          <div className="font-heading font-extrabold text-xs text-[#171717] tracking-tight">
                            Custom Estimate On Request
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5">
                          Tiered Margins
                        </span>
                      </div>

                      {/* Action CTAs */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEstimate(item)}
                          className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-[10px] font-extrabold uppercase tracking-wider py-2.5 px-2 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send size={11} /> Request Quote
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white text-[10px] font-extrabold uppercase tracking-wider py-2.5 px-2 flex items-center justify-center gap-1 transition-colors text-center"
                        >
                          WhatsApp &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ESTIMATE REQUEST MODAL */}
      {selectedProductForEstimate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#e5e4df] pb-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#cc785c]">
                  B2B ESTIMATE & QUOTATION INQUIRY
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#171717] uppercase tracking-tight mt-0.5">
                  Request Wholesale Estimate
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEstimateModal}
                className="w-8 h-8 flex items-center justify-center border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Selected Product Summary Card */}
            <div className="flex items-center gap-3.5 bg-[#faf9f5] border border-[#e5e4df] p-3">
              <div className="relative w-16 h-16 bg-[#eae8e3] shrink-0 border border-[#e5e4df] overflow-hidden">
                <Image
                  src={selectedProductForEstimate.images?.[0] || 'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'}
                  alt={selectedProductForEstimate.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-heading font-extrabold text-xs sm:text-sm text-[#171717] truncate">
                  {selectedProductForEstimate.name}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#737373]">
                  {selectedProductForEstimate.moq && (
                    <span className="bg-[#171717] text-white font-bold px-1.5 py-0.2">
                      MOQ: {selectedProductForEstimate.moq}
                    </span>
                  )}
                  {selectedProductForEstimate.gsm && (
                    <span className="font-mono font-semibold text-[#171717]">
                      {selectedProductForEstimate.gsm}
                    </span>
                  )}
                  <span className="text-[#cc785c] font-bold">
                    • {selectedProductForEstimate.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body / Form */}
            {modalSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717]">
                  ESTIMATE REQUEST RECEIVED!
                </h4>
                <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong>{modalFormData.name}</strong> ({modalFormData.company}). Our B2B merchandising team will prepare a formal estimate for <strong>{selectedProductForEstimate.name}</strong> and contact you via WhatsApp / email within 24 hours.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCloseEstimateModal}
                    className="bg-[#171717] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 hover:bg-black transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-semibold text-center">
                    ⚠️ {modalError}
                  </div>
                )}

                {/* Honeypot hidden input */}
                <input
                  type="text"
                  name="company_website_hp"
                  value={modalFormData.company_website_hp}
                  onChange={e => setModalFormData({ ...modalFormData, company_website_hp: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      YOUR FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalFormData.name}
                      onChange={e => setModalFormData({ ...modalFormData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      COMPANY / STORE NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalFormData.company}
                      onChange={e => setModalFormData({ ...modalFormData, company: e.target.value })}
                      placeholder="e.g. Studio Nine Apparel"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      WHATSAPP / PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      required
                      value={modalFormData.phone}
                      onChange={e => setModalFormData({ ...modalFormData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={modalFormData.email}
                      onChange={e => setModalFormData({ ...modalFormData, email: e.target.value })}
                      placeholder="business@example.com"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      CITY & STATE *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalFormData.cityCountry}
                      onChange={e => setModalFormData({ ...modalFormData, cityCountry: e.target.value })}
                      placeholder="e.g. Delhi NCR, India"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      TARGET QUANTITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={modalFormData.quantity}
                      onChange={e => setModalFormData({ ...modalFormData, quantity: e.target.value })}
                      placeholder="e.g. 50, 100, 250 pieces"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                {/* Customization Options Radio/Select */}
                {selectedProductForEstimate.customizationOptions && selectedProductForEstimate.customizationOptions.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      CUSTOMIZATION / BRANDING REQUIREMENT
                    </label>
                    <select
                      value={modalFormData.customizationInterest}
                      onChange={e => setModalFormData({ ...modalFormData, customizationInterest: e.target.value })}
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      {selectedProductForEstimate.customizationOptions.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    SPECIFICATIONS & NOTES
                  </label>
                  <textarea
                    rows={3}
                    value={modalFormData.message}
                    onChange={e => setModalFormData({ ...modalFormData, message: e.target.value })}
                    placeholder="Provide details about artwork dimensions, preferred fabric colors, delivery timeline..."
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#e5e4df]">
                  <button
                    type="button"
                    onClick={handleCloseEstimateModal}
                    className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-3 px-4 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isModalSubmitting}
                    className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-6 flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isModalSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit For Estimate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* General Wholesale Inquiry Form (Bottom Section) */}
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 border border-[#e5e4df] shadow-sm">
        {generalSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
              ENQUIRY SUBMITTED!
            </h2>
            <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
              Thank you for reaching out, <strong>{generalFormData.name}</strong> ({generalFormData.company}). Our B2B representative will review your request and get back to <strong>{generalFormData.email}</strong> within 24 hours.
            </p>
            <button
              onClick={() => setGeneralSubmitted(false)}
              className="mt-4 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-8 hover:bg-black transition-colors"
            >
              SUBMIT ANOTHER ENQUIRY
            </button>
          </div>
        ) : (
          <form onSubmit={handleGeneralSubmit} className="space-y-6">
            <div className="border-b border-[#e5e4df] pb-4 mb-6">
              <h2 className="font-heading font-bold text-xl uppercase tracking-wider text-[#171717]">
                CUSTOM B2B WHOLESALE ENQUIRY
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Need a completely tailored merchandise collection, university bulk order, or specialized garment development? Send us your brief below.
              </p>
            </div>

            {generalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 font-semibold text-center">
                ⚠️ {generalError}
              </div>
            )}

            {/* Honeypot hidden input */}
            <input
              type="text"
              name="company_website_hp"
              value={generalFormData.company_website_hp}
              onChange={e => setGeneralFormData({ ...generalFormData, company_website_hp: e.target.value })}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  value={generalFormData.name}
                  onChange={e => setGeneralFormData({ ...generalFormData, name: e.target.value })}
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
                  value={generalFormData.company}
                  onChange={e => setGeneralFormData({ ...generalFormData, company: e.target.value })}
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
                  value={generalFormData.email}
                  onChange={e => setGeneralFormData({ ...generalFormData, email: e.target.value })}
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
                  value={generalFormData.phone}
                  onChange={e => setGeneralFormData({ ...generalFormData, phone: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="+91 98765 43210"
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
                  value={generalFormData.cityCountry}
                  onChange={e => setGeneralFormData({ ...generalFormData, cityCountry: e.target.value })}
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
                  value={generalFormData.quantity}
                  onChange={e => setGeneralFormData({ ...generalFormData, quantity: e.target.value })}
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
                value={generalFormData.productInterest}
                onChange={e => setGeneralFormData({ ...generalFormData, productInterest: e.target.value })}
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                placeholder="e.g. Heavyweight Tees, Gymwear, Custom Uniforms"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                MESSAGE *
              </label>
              <textarea
                required
                rows={4}
                value={generalFormData.message}
                onChange={e => setGeneralFormData({ ...generalFormData, message: e.target.value })}
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                placeholder="Tell us about your brand, artwork requirements, timeline..."
              />
            </div>

            <button
              type="submit"
              disabled={isGeneralSubmitting}
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGeneralSubmitting ? (
                <span>SUBMITTING ENQUIRY...</span>
              ) : (
                <>
                  <Send size={15} /> SUBMIT WHOLESALE ENQUIRY
                </>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
