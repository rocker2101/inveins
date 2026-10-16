'use client';

import React, { useState, useEffect } from 'react';
import { X, Ticket, Tag, Check, Copy, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface OfferItem {
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrderValue: number;
}

export const AvailableOffersModal: React.FC = () => {
  const { isOffersModalOpen, setIsOffersModalOpen, coupon, applyCoupon, subtotal } = useCart();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ code: string; text: string; success: boolean } | null>(null);

  useEffect(() => {
    if (!isOffersModalOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/coupons', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.coupons)) {
          setOffers(data.coupons);
        }
      })
      .catch(err => {
        console.error('Failed to load available offers:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOffersModalOpen]);

  if (!isOffersModalOpen) return null;

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleApplyOffer = async (code: string) => {
    setApplyingCode(code);
    setFeedbackMessage(null);
    try {
      const res = await applyCoupon(code);
      setFeedbackMessage({ code, text: res.message, success: res.success });
      if (res.success) {
        setTimeout(() => {
          setIsOffersModalOpen(false);
          setFeedbackMessage(null);
        }, 1200);
      }
    } finally {
      setApplyingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-lg border border-[#e5e4df] shadow-2xl p-5 sm:p-7 relative my-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsOffersModalOpen(false)}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#171717] p-1"
          aria-label="Close offers"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#e5e4df] pb-4 mb-4">
          <div className="w-10 h-10 bg-[#171717] text-[#f5f4f0] flex items-center justify-center font-bold flex-shrink-0">
            <Ticket size={20} />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-lg uppercase tracking-wider text-[#171717]">
              AVAILABLE OFFERS & PROMOS
            </h2>
            <p className="text-[11px] text-[#737373]">
              Tap to apply active discounts directly to your shopping bag
            </p>
          </div>
        </div>

        {/* Current Bag Value Notice */}
        <div className="bg-white border border-[#e5e4df] p-3 mb-4 flex items-center justify-between text-xs">
          <span className="text-[#737373] font-medium">Your Current Subtotal:</span>
          <span className="font-heading font-extrabold text-sm text-[#171717]">
            ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`p-3 mb-4 text-xs font-bold flex items-center gap-2 border ${
              feedbackMessage.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}
          >
            {feedbackMessage.success ? <Check size={14} /> : <X size={14} />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Offers List */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#737373]">
              <Loader2 size={24} className="animate-spin text-[#171717]" />
              <span className="text-xs font-bold uppercase tracking-wider">Loading Best Offers...</span>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#737373] bg-white border border-[#e5e4df] p-6">
              <Tag size={28} className="mx-auto text-neutral-400 mb-2" />
              <p className="font-bold text-[#171717] uppercase tracking-wider">No active offers right now</p>
              <p className="text-[11px] mt-1">Check back soon for seasonal promotions and drop specials.</p>
            </div>
          ) : (
            offers.map(off => {
              const isCurrentApplied = coupon?.code === off.code;
              const isEligible = subtotal >= (off.minOrderValue || 0);
              const amountNeeded = Math.max(0, (off.minOrderValue || 0) - subtotal);

              return (
                <div
                  key={off.code}
                  className={`bg-white border p-4 transition-all relative ${
                    isCurrentApplied
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                      : 'border-[#e5e4df] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Offer Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-[#f5f4f0] border border-[#e5e4df] px-2 py-0.5 text-[#171717] tracking-wider uppercase">
                          {off.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(off.code)}
                          className="text-[#737373] hover:text-[#171717] p-1 text-[10px] flex items-center gap-1"
                          title="Copy code"
                        >
                          {copiedCode === off.code ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <Check size={11} /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 font-bold uppercase">
                              <Copy size={11} /> Copy
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="font-heading font-extrabold text-sm text-[#171717] uppercase tracking-tight">
                        {off.discountType === 'flat'
                          ? `FLAT ₹${off.discountValue} OFF`
                          : `GET ${off.discountValue}% OFF`}
                      </div>

                      <p className="text-[11px] text-[#737373]">
                        {off.minOrderValue > 0
                          ? `Valid on orders of ₹${off.minOrderValue.toLocaleString('en-IN')} or above`
                          : 'Valid on all order values with no minimum purchase'}
                      </p>
                    </div>

                    {/* Right: Apply CTA */}
                    <div className="sm:text-right flex-shrink-0">
                      {isCurrentApplied ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
                          <Check size={13} /> Applied
                        </span>
                      ) : isEligible ? (
                        <button
                          type="button"
                          disabled={applyingCode === off.code}
                          onClick={() => handleApplyOffer(off.code)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {applyingCode === off.code ? (
                            <>
                              <Loader2 size={12} className="animate-spin" /> Applying...
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} /> Apply Code
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 inline-block">
                            Add ₹{amountNeeded.toLocaleString('en-IN')} more to unlock
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-[#e5e4df] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-[#737373]">
          <p>• Only 1 promo code applies per checkout order.</p>
          <button
            onClick={() => setIsOffersModalOpen(false)}
            className="text-neutral-800 hover:text-black font-bold uppercase tracking-wider underline text-left sm:text-right"
          >
            Back to Bag
          </button>
        </div>
      </div>
    </div>
  );
};
