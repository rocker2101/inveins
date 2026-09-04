'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { 
  Plus, Minus, MapPin, Ruler, ChevronDown, ChevronUp, 
  ShoppingBag, Zap, Sparkles, Check, AlertTriangle, 
  Heart, ShieldCheck, Share2, Star, Truck, RotateCcw, 
  Maximize2, X 
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { 
    productsList, 
    addToCart, 
    setIsSizeGuideOpen, 
    openExpressBuy, 
    isInWishlist, 
    toggleWishlist 
  } = useCart();

  const product = productsList.find(p => p.id === productId);

  if (!product) {
    notFound();
  }

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Outfit Pairing Item for "COMPLETE THE LOOK"
  const pairedProduct = product.completeLookWith
    ? productsList.find(p => p.id === product.completeLookWith)
    : null;

  // Accordion states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    material: true,
    shipping: false,
    returns: false,
  });

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ success: boolean; message: string } | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const today = new Date();
      const deliverDate = new Date(today.setDate(today.getDate() + 3));
      const formattedDate = deliverDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
      setPincodeResult({
        success: true,
        message: `Express Delivery Available to ${pincode} by ${formattedDate}. Cash on Delivery & UPI supported.`,
      });
    } else {
      setPincodeResult({
        success: false,
        message: 'Please enter a valid 6-digit Indian postal code.',
      });
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addToCart(product, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on INVEINS:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isWish = isInWishlist(product.id);
  const isSoldOut = product.badge === 'SOLD OUT' || product.availableStock === 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 8;
  const recommendedProducts = productsList.filter(p => p.id !== product.id && (p.category === product.category || p.badge === 'BESTSELLER')).slice(0, 4);

  // Structured JSON-LD Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: 'INVEINS',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'INVEINS Kanpur',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#6c6a64] border-b border-[#e6e2d8] pb-4">
        <Link href="/" className="hover:text-[#141413]">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#141413]">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#141413]">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#141413] line-clamp-1">{product.name}</span>
      </nav>

      {/* Product Detail Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        
        {/* Left Column: Interactive Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-[#f4f1ea] overflow-hidden border border-[#e6e2d8] group">
            <Image
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />

            {/* Badges */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <span className={`text-[10px] font-extrabold tracking-widest px-3 py-1 uppercase ${
                  product.badge === 'HOT' ? 'bg-[#cc785c] text-white' :
                  product.badge === 'NEW' ? 'bg-[#141413] text-white' :
                  product.badge === 'BESTSELLER' ? 'bg-[#15803D] text-white' :
                  'bg-neutral-800 text-white'
                }`}>
                  {product.badge}
                </span>
              </div>
            )}

            {/* Zoom trigger icon */}
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 z-10 p-2.5 bg-white/90 hover:bg-white text-[#141413] rounded-full shadow-sm transition-colors"
              aria-label="Enlarge Image"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-20 h-24 bg-[#f4f1ea] flex-shrink-0 border-2 overflow-hidden transition-all ${
                    selectedImageIdx === idx
                      ? 'border-[#141413]'
                      : 'border-[#e6e2d8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Verified Craft & Textile Guarantee */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-[#e6e2d8] text-center text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#141413]">280–420 GSM</span>
              <p className="text-[10px] text-[#6c6a64]">Custom Heavy Organic Weave</p>
            </div>
            <div className="space-y-0.5 border-x border-[#e6e2d8]">
              <span className="font-bold text-[#141413]">Pre-Shrunk</span>
              <p className="text-[10px] text-[#6c6a64]">Retains Shape After Wash</p>
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-[#141413]">Kanpur Studio</span>
              <p className="text-[10px] text-[#6c6a64]">Direct Craftsmanship</p>
            </div>
          </div>
        </div>

        {/* Right Column: Purchasing & Specifications */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header Row (Category, Wishlist, Share) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
                {product.category} {product.fit && `• FIT: ${product.fit}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleShare}
                  className="p-2 text-[#6c6a64] hover:text-[#141413] transition-colors"
                  aria-label="Share product"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 transition-colors ${
                    isWish ? 'text-red-600' : 'text-[#6c6a64] hover:text-[#141413]'
                  }`}
                  aria-label={isWish ? 'Saved in Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={18} fill={isWish ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {copiedLink && (
              <p className="text-[11px] font-bold text-[#15803D] animate-fade-in">
                ✓ Product link copied to clipboard!
              </p>
            )}

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight">
              {product.name}
            </h1>

            {/* Price & Tax Status */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-heading font-extrabold text-2xl text-[#141413]">
                {product.currency}{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#6c6a64]">
                MRP Inclusive of all taxes
              </span>
            </div>

            {/* Stock Availability */}
            <div className="pt-1">
              {isSoldOut ? (
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-xs font-bold text-[#b45309] flex items-center gap-1">
                  <AlertTriangle size={13} /> Only {product.availableStock} pieces remaining in this batch
                </span>
              ) : (
                <span className="text-xs font-semibold text-[#15803D] flex items-center gap-1">
                  <Check size={13} /> In Stock • Ready to dispatch from Kanpur Studio
                </span>
              )}
            </div>

            <p className="text-xs text-[#6c6a64] leading-relaxed pt-1">
              {product.tagline}
            </p>
          </div>

          {/* Size Selection */}
          <div className="space-y-3 pt-4 border-t border-[#e6e2d8]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                SELECT SIZE: <span className="text-[#cc785c]">{selectedSize}</span>
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] font-bold text-[#6c6a64] hover:text-[#141413] flex items-center gap-1 underline underline-offset-2"
              >
                <Ruler size={13} /> Size Guide & CM
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-11 px-3 text-xs font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-[#141413] text-[#faf9f5] shadow-xs'
                        : 'bg-white border border-[#e6e2d8] text-[#141413] hover:border-[#141413]'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Controls & Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#e6e2d8]">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#e6e2d8] bg-white h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 h-full hover:bg-neutral-100 text-[#141413]"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-xs font-bold text-[#141413]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 h-full hover:bg-neutral-100 text-[#141413]"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* 1-Click Express Buy Button */}
              <button
                onClick={() => openExpressBuy(product, selectedSize)}
                disabled={isSoldOut}
                className="flex-1 h-12 bg-[#141413] hover:bg-black text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Zap size={14} className="text-[#cc785c] fill-[#cc785c]" />
                1-CLICK EXPRESS BUY
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="w-full h-12 bg-white border-2 border-[#141413] hover:bg-[#141413] hover:text-white text-[#141413] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <ShoppingBag size={15} />
              {addedSuccess ? 'ADDED TO BAG!' : 'ADD TO BAG'}
            </button>
          </div>

          {/* Indian Pincode Delivery Estimator */}
          <div className="bg-[#faf9f5] border border-[#e6e2d8] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#141413]">
              <MapPin size={14} className="text-[#cc785c]" />
              <span>ESTIMATE DELIVERY</span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-2 bg-white border border-[#e6e2d8] text-xs font-semibold focus:outline-none focus:border-[#141413]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#141413] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                CHECK
              </button>
            </form>
            {pincodeResult && (
              <p className={`text-[11px] font-bold ${pincodeResult.success ? 'text-[#15803D]' : 'text-[#c64545]'}`}>
                {pincodeResult.message}
              </p>
            )}
          </div>

          {/* "COMPLETE THE LOOK" Cross-Sell Bundling */}
          {pairedProduct && (
            <div className="border border-[#e6e2d8] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#cc785c]">
                  RECOMMENDED OUTFIT PAIRING
                </span>
                <span className="text-[10px] font-bold bg-[#faf9f5] px-2 py-0.5 border border-[#e6e2d8]">
                  BUNDLE
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <div className="relative w-16 h-20 bg-[#f4f1ea] flex-shrink-0 overflow-hidden">
                  <Image
                    src={pairedProduct.images[0]}
                    alt={pairedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-extrabold text-xs text-[#141413]">
                    {pairedProduct.name}
                  </h4>
                  <p className="text-[11px] text-[#6c6a64] line-clamp-1">{pairedProduct.tagline}</p>
                  <p className="text-xs font-bold text-[#141413] mt-1">
                    ₹{pairedProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(product, selectedSize, 1);
                  addToCart(pairedProduct, pairedProduct.sizes[0] || 'M', 1);
                  setAddedSuccess(true);
                  setTimeout(() => setAddedSuccess(false), 2000);
                }}
                className="w-full py-2.5 bg-[#faf9f5] hover:bg-[#141413] hover:text-white border border-[#141413] text-xs font-bold uppercase tracking-wider text-[#141413] transition-colors"
              >
                ADD COMPLETE OUTFIT (₹{(product.price + pairedProduct.price).toLocaleString('en-IN')})
              </button>
            </div>
          )}

          {/* Accordion Specifications */}
          <div className="border-t border-[#e6e2d8] divide-y divide-[#e6e2d8] text-xs">
            
            {/* Product Details */}
            <div className="py-3.5">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-[#141413]"
              >
                <span>PRODUCT DETAILS & FORM</span>
                {openAccordions.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.details && (
                <div className="pt-3 space-y-2 text-[#6c6a64] leading-relaxed">
                  <p>{product.description}</p>
                  {product.details && product.details.length > 0 && (
                    <ul className="space-y-1 list-disc pl-4 pt-1">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Material & Care */}
            <div className="py-3.5">
              <button
                onClick={() => toggleAccordion('material')}
                className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-[#141413]"
              >
                <span>FABRIC SPECIFICATION & CARE</span>
                {openAccordions.material ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.material && (
                <div className="pt-3 space-y-2 text-[#6c6a64] leading-relaxed">
                  {product.materialCare && product.materialCare.length > 0 ? (
                    <ul className="space-y-1 list-disc pl-4">
                      {product.materialCare.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>100% Organic Combed Cotton / Spandex recovery blend. Machine wash cold inside-out, dry in shade.</p>
                  )}
                </div>
              )}
            </div>

            {/* Shipping & Delivery */}
            <div className="py-3.5">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-[#141413]"
              >
                <span>SHIPPING & DELIVERY INFORMATION</span>
                {openAccordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.shipping && (
                <div className="pt-3 text-[#6c6a64] leading-relaxed space-y-1.5">
                  <p>• Dispatched from our Kanpur Studio within 24 hours of order confirmation.</p>
                  <p>• Express air shipping delivers within 2–4 business days across India.</p>
                  <p>• Complimentary shipping automatically applies on all orders above ₹999.</p>
                </div>
              )}
            </div>

            {/* 7-Day Free Returns & Exchanges */}
            <div className="py-3.5">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full flex items-center justify-between font-bold uppercase tracking-wider text-[#141413]"
              >
                <span>7-DAY EASY SIZE EXCHANGE</span>
                {openAccordions.returns ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordions.returns && (
                <div className="pt-3 text-[#6c6a64] leading-relaxed space-y-1.5">
                  <p>• Need a different size? We offer doorstep reverse pickup for free size exchanges within 7 days of delivery.</p>
                  <p>• Items must be unwashed, unworn, and retain original tags.</p>
                  <p>• Initiate instantly via our WhatsApp support desk at +91 7985232434.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="border-t border-[#e6e2d8] pt-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
              VERIFIED BUYERS
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#141413] tracking-tight mt-0.5">
              CUSTOMER PERSPECTIVE & WEAR REPORT
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#141413]">4.9 / 5.0 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              author: 'Arjun M.',
              loc: 'Bengaluru',
              review: 'The fabric density on this piece is unlike standard streetwear brands in India. Heavy drape, zero cling, collar holds its structure after 4 washes.',
              badge: 'Verified Buyer',
              fitReport: 'True to Size',
            },
            {
              author: 'Rohan K.',
              loc: 'Mumbai',
              review: 'Ordered via 1-Click WhatsApp buy. Reached Mumbai in 3 days straight from Kanpur. The stonewash finish is subtle and premium.',
              badge: 'Verified Buyer',
              fitReport: 'Boxy Drape',
            },
            {
              author: 'Vikram S.',
              loc: 'Delhi NCR',
              review: 'Great GSM weight. Stood up to regular studio sessions and travel. Excellent stitching reinforcement on the shoulders.',
              badge: 'Verified Buyer',
              fitReport: 'Architectural Cut',
            },
          ].map((rev, i) => (
            <div key={i} className="bg-white border border-[#e6e2d8] p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex text-amber-500 mb-1">
                    {[...Array(5)].map((_, starI) => (
                      <Star key={starI} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <h5 className="font-heading font-extrabold text-xs text-[#141413]">{rev.author} ({rev.loc})</h5>
                </div>
                <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  {rev.badge}
                </span>
              </div>
              <p className="text-xs text-[#6c6a64] leading-relaxed italic">
                "{rev.review}"
              </p>
              <div className="text-[10px] text-[#6c6a64] font-semibold pt-1 border-t border-[#e6e2d8]/60">
                Fit verdict: <span className="text-[#141413]">{rev.fitReport}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Garments Grid ("You May Also Like") */}
      <section className="border-t border-[#e6e2d8] pt-14 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
              CONSIDERED ROTATION
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-[#141413] tracking-tight mt-0.5">
              YOU MAY ALSO LIKE
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#141413] hover:underline"
          >
            Explore Catalog
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Fullscreen Image Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white bg-white/10 rounded-full"
            aria-label="Close Fullscreen"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-4xl w-full h-[85vh]">
            <Image
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
