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
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered';
  trackingNumber?: string;
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

  // Order Management
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Wholesale Enquiries
  wholesaleEnquiries: WholesaleEnquiry[];
  addWholesaleEnquiry: (enquiry: Omit<WholesaleEnquiry, 'id' | 'createdAt'>) => void;

  // Inventory Stock & Product Management
  productsList: Product[];
  deletedProductIds: string[];
  updateProductStock: (productId: string, newStock: number, newBadge?: Product['badge']) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => Product;
  deleteProduct: (productId: string) => void;
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

  // Load from localStorage on client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('inveins_cart');
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        // Refresh product prices from latest catalog definitions
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

      const savedOrders = localStorage.getItem('inveins_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) setOrders(parsed);
      }

      const savedEnquiries = localStorage.getItem('inveins_wholesale_enquiries');
      if (savedEnquiries) {
        const parsed = JSON.parse(savedEnquiries);
        if (Array.isArray(parsed)) setWholesaleEnquiries(parsed);
      }

      // 1. Load deleted product IDs
      const savedDeleted = localStorage.getItem('inveins_deleted_product_ids');
      const deletedIds: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      setDeletedProductIds(deletedIds);

      // 2. Load products list and synchronize with new IndiaMART prices
      const CATALOG_VERSION = 'v2_indiamart_prices';
      const storedVersion = localStorage.getItem('inveins_catalog_version');
      const savedProducts = localStorage.getItem('inveins_products');

      if (savedProducts && storedVersion === CATALOG_VERSION) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const activeList = parsed.filter(p => !deletedIds.includes(p.id));
        setProductsList(activeList);
        localStorage.setItem('inveins_products', JSON.stringify(activeList));
      } else {
        // Upgrade prices from PRODUCTS while preserving any custom user-added products
        let customAdded: Product[] = [];
        if (savedProducts) {
          try {
            const parsed: Product[] = JSON.parse(savedProducts);
            customAdded = parsed.filter(p => !PRODUCTS.some(dp => dp.id === p.id));
          } catch (err) {}
        }
        const activeDefault = PRODUCTS.filter(p => !deletedIds.includes(p.id));
        const combined = [...activeDefault, ...customAdded];
        setProductsList(combined);
        localStorage.setItem('inveins_products', JSON.stringify(combined));
        localStorage.setItem('inveins_catalog_version', CATALOG_VERSION);
      }
    } catch (e) {
      console.error('Failed to load local storage state', e);
    } finally {
      isLoaded.current = true;
    }
  }, []);

  // Listen for storage events across tabs (e.g. order placed in store tab appears immediately in admin tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'inveins_orders' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) setOrders(fresh);
        } catch (err) {}
      }
      if (e.key === 'inveins_wholesale_enquiries' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (Array.isArray(fresh)) setWholesaleEnquiries(fresh);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save changes to localStorage (Only after initial load to prevent empty overwrites!)
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

  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem('inveins_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem('inveins_wholesale_enquiries', JSON.stringify(wholesaleEnquiries));
    } catch (e) {}
  }, [wholesaleEnquiries]);

  useEffect(() => {
    if (!isLoaded.current) return;
    try {
      localStorage.setItem('inveins_products', JSON.stringify(productsList));
    } catch (e) {}
  }, [productsList]);

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

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    // Auto-reduce stock count
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

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('inveins_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      try {
        localStorage.setItem('inveins_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addWholesaleEnquiry = (enquiryData: Omit<WholesaleEnquiry, 'id' | 'createdAt'>) => {
    const newEnquiry: WholesaleEnquiry = {
      ...enquiryData,
      id: `WS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    setWholesaleEnquiries(prev => {
      const updated = [newEnquiry, ...prev];
      try {
        localStorage.setItem('inveins_wholesale_enquiries', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateProductStock = (productId: string, newStock: number, newBadge?: Product['badge']) => {
    setProductsList(prev => prev.map(p => {
      if (p.id === productId) {
        const badge = newBadge !== undefined ? newBadge : (newStock === 0 ? 'SOLD OUT' : (p.badge === 'SOLD OUT' ? 'NEW' : p.badge));
        return { ...p, availableStock: newStock, badge };
      }
      return p;
    }));
  };

  const addNewProduct = (productData: Omit<Product, 'id'>): Product => {
    const newId = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProductsList(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const deleteProduct = (productId: string) => {
    // 1. Update deleted product IDs in state and localStorage
    setDeletedProductIds(prev => {
      const updated = prev.includes(productId) ? prev : [...prev, productId];
      try {
        localStorage.setItem('inveins_deleted_product_ids', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Remove product from productsList state and localStorage immediately
    setProductsList(prev => {
      const updated = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem('inveins_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Remove from active cart items and wishlist if present
    setItems(prev => prev.filter(i => i.product.id !== productId));
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const restoreDefaultProducts = () => {
    try {
      localStorage.removeItem('inveins_deleted_product_ids');
      localStorage.setItem('inveins_products', JSON.stringify(PRODUCTS));
    } catch (e) {}
    setDeletedProductIds([]);
    setProductsList(PRODUCTS);
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
        wholesaleEnquiries,
        addWholesaleEnquiry,
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
