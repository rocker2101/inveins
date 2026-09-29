'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  Scissors, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Orders & Tracking
  {
    category: 'Orders & Tracking',
    question: 'How can I track my active order?',
    answer: 'Once your order is dispatched from our Kanpur studio, you will receive an automated tracking link with an Air Waybill (AWB) number via SMS and Email. You can also view live tracking anytime on our website by visiting the Track My Order page (/account) and entering your Order ID.',
  },
  {
    category: 'Orders & Tracking',
    question: 'Can I cancel or modify my order after placing it?',
    answer: 'Yes, you can request order modifications (like size adjustments or shipping address changes) or cancellation before your parcel is dispatched. Please contact our studio care desk immediately at inveins24@gmail.com or WhatsApp us at +91 79852 32434 within 12 hours of placing the order.',
  },
  {
    category: 'Orders & Tracking',
    question: 'Do you offer Cash on Delivery (COD)?',
    answer: 'Yes, we provide Cash on Delivery (COD) for eligible pincodes across India. You will receive an automated confirmation message on WhatsApp upon choosing COD during checkout.',
  },

  // Shipping & Delivery
  {
    category: 'Shipping & Delivery',
    question: 'What are your delivery charges and shipping timelines?',
    answer: 'We offer complimentary FREE express shipping on all orders valued at ₹999 and above. For orders under ₹999, a flat delivery fee of ₹70 is applied. Orders are dispatched within 24 to 48 business hours and typically arrive within 3 to 7 working days depending on your location.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'Do you deliver across all pincodes in India?',
    answer: 'Yes! We ship to over 26,000+ pin codes across India in partnership with leading tier-1 couriers including Delhivery, BlueDart, DTDC, and Xpressbees.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'What if my package appears damaged upon arrival?',
    answer: 'If your parcel appears opened, physically tampered with, or damaged during transit, please take photos or a brief unboxing video and notify us within 48 hours of delivery at inveins24@gmail.com. We will arrange a free immediate replacement.',
  },

  // Payments & Razorpay
  {
    category: 'Payments & Security',
    question: 'What online payment methods do you accept?',
    answer: 'Through our RBI-authorized payment partner Razorpay, we accept all major Indian and international payment options: UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ banks, Credit & Debit Cards (Visa, Mastercard, RuPay, Maestro), and digital wallets.',
  },
  {
    category: 'Payments & Security',
    question: 'Is my payment information secure on INVEINS?',
    answer: '100% secure. We do not store or process your credit card numbers, CVVs, or UPI PINs on our servers. All transactions are encrypted with bank-grade 256-bit SSL protocols and processed directly through Razorpay, which is certified Level 1 PCI-DSS compliant.',
  },
  {
    category: 'Payments & Security',
    question: 'Money was deducted from my account but order is not confirmed. What happened?',
    answer: 'Occasionally, network drops between your banking app and the payment gateway can delay confirmation. If this happens, our automated reconciliation engine will either verify and confirm your order within a few hours or Razorpay will automatically reverse the full amount back to your bank within 24–48 business hours.',
  },

  // Sizing & Fabrics
  {
    category: 'Garments & Fit',
    question: 'How do I choose the correct size?',
    answer: 'Each product page features a detailed garment measurement chart indicating chest width, length, and shoulder drop in inches and centimeters. Our heavyweight tees feature a modern, relaxed boxy cut, while our compression line is engineered with an athletic, body-hugging compression profile. If you prefer an oversized fit, choose your regular size; for a tailored fit, size down one step.',
  },
  {
    category: 'Garments & Fit',
    question: 'What is special about INVEINS 280–420 GSM textiles?',
    answer: 'Unlike mass-market flimsy cotton (typically 140–180 GSM), INVEINS sources custom-knit French Terry, loopback fleece, and dense combed cotton ranging from 280 GSM to 420 GSM. These fabrics retain their architectural drape, eliminate transparency, and withstand hundreds of wash cycles without losing shape.',
  },
  {
    category: 'Garments & Fit',
    question: 'How should I wash and care for my heavyweight garments?',
    answer: 'Machine wash in cold water (max 30°C) with similar colors using mild detergent. Turn tees inside-out before washing to preserve the print and fabric hand-feel. Avoid tumble drying on high heat; air-dry in shade to maintain optimal fiber integrity.',
  },

  // Returns, Exchanges & Refunds
  {
    category: 'Returns & Refunds',
    question: 'What is your exchange and return policy?',
    answer: 'We provide a hassle-free 7-day return and exchange window from the date your order is delivered. Garments must be unworn, unwashed, and returned with original tags intact.',
  },
  {
    category: 'Returns & Refunds',
    question: 'How long does it take to receive my refund?',
    answer: 'Once your returned product is collected by our courier and inspected at our studio, your refund is approved and initiated within 24 hours. The refunded amount will reflect in your original payment method (bank account, card, or UPI) within 5 to 7 business days as per banking standards.',
  },
  {
    category: 'Returns & Refunds',
    question: 'Are there reverse pickup fees for size exchanges?',
    answer: 'We provide complimentary reverse pickup for your first size exchange on eligible orders. Our courier partner will pick up the item directly from your doorstep.',
  },

  // Wholesale & Custom
  {
    category: 'Wholesale & Custom',
    question: 'Do you accept bulk, corporate, or gym apparel orders?',
    answer: 'Yes! We run an industrial garment manufacturing setup in Kanpur with full facilities for custom fabric milling, precision pattern-making, high-density screen printing, and commercial DTF (Direct-to-Film) transfers. Visit our Wholesale & Custom DTF page or email hello@inveins.studio for custom B2B quotes.',
  },
];

