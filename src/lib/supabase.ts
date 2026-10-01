import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (typeof window === 'undefined' && !supabaseUrl) {
  console.warn('[SECURITY NOTICE] NEXT_PUBLIC_SUPABASE_URL is not set in environment.');
}

/**
 * Public Supabase client for client-side and unprivileged operations
 */
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: { persistSession: false },
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

/**
 * Privileged Supabase client for server-side API routes bypassing RLS with service_role
 */
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || 'placeholder-key', {
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
  payment_id?: string;
  cashfree_order_id?: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Failed';
  tracking_number: string;
  verification_token?: string;
  created_at?: string;
  updated_at?: string;
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
