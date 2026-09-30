import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | INVEINS Fashion',
  description: 'Data protection and privacy policy for INVEINS APPARELS customer information and transactions.',
};

export default function PrivacyPage() {
  const lastUpdated = 'September 29, 2026';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          DATA PROTECTION & SECURITY
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#171717] tracking-tight mt-1">
          PRIVACY POLICY
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-2">
          Last Updated: September 30, 2026 • INVEINS (GST: 09CLWPV7429M2ZO • Udyam: UDYAM-UP-43-0147583)
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#e5e4df] p-6 sm:p-10 space-y-8 text-xs sm:text-sm text-[#333] leading-relaxed">
        
        {/* Intro */}
        <div className="p-4 bg-[#fbfbfa] border-l-2 border-[#171717]">
          <p className="font-medium text-[#171717]">
            At <strong>INVEINS</strong> (&quot;INVEINS&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;), we treat your privacy and data sovereignty with utmost rigor. This Privacy Policy outlines our transparent protocols for collecting, storing, utilizing, and safeguarding your personal information when you access <strong>https://www.inveins.in</strong>.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">01.</span> Information We Collect
          </h2>
          <p>
            When you interact with our platform, purchase garments, or contact our customer support, we collect the following necessary information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li><strong>Identity & Contact Details:</strong> Full name, billing and delivery addresses, postal/pin code, email address, and active telephone/WhatsApp number.</li>
            <li><strong>Transactional Information:</strong> Order histories, item sizes, payment method type, unique transaction identifiers, and shipping tracking numbers.</li>
            <li><strong>Technical & Browsing Data:</strong> IP address, device type, browser specifications, and referral URLs gathered via essential functional cookies to guarantee cart continuity and responsive rendering.</li>
          </ul>
        </section>

        {/* Section 2: Payment Security & Non-Storage of Card Data */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">02.</span> Payment Security & Non-Storage of Financial Data
          </h2>
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xs space-y-2">
            <p className="font-semibold text-emerald-950 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-700" />
              100% Secure Payment Architecture
            </p>
            <p className="text-emerald-900 text-xs">
              <strong>INVEINS does NOT store or process your complete credit/debit card numbers, CVVs, or UPI PINs.</strong> All electronic payments are processed directly via <strong>Razorpay Payment Gateway</strong>, which adheres to PCI-DSS Level 1 compliance and uses 256-bit bank-grade encryption.
            </p>
          </div>
        </section>

        {/* Section 3: How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">03.</span> How We Use Your Information
          </h2>
          <p>
            Your information is processed strictly for legitimate operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>Processing, packing, and dispatching your orders.</li>
            <li>Sending transactional updates via Email/SMS/WhatsApp (order confirmations, shipping waybills, delivery alerts).</li>
            <li>Processing size exchanges, cancellations, and refunds in accordance with our policies.</li>
            <li>Preventing fraudulent transactions and ensuring server-level security integrity.</li>
            <li>Providing responsive customer service and technical support.</li>
          </ul>
        </section>

        {/* Section 4: Third-Party Sharing */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">04.</span> Authorized Third-Party Disclosures
          </h2>
          <p>
            We strictly uphold a <strong>zero-spam policy</strong>. We never sell, rent, or trade your personal data to marketing third parties or lead aggregators. We only share essential operational details with trusted service partners:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li><strong>Payment Gateways:</strong> Razorpay Software Private Limited for verifying payment signatures and issuing refunds.</li>
            <li><strong>Logistics & Couriers:</strong> Verified Indian express couriers (e.g., Delhivery, BlueDart, DTDC, Xpressbees) to execute door-to-door delivery.</li>
            <li><strong>Legal & Regulatory Authorities:</strong> Only when strictly mandated by applicable Indian law, court order, or governmental law enforcement agency.</li>
          </ul>
        </section>

        {/* Section 5: Cookies and Session Tracking */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">05.</span> Cookies & Local Storage
          </h2>
          <p>
            We use localized browser storage and non-invasive cookies solely to retain your active shopping cart items, preserve your wishlist preferences, and ensure seamless checkout navigation. You can configure your browser to decline cookies, but please note that some interactive features of our store may function with diminished efficiency.
          </p>
        </section>

        {/* Section 6: Data Retention & User Rights */}
        <section className="space-y-3">
          <h2 className="font-heading font-extrabold text-base sm:text-lg text-[#171717] uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#cc785c]">06.</span> Your Data Rights & Retention
          </h2>
          <p>
            We retain transactional and order records only as required to satisfy statutory GST, taxation, and financial audit compliances under Indian law. You have the right to request access to the personal data we hold about you or request its rectification or erasure by contacting our support team.
          </p>
        </section>

        {/* Section 7: Grievance Officer */}
        <div className="pt-6 border-t border-[#e5e4df] space-y-2">
          <h3 className="font-bold text-[#171717] uppercase tracking-wider">
            Grievance Officer & Support Contact
          </h3>
          <p className="text-neutral-600">
            In accordance with the Information Technology Act 2000 and consumer protection guidelines, the contact details of our Grievance Officer are provided below:
          </p>
          <div className="text-xs space-y-1 text-neutral-700">
            <p><strong>Grievance Officer:</strong> Shaurya Vishnoi</p>
            <p><strong>Designation:</strong> Grievance & Compliance Officer</p>
            <p><strong>Entity:</strong> INVEINS (GST: 09CLWPV7429M2ZO • Udyam: UDYAM-UP-43-0147583)</p>
            <p><strong>Registered Address:</strong> E 48, K D A Colony, Daheli Sujanpur, Shyam Nagar, Kanpur Nagar, Uttar Pradesh 208013, India</p>
            <p><strong>Email:</strong> <a href="mailto:inveins24@gmail.com" className="text-[#cc785c] underline">inveins24@gmail.com</a></p>
            <p><strong>Direct Helpline:</strong> +91 79852 32434 (Mon–Fri, 10:00 AM – 6:00 PM IST)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
