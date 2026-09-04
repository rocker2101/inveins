'use client';

import React, { useState, useEffect } from 'react';
import { useCart, Order, WholesaleEnquiry } from '@/context/CartContext';
import { Product } from '@/data/products';
import { ShieldCheck, Lock, Package, ShoppingBag, MessageSquare, Plus, Trash2, Check, AlertTriangle, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';

const ADMIN_PIN = 'inveins2025';

export default function AdminPage() {
  const {
    orders,
    updateOrderStatus,
    wholesaleEnquiries,
    productsList,
    deletedProductIds,
    updateProductStock,
    addNewProduct,
    deleteProduct,
    restoreDefaultProducts,
  } = useCart();

  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'wholesale' | 'add-product'>('orders');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered'>('All');

  // Persist admin session across page refreshes
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('inveins_admin_auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {}
  }, []);

  // Temporary stock edit state
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      try {
        localStorage.setItem('inveins_admin_auth', 'true');
      } catch (e) {}
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    try {
      localStorage.removeItem('inveins_admin_auth');
    } catch (e) {}
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProductForm.price) || 1490;
    const stockNum = parseInt(newProductForm.availableStock) || 20;
    const img = newProductForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1579809011670-aa21121f5ec6?auto=format&fit=crop&w=1200&q=85';

    addNewProduct({
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
        'Reinforced coverstitching'
      ],
      materialCare: [
        '100% Certified Organic Cotton',
        'Machine wash cold, dry flat in shade'
      ],
      shippingInfo: 'Complimentary shipping across India on orders above ₹999.',
      returnsInfo: 'Hassle-free 7-day exchange & return policy.'
    });

    setProductAddedSuccess(true);
    setTimeout(() => {
      setProductAddedSuccess(false);
      setActiveTab('inventory');
    }, 1500);

    // Reset Form
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

  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [localEnquiries, setLocalEnquiries] = useState<WholesaleEnquiry[]>([]);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('inveins_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setLocalOrders(parsed);
      }
      const storedEnq = localStorage.getItem('inveins_wholesale_enquiries');
      if (storedEnq) {
        const parsed = JSON.parse(storedEnq);
        if (Array.isArray(parsed)) setLocalEnquiries(parsed);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadFromStorage();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'inveins_orders' || e.key === 'inveins_wholesale_enquiries') {
        loadFromStorage();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeOrders = orders.length > 0 ? orders : localOrders;
  const activeEnquiries = wholesaleEnquiries.length > 0 ? wholesaleEnquiries : localEnquiries;
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const filteredOrders = activeOrders.filter(o => statusFilter === 'All' || o.status === statusFilter);

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
                ⚠️ Incorrect Admin Passcode. Try <code className="font-mono bg-red-100 px-1 py-0.5">inveins2025</code>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                ADMIN PASSCODE
              </label>
              <input
                type="password"
                required
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter passcode (inveins2025)"
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717] font-mono tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck size={16} /> UNLOCK ADMIN DASHBOARD
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e4df] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold tracking-widest px-2.5 py-0.5 uppercase">
              AUTHENTICATED
            </span>
            <span className="text-xs text-[#737373]">INVEINS STORE MANAGER</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-[#171717] tracking-tight mt-1">
            ADMIN CONTROL PANEL
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('add-product')}
            className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} /> ADD NEW CLOTH
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wider text-[#737373] hover:text-[#171717] underline"
          >
            LOCK DASHBOARD
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#737373]">TOTAL REVENUE</p>
            <p className="font-heading font-extrabold text-2xl text-[#171717] mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#737373]">TOTAL ORDERS</p>
            <p className="font-heading font-extrabold text-2xl text-[#171717] mt-1">
              {activeOrders.length}
            </p>
          </div>
          <div className="w-10 h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-white p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#737373]">WHOLESALE ENQUIRIES</p>
            <p className="font-heading font-extrabold text-2xl text-[#171717] mt-1">
              {activeEnquiries.length}
            </p>
          </div>
          <div className="w-10 h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-white p-5 border border-[#e5e4df] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#737373]">CATALOG ITEMS</p>
            <p className="font-heading font-extrabold text-2xl text-[#171717] mt-1">
              {productsList.length}
            </p>
          </div>
          <div className="w-10 h-10 bg-[#f5f4f0] text-[#171717] flex items-center justify-center font-bold">
            <Package size={20} />
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
          ORDERS ({activeOrders.length})
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
          WHOLESALE ENQUIRIES ({activeEnquiries.length})
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
            <div className="bg-white border border-[#e5e4df] overflow-x-auto">
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
                    <th className="p-3.5">Status Toggle</th>
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
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Toast Notification Banner */}
          {deleteToast && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center justify-between rounded animate-fade-in">
              <span className="flex items-center gap-1.5">
                <Trash2 size={14} className="text-red-600" /> {deleteToast}
              </span>
              <button
                onClick={() => setDeleteToast(null)}
                className="text-red-700 hover:text-red-900 text-[11px] font-extrabold uppercase ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Catalog Status & Restore Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-[#e5e4df]">
            <div className="text-xs">
              <span className="font-bold text-[#171717]">{productsList.length} Active Products</span>
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
                  setDeleteToast('All original IndiaMART catalog products have been restored!');
                }}
                className="bg-[#faf9f5] hover:bg-neutral-100 text-[#141413] border border-[#e6e2d8] text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-3.5 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles size={12} className="text-[#cc785c]" /> Restore Original Catalog ({deletedProductIds.length})
              </button>
            )}
          </div>

          <div className="bg-white border border-[#e5e4df] overflow-x-auto">
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
                            onClick={() => updateProductStock(prod.id, stockVal)}
                            className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 flex items-center gap-1 transition-colors"
                          >
                            <Check size={12} /> SAVE STOCK
                          </button>
                          <button
                            onClick={() => setProductToDelete(prod)}
                            className="border border-red-300 text-red-700 hover:bg-red-700 hover:text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-2.5 transition-colors flex items-center gap-1"
                            title={`Delete ${prod.name} from catalog`}
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

          {/* Delete Confirmation In-App Modal */}
          {productToDelete && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white border border-[#e5e4df] max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-[#171717]">
                      Delete Product From Catalog?
                    </h3>
                    <p className="text-[11px] text-[#737373]">
                      This item will be removed immediately from the online store and catalog.
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
                    onClick={() => {
                      const name = productToDelete.name;
                      deleteProduct(productToDelete.id);
                      setProductToDelete(null);
                      setDeleteToast(`"${name}" was successfully deleted from catalog.`);
                      setTimeout(() => setDeleteToast(null), 5000);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 size={13} /> Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
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
              Publish a new garment directly to the live catalog and storefront.
            </p>
          </div>

          {productAddedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={18} /> PRODUCT PUBLISHED SUCCESSFULLY! Redirecting to inventory...
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
              <Sparkles size={16} /> PUBLISH PRODUCT TO CATALOG
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: WHOLESALE ENQUIRIES */}
      {activeTab === 'wholesale' && (
        <div className="space-y-4">
          {activeEnquiries.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373]">
              No B2B wholesale enquiries submitted yet.
            </div>
          ) : (
            <div className="bg-white border border-[#e5e4df] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171717] text-[#f5f4f0] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ID & Date</th>
                    <th className="p-3.5">Name & Company</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Product Interest & Qty</th>
                    <th className="p-3.5">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e4df] text-[#171717]">
                  {activeEnquiries.map(enq => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
