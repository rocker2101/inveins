import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, MapPin, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | INVEINS Fashion',
  description: 'Pan-India express delivery timelines, shipping charges, and tracking guidelines for INVEINS APPARELS.',
};

export default function ShippingPolicyPage() {
  const lastUpdated = 'September 29, 2026';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          LOGISTICS & FULFILLMENT
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          SHIPPING & DELIVERY
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2">
          Last Updated: {lastUpdated} • INVEINS APPARELS
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#e5e4df] p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-[#333] leading-relaxed">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-[#e5e4df]">
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <Clock size={20} className="mx-auto text-[#cc785c]" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">DISPATCH TIME</h4>
            <p className="text-neutral-500 text-[11px]">24 to 48 business hours</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <Truck size={20} className="mx-auto text-[#cc785c]" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">ESTIMATED DELIVERY</h4>
            <p className="text-neutral-500 text-[11px]">3 to 7 working days Pan-India</p>
          </div>
          <div className="p-4 bg-[#fbfbfa] border border-[#e5e4df] text-center space-y-1">
            <ShieldCheck size={20} className="mx-auto text-emerald-600" />
            <h4 className="font-bold text-[#171717] text-xs uppercase tracking-wider">SHIPPING COST</h4>
            <p className="text-neutral-500 text-[11px]">FREE on ₹999+ | Flat ₹70 below ₹999</p>
          </div>
        </div>

        {/* Section 1: Coverage & Locations */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">01.</span> Pan-India Delivery Coverage
          </h2>
          <p>
            INVEINS APPARELS delivers to over <strong>26,000+ postal pin codes across India</strong>. We partner with tier-1 logistics networks including <strong>Delhivery, BlueDart, DTDC, and Xpressbees</strong> to ensure your garments reach you swiftly and safely.
          </p>
          <p className="text-neutral-600 text-xs">
            *Please note that we currently only deliver within the domestic territory of India. International shipping will be announced soon.
          </p>
        </section>

        {/* Section 2: Shipping Charges */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">02.</span> Shipping Charges
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-[#e5e4df] text-xs">
              <thead className="bg-[#f5f4f0] uppercase tracking-wider text-[#171717] font-bold">
                <tr>
                  <th className="p-3 border-b border-[#e5e4df]">Order Value</th>
                  <th className="p-3 border-b border-[#e5e4df]">Shipping Method</th>
                  <th className="p-3 border-b border-[#e5e4df]">Applicable Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e4df] text-neutral-700">
                <tr>
                  <td className="p-3 font-semibold">Orders ₹999 and above</td>
                  <td className="p-3">Pan-India Express Surface</td>
                  <td className="p-3 text-emerald-700 font-bold">FREE (Complimentary)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Orders below ₹999</td>
                  <td className="p-3">Standard Courier Dispatch</td>
                  <td className="p-3 font-medium">Flat ₹70</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Processing & Delivery Timelines */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">03.</span> Estimated Delivery Timelines
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li><strong>Order Processing & Dispatch:</strong> All orders are curated, packaged, and handed over to the courier within <strong>24 to 48 business hours</strong> from our studio in Kanpur, Uttar Pradesh. Orders placed on Sundays or National Holidays are dispatched the following working day.</li>
            <li><strong>Metro Cities:</strong> Typically delivered within <strong>3 to 5 business days</strong> post-dispatch (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata).</li>
            <li><strong>Rest of India (Tier 2 & 3 Cities):</strong> Delivered within <strong>5 to 7 business days</strong> post-dispatch.</li>
            <li><strong>North-East & Remote Regions:</strong> May take <strong>7 to 9 business days</strong> depending on regional transport links.</li>
          </ul>
        </section>

        {/* Section 4: Tracking Your Order */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">04.</span> Order Tracking & Notifications
          </h2>
          <p>
            As soon as your shipment is scanned by the courier partner, an automated confirmation is dispatched via <strong>Email and SMS/WhatsApp</strong> containing your Air Waybill (AWB) tracking number and courier tracking link.
          </p>
          <p>
            You can also check live status directly on our platform anytime by visiting our{' '}
            <Link href="/account" className="text-[#cc785c] underline font-semibold">
              Track My Order page
            </Link>.
          </p>
        </section>

        {/* Section 5: Packaging & Eco Commitment */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">05.</span> Architectural Packaging
          </h2>
          <p>
            Every garment from INVEINS is individually folded and placed in moisture-barrier breathable garment sleeves before being sealed inside our recyclable matte exterior shipper bags. We ensure your heavyweight apparel arrives in pristine condition.
          </p>
        </section>

        {/* Section 6: Non-Delivery & Failed Delivery Attempts */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">06.</span> Delivery Attempts & Address Changes
          </h2>
          <p>
            Our logistics partners make up to <strong>three delivery attempts</strong> before returning the package to our warehouse (RTO). Please ensure that you provide an accurate delivery address with relevant landmarks and a working contact phone number.
          </p>
          <p className="text-neutral-600 text-xs">
            If you need to change your delivery address after ordering, please message us on WhatsApp within 3 hours of placing the order. Once the AWB is assigned, rerouting may cause additional delivery delays.
          </p>
        </section>

        {/* Need Help CTA */}
        <div className="pt-6 border-t border-[#e5e4df] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#171717] uppercase tracking-wider text-xs">
              Have questions about your delivery?
            </h4>
            <p className="text-neutral-500 text-xs mt-0.5">
              Contact our logistics desk via email at <span className="font-medium text-[#171717]">inveins24@gmail.com</span> or WhatsApp <span className="font-medium text-[#171717]">+91 79852 32434</span>.
            </p>
          </div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-black transition-colors"
          >
            Track An Order <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
