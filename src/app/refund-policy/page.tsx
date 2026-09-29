import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | INVEINS Fashion',
  description: 'Detailed cancellation, exchange, and refund terms for orders placed with INVEINS APPARELS.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'September 29, 2026';

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
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">CANCELLATION</h4>
            <p className="text-neutral-500 text-[11px]">Before dispatch / within 12 hours of order</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <RotateCcw size={20} className="mx-auto text-[#cc785c]" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">7-DAY RETURNS</h4>
            <p className="text-neutral-500 text-[11px]">Unworn items with tags intact</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <CheckCircle size={20} className="mx-auto text-emerald-600" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">5–7 DAYS REFUND</h4>
            <p className="text-neutral-500 text-[11px]">Credited directly to original payment source</p>
          </div>
        </div>

        {/* Section 1: Order Cancellation */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">01.</span> Order Cancellation Policy
          </h2>
          <p>
            You can request cancellation of your order at any point <strong>prior to order dispatch</strong> (typically within 12 to 24 hours of placing the order).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>To cancel an order before dispatch, please contact us immediately at <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline">inveins24@gmail.com</a> or via WhatsApp at <strong>+91 79852 32434</strong> with your Order ID.</li>
            <li>Once an order has been picked up by our courier partner and a tracking AWB has been generated, the order cannot be cancelled in transit. In such cases, you may initiate a return upon delivery.</li>
            <li>For orders cancelled before dispatch, the entire order amount will be refunded directly to your original payment method.</li>
          </ul>
        </section>

        {/* Section 2: Returns & Exchanges Window */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">02.</span> 7-Day Return & Exchange Window
          </h2>
          <p>
            We take immense pride in the craftsmanship of our heavyweight textiles. If a garment does not fit as expected or you wish to exchange it, we offer a <strong>7-day return and exchange window</strong> from the date of confirmed delivery.
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
              If your package arrives physically tampered with, damaged, or contains an incorrect item, please notify us within <strong>48 hours of delivery</strong> with unboxing photographs or a short video. We will dispatch an immediate free replacement or issue a 100% full refund at no additional courier charge.
            </p>
          </div>
        </section>

        {/* Section 4: Refund Processing & Timelines (Mandatory for Razorpay) */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">04.</span> Refund Processing & Timelines
          </h2>
          <p>
            Once your returned item reaches our Kanpur fulfillment studio, our quality assurance team inspects the garment within 24–48 hours.
          </p>
          <div className="p-4 bg-[#fbfbfa] border-l-2 border-[#171717] space-y-2">
            <p className="font-bold text-[#171717]">
              Refund Turnaround Time: 5 to 7 Working Days
            </p>
            <p className="text-neutral-600">
              Upon approval of the return, refunds are initiated immediately and credited back to the <strong>original source of payment</strong> (UPI ID, Net Banking, or Credit/Debit Card via Razorpay) within <strong>5 to 7 business days</strong>, depending on your bank&apos;s settlement cycle.
            </p>
            <p className="text-neutral-600 text-xs">
              For Cash on Delivery (COD) orders, our support team will contact you to collect your preferred UPI ID or Bank NEFT details to remit the refund securely.
            </p>
          </div>
        </section>

        {/* Section 5: Step-by-Step Return Process */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">05.</span> How to Initiate a Return or Exchange
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-neutral-600">
            <li>
              <strong>Reach Out:</strong> Send an email to <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline font-medium">inveins24@gmail.com</a> or WhatsApp message to <strong>+91 79852 32434</strong> with your <strong>Order ID</strong> and the reason for exchange/return.
            </li>
            <li>
              <strong>Reverse Pickup:</strong> Our logistics partner will arrange a reverse pickup from your registered delivery address within 2–3 working days.
            </li>
            <li>
              <strong>Inspection & Settlement:</strong> Once the product arrives at our studio and passes our quality check, your replacement size is dispatched or your refund is initiated within 24 hours.
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
              Our studio care desk is available Monday through Friday, 10:00 AM – 6:00 PM IST.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-black transition-colors"
          >
            Contact Support <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
