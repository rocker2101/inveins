import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "INVEINS — Form Follows Feeling",
  description: "INVEINS makes considered essentials and modern layers for the everyday rotation. Useful forms, honest materials and architectural cuts.",
  keywords: ["INVEINS", "Fashion", "Minimalist Clothing", "Essentials", "Architectural Fashion", "Organic Cotton", "Pan-India Delivery"],
  authors: [{ name: "INVEINS Studio" }],
  openGraph: {
    title: "INVEINS — Form Follows Feeling",
    description: "Considered clothing, made to move.",
    url: "https://inveins.studio",
    siteName: "INVEINS STUDIO",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-[#f5f4f0] text-[#171717] font-sans selection:bg-[#171717] selection:text-[#f5f4f0] flex flex-col justify-between">
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
        </CartProvider>
      </body>
    </html>
  );
}
