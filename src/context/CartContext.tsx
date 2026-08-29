'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  pincode: string;
}

export interface Order {
  id: string;
  customer: SavedAddress;
  items: CartItem[];
  subtotal: number;
  paymentMethod: 'upi' | 'cod' | 'card';
  status: 'Pending' | 'Dispatched' | 'Delivered';
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

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedSize: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  
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
  updateProductStock: (productId: string, newStock: number, newBadge?: Product['badge']) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => Product;
  deleteProduct: (productId: string) => void;

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

  // 1-Click Express Buy State
  isExpressOpen: boolean;
  expressProduct: Product | null;
  expressSize: string;
  openExpressBuy: (product: Product, size?: string) => void;
  setIsExpressOpen: (open: boolean) => void;
}

const FREE_SHIPPING_THRESHOLD = 4000;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wholesaleEnquiries, setWholesaleEnquiries] = useState<WholesaleEnquiry[]>([]);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isShippingPolicyOpen, setIsShippingPolicyOpen] = useState(false);

  // Express 1-Click Buy State
  const [isExpressOpen, setIsExpressOpen] = useState(false);
  const [expressProduct, setExpressProduct] = useState<Product | null>(null);
  const [expressSize, setExpressSize] = useState<string>('M');

  // Load from localStorage on client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('inveins_cart');
      if (savedCart) setItems(JSON.parse(savedCart));

      const savedAddr = localStorage.getItem('inveins_saved_address');
      if (savedAddr) setSavedAddress(JSON.parse(savedAddr));

      const savedOrders = localStorage.getItem('inveins_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedEnquiries = localStorage.getItem('inveins_wholesale_enquiries');
      if (savedEnquiries) setWholesaleEnquiries(JSON.parse(savedEnquiries));

      const savedProducts = localStorage.getItem('inveins_products');
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        // Find any newly added user custom products (products not in master PRODUCTS)
        const customProducts = parsed.filter(p => !PRODUCTS.some(dp => dp.id === p.id));
        
        // Merge stock/badge edits for master PRODUCTS, keeping latest images & category details
        const mergedDefaultProducts = PRODUCTS.map(dp => {
          const saved = parsed.find(p => p.id === dp.id);
          if (saved) {
            return {
              ...dp,
              availableStock: saved.availableStock !== undefined ? saved.availableStock : dp.availableStock,
              badge: saved.badge || dp.badge,
            };
          }
          return dp;
        });

        const fullList = [...mergedDefaultProducts, ...customProducts];
        setProductsList(fullList);
        localStorage.setItem('inveins_products', JSON.stringify(fullList));
      } else {
        setProductsList(PRODUCTS);
        localStorage.setItem('inveins_products', JSON.stringify(PRODUCTS));
      }
    } catch (e) {
      console.error('Failed to load local storage state', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('inveins_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      if (savedAddress) localStorage.setItem('inveins_saved_address', JSON.stringify(savedAddress));
    } catch (e) {}
  }, [savedAddress]);

  useEffect(() => {
    try {
      localStorage.setItem('inveins_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('inveins_wholesale_enquiries', JSON.stringify(wholesaleEnquiries));
    } catch (e) {}
  }, [wholesaleEnquiries]);

  useEffect(() => {
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
  };

  const saveAddress = (address: SavedAddress) => {
    setSavedAddress(address);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
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

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const addWholesaleEnquiry = (enquiryData: Omit<WholesaleEnquiry, 'id' | 'createdAt'>) => {
    const newEnquiry: WholesaleEnquiry = {
      ...enquiryData,
      id: `WS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    setWholesaleEnquiries(prev => [newEnquiry, ...prev]);
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
    setProductsList(prev => prev.filter(p => p.id !== productId));
  };

  const openExpressBuy = (product: Product, size?: string) => {
    setExpressProduct(product);
    setExpressSize(size || product.sizes[0] || 'M');
    setIsExpressOpen(true);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

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
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        savedAddress,
        saveAddress,
        orders,
        addOrder,
        updateOrderStatus,
        wholesaleEnquiries,
        addWholesaleEnquiry,
        productsList,
        updateProductStock,
        addNewProduct,
        deleteProduct,
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
