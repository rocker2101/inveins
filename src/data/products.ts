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

// Products are loaded directly and authoritatively from Supabase PostgreSQL database
export const PRODUCTS: Product[] = [];