const CATEGORIES = [
  'All',
  'Orders & Tracking',
  'Shipping & Delivery',
  'Payments & Security',
  'Garments & Fit',
  'Returns & Refunds',
  'Wholesale & Custom',
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesQuery = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          KNOWLEDGE BASE
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#171717] tracking-tight">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs sm:text-base text-[#737373] leading-relaxed">
          Quick answers to common questions about sizing, heavyweight textiles, shipping timelines, Razorpay payments, and returns.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-xl mx-auto relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. shipping time, refund, size, Razorpay)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#e5e4df] text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setOpenIndex(null);
            }}
            className={`px-3 sm:px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
              activeCategory === category
                ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]'
                : 'bg-white text-neutral-600 border-[#e5e4df] hover:border-neutral-400'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Accordion Questions List */}
      <div className="bg-white border border-[#e5e4df] divide-y divide-[#e5e4df]">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-4 px-6 sm:px-8 text-left flex items-center justify-between gap-4 hover:bg-[#fbfbfa] transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#cc785c] font-bold">
                      {faq.category}
                    </span>
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-[#171717] tracking-tight">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-[#737373] flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#171717]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed bg-[#fbfbfa]">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center space-y-3">
            <HelpCircle size={32} className="mx-auto text-neutral-400" />
            <p className="font-heading font-bold text-sm text-[#171717] uppercase tracking-wide">
              No matching questions found
            </p>
            <p className="text-xs text-neutral-500">
              Try searching with different keywords or contact our studio desk directly.
            </p>
          </div>
        )}
      </div>

      {/* Still Have Questions CTA */}
      <div className="bg-[#141413] text-[#faf9f5] p-8 sm:p-10 border border-[#2a2927] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#cc785c]">
            CANNOT FIND WHAT YOU ARE LOOKING FOR?
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wider">
            TALK TO OUR STUDIO TEAM
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Our team in Kanpur is on standby to assist with sizing advice, custom DTF questions, or payment reconciliations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/contact"
            className="bg-[#faf9f5] text-[#141413] hover:bg-white text-xs font-bold uppercase tracking-widest py-3 px-5 text-center flex items-center justify-center gap-2 transition-colors"
          >
            Contact Studio <ArrowRight size={14} />
          </Link>
          <a
            href="https://wa.me/917985232434"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-neutral-700 hover:border-white text-white text-xs font-bold uppercase tracking-widest py-3 px-5 text-center flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={14} /> WhatsApp Us
          </a>
        </div>
      </div>

    </div>
  );
}
