export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: 'Tees' | 'Shirts' | 'Joggers' | 'Gym Compression' | 'Outerwear' | 'Custom B2B';
  badge?: 'NEW' | 'LIMITED' | 'SOLD OUT' | 'BESTSELLER' | 'HOT';
  tagline: string;
  description: string;
  availableStock: number;
  images: string[];
  sizes: string[];
  details: string[];
  materialCare: string[];
  shippingInfo: string;
  returnsInfo: string;
  fit?: 'Oversized' | 'Architectural' | 'Relaxed Straight' | 'Structured' | 'Slim Fit' | 'Compression Fit';
  occasion?: 'Everyday Uniform' | 'Studio & Work' | 'Weekend & Lounge' | 'Gym & Active';
  completeLookWith?: string;
  wholesalePrice?: string;
  gsm?: string;
}

export const PRODUCTS: Product[] = [
  // ==================== LIVE AUTHORITATIVE PRODUCTS ====================
  {
    id: 'rakshak-heavyweight-tshirt-996',
    name: 'RAKSHAK heavyweight tshirt',
    price: 599,
    currency: '₹',
    category: 'Tees',
    badge: 'NEW',
    tagline: 'Wear respectfully',
    description: 'Designed with spirituality',
    availableStock: 12,
    images: ['https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '260-340 GSM organic combed cotton jersey',
      'Pre-shrunk architectural cut',
      'Reinforced coverstitching'
    ],
    materialCare: [
      '100% Combed Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
  },
  {
    id: 'god-s-plan-heavyweight-antibacterial-tee-472',
    name: "GOD's PLAN heavyweight antibacterial tee",
    price: 599,
    currency: '₹',
    category: 'Tees',
    badge: 'HOT',
    tagline: 'Built on 240 GSM cotton, this INVEINS tee blends faith, discipline, and ambition into a bold everyday statement of purpose',
    description: 'Key Features\nBrand: INVEINS\nFabric: French Terry\nFabric Weight: 240 GSM\nConstruction: Single Layer\nFit: Heavyweight, structured everyday silhouette\nFeature: Antibacterial fabric treatment\nFeel: Soft, substantial, and comfortable\nStyle: Minimal, contemporary, and versatile\nUse: Everyday wear, casual wear, and streetwear',
    availableStock: 22,
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      'Fabric Weight: 280 GSM',
      'Pre-shrunk architectural cut',
      'Reinforced coverstitching'
    ],
    materialCare: [
      '100% French Terry Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
  },
  {
    id: 'universe-11-11-heavyweight-inveins-tee-662',
    name: 'UNIVERSE 11:11 heavyweight INVEINS tee',
    price: 569,
    currency: '₹',
    category: 'Tees',
    badge: 'BESTSELLER',
    tagline: '“Ride the waves of your own universe. INVEINS Oversized Tee blends cosmic energy, effortless streetwear, and bold artistic expression—made for those who trust their journey and move freely.”',
    description: 'Key Features Brand: INVEINS Fabric: French Terry Fabric Weight: 240 GSM Construction: Single Layer Fit: Heavyweight, structured everyday silhouette Feature: Antibacterial fabric treatment Feel: Soft, substantial, and comfortable Style: Minimal, contemporary, and versatile Use: Everyday wear, casual wear, and streetwear',
    availableStock: 24,
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '260-340 GSM organic combed cotton jersey',
      'Pre-shrunk architectural cut',
      'Reinforced coverstitching'
    ],
    materialCare: [
      '100% Combed Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
  },
  {
    id: 'aham-brahmashmi-oversized-heavyweight-tee-882',
    name: 'AHAM BRAHMASHMI oversized heavyweight tee',
    price: 599,
    currency: '₹',
    category: 'Tees',
    badge: 'HOT',
    tagline: 'INVEINS — Wear what lies within. Rooted in ancient wisdom, shaped by modern rebellion, our oversized T-shirts embody self, consciousness, and the limitless reality that lives inside you.',
    description: 'Key Features Brand: INVEINS Fabric: French Terry Fabric Weight: 240 GSM Construction: Single Layer Fit: Heavyweight, structured everyday silhouette Feature: Antibacterial fabric treatment Feel: Soft, substantial, and comfortable Style: Minimal, contemporary, and versatile Use: Everyday wear, casual wear, and streetwear',
    availableStock: 25,
    images: ['https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '260-340 GSM organic combed cotton jersey',
      'Pre-shrunk architectural cut',
      'Reinforced coverstitching'
    ],
    materialCare: [
      '100% Combed Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
  },
  {
    id: 'aham-brahmashmi-white-heavyweight-tee-722',
    name: 'AHAM BRAHMASHMI white heavyweight tee',
    price: 574,
    currency: '₹',
    category: 'Tees',
    badge: 'NEW',
    tagline: 'Wear what lies within. Rooted in ancient wisdom, shaped by modern rebellion, our oversized T-shirts embody self, consciousness, and the limitless reality that lives inside you.',
    description: 'Key Features Brand: INVEINS Fabric: French Terry Fabric Weight: 240 GSM Construction: Single Layer Fit: Heavyweight, structured everyday silhouette Feature: Antibacterial fabric treatment Feel: Soft, substantial, and comfortable Style: Minimal, contemporary, and versatile Use: Everyday wear, casual wear, and streetwear',
    availableStock: 25,
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '260-340 GSM organic combed cotton jersey',
      'Pre-shrunk architectural cut',
      'Reinforced coverstitching'
    ],
    materialCare: [
      '100% Combed Cotton',
      'Machine wash inside out in cold water',
      'Dry in shade'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Oversized',
    occasion: 'Everyday Uniform',
  },
  {
    id: 'full-sleeves-n1-compression-910',
    name: 'Full sleeves N1 compression',
    price: 599,
    currency: '₹',
    category: 'Gym Compression',
    badge: 'LIMITED',
    tagline: '4-way stretch fabric for limitless range of motion Flatlock seam for comfort stretch & durability Lightweight and cool to the touch Sweat-wicking technology',
    description: 'Designed for technical performance and recreation, the Compression Collection offers a range of products guaranteed to take you through your toughest. INVEINS Compression Speaks to those who demand the most out of life and have similar demands of their apparel.',
    availableStock: 25,
    images: ['https://5.imimg.com/data5/SELLER/Default/2026/3/590938561/TI/FE/BN/180956315/men-compression-t-shirt-500x500.jpeg'],
    sizes: ['S', 'M', 'L', 'XL'],
    details: [
      '4-way stretch Spandex & Poly blend',
      'Flatlock anti-chafing seams',
      'Sweat-wicking thermoregulating technology'
    ],
    materialCare: [
      '88% Polyester / 12% Spandex',
      'Machine wash cold, air dry'
    ],
    shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
    returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    fit: 'Compression Fit',
    occasion: 'Gym & Active',
  },
];
