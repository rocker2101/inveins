'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, PRODUCTS } from '@/data/products';

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface SavedAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
}

export interface Order {
  id: string;
  customer: SavedAddress;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: 'upi' | 'cod' | 'card' | 'whatsapp';
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  verificationToken?: string;
  createdAt: string;
}

export interface WholesaleEnquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  cityCountry: string;
  productInterest: string;
  quantity: string;
  message: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedSize: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;

  // Coupons
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Saved Customer Address Memory
  savedAddress: SavedAddress | null;
  saveAddress: (address: SavedAddress) => void;

  // Order Management & Supabase Sync
  orders: Order[];
  addOrder: (order: Partial<Order> & Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  refreshDatabaseData: () => Promise<void>;

  wholesaleEnquiries: WholesaleEnquiry[];
  addWholesaleEnquiry: (enquiry: Omit<WholesaleEnquiry, 'id' | 'createdAt'>) => Promise<{ success: boolean; message?: string }>;
  deleteWholesaleEnquiry: (enquiryId: string) => Promise<boolean>;

  // Inventory Stock & Product Management
  productsList: Product[];
  deletedProductIds: string[];
  updateProductStock: (productId: string, newStock: number, newBadge?: Product['badge']) => Promise<void>;
  addNewProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  restoreDefaultProducts: () => void;

  // Modals & Drawers State
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isShippingPolicyOpen: boolean;
  setIsShippingPolicyOpen: (open: boolean) => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // 1-Click Express Buy State
  isExpressOpen: boolean;
  expressProduct: Product | null;
  expressSize: string;
  openExpressBuy: (product: Product, size?: string) => void;
  setIsExpressOpen: (open: boolean) => void;
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 70;

const VALID_COUPONS: Record<string, number> = {
  FIRST10: 10,
  INVEINS15: 15,
  HEAVY20: 20,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wholesaleEnquiries, setWholesaleEnquiries] = useState<WholesaleEnquiry[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isShippingPolicyOpen, setIsShippingPolicyOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Express 1-Click Buy State
  const [isExpressOpen, setIsExpressOpen] = useState(false);
  const [expressProduct, setExpressProduct] = useState<Product | null>(null);
  const [expressSize, setExpressSize] = useState<string>('M');

  const isLoaded = useRef(false);

  // Load user client preferences (cart, wishlist, address) from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('inveins_cart');
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        const updatedCart = parsedCart.map(item => {
          const fresh = PRODUCTS.find(p => p.id === item.product.id);
          return fresh ? { ...item, product: { ...item.product, price: fresh.price } } : item;
        });
        setItems(updatedCart);
      }

      const savedWishlist = localStorage.getItem('inveins_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedAddr = localStorage.getItem('inveins_saved_address');
      if (savedAddr) setSavedAddress(JSON.parse(savedAddr));
    } catch (e) {
      console.error('Failed to load local storage state', e);
    } finally {
      isLoaded.current = true;
    }

    // Immediately fetch live authoritative data from Supabase PostgreSQL
    refreshDatabaseData();
  }, []);

  // Synchronize orders, enquiries, and products from Supabase PostgreSQL database
  const refreshDatabaseData = async () => {
    try {
      const [ordersRes, wsRes, prodRes] = await Promise.allSettled([
        fetch('/api/orders/list', { cache: 'no-store' }),
        fetch('/api/wholesale/list', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' }),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const data = await ordersRes.value.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }

      if (wsRes.status === 'fulfilled' && wsRes.value.ok) {
        const wsData = await wsRes.value.json();
        if (wsData.success && Array.isArray(wsData.enquiries)) {
          setWholesaleEnquiries(wsData.enquiries);
        }
      }

      if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
        const prodData = await prodRes.value.json();
        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          setProductsList(prodData.products);
        }
      }
    } catch (err) {
      console.error('Supabase synchronization error:', err);
    }
  };

  // Sync with Supabase on tab focus and periodically (every 25 seconds)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshDatabaseData();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', refreshDatabaseData);

    const intervalId = setInterval(() => {
      refreshDatabaseData();
    }, 25000);

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', refreshDatabaseData);
      clearInterval(intervalId);
    };
  }, []);

  // Save cart & wishlist changes to localStorage
  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem('inveins_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem('inveins_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      if (savedAddress) localStorage.setItem('inveins_saved_address', JSON.stringify(savedAddress));
    } catch (e) {}
  }, [savedAddress]);

  const addToCart = (product: Product, selectedSize: string, quantity = 1) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.product.id === product.id && i.selectedSize === selectedSize
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, selectedSize, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.selectedSize === selectedSize)));
  };

  const updateQuantity = (productId: string, selectedSize: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(i => {
          if (i.product.id === productId && i.selectedSize === selectedSize) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon action
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (VALID_COUPONS[cleanCode]) {
      const discountPercent = VALID_COUPONS[cleanCode];
      const discountAmount = Math.round((subtotal * discountPercent) / 100);
      setCoupon({
        code: cleanCode,
        discountPercent,
        discountAmount,
      });
      return { success: true, message: `Coupon applied: ${discountPercent}% off!` };
    }
    return { success: false, message: 'Invalid promo code. Try FIRST10 for 10% off.' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const saveAddress = (address: SavedAddress) => {
    setSavedAddress(address);
  };

  const addOrder = (orderData: Partial<Order> & Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingNumber: orderData.trackingNumber || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: orderData.createdAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      verificationToken: orderData.verificationToken,
    };

    // Auto-reduce stock count in state
    setProductsList(prev => prev.map(p => {
      const orderedItem = orderData.items.find(i => i.product.id === p.id);
      if (orderedItem) {
        const updatedStock = Math.max(0, p.availableStock - orderedItem.quantity);
        return {
          ...p,
          availableStock: updatedStock,
          badge: updatedStock === 0 ? 'SOLD OUT' : p.badge,
        };
      }
      return p;
    }));

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Optimistic state update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    try {
      await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });
    } catch (err) {
      console.error('Failed to sync order status to Supabase:', err);
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    // Optimistic removal
    setOrders(prev => prev.filter(o => o.id !== orderId));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(res.ok && data.success);
    } catch (err) {
      console.error('Failed to delete order from Supabase:', err);
      // Revert by re-fetching
      refreshDatabaseData();
      return false;
    }
  };

  const addWholesaleEnquiry = async (enquiryData: Omit<WholesaleEnquiry, 'id' | 'createdAt'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/wholesale/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Submission failed. Please check your information.' };
      }

      const savedEnquiry: WholesaleEnquiry = {
        ...enquiryData,
        id: data.enquiry?.id || `WS-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: data.enquiry?.createdAt || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      };

      setWholesaleEnquiries(prev => [savedEnquiry, ...prev.filter(e => e.id !== savedEnquiry.id)]);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to sync wholesale enquiry to Supabase:', err);
      return { success: false, message: 'Network connection failed. Please try again.' };
    }
  };

  const deleteWholesaleEnquiry = async (enquiryId: string): Promise<boolean> => {
    // Optimistic removal
    setWholesaleEnquiries(prev => prev.filter(e => e.id !== enquiryId));

    try {
      const res = await fetch(`/api/wholesale/${enquiryId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(res.ok && data.success);
    } catch (err) {
      console.error('Failed to delete enquiry from Supabase:', err);
      refreshDatabaseData();
      return false;
    }
  };

  const updateProductStock = async (productId: string, newStock: number, newBadge?: Product['badge']) => {
    // Optimistic state update
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        const badge = newBadge !== undefined ? newBadge : (newStock === 0 ? 'SOLD OUT' : (p.badge === 'SOLD OUT' ? 'NEW' : p.badge));
        return { ...p, availableStock: newStock, badge };
      }
      return p;
    }));

    // Server-side persistence in Supabase
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStock: newStock, badge: newBadge }),
      });
    } catch (err) {
      console.error('Failed to update product stock in Supabase:', err);
    }
  };

  const addNewProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const tempId = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
    const optimisticProduct: Product = {
      ...productData,
      id: tempId,
    };

    setProductsList(prev => [optimisticProduct, ...prev]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProductsList(prev => [data.product, ...prev.filter(p => p.id !== tempId)]);
        return data.product;
      }
    } catch (err) {
      console.error('Failed to persist new product to Supabase:', err);
    }

    return optimisticProduct;
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    // Optimistic removal from product list, cart, and wishlist
    setProductsList(prev => prev.filter(p => p.id !== productId));
    setItems(prev => prev.filter(i => i.product.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(res.ok && data.success);
    } catch (err) {
      console.error('Failed to delete product from Supabase:', err);
      refreshDatabaseData();
      return false;
    }
  };

  const restoreDefaultProducts = async () => {
    try {
      await refreshDatabaseData();
    } catch (e) {}
  };

  const openExpressBuy = (product: Product, size?: string) => {
    setExpressProduct(product);
    setExpressSize(size || product.sizes[0] || 'M');
    setIsExpressOpen(true);
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING_FEE : 0;
  const discountAmount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        discountAmount,
        shippingFee,
        grandTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        coupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        savedAddress,
        saveAddress,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        refreshDatabaseData,
        wholesaleEnquiries,
        addWholesaleEnquiry,
        deleteWholesaleEnquiry,
        productsList,
        deletedProductIds,
        updateProductStock,
        addNewProduct,
        deleteProduct,
        restoreDefaultProducts,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isShippingPolicyOpen,
        setIsShippingPolicyOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isExpressOpen,
        expressProduct,
        expressSize,
        openExpressBuy,
        setIsExpressOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
