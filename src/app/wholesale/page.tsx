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
  ChevronLeft,
  X,
  Phone,
  Mail,
  Loader2,
  Filter,
  Eye,
  Maximize2,
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

  // Quick View & Photo Gallery Modal State (Like Retail Catalog)
  const [viewingProduct, setViewingProduct] = useState<WholesaleProduct | null>(null);

  // Estimate Modal State
  const [selectedProductForEstimate, setSelectedProductForEstimate] = useState<WholesaleProduct | null>(null);
  const [modalActiveImgIndex, setModalActiveImgIndex] = useState(0);
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
    setModalActiveImgIndex(0);
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
            {filteredProducts.map(item => (
              <WholesaleProductCard
                key={item.id}
                item={item}
                onOpenEstimate={handleOpenEstimate}
                onViewProduct={(prod) => setViewingProduct(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* PHOTO GALLERY & QUICK VIEW MODAL (LIKE RETAIL CATALOG) */}
      {viewingProduct && (
        <WholesaleGalleryModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onRequestEstimate={(prod) => {
            setViewingProduct(null);
            handleOpenEstimate(prod);
          }}
        />
      )}

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
            <div className="bg-[#faf9f5] border border-[#e5e4df] p-3 space-y-2">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 bg-[#eae8e3] shrink-0 border border-[#e5e4df] overflow-hidden">
                  <Image
                    src={
                      (selectedProductForEstimate.images && selectedProductForEstimate.images[modalActiveImgIndex]) ||
                      selectedProductForEstimate.images?.[0] ||
                      'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'
                    }
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

              {/* Thumbnails switcher in Estimate Modal if product has multiple photos */}
              {selectedProductForEstimate.images && selectedProductForEstimate.images.length > 1 && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#e5e4df] overflow-x-auto">
                  <span className="text-[9px] font-bold uppercase text-[#737373] tracking-wider shrink-0 mr-1">
                    Photos ({selectedProductForEstimate.images.length}):
                  </span>
                  {selectedProductForEstimate.images.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={() => setModalActiveImgIndex(idx)}
                      className={`relative w-8 h-8 border shrink-0 overflow-hidden cursor-pointer transition-all ${
                        modalActiveImgIndex === idx
                          ? 'border-[#171717] ring-1 ring-[#171717]'
                          : 'border-[#e5e4df] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgUrl} alt="Thumb" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
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

      {/* Wholesale Order Policy & WhatsApp Support Desk */}
      <div className="max-w-2xl mx-auto p-4 sm:p-5 bg-white border border-[#e5e4df] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div>
          <span className="font-bold text-[#171717] uppercase tracking-wider block">
            Wholesale Orders & Production Policy
          </span>
          <p className="text-[#737373] text-[11px] mt-0.5">
            B2B bulk orders are custom manufactured and exported to 5+ countries worldwide. For order status, production stage review, or refund inquiries, connect directly with our studio head on WhatsApp.
          </p>
        </div>
        <a
          href="https://wa.me/917985232434?text=Hi%20INVEINS%2C%20I%20have%20an%20inquiry%20regarding%20Wholesale%20Order%20Review%20%2F%20Refund."
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white hover:bg-black transition-colors text-[10px] font-bold uppercase tracking-wider"
        >
          <MessageSquare size={13} />
          WhatsApp Support
        </a>
      </div>

    </div>
  );
}

function WholesaleProductCard({
  item,
  onOpenEstimate,
  onViewProduct,
}: {
  item: WholesaleProduct;
  onOpenEstimate: (prod: WholesaleProduct) => void;
  onViewProduct: (prod: WholesaleProduct) => void;
}) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : ['https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'];

  const currentImg = images[activeImgIndex] || images[0];

  const waText = `Hi INVEINS, I want to inquire about wholesale quote and estimate for: ${item.name} (${item.moq ? `MOQ: ${item.moq}` : ''}).`;
  const waUrl = `https://wa.me/917985232434?text=${encodeURIComponent(waText)}`;

  return (
    <div 
      className="bg-white border border-[#e5e4df] overflow-hidden flex flex-col group hover:border-[#171717] transition-all duration-300 shadow-xs hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clickable Image Container (Like Retail Catalog) */}
      <div 
        onClick={() => onViewProduct(item)}
        className="relative aspect-square w-full bg-[#f4f1ea] overflow-hidden cursor-pointer"
        title="Click to view all photos & manufacturing specs"
      >
        {/* Ambient blurred backdrop so any aspect ratio looks complete */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${currentImg})` }}
        />

        {/* Primary Photo */}
        <Image
          src={images[0]}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-all duration-500 ease-out ${
            images[1] && isHovered && activeImgIndex === 0
              ? 'opacity-0 scale-105'
              : 'opacity-100 group-hover:scale-105'
          }`}
        />

        {/* Alternate view on hover (like retail catalog ProductCard) */}
        {images[1] && activeImgIndex === 0 && (
          <Image
            src={images[1]}
            alt={`${item.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-all duration-500 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0'
            }`}
          />
        )}

        {/* Selected non-zero photo */}
        {activeImgIndex > 0 && (
          <Image
            src={images[activeImgIndex]}
            alt={`${item.name} view ${activeImgIndex + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
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

        {/* Top-Right Quick View Eye Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(item);
            }}
            className="min-w-[34px] min-h-[34px] rounded-full bg-white/95 hover:bg-[#171717] hover:text-white text-[#171717] transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer"
            title="View All Photos & Details"
          >
            <Eye size={15} />
          </button>
        </div>

        {item.gsm && (
          <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#171717] border border-[#e5e4df] text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wide z-10 pointer-events-none">
            {item.gsm}
          </span>
        )}

        {/* Multi-Photo Dots & Photo Count Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className="bg-[#171717]/85 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5">
              📸 {images.length}
            </span>
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeImgIndex === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white'
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details (Strictly No Retail Price!) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-[#cc785c] uppercase tracking-wider">
            {item.category}
          </div>

          <h3 
            onClick={() => onViewProduct(item)}
            className="font-heading font-extrabold text-sm sm:text-base text-[#141413] hover:text-[#cc785c] cursor-pointer transition-colors leading-snug line-clamp-2"
            title={item.name}
          >
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
              onClick={() => onOpenEstimate(item)}
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
}

/**
 * WHOLESALE PHOTO GALLERY & QUICK VIEW MODAL
 * Matches the retail catalog's QuickViewModal and /product/[id] interactive gallery.
 */
function WholesaleGalleryModal({
  product,
  onClose,
  onRequestEstimate,
}: {
  product: WholesaleProduct;
  onClose: () => void;
  onRequestEstimate: (prod: WholesaleProduct) => void;
}) {
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'];

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const currentImg = images[selectedImgIdx] || images[0];
  const waText = `Hi INVEINS, I want to inquire about wholesale quote and estimate for: ${product.name} (${product.moq ? `MOQ: ${product.moq}` : ''}).`;
  const waUrl = `https://wa.me/917985232434?text=${encodeURIComponent(waText)}`;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl bg-[#faf9f5] border border-[#e6e2d8] shadow-2xl overflow-hidden animate-scale-up my-auto max-h-[92vh] flex flex-col md:flex-row"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 min-h-[40px] min-w-[40px] flex items-center justify-center bg-white/95 hover:bg-white text-[#141413] transition-colors rounded-full shadow-md cursor-pointer border border-[#e5e4df]"
            aria-label="Close Gallery"
          >
            <X size={18} />
          </button>

          {/* Left Column: Interactive Image Gallery */}
          <div className="md:w-1/2 bg-[#f0ede6] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e5e4df] p-4 sm:p-6 space-y-3">
            {/* Main Image Stage */}
            <div className="relative aspect-square w-full bg-white border border-[#e5e4df] overflow-hidden group">
              <div 
                className="absolute inset-0 bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${currentImg})` }}
              />
              <Image
                src={currentImg}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="relative z-1 object-contain object-center p-2"
                priority
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
                {product.moq && (
                  <span className="bg-[#141413] text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                    MOQ: {product.moq}
                  </span>
                )}
                {product.badge && (
                  <span className="bg-[#cc785c] text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Zoom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3 right-3 z-10 p-2 bg-white/90 hover:bg-white text-[#141413] rounded-full shadow-sm cursor-pointer"
                title="Fullscreen Zoom"
              >
                <Maximize2 size={16} />
              </button>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImgIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#141413] flex items-center justify-center shadow-md cursor-pointer transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImgIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#141413] flex items-center justify-center shadow-md cursor-pointer transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip with Photo Count */}
            {images.length > 1 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  <span>Product Gallery ({images.length} Photos)</span>
                  <span className="font-mono">{selectedImgIdx + 1} of {images.length}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`relative w-16 h-16 bg-white shrink-0 border-2 overflow-hidden transition-all cursor-pointer ${
                        selectedImgIdx === idx
                          ? 'border-[#171717] shadow-xs'
                          : 'border-[#e5e4df] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="Thumb" fill className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Full Manufacturing Specifications */}
          <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#cc785c]">
                  <span>{product.category}</span>
                  {product.gsm && (
                    <span className="font-mono text-[#171717] bg-[#f5f4f0] border border-[#e5e4df] px-1.5 py-0.2">
                      {product.gsm}
                    </span>
                  )}
                </div>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#171717] tracking-tight mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Pricing Display */}
              <div className="bg-[#faf9f5] border border-[#e5e4df] p-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#737373]">
                    B2B PRICING & TIER
                  </div>
                  <div className="font-heading font-extrabold text-sm text-[#171717] mt-0.5">
                    Custom Volume Estimate On Request
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5">
                  Factory Direct
                </span>
              </div>

              {product.tagline && (
                <p className="text-xs font-semibold text-[#171717] leading-relaxed">
                  {product.tagline}
                </p>
              )}

              {product.description && (
                <div className="text-xs text-[#737373] leading-relaxed space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block">
                    Manufacturing Details:
                  </span>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Available Sizes */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#e5e4df]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block">
                    Available Sizes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.availableSizes.map(sz => (
                      <span
                        key={sz}
                        className="px-2 py-1 bg-white border border-[#e5e4df] text-xs font-mono font-bold text-[#171717]"
                      >
                        {sz}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization Services */}
              {product.customizationOptions && product.customizationOptions.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#e5e4df]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717] block">
                    Supported Print & Customization Services:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.customizationOptions.map(opt => (
                      <span
                        key={opt}
                        className="px-2 py-1 bg-[#f5f4f0] text-[11px] font-bold text-[#171717] border border-[#e5e4df]"
                      >
                        ✓ {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#e5e4df] space-y-2">
              <button
                type="button"
                onClick={() => onRequestEstimate(product)}
                className="w-full bg-[#171717] hover:bg-black text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Send size={13} />
                REQUEST CUSTOM ESTIMATE
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MessageSquare size={14} />
                WhatsApp Direct Estimate
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN ZOOM LIGHTBOX */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>

          <div 
            className="relative w-full max-w-5xl h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={currentImg}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImgIdx(idx);
                  }}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    selectedImgIdx === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}


