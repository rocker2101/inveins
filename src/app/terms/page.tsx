import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileText, Scale, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | INVEINS Fashion',
  description: 'Terms of Service and legal usage conditions for INVEINS APPARELS ecommerce platform.',
};

export default function TermsPage() {
  const lastUpdated = 'September 29, 2026';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          LEGAL FRAMEWORK
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          TERMS & CONDITIONS
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2">
          Last Updated: {lastUpdated} • INVEINS APPARELS (GST: 09CLWPV7429M2ZO)
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#e5e4df] p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-[#333] leading-relaxed">
        
        {/* Intro */}
        <div className="p-4 bg-[#fbfbfa] border-l-2 border-[#171717]">
          <p className="font-medium text-[#171717]">
            Welcome to INVEINS. These Terms and Conditions constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;User&quot;, &quot;You&quot;) and <strong>INVEINS APPARELS</strong> (&quot;INVEINS&quot;, &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;), operating the website <strong>https://inveins.studio</strong>. By accessing our website, browsing our collections, or placing an order, you agree to be bound by these terms.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">01.</span> General Conditions & Eligibility
          </h2>
          <p>
            By using this website, you represent that you are at least 18 years of age or possess the legal authority to enter into binding agreements in your jurisdiction. If you are under 18, you may only use this site under the supervision of a parent or legal guardian.
          </p>
          <p>
            We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion, including cases where fraudulent, unauthorized, or abusive activity is suspected.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">02.</span> Product Information & Pricing
          </h2>
          <p>
            All products displayed on INVEINS (including heavyweight tees, French Terry lowers, compression garments, and overshirts) are subject to availability. We strive to present true-to-life colors, textile textures, and garment measurements. However, slight variations may occur due to screen calibration and batch dyeing processes.
          </p>
          <p>
            All prices are stated in <strong>Indian National Rupees (INR / ₹)</strong> and are inclusive of applicable goods and services tax (GST). Prices are subject to revision without prior notice, but any change will not affect orders already confirmed by us.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">03.</span> Orders, Payments & Razorpay
          </h2>
          <p>
            When you place an order, you agree to provide complete, accurate, and current purchase and contact information. Online payment processing is securely managed by our RBI-licensed payment gateway partner, <strong>Razorpay</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>We accept UPI (Google Pay, PhonePe, Paytm, etc.), Net Banking, Debit/Credit Cards, and eligible Wallets.</li>
            <li>We do not store your confidential card numbers, CVVs, or UPI PINs on our servers. All financial transactions are encrypted end-to-end via Razorpay&apos;s PCI-DSS compliant infrastructure.</li>
            <li>In the event of a payment deduction where the order status remains unconfirmed due to network interruptions, our automated reconciliation will credit the order or initiate an automatic reversal within 24–48 hours.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">04.</span> Shipping & Delivery
          </h2>
          <p>
            Orders are processed and dispatched from our Kanpur studio within 24–48 business hours. Deliveries are executed across Pan-India through verified logistics partners. Standard transit timelines range from 3 to 7 business days depending on delivery pincode. Complete details are governed by our{' '}
            <Link href="/shipping-policy" className="text-[#cc785c] underline font-semibold">
              Shipping & Delivery Policy
            </Link>.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">05.</span> Returns, Exchanges & Refunds
          </h2>
          <p>
            We offer a 7-day hassle-free size exchange and return window on eligible, unworn items with original tags and packaging intact. Refunds are credited back to the original source of payment within 5 to 7 business days following quality inspection. Complete details are governed by our{' '}
            <Link href="/refund-policy" className="text-[#cc785c] underline font-semibold">
              Refund & Cancellation Policy
            </Link>.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">06.</span> Intellectual Property Rights
          </h2>
          <p>
            All content on this website, including but not limited to brand typography, logos, graphics, garment patterns, photography, product descriptions, digital assets, and software code, is the exclusive proprietary property of <strong>INVEINS APPARELS</strong>. Any reproduction, distribution, modification, or commercial exploitation without prior written consent is strictly prohibited.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">07.</span> Limitation of Liability & Governing Law
          </h2>
          <p>
            INVEINS APPARELS shall not be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this platform. Our maximum cumulative liability for any claim arising out of a purchase shall never exceed the actual amount paid by you for that specific order.
          </p>
          <p>
            These terms are governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kanpur, Uttar Pradesh, India</strong>.
          </p>
        </section>

        {/* Contact details */}
        <div className="pt-6 border-t border-[#e5e4df] space-y-2">
          <h3 className="font-bold text-[#171717] uppercase tracking-wider">
            Questions Regarding These Terms?
          </h3>
          <p className="text-neutral-600">
            For legal inquiries, terms clarification, or business correspondence:
          </p>
          <div className="text-xs space-y-1 text-neutral-700">
            <p><strong>Entity:</strong> INVEINS APPARELS (GST: 09CLWPV7429M2ZO)</p>
            <p><strong>Managing Director:</strong> Shaurya Vishnoi</p>
            <p><strong>Location:</strong> Kanpur Nagar, Uttar Pradesh 208001, India</p>
            <p><strong>Official Email:</strong> <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline">inveins24@gmail.com</a></p>
            <p><strong>Direct Helpline:</strong> +91 79852 32434</p>
          </div>
        </div>

      </div>
    </div>
  );
}
