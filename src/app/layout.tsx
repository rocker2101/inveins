import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/InveinsFooter";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchModal } from "@/components/SearchModal";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ShippingPolicyModal } from "@/components/ShippingPolicyModal";
import { ExpressCheckoutModal } from "@/components/ExpressCheckoutModal";
import { QuickViewModal } from "@/components/QuickViewModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#faf9f5",
};

export const metadata: Metadata = {
  title: "INVEINS — Form Follows Feeling | Heavyweight Essentials & Gym Activewear",
  description: "INVEINS crafts considered heavyweight French Terry tees (280-420 GSM), form-locking gym compression wear, and architectural baggie lowers. Engineered in Kanpur with direct Pan-India express delivery.",
  keywords: [
    "INVEINS", "Heavyweight T Shirt", "280 GSM Cotton", "Gym Compression T Shirt", 
    "Acid Wash Boxy Tee", "French Terry Lowers", "Oversized Tee India", "Kanpur Apparel", 
    "Indian Streetwear", "DTF Printing Kanpur"
  ],
  authors: [{ name: "INVEINS Studio" }],
  metadataBase: new URL("https://inveins.studio"),
  openGraph: {
    title: "INVEINS — Form Follows Feeling",
    description: "Considered wardrobe foundations. Architectural drape, heavyweight organic cotton, form-locking activewear.",
    url: "https://inveins.studio",
    siteName: "INVEINS",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg",
        width: 1200,
        height: 630,
        alt: "INVEINS Fashion & Heavyweight Basics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INVEINS — Form Follows Feeling",
    description: "Heavyweight French Terry essentials and gym compression wear.",
    images: ["https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "INVEINS",
    "legalName": "Inveins",
    "founder": "Shaurya Vishnoi",
    "taxID": "09CLWPV7429M2ZO",
    "url": "https://inveins.studio",
    "logo": "https://inveins.studio/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7985232434",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kanpur",
      "addressRegion": "Uttar Pradesh",
      "addressCountry": "IN"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#faf9f5] text-[#141413] font-sans selection:bg-[#141413] selection:text-[#faf9f5] flex flex-col justify-between">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />

          {/* Global Drawers & Modals */}
          <CartDrawer />
          <SearchModal />
          <SizeGuideModal />
          <CheckoutModal />
          <ShippingPolicyModal />
          <ExpressCheckoutModal />
          <QuickViewModal />
        </CartProvider>
      </body>
    </html>
  );
}
