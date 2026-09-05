import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kpadoptqtdmncvaoexmj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwYWRvcHRxdGRtbmN2YW9leG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAwMDYsImV4cCI6MjEwMjY1NjAwNn0.vuvjhytVUjfyZ7hIeYtOlmYDU3SEGWxPo_dARs4A3QI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

export interface DbOrder {
  id: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
  };
  items: Array<{
    product: any;
    selectedSize: string;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  grand_total: number;
  payment_method: string;
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_number: string;
  verification_token?: string;
  created_at?: string;
}

export interface DbWholesaleEnquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city_country: string;
  product_interest: string;
  quantity: string;
  message: string;
  created_at?: string;
}
