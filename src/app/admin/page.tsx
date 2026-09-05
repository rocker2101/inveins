'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart, Order, WholesaleEnquiry } from '@/context/CartContext';
import { Product } from '@/data/products';
import { ShieldCheck, Lock, Package, ShoppingBag, MessageSquare, Plus, Trash2, Check, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Database } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  wholesaleEnquiries: number;
  catalogItems: number;
}

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    refreshDatabaseData,
    wholesaleEnquiries,
    deleteWholesaleEnquiry,
    productsList,
    deletedProductIds,
    updateProductStock,
    addNewProduct,
    deleteProduct,
    restoreDefaultProducts,
  } = useCart();

  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'wholesale' | 'add-product'>('orders');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered'>('All');

  // Authoritative server-side stats from Supabase
  const [serverStats, setServerStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Temporary stock edit state
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals for confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState<WholesaleEnquiry | null>(null);

  // New Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    currency: '₹',
    category: 'Tees' as Product['category'],
    badge: 'NEW' as Product['badge'],
    tagline: '',
    description: '',
    availableStock: '25',
    imageUrl: '',
    sizes: ['S', 'M', 'L', 'XL'],
  });

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          setServerStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, []);

  // Verify server-side HttpOnly session cookie on mount
  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          const storedAuth = localStorage.getItem('inveins_admin_auth');
          if (storedAuth === 'true') {
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        const storedAuth = localStorage.getItem('inveins_admin_auth');
        if (storedAuth === 'true') setIsAuthenticated(true);
      } finally {
        setIsCheckingSession(false);
      }
    }
    verifySession();
  }, []);

  // Fetch stats once when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshDatabaseData();
      fetchDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshDatabaseData(),
        fetchDashboardStats(),
      ]);
      setActionToast({ message: 'Authoritative data synchronized with Supabase.', type: 'info' });
      setTimeout(() => setActionToast(null), 3500);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPinError(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPinError(false);
        try {
          localStorage.setItem('inveins_admin_auth', 'true');
        } catch (e) {}
      } else {
        setPinError(true);
        setErrorMessage(data.message || 'Incorrect Admin Passcode');
      }
    } catch (err) {
      setPinError(true);
      setErrorMessage('Connection failed. Please check network.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    setIsAuthenticated(false);
    setPinInput('');
    try {
      localStorage.removeItem('inveins_admin_auth');
    } catch (e) {}
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProductForm.price) || 1490;
    const stockNum = parseInt(newProductForm.availableStock) || 20;
    const img = newProductForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1579809011670-aa21121f5ec6?auto=format&fit=crop&w=1200&q=85';

    await addNewProduct({
      name: newProductForm.name,
      price: priceNum,
      currency: '₹',
      category: newProductForm.category,
      badge: stockNum === 0 ? 'SOLD OUT' : newProductForm.badge,
      tagline: newProductForm.tagline || 'Considered essential garment cut for an architectural fit.',
      description: newProductForm.description || 'Crafted with premium heavyweight organic cotton.',
      availableStock: stockNum,
      images: [img],
      sizes: newProductForm.sizes,
      details: [
        '260-340 GSM organic combed cotton jersey',
        'Pre-shrunk architectural cut',
        'Reinforced coverstitching',
      ],
      materialCare: [
        '100% Certified Organic Cotton',
        'Machine wash cold, dry flat in shade',
      ],
      shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
      returnsInfo: 'Hassle-free 7-day exchange & return policy.',
    });

    setProductAddedSuccess(true);
    fetchDashboardStats();

    setTimeout(() => {
      setProductAddedSuccess(false);
      setActiveTab('inventory');
    }, 1500);

    setNewProductForm({
      name: '',
      price: '',
      currency: '₹',
      category: 'Tees',
      badge: 'NEW',
      tagline: '',
      description: '',
      availableStock: '25',
      imageUrl: '',
      sizes: ['S', 'M', 'L', 'XL'],
    });
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const id = orderToDelete.id;
    setOrderToDelete(null);
    const success = await deleteOrder(id);
    if (success) {
      setActionToast({ message: `Order ${id} deleted successfully from Supabase.`, type: 'success' });
      fetchDashboardStats();
    } else {
      setActionToast({ message: `Failed to delete order ${id}.`, type: 'error' });
    }
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleConfirmDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    const id = enquiryToDelete.id;
    setEnquiryToDelete(null);
    const success = await deleteWholesaleEnquiry(id);
    if (success) {
      setActionToast({ message: `Wholesale enquiry ${id} deleted successfully.`, type: 'success' });
      fetchDashboardStats();
    } else {
      setActionToast({ message: `Failed to delete enquiry ${id}.`, type: 'error' });
    }
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    const id = productToDelete.id;
    setProductToDelete(null);
    const success = await deleteProduct(id);
    if (success) {
      setActionToast({ message: `"${name}" removed from catalog and database.`, type: 'success' });
      fetchDashboardStats();
    } else {
      setActionToast({ message: `Failed to delete "${name}".`, type: 'error' });
    }
    setTimeout(() => setActionToast(null), 4000);
  };

  // Calculated metrics
  const calculatedRevenue = orders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);
  const displayRevenue = serverStats ? serverStats.totalRevenue : calculatedRevenue;
  const displayOrdersCount = serverStats ? serverStats.totalOrders : orders.length;
  const displayWholesaleCount = serverStats ? serverStats.wholesaleEnquiries : wholesaleEnquiries.length;
  const displayCatalogCount = serverStats ? serverStats.catalogItems : productsList.length;

  const filteredOrders = orders.filter(o => statusFilter === 'All' || o.status === statusFilter);

  if (isCheckingSession) {
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#737373]">
          Verifying Admin Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 px-4">
        <div className="bg-white border border-[#e5e4df] shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#171717] text-[#f5f4f0] rounded-full flex items-center justify-center mx-auto">
              <Lock size={24} />
            </div>
            <h1 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
              INVEINS ADMIN PORTAL
            </h1>
            <p className="text-xs text-[#737373]">
              Enter management passcode to access orders & inventory.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {pinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700 text-center">
                ⚠️ {errorMessage || 'Access Denied. Incorrect Admin Passcode.'}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                ADMIN PASSCODE
              </label>
              <input
                type="password"
                required
                inputMode="numeric"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] h-12 sm:h-10 px-3.5 text-base sm:text-xs text-[#171717] focus:outline-none focus:border-[#171717] font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#171717] hover:bg-black active:bg-neutral-800 text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest min-h-[48px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span>VERIFYING CREDENTIALS...</span>
              ) : (
                <>
                  <ShieldCheck size={16} /> UNLOCK ADMIN DASHBOARD
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Admin Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e4df] pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-800 text-emerald-100 text-[9px] sm:text-[10px] font-bold tracking-widest px-2.5 py-0.5 uppercase">
              AUTHENTICATED
            </span>
            <span className="text-[11px] sm:text-xs text-[#737373]">INVEINS STORE MANAGER</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#171717] tracking-tight mt-1">
            ADMIN CONTROL PANEL
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold tracking-wider px-2.5 py-1.5 sm:px-3 sm:py-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database size={13} className="text-emerald-700" />
            <span className="hidden xs:inline">SUPABASE POSTGRESQL</span>
            <span className="xs:hidden">SUPABASE</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white border border-[#e5e4df] hover:border-[#171717] active:bg-neutral-100 text-[#171717] text-xs font-bold uppercase tracking-wider py-2 px-3 flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[38px] shadow-xs"
            title="Fetch authoritative live data from Supabase"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
            <span>{isRefreshing ? 'SYNCING...' : 'SYNC'}</span>
          </button>

          <button
            onClick={() => setActiveTab('add-product')}
            className="bg-[#171717] hover:bg-black active:bg-neutral-800 text-[#f5f4f0] text-xs font-bold uppercase tracking-wider py-2 px-3.5 flex items-center gap-1.5 transition-colors min-h-[38px]"
          >
            <Plus size={16} /> <span className="hidden xs:inline">ADD NEW CLOTH</span><span className="xs:hidden">ADD ITEM</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wider text-[#737373] hover:text-[#171717] underline ml-auto sm:ml-0 py-2"
          >
            LOCK
          </button>
        </div>
      </div>

      {/* Action Toast Banner */}
      {actionToast && (
        <div
          className={`p-3.5 border text-xs font-bold flex items-center justify-between transition-all ${
            actionToast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : actionToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-neutral-50 border-neutral-200 text-neutral-800'
          }`}
        >
          <span>{actionToast.message}</span>
          <button
            onClick={() => setActionToast(null)}
            className="text-[10px] font-extrabold uppercase ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Authoritative Stats Cards Row (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#737373]">REVENUE</p>
            <p className="font-heading font-extrabold text-base sm:text-2xl text-[#171717] mt-0.5 sm:mt-1 truncate">
              ₹{displayRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">
            ₹
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#737373]">ORDERS</p>
            <p className="font-heading font-extrabold text-base sm:text-2xl text-[#171717] mt-0.5 sm:mt-1">
              {displayOrdersCount}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold flex-shrink-0">
            <ShoppingBag size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#737373]">WHOLESALE</p>
            <p className="font-heading font-extrabold text-base sm:text-2xl text-[#171717] mt-0.5 sm:mt-1">
              {displayWholesaleCount}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold flex-shrink-0">
            <MessageSquare size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#737373]">CATALOG</p>
            <p className="font-heading font-extrabold text-base sm:text-2xl text-[#171717] mt-0.5 sm:mt-1">
              {displayCatalogCount}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold flex-shrink-0">
            <Package size={18} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#e5e4df] gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors ${
            activeTab === 'orders' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          ORDERS ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition-colors ${
            activeTab === 'inventory' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          INVENTORY MANAGEMENT ({productsList.length})
        </button>

        <button
          onClick={() => setActiveTab('add-product')}
          className={`pb-3 transition-colors ${
            activeTab === 'add-product' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          + ADD NEW CLOTH
        </button>

        <button
          onClick={() => setActiveTab('wholesale')}
          className={`pb-3 transition-colors ${
            activeTab === 'wholesale' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          WHOLESALE ENQUIRIES ({wholesaleEnquiries.length})
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#737373] uppercase tracking-wider">Filter Status:</span>
            {(['All', 'Pending', 'Confirmed', 'Dispatched', 'Delivered'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold border transition-colors ${
                  statusFilter === st ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373]">
              No orders found matching the "{statusFilter}" filter.
            </div>
          ) : (
            <>
              {/* Mobile View: Order Cards (< md) */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white border border-[#e5e4df] p-4 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-[#e5e4df] pb-2.5">
                      <div>
                        <div className="font-bold font-mono text-sm text-[#171717]">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-[#737373] mt-0.5">
                          {order.createdAt} {order.trackingNumber && `• Trk: ${order.trackingNumber}`}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-heading font-extrabold text-sm text-[#171717]">
                          ₹{(order.grandTotal || order.subtotal).toLocaleString('en-IN')}
                        </span>
                        <div className="text-[10px] font-bold uppercase text-[#737373]">
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-bold text-[#171717]">{order.customer.name}</div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={`tel:${order.customer.phone}`}
                          className="text-[#cc785c] font-bold hover:underline py-0.5"
                        >
                          📞 {order.customer.phone}
                        </a>
                        {order.customer.email && (
                          <span className="text-[#737373] text-[10px] truncate max-w-[160px]">
                            • {order.customer.email}
                          </span>
                        )}
                      </div>
                      <p className="text-[#737373] text-[11px] leading-relaxed">
                        📍 {order.customer.address}, {order.customer.city} ({order.customer.pincode})
                      </p>
                    </div>

                    {/* Ordered items breakdown */}
                    <div className="bg-[#faf9f5] p-2.5 border border-[#e5e4df] text-xs space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373] block">
                        ITEMS:
                      </span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="font-medium text-[#171717]">
                            {it.product.name} (<span className="font-bold">{it.selectedSize}</span>)
                          </span>
                          <span className="font-bold text-[#737373]">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Status & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e5e4df]">
                      <div className="flex-1">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                          className={`w-full min-h-[40px] text-xs font-bold px-2.5 py-1.5 border focus:outline-none ${
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            order.status === 'Confirmed' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            order.status === 'Dispatched' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="min-h-[40px] px-3 border border-red-200 text-red-700 hover:bg-red-700 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 flex-shrink-0"
                        title={`Delete Order ${order.id}`}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Wide Table (>= md) */}
              <div className="hidden md:block bg-white border border-[#e5e4df] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#171717] text-[#f5f4f0] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Delivery Address</th>
                      <th className="p-3.5">Item(s) & Size</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e4df] text-[#171717]">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#f5f4f0]/50 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-[#171717]">
                          {order.id}
                          {order.trackingNumber && (
                            <div className="text-[10px] text-[#6c6a64] font-normal">{order.trackingNumber}</div>
                          )}
                        </td>
                        <td className="p-3.5 text-[#737373]">{order.createdAt}</td>
                        <td className="p-3.5">
                          <div className="font-bold">{order.customer.name}</div>
                          <div className="text-[11px] text-[#737373]">{order.customer.phone}</div>
                          <div className="text-[10px] text-[#737373]">{order.customer.email}</div>
                        </td>
                        <td className="p-3.5 text-[#737373] max-w-xs">
                          {order.customer.address}, {order.customer.city} ({order.customer.pincode})
                        </td>
                        <td className="p-3.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="font-medium">
                              {it.product.name} (<span className="font-bold">{it.selectedSize}</span>) x{it.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5 font-extrabold">₹{(order.grandTotal || order.subtotal).toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-neutral-100 border text-[10px] font-bold uppercase">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                            className={`text-xs font-bold px-2 py-1 border focus:outline-none ${
                              order.status === 'Pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                              order.status === 'Confirmed' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                              order.status === 'Dispatched' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                              'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="border border-red-200 text-red-700 hover:bg-red-700 hover:text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 transition-colors inline-flex items-center gap-1"
                            title={`Delete Order ${order.id}`}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Catalog Status & Restore Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-[#e5e4df]">
            <div className="text-xs">
              <span className="font-bold text-[#171717]">{productsList.length} Active Products in Database</span>
              {deletedProductIds && deletedProductIds.length > 0 && (
                <span className="ml-2 text-red-600 font-semibold text-[11px]">
                  ({deletedProductIds.length} item{deletedProductIds.length > 1 ? 's' : ''} deleted)
                </span>
              )}
            </div>

            {deletedProductIds && deletedProductIds.length > 0 && (
              <button
                onClick={() => {
                  restoreDefaultProducts();
                  setActionToast({ message: 'Catalog restored from database.', type: 'info' });
                }}
                className="bg-[#faf9f5] hover:bg-neutral-100 text-[#141413] border border-[#e6e2d8] text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-3.5 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={12} className="text-[#cc785c]" /> Restore Catalog ({deletedProductIds.length})
              </button>
            )}
          </div>

          {/* Mobile View: Inventory Cards (< md) */}
          <div className="md:hidden space-y-3">
            {productsList.map(prod => {
              const stockVal = editingStock[prod.id] !== undefined ? editingStock[prod.id] : prod.availableStock;
              const isLowStock = prod.availableStock > 0 && prod.availableStock < 5;

              return (
                <div key={prod.id} className="bg-white border border-[#e5e4df] p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2 border-b border-[#e5e4df] pb-2">
                    <div>
                      <div className="font-heading font-extrabold text-sm text-[#171717] flex items-center gap-1.5 flex-wrap">
                        <span>{prod.name}</span>
                        {isLowStock && (
                          <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.5 border border-amber-300 flex items-center gap-0.5">
                            <AlertTriangle size={10} /> LOW STOCK
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#737373] mt-0.5">
                        {prod.category} • <span className="font-bold text-[#171717]">₹{prod.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setProductToDelete(prod)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-red-200 text-red-700 hover:bg-red-700 hover:text-white transition-colors"
                      title={`Delete ${prod.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                        Stock Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={stockVal}
                        onChange={e => setEditingStock({ ...editingStock, [prod.id]: parseInt(e.target.value) || 0 })}
                        className="w-full bg-[#f5f4f0] border border-[#e5e4df] h-10 px-2 font-bold text-center text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                        Badge
                      </label>
                      <select
                        value={prod.badge || (prod.availableStock === 0 ? 'SOLD OUT' : 'NEW')}
                        onChange={e => updateProductStock(prod.id, stockVal, e.target.value as any)}
                        className="w-full text-xs font-bold h-10 px-2 border border-[#e5e4df] bg-[#f5f4f0]"
                      >
                        <option value="NEW">NEW</option>
                        <option value="LIMITED">LIMITED</option>
                        <option value="SOLD OUT">SOLD OUT</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await updateProductStock(prod.id, stockVal);
                      setActionToast({ message: `Stock updated for ${prod.name}`, type: 'success' });
                      setTimeout(() => setActionToast(null), 3000);
                    }}
                    className="w-full bg-[#171717] hover:bg-black active:bg-neutral-800 text-[#f5f4f0] text-xs font-bold uppercase tracking-wider min-h-[40px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check size={14} /> SAVE STOCK ({stockVal} pcs)
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Inventory Table (>= md) */}
          <div className="hidden md:block bg-white border border-[#e5e4df] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171717] text-[#f5f4f0] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price (₹)</th>
                  <th className="p-3.5">Available Stock</th>
                  <th className="p-3.5">Status Badge</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e4df] text-[#171717]">
                {productsList.map(prod => {
                  const stockVal = editingStock[prod.id] !== undefined ? editingStock[prod.id] : prod.availableStock;
                  const isLowStock = prod.availableStock > 0 && prod.availableStock < 5;

                  return (
                    <tr key={prod.id} className="hover:bg-[#f5f4f0]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-sm flex items-center gap-2">
                          {prod.name}
                          {isLowStock && (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-2 py-0.5 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle size={10} /> LOW STOCK
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#737373] line-clamp-1">{prod.tagline}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-[#737373]">{prod.category}</td>
                      <td className="p-3.5 font-bold">₹{prod.price.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <input
                          type="number"
                          min={0}
                          value={stockVal}
                          onChange={e => setEditingStock({ ...editingStock, [prod.id]: parseInt(e.target.value) || 0 })}
                          className="w-20 bg-[#f5f4f0] border border-[#e5e4df] p-1.5 font-bold text-center"
                        />
                      </td>
                      <td className="p-3.5">
                        <select
                          value={prod.badge || (prod.availableStock === 0 ? 'SOLD OUT' : 'NEW')}
                          onChange={e => updateProductStock(prod.id, stockVal, e.target.value as any)}
                          className="text-xs font-bold p-1.5 border border-[#e5e4df] bg-[#f5f4f0]"
                        >
                          <option value="NEW">NEW</option>
                          <option value="LIMITED">LIMITED</option>
                          <option value="SOLD OUT">SOLD OUT</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await updateProductStock(prod.id, stockVal);
                              setActionToast({ message: `Stock updated for ${prod.name}`, type: 'success' });
                              setTimeout(() => setActionToast(null), 3000);
                            }}
                            className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 flex items-center gap-1 transition-colors"
                          >
                            <Check size={12} /> SAVE STOCK
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="border border-red-300 text-red-700 hover:bg-red-700 hover:text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-2.5 transition-colors flex items-center gap-1"
                            title={`Delete ${prod.name} from database`}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADD NEW CLOTH FORM */}
      {activeTab === 'add-product' && (
        <div className="max-w-2xl bg-white p-8 border border-[#e5e4df] shadow-sm space-y-6">
          <div className="border-b border-[#e5e4df] pb-4">
            <h2 className="font-heading font-bold text-xl uppercase tracking-wider text-[#171717]">
              ADD NEW CLOTHING ITEM
            </h2>
            <p className="text-xs text-[#737373] mt-1">
              Publish a new garment directly to the Supabase database and storefront.
            </p>
          </div>

          {productAddedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={18} /> PRODUCT SAVED TO DATABASE! Redirecting to inventory...
            </div>
          )}

          <form onSubmit={handleAddProductSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Minimalist Linen Shirt"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  PRICE IN ₹ *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newProductForm.price}
                  onChange={e => setNewProductForm({ ...newProductForm, price: e.target.value })}
                  placeholder="e.g. 2490"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  CATEGORY *
                </label>
                <select
                  value={newProductForm.category}
                  onChange={e => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  <option value="Tees">Tees</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Denim">Denim</option>
                  <option value="Layers">Layers</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  STATUS BADGE *
                </label>
                <select
                  value={newProductForm.badge}
                  onChange={e => setNewProductForm({ ...newProductForm, badge: e.target.value as any })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  <option value="NEW">NEW</option>
                  <option value="LIMITED">LIMITED</option>
                  <option value="SOLD OUT">SOLD OUT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  INITIAL STOCK *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newProductForm.availableStock}
                  onChange={e => setNewProductForm({ ...newProductForm, availableStock: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                SHORT TAGLINE *
              </label>
              <input
                type="text"
                required
                value={newProductForm.tagline}
                onChange={e => setNewProductForm({ ...newProductForm, tagline: e.target.value })}
                placeholder="e.g. Heavyweight organic cotton, cut for an easy drape."
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                FULL DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={newProductForm.description}
                onChange={e => setNewProductForm({ ...newProductForm, description: e.target.value })}
                placeholder="Detailed garment specifications..."
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                PRODUCT PHOTO IMAGE URL *
              </label>
              <input
                type="url"
                required
                value={newProductForm.imageUrl}
                onChange={e => setNewProductForm({ ...newProductForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Sparkles size={16} /> PUBLISH PRODUCT TO DATABASE
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: WHOLESALE ENQUIRIES */}
      {activeTab === 'wholesale' && (
        <div className="space-y-4">
          {wholesaleEnquiries.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373]">
              No B2B wholesale enquiries submitted yet.
            </div>
          ) : (
            <>
              {/* Mobile View: Wholesale Cards (< md) */}
              <div className="md:hidden space-y-3">
                {wholesaleEnquiries.map(enq => (
                  <div key={enq.id} className="bg-white border border-[#e5e4df] p-4 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-[#e5e4df] pb-2">
                      <div>
                        <div className="font-heading font-extrabold text-sm text-[#171717]">
                          {enq.company || enq.name}
                        </div>
                        <div className="text-[10px] text-[#737373] mt-0.5">
                          {enq.createdAt} • ID: {enq.id}
                        </div>
                      </div>

                      <button
                        onClick={() => setEnquiryToDelete(enq)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-red-200 text-red-700 hover:bg-red-700 hover:text-white transition-colors"
                        title={`Delete Enquiry ${enq.id}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-[#171717]">
                        <span className="text-[#737373]">Contact: </span>
                        <span className="font-bold">{enq.name}</span>
                        {enq.cityCountry && <span className="text-[#737373]"> ({enq.cityCountry})</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        <a 
                          href={`tel:${enq.phone}`}
                          className="text-[#cc785c] font-bold hover:underline py-0.5"
                        >
                          📞 {enq.phone}
                        </a>
                        <a 
                          href={`mailto:${enq.email}`}
                          className="text-[#171717] font-semibold hover:underline py-0.5"
                        >
                          ✉️ {enq.email}
                        </a>
                      </div>
                    </div>

                    <div className="bg-[#faf9f5] p-2.5 border border-[#e5e4df] text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#171717]">{enq.productInterest}</span>
                        <span className="bg-[#171717] text-white text-[10px] font-bold px-2 py-0.5">
                          Qty: {enq.quantity}
                        </span>
                      </div>
                      {enq.message && (
                        <p className="text-[11px] text-[#737373] italic pt-1 border-t border-[#e5e4df]">
                          "{enq.message}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Wholesale Table (>= md) */}
              <div className="hidden md:block bg-white border border-[#e5e4df] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#171717] text-[#f5f4f0] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">ID & Date</th>
                      <th className="p-3.5">Name & Company</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Product Interest & Qty</th>
                      <th className="p-3.5">Message</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e4df] text-[#171717]">
                    {wholesaleEnquiries.map(enq => (
                      <tr key={enq.id} className="hover:bg-[#f5f4f0]/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold font-mono">{enq.id}</div>
                          <div className="text-[10px] text-[#737373]">{enq.createdAt}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold">{enq.name}</div>
                          <div className="text-[11px] text-[#737373]">{enq.company}</div>
                        </td>
                        <td className="p-3.5">
                          <div>{enq.email}</div>
                          <div className="text-[11px] text-[#737373]">{enq.phone}</div>
                        </td>
                        <td className="p-3.5 text-[#737373]">{enq.cityCountry}</td>
                        <td className="p-3.5">
                          <div className="font-bold">{enq.productInterest}</div>
                          <div className="text-[11px] text-[#737373]">Qty: {enq.quantity}</div>
                        </td>
                        <td className="p-3.5 text-[#737373] max-w-xs">{enq.message}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setEnquiryToDelete(enq)}
                            className="border border-red-200 text-red-700 hover:bg-red-700 hover:text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 transition-colors inline-flex items-center gap-1"
                            title={`Delete Enquiry ${enq.id}`}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL: Delete Product Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#171717]">
                  Delete Product From Database?
                </h3>
                <p className="text-[11px] text-[#737373]">
                  This item will be permanently removed from Supabase and the live storefront.
                </p>
              </div>
            </div>

            <div className="bg-[#f5f4f0] p-3.5 border border-[#e5e4df] text-xs space-y-1">
              <div className="font-bold text-[#171717]">{productToDelete.name}</div>
              <div className="text-[11px] text-[#737373]">
                Category: <span className="font-semibold">{productToDelete.category}</span> • Price: <span className="font-bold">₹{productToDelete.price}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Order Confirmation */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#171717]">
                  Delete Order Record?
                </h3>
                <p className="text-[11px] text-[#737373]">
                  Order {orderToDelete.id} will be permanently removed from Supabase PostgreSQL.
                </p>
              </div>
            </div>

            <div className="bg-[#f5f4f0] p-3.5 border border-[#e5e4df] text-xs space-y-1">
              <div className="font-bold text-[#171717]">Customer: {orderToDelete.customer.name}</div>
              <div className="text-[11px] text-[#737373]">
                Total: <span className="font-bold">₹{orderToDelete.grandTotal || orderToDelete.subtotal}</span> • Status: <span className="font-semibold">{orderToDelete.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteOrder}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Wholesale Enquiry Confirmation */}
      {enquiryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#171717]">
                  Delete Wholesale Enquiry?
                </h3>
                <p className="text-[11px] text-[#737373]">
                  Enquiry {enquiryToDelete.id} from {enquiryToDelete.company || enquiryToDelete.name} will be deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEnquiryToDelete(null)}
                className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteEnquiry}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
