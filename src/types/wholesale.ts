export interface WholesaleProduct {
  id: string;
  name: string;
  category: string;
  moq: string; // Minimum Order Quantity, e.g. "50 Pieces"
  gsm?: string; // Fabric weight, e.g. "240 GSM", "280 GSM French Terry"
  tagline?: string;
  description?: string;
  availableSizes: string[];
  customizationOptions: string[]; // e.g. ['DTF Printing', 'Embroidery', 'Screen Print', 'Plain Blanks']
  images: string[];
  badge?: string; // 'BULK READY', 'FACTORY DIRECT', 'CUSTOM ORDER', 'BESTSELLER'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WholesaleEstimateRequest {
  productId?: string;
  productName?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  cityCountry: string;
  quantity: string;
  customizationInterest?: string;
  message: string;
}
