import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, Clock, CheckCircle, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | INVEINS Fashion',
  description: 'Official 24-hour refund, cancellation, and exchange terms for orders placed with INVEINS APPARELS.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'October 16, 2026';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          CUSTOMER ASSURANCE
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          REFUND & CANCELLATION
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2">
          Last Updated: {lastUpdated} • INVEINS APPARELS
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#e5e4df] p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-[#333] leading-relaxed">
        
        {/* Core Guarantee Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#e5e4df]">
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <Clock size={20} className="mx-auto text-[#cc785c]" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">24-HOUR CANCELLATION</h4>
            <p className="text-neutral-500 text-[11px]">Eligible within 24 hours of placing order</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <RotateCcw size={20} className="mx-auto text-[#cc785c]" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">24-HOUR RETURN WINDOW</h4>
            <p className="text-neutral-500 text-[11px]">Notify within 24 hours of delivery</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <CheckCircle size={20} className="mx-auto text-emerald-600" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">5–7 DAYS REFUND</h4>
            <p className="text-neutral-500 text-[11px]">Credited directly to original payment source</p>
          </div>
        </div>

        {/* Section 1: Order Cancellation & Refund */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">01.</span> 24-Hour Order Cancellation & Refund Policy
          </h2>
          <p>
            You can request cancellation and a 100% full refund for your order strictly <strong>within 24 hours of placing the order</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>
              <strong>Instant Request via My Orders:</strong> You can click the <strong>&ldquo;Refund / Cancel&rdquo;</strong> button directly in your{' '}
              <Link href="/account" className="text-[#cc785c] underline font-medium">
                Customer Account / Order History
              </Link>{' '}
              to instantly connect with our studio desk via WhatsApp with your pre-filled Order ID.
            </li>
            <li>
              <strong>Direct WhatsApp / Email:</strong> Alternatively, contact us immediately at{' '}
              <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline">
                inveins24@gmail.com
              </a>{' '}
              or WhatsApp at <strong>+91 79852 32434</strong> with your Order ID within the 24-hour window.
            </li>
            <li>
              <strong>Post 24-Hour Dispatch:</strong> After 24 hours, orders enter automated cutting, packing, and courier dispatch. Once picked up by our courier partner with an assigned tracking AWB, the order cannot be cancelled in transit.
            </li>
            <li>
              <strong>Wholesale Orders:</strong> Wholesale / B2B bulk orders are customized and strictly non-refundable once production or fabric procurement has commenced.
            </li>
          </ul>
        </section>

        {/* Section 2: Returns & Exchanges Window */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">02.</span> 24-Hour Return & Exchange Window
          </h2>
          <p>
            We take immense pride in the craftsmanship of our heavyweight streetwear. If an item arrives damaged, does not fit, or you wish to request a return/exchange, you must notify our team within <strong>24 hours of confirmed delivery</strong>.
          </p>
          <p className="font-semibold text-[#171717]">To qualify for a return or exchange, items must satisfy the following conditions:</p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>Garments must be unworn, unwashed, and free of stains, perfume fragrances, or deodorant marks.</li>
            <li>All original garment tags, woven brand labels, and eco-packaging must remain intact and attached.</li>
            <li>Customized garments (e.g. custom wholesale DTF prints or altered lengths) are non-returnable unless defective.</li>
          </ul>
        </section>

        {/* Section 3: Damaged, Defective or Incorrect Items */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">03.</span> Damaged or Defective Items on Delivery
          </h2>
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xs space-y-2">
            <p className="font-semibold text-amber-950 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" />
              Transit Damage or Wrong Item Received
            </p>
            <p className="text-amber-900 text-xs">
              If your package arrives physically tampered with, damaged, or contains an incorrect item, please notify us within <strong>24 hours of delivery</strong> with unboxing photographs or a short video. We will dispatch an immediate free replacement or issue a 100% full refund at no additional courier charge.
            </p>
          </div>
        </section>

        {/* Section 4: Refund Processing & Timelines */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">04.</span> Refund Processing & Timelines
          </h2>
          <p>
            For verified 24-hour cancellations or inspected returns, refunds are initiated promptly by our accounts desk.
          </p>
          <div className="p-4 bg-[#fbfbfa] border-l-2 border-[#171717] space-y-2">
            <p className="font-bold text-[#171717]">
              Refund Turnaround Time: 5 to 7 Working Days
            </p>
            <p className="text-neutral-600">
              Upon approval, refunds are initiated immediately and credited back to the <strong>original source of payment</strong> (UPI ID, Net Banking, or Credit/Debit Card via Cashfree Payments) within <strong>5 to 7 business days</strong>, depending on your bank&apos;s settlement cycle.
            </p>
            <p className="text-neutral-600 text-xs">
              For Cash on Delivery (COD) orders, our support team will contact you to collect your preferred UPI ID or Bank NEFT details to remit the refund securely.
            </p>
          </div>
        </section>

        {/* Section 5: Step-by-Step Return / Refund Process */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">05.</span> How to Request a Refund, Cancellation or Exchange
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
            <li>
              <strong>One-Click via Account:</strong> Visit your <Link href="/account" className="text-[#cc785c] underline font-medium">My Orders</Link> section and click <strong>&ldquo;Refund / Cancel&rdquo;</strong> to chat directly with the store owner on WhatsApp with your Order ID pre-filled.
            </li>
            <li>
              <strong>WhatsApp / Email:</strong> Alternatively, reach out directly to <strong>+91 79852 32434</strong> or <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline font-medium">inveins24@gmail.com</a> within 24 hours of ordering/delivery.
            </li>
            <li>
              <strong>Prompt Resolution:</strong> For pre-dispatch cancellations, refunds are initiated on the same day. For physical returns, reverse pickup is scheduled within 2 working days.
            </li>
          </ol>
        </section>

        {/* Support Section */}
        <div className="pt-6 border-t border-[#e5e4df] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#171717] uppercase tracking-wider text-xs">
              Need assistance with an active order?
            </h4>
            <p className="text-neutral-500 text-xs mt-0.5">
              Our studio care desk is available Monday through Saturday, 10:00 AM – 7:00 PM IST.
            </p>
          </div>
          <a
            href="https://wa.me/917985232434?text=Hi%20INVEINS%2C%20I%20have%20a%20query%20about%20Refund%20%26%20Cancellation."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-black transition-colors"
          >
            <MessageSquare size={14} /> WhatsApp Studio Desk
          </a>
        </div>

      </div>
    </div>
  );
}
