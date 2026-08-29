'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { Plus, Minus, MapPin, Ruler, ChevronDown, ChevronUp, ShoppingBag, Zap, Sparkles, Check, AlertTriangle, Layers } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { productsList, addToCart, setIsSizeGuideOpen, openExpressBuy } = useCart();

  const product = productsList.find(p => p.id === productId);

  if (!product) {
    notFound();
  }

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);

  // Outfit Pairing Item for "COMPLETE THE LOOK"
  const pairedProduct = product.completeLookWith
    ? productsList.find(p => p.id === product.completeLookWith)
    : null;

  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    material: false,
    shipping: false,
    returns: false,
  });

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeResult(`✓ Express Pan-India Delivery available for ${pincode} (3-4 Business Days)`);
    } else {
      setPincodeResult(`⚠️ Please enter a valid 6-digit Indian PIN code.`);
    }
  };

  const isSoldOut = product.badge === 'SOLD OUT' || product.availableStock === 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 10;
  const recommendedProducts = productsList.filter(p => p.id !== product.id).slice(0, 3);

  const handleBuyCompleteLook = () => {
    if (!product || !pairedProduct) return;
    // Add both to cart
    addToCart(product, selectedSize, 1);
    addToCart(pairedProduct, pairedProduct.sizes[0] || 'M', 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Image Gallery Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-[#e5e4df] overflow-hidden border border-[#e5e4df]">
            <Image
              src={product.images[selectedImageIdx]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold tracking-widest px-3 py-1 uppercase ${
                  product.badge === 'NEW' ? 'bg-[#171717] text-[#f5f4f0]' :
                  product.badge === 'LIMITED' ? 'bg-amber-900 text-amber-100' :
                  'bg-neutral-300 text-neutral-700'
                }`}>
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-20 h-24 bg-[#e5e4df] flex-shrink-0 border-2 transition-all ${
                    selectedImageIdx === idx ? 'border-[#171717]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Information */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Breadcrumb & Tags */}
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#737373] uppercase">
            <span>{product.category}</span>
            <span>/</span>
            <span>FIT: {product.fit || 'STANDARD'}</span>
            <span>/</span>
            <span className="text-[#171717]">{product.badge || 'IN STOCK'}</span>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] tracking-tight">
              {product.name}
            </h1>
            <p className="font-extrabold text-2xl text-[#171717] mt-2">
              {product.currency}{product.price.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-[#737373] mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Low Stock Urgency Alert (Snitch Beater Feature) */}
          {isLowStock && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-700 flex-shrink-0" />
              <span>LIMITED RELEASE: ONLY {product.availableStock} PIECES LEFT IN STOCK!</span>
            </div>
          )}

          {/* Size Selector */}
          {!isSoldOut && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">SELECT SIZE</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs font-bold uppercase underline tracking-wider text-[#737373] hover:text-[#171717] flex items-center gap-1"
                >
                  <Ruler size={14} /> SIZE GUIDE
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-xs font-bold uppercase border transition-all ${
                      selectedSize === size
                        ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]'
                        : 'bg-white text-[#171717] border-[#e5e4df] hover:border-[#171717]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isSoldOut && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">QUANTITY</span>
              <div className="flex items-center w-36 border border-[#e5e4df] bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-[#737373] hover:text-[#171717]"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-[#171717]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-[#737373] hover:text-[#171717]"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Pincode Delivery Checker */}
          <div className="bg-white p-4 border border-[#e5e4df] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717]">
              <MapPin size={15} /> DELIVERY CHECKER
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="ENTER PIN CODE"
                className="flex-1 bg-[#f5f4f0] border border-[#e5e4df] px-3 py-2 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
              />
              <button
                type="submit"
                className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-wider px-4 py-2"
              >
                CHECK
              </button>
            </form>
            {pincodeResult && (
              <p className="text-[11px] font-semibold text-[#171717] pt-1">
                {pincodeResult}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            {!isSoldOut ? (
              <>
                <button
                  onClick={() => openExpressBuy(product, selectedSize)}
                  className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Zap size={16} className="fill-[#f5f4f0]" /> 1-CLICK EXPRESS BUY
                </button>

                <button
                  onClick={() => addToCart(product, selectedSize, quantity)}
                  className="w-full border-2 border-[#171717] hover:bg-[#171717] hover:text-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag size={16} /> ADD TO BAG
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full bg-neutral-300 text-neutral-600 text-xs font-bold uppercase tracking-widest py-4 cursor-not-allowed"
              >
                OUT OF STOCK
              </button>
            )}
          </div>

          {/* "COMPLETE THE LOOK" OUTFIT BUNDLE CARD (Snitch Beater Feature) */}
          {pairedProduct && (
            <div className="bg-[#171717] text-[#f5f4f0] p-5 border border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b border-[#333] pb-3">
                <span className="text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 text-[#f5f4f0]">
                  <Layers size={14} /> COMPLETE THE LOOK
                </span>
                <span className="text-[10px] font-bold text-amber-300 uppercase">RECOMMENDED STYLING</span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="relative w-16 h-20 bg-[#333] flex-shrink-0 border border-[#444]">
                  <Image src={pairedProduct.images[0]} alt={pairedProduct.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <h4 className="font-heading font-bold text-sm">{pairedProduct.name}</h4>
                  <p className="text-[11px] text-[#a3a3a3] line-clamp-1">{pairedProduct.tagline}</p>
                  <p className="font-bold text-white">₹{pairedProduct.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <button
                onClick={handleBuyCompleteLook}
                className="w-full bg-[#f5f4f0] hover:bg-white text-[#171717] text-xs font-extrabold uppercase tracking-wider py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles size={14} /> ADD COMPLETE OUTFIT TO BAG (₹{(product.price + pairedProduct.price).toLocaleString('en-IN')})
              </button>
            </div>
          )}

          {/* Accordions */}
          <div className="border-t border-[#e5e4df] pt-4 space-y-3">
            
            {/* Details */}
            <div className="border border-[#e5e4df] bg-white">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full p-4 text-left font-heading font-bold text-xs uppercase tracking-wider text-[#171717] flex justify-between items-center"
              >
                <span>PRODUCT DETAILS</span>
                {openAccordions.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.details && (
                <div className="px-4 pb-4 text-xs text-[#737373] space-y-1.5 border-t border-[#e5e4df]/50 pt-3">
                  {product.details.map((d, i) => (
                    <li key={i} className="list-disc list-inside">{d}</li>
                  ))}
                </div>
              )}
            </div>

            {/* Material & Care */}
            <div className="border border-[#e5e4df] bg-white">
              <button
                onClick={() => toggleAccordion('material')}
                className="w-full p-4 text-left font-heading font-bold text-xs uppercase tracking-wider text-[#171717] flex justify-between items-center"
              >
                <span>MATERIAL & CARE</span>
                {openAccordions.material ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.material && (
                <div className="px-4 pb-4 text-xs text-[#737373] space-y-1.5 border-t border-[#e5e4df]/50 pt-3">
                  {product.materialCare.map((m, i) => (
                    <li key={i} className="list-disc list-inside">{m}</li>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping & Delivery */}
            <div className="border border-[#e5e4df] bg-white">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full p-4 text-left font-heading font-bold text-xs uppercase tracking-wider text-[#171717] flex justify-between items-center"
              >
                <span>SHIPPING & DELIVERY</span>
                {openAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.shipping && (
                <div className="px-4 pb-4 text-xs text-[#737373] border-t border-[#e5e4df]/50 pt-3 leading-relaxed">
                  {product.shippingInfo}
                </div>
              )}
            </div>

            {/* Returns & Exchanges */}
            <div className="border border-[#e5e4df] bg-white">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full p-4 text-left font-heading font-bold text-xs uppercase tracking-wider text-[#171717] flex justify-between items-center"
              >
                <span>RETURNS & EXCHANGES</span>
                {openAccordions.returns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.returns && (
                <div className="px-4 pb-4 text-xs text-[#737373] border-t border-[#e5e4df]/50 pt-3 leading-relaxed">
                  {product.returnsInfo}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Recommended Products Carousel/Grid */}
      <section className="border-t border-[#e5e4df] pt-12 space-y-6">
        <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
          YOU MAY ALSO LIKE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {recommendedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
