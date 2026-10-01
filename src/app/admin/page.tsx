'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCart, Order, WholesaleEnquiry } from '@/context/CartContext';
import { Product } from '@/data/products';
import { ShieldCheck, Lock, Package, ShoppingBag, MessageSquare, Plus, Trash2, Check, AlertTriangle, CheckCircle2, Sparkles, RefreshCw, Database, UploadCloud, Loader2, Image as ImageIcon, Eye, EyeOff, Pencil, X, Truck } from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  wholesaleEnquiries: number;
  catalogItems: number;
}

export default function AdminPage() {
  const {
    orders,
    setOrders,
    updateOrderStatus,
    deleteOrder,
    refreshDatabaseData,
    wholesaleEnquiries,
    setWholesaleEnquiries,
    deleteWholesaleEnquiry,
    productsList,
    deletedProductIds,
    updateProductStock,
    addNewProduct,
    updateProduct,
    deleteProduct,
    restoreDefaultProducts,
    standardShippingFee,
    freeShippingThreshold,
    updateShippingSettings,
    refreshShippingSettings,
  } = useCart();

  const [pinInput, setPinInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'wholesale' | 'add-product' | 'shipping'>('orders');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered'>('All');

  // Shipping Configuration Editing State
  const [shippingFeeInput, setShippingFeeInput] = useState<string>(String(standardShippingFee));
  const [freeThresholdInput, setFreeThresholdInput] = useState<string>(String(freeShippingThreshold));
  const [isSavingShipping, setIsSavingShipping] = useState<boolean>(false);
  const isEditingShippingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isEditingShippingRef.current && !isSavingShipping) {
      setShippingFeeInput(String(standardShippingFee));
    }
  }, [standardShippingFee, isSavingShipping]);

  useEffect(() => {
    if (!isEditingShippingRef.current && !isSavingShipping) {
      setFreeThresholdInput(String(freeShippingThreshold));
    }
  }, [freeShippingThreshold, isSavingShipping]);

  const handleApplyPreset = async (fee: number, threshold: number, presetLabel: string) => {
    isEditingShippingRef.current = false;
    setShippingFeeInput(String(fee));
    setFreeThresholdInput(String(threshold));
    setIsSavingShipping(true);
    try {
      const res = await updateShippingSettings(fee, threshold);
      if (res.success) {
        setActionToast({
          message: fee === 0 
            ? '✓ Free Delivery Everywhere (₹0) applied & saved!' 
            : `✓ Shipping preset saved: ${presetLabel}`,
          type: 'success',
        });
      } else {
        setActionToast({ message: res.message || 'Failed to update shipping cost', type: 'error' });
      }
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error updating shipping settings', type: 'error' });
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleSaveShippingSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fee = parseFloat(shippingFeeInput);
    const threshold = parseFloat(freeThresholdInput);

    if (isNaN(fee) || fee < 0) {
      setActionToast({ message: 'Please enter a valid standard delivery cost (₹0 or more).', type: 'error' });
      return;
    }
    if (isNaN(threshold) || threshold < 0) {
      setActionToast({ message: 'Please enter a valid free delivery threshold (₹0 or more).', type: 'error' });
      return;
    }

    isEditingShippingRef.current = false;
    setIsSavingShipping(true);
    try {
      const res = await updateShippingSettings(fee, threshold);
      if (res.success) {
        setActionToast({
          message: fee === 0 
            ? '✓ Free Delivery Everywhere saved! Customers will not be charged shipping.'
            : `✓ Shipping saved! Standard: ₹${Math.round(fee)}, Free over: ₹${Math.round(threshold)}.`,
          type: 'success',
        });
      } else {
        setActionToast({ message: res.message || 'Failed to update shipping cost', type: 'error' });
      }
    } catch (err: any) {
      setActionToast({ message: err.message || 'Error updating shipping settings', type: 'error' });
    } finally {
      setIsSavingShipping(false);
    }
  };

  // Authoritative server-side stats from Supabase
  const [serverStats, setServerStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Temporary stock edit state
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Phone gallery upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePhonePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      const formData = new FormData();

      for (const file of filesArray) {
        let fileToUpload: File = file;
        if (file.type.startsWith('image/') && !file.type.includes('svg')) {
          try {
            const optimizedBlob = await new Promise<Blob | null>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                  const maxDim = 1600;
                  let { width, height } = img;
                  if (width > maxDim || height > maxDim) {
                    const ratio = Math.min(maxDim / width, maxDim / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                  }
                  const canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) { resolve(null); return; }
                  ctx.drawImage(img, 0, 0, width, height);
                  canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
                };
                img.onerror = () => resolve(null);
                img.src = ev.target?.result as string;
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            });
            if (optimizedBlob) {
              fileToUpload = new File([optimizedBlob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
                type: 'image/jpeg',
              });
            }
          } catch (compErr) {
            console.warn('Compression skipped, using original file', compErr);
          }
        }
        formData.append('files', fileToUpload);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || (!data.success && !data.url && !data.urls)) {
        const errorDetail = data.error ? `${data.message} (${data.error})` : data.message || 'Failed to upload photo(s)';
        throw new Error(errorDetail);
      }

      const returnedUrls: string[] = data.urls || (data.url ? [data.url] : []);
      setNewProductForm(prev => {
        const existing = prev.images || (prev.imageUrl ? [prev.imageUrl] : []);
        const combined = Array.from(new Set([...existing, ...returnedUrls]));
        return {
          ...prev,
          images: combined,
          imageUrl: combined[0] || '',
        };
      });

      setActionToast({
        message: `${returnedUrls.length} catalog photo(s) uploaded successfully!`,
        type: 'success',
      });
      setTimeout(() => setActionToast(null), 4000);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProductImage = (idxToRemove: number) => {
    setNewProductForm(prev => {
      const updated = (prev.images || []).filter((_, idx) => idx !== idxToRemove);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleSetPrimaryImage = (idxToPrimary: number) => {
    setNewProductForm(prev => {
      const currentImages = [...(prev.images || [])];
      const target = currentImages[idxToPrimary];
      if (!target) return prev;
      currentImages.splice(idxToPrimary, 1);
      currentImages.unshift(target);
      return {
        ...prev,
        images: currentImages,
        imageUrl: currentImages[0],
      };
    });
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    const url = manualUrlInput.trim();
    setNewProductForm(prev => {
      const updated = Array.from(new Set([...(prev.images || []), url]));
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || url,
      };
    });
    setManualUrlInput('');
  };

  // Modals for confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState<WholesaleEnquiry | null>(null);

  // New Product Form State
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    currency: '₹',
    category: 'Gym Compression' as Product['category'],
    badge: 'NEW' as Product['badge'],
    tagline: '',
    gsm: '',
    description: '',
    availableStock: '25',
    imageUrl: '',
    images: [] as string[],
    sizes: ['S', 'M', 'L', 'XL'],
  });

  // Editing Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editCustomSizeInput, setEditCustomSizeInput] = useState('');
  const [editManualUrlInput, setEditManualUrlInput] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);

  const [editProductForm, setEditProductForm] = useState<{
    name: string;
    price: string;
    category: Product['category'];
    badge: Product['badge'];
    tagline: string;
    gsm: string;
    description: string;
    availableStock: string;
    images: string[];
    sizes: string[];
  }>({
    name: '',
    price: '',
    category: 'Tees',
    badge: 'NEW',
    tagline: '',
    gsm: '',
    description: '',
    availableStock: '20',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
  });

  const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34', '36', '38'];
  const CATEGORY_LIST: { label: string; value: Product['category'] }[] = [
    { label: 'Gym Compression', value: 'Gym Compression' },
    { label: 'Tees & Tops', value: 'Tees' },
    { label: 'Lowers & Joggers', value: 'Joggers' },
    { label: 'Shirts & Polos', value: 'Shirts' },
    { label: 'Hoodies & Outerwear', value: 'Outerwear' },
    { label: 'Custom B2B Merchandise', value: 'Custom B2B' },
  ];

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    const existingGsm = prod.gsm || 
      prod.details?.find(d => /\b\d{2,3}(?:[–-]\d{2,3})?\s*GSM\b/i.test(d) && !d.includes('260-340') && !d.includes('280-420') && !d.includes('280–420'))?.match(/\b(\d{2,3}(?:[–-]\d{2,3})?\s*GSM)\b/i)?.[1] || '';

    setEditProductForm({
      name: prod.name,
      price: String(prod.price),
      category: prod.category || 'Tees',
      badge: prod.badge || 'NEW',
      tagline: prod.tagline || '',
      gsm: existingGsm,
      description: prod.description || '',
      availableStock: String(prod.availableStock),
      images: Array.isArray(prod.images) ? [...prod.images] : [],
      sizes: Array.isArray(prod.sizes) && prod.sizes.length > 0 ? [...prod.sizes] : ['S', 'M', 'L', 'XL'],
    });
    setEditManualUrlInput('');
    setEditCustomSizeInput('');
    setEditUploadError(null);
  };

  const handleEditPhonePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    setIsUploadingEditPhoto(true);
    setEditUploadError(null);
    try {
      const formData = new FormData();
      for (const file of filesArray) {
        formData.append('files', file);
      }
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || (!data.success && !data.url && !data.urls)) {
        throw new Error(data.message || 'Failed to upload photo(s)');
      }
      const returnedUrls: string[] = data.urls || (data.url ? [data.url] : []);
      setEditProductForm(prev => {
        const combined = Array.from(new Set([...(prev.images || []), ...returnedUrls]));
        return { ...prev, images: combined };
      });
      setActionToast({ message: `${returnedUrls.length} photo(s) added to product!`, type: 'success' });
      setTimeout(() => setActionToast(null), 3000);
    } catch (err: any) {
      setEditUploadError(err?.message || 'Upload failed');
    } finally {
      setIsUploadingEditPhoto(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingEdit(true);
    try {
      const rawGsm = (editProductForm.gsm || '').trim();
      const normalizedGsm = rawGsm ? (rawGsm.toLowerCase().endsWith('gsm') ? rawGsm.toUpperCase() : `${rawGsm} GSM`) : '';

      // Clean existing details: remove any old or legacy auto GSM strings like "260-340 GSM...", "280–420 GSM...", or existing "GSM:" / "Fabric Weight:" entries
      const existingDetails = (editingProduct.details || []).filter(
        d => !/\b(\d{2,3}(?:[–-]\d{2,3})?\s*GSM)\b/i.test(d)
      );
      const updatedDetails = normalizedGsm
        ? [`Fabric Weight: ${normalizedGsm}`, ...existingDetails]
        : existingDetails;

      const success = await updateProduct(editingProduct.id, {
        name: editProductForm.name.trim(),
        price: parseFloat(editProductForm.price) || editingProduct.price,
        category: editProductForm.category,
        badge: editProductForm.badge,
        availableStock: parseInt(editProductForm.availableStock) || 0,
        sizes: editProductForm.sizes.length > 0 ? editProductForm.sizes : ['S', 'M', 'L', 'XL'],
        tagline: editProductForm.tagline.trim(),
        description: editProductForm.description.trim(),
        images: editProductForm.images.length > 0 ? editProductForm.images : editingProduct.images,
        details: updatedDetails,
        gsm: normalizedGsm || undefined,
      });
      if (success) {
        setActionToast({ message: `"${editProductForm.name}" updated successfully in database!`, type: 'success' });
        setEditingProduct(null);
        fetchDashboardStats();
      } else {
        setActionToast({ message: `Failed to update product. Please try again.`, type: 'error' });
      }
    } catch (err) {
      setActionToast({ message: 'Error saving product updates.', type: 'error' });
    } finally {
      setIsSavingEdit(false);
      setTimeout(() => setActionToast(null), 4000);
    }
  };

  const loadAdminData = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const [statsRes, ordersRes, wsRes] = await Promise.allSettled([
        fetch('/api/admin/dashboard', { cache: 'no-store' }),
        fetch('/api/orders/list', { cache: 'no-store' }),
        fetch('/api/wholesale/list', { cache: 'no-store' }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json();
        if (statsData.success && statsData.stats) {
          setServerStats(statsData.stats);
        }
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        const ordData = await ordersRes.value.json();
        if (ordData.success && Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
        }
      }

      if (wsRes.status === 'fulfilled' && wsRes.value.ok) {
        const wsData = await wsRes.value.json();
        if (wsData.success && Array.isArray(wsData.enquiries)) {
          setWholesaleEnquiries(wsData.enquiries);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [setOrders, setWholesaleEnquiries]);

  const fetchDashboardStats = loadAdminData;

  // Verify server-side HttpOnly session cookie on mount
  useEffect(() => {
    async function verifySession() {
      try {
        const res = await fetch('/api/admin/session');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    }
    verifySession();
  }, []);

  // Fetch stats and orders immediately once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
      refreshDatabaseData(true);
    }
  }, [isAuthenticated, loadAdminData, refreshDatabaseData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadAdminData(),
        refreshDatabaseData(true),
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
        loadAdminData();
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
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProductForm.price) || 1490;
    const stockNum = parseInt(newProductForm.availableStock) || 20;

    const catalogImages = (newProductForm.images && newProductForm.images.length > 0)
      ? newProductForm.images
      : newProductForm.imageUrl.trim()
        ? [newProductForm.imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1579809011670-aa21121f5ec6?auto=format&fit=crop&w=1200&q=85'];

    const rawGsm = (newProductForm.gsm || '').trim();
    const normalizedGsm = rawGsm ? (rawGsm.toLowerCase().endsWith('gsm') ? rawGsm.toUpperCase() : `${rawGsm} GSM`) : '';

    const baseDetails = newProductForm.category.toLowerCase().includes('compression')
      ? [
          '4-way stretch high-recovery performance fabric',
          'Form-locking compression fit for enhanced recovery',
          'Reinforced flatlock anti-chafing seams',
        ]
      : newProductForm.category.toLowerCase().includes('lower') || newProductForm.category.toLowerCase().includes('pant')
      ? [
          'Heavyweight architectural street silhouette',
          'Deep utility pockets with reinforced pocket bags',
          'Pre-washed fabric with clean ankle drape',
        ]
      : [
          'Considered architectural boxy silhouette',
          'Reinforced collar and double-needle coverstitching',
          'Pre-washed fabric engineered for shape retention',
        ];

    const finalDetails = normalizedGsm
      ? [`Fabric Weight: ${normalizedGsm}`, ...baseDetails]
      : baseDetails;

    await addNewProduct({
      name: newProductForm.name,
      price: priceNum,
      currency: '₹',
      category: newProductForm.category,
      badge: stockNum === 0 ? 'SOLD OUT' : newProductForm.badge,
      tagline: newProductForm.tagline || 'Considered essential garment cut for an architectural fit.',
      description: newProductForm.description || 'Crafted with premium heavyweight organic cotton.',
      availableStock: stockNum,
      images: catalogImages,
      sizes: newProductForm.sizes,
      details: finalDetails,
      gsm: normalizedGsm || undefined,
      materialCare: newProductForm.category.toLowerCase().includes('compression')
        ? [
            'High-recovery Poly-Spandex performance blend',
            'Machine wash cold inside-out, air dry in shade',
          ]
        : [
            'Premium considered textile blend',
            'Machine wash cold inside-out, dry flat in shade',
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

    setManualUrlInput('');
    setCustomSizeInput('');
    setNewProductForm({
      name: '',
      price: '',
      currency: '₹',
      category: 'Gym Compression',
      badge: 'NEW',
      tagline: '',
      gsm: '',
      description: '',
      availableStock: '25',
      imageUrl: '',
      images: [],
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
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] h-12 sm:h-10 pl-3.5 pr-11 text-base sm:text-xs text-[#171717] focus:outline-none focus:border-[#171717] font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-0 top-0 h-full px-3 text-[#737373] hover:text-[#171717] flex items-center justify-center min-w-[44px]"
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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

  const renderShippingSettingsCard = () => (
    <div className="bg-white border border-[#e5e4df] p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e4df] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#171717] text-[#f5f4f0] flex items-center justify-center font-bold flex-shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#171717] uppercase tracking-wide">
              Cart Shipping & Delivery Cost
            </h3>
            <p className="text-[11px] sm:text-xs text-[#737373] mt-0.5">
              Directly controls shipping fees charged in the Catalog Cart Drawer, Cart page, and Checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {standardShippingFee === 0 ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Active: 100% Free Pan-India Delivery (₹0)
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#faf9f5] border border-[#e5e4df] text-[#171717]">
              Active: ₹{standardShippingFee} flat {freeShippingThreshold > 0 ? `• Free > ₹${freeShippingThreshold}` : '• Flat Fee Only'}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveShippingSettings} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1.5">
              Standard Delivery Fee (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373]">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={shippingFeeInput}
                onChange={(e) => {
                  isEditingShippingRef.current = true;
                  setShippingFeeInput(e.target.value);
                }}
                placeholder="0"
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 pl-8 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
            <p className="text-[10px] text-[#737373] mt-1">
              Charged when subtotal is under the free threshold. Set to 0 for storewide free shipping.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1.5">
              Free Shipping Order Threshold (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373]">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={freeThresholdInput}
                onChange={(e) => {
                  isEditingShippingRef.current = true;
                  setFreeThresholdInput(e.target.value);
                }}
                placeholder="0"
                className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 pl-8 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
            <p className="text-[10px] text-[#737373] mt-1">
              Orders equal to or above this subtotal get ₹0 shipping in cart drawer & checkout.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">Quick Apply Presets:</span>
          <button
            type="button"
            disabled={isSavingShipping}
            onClick={() => handleApplyPreset(0, 0, 'Free Delivery Everywhere')}
            className={`px-3 py-1.5 text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              standardShippingFee === 0
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            <Check size={12} /> Free Delivery Everywhere (₹0)
          </button>
          <button
            type="button"
            disabled={isSavingShipping}
            onClick={() => handleApplyPreset(70, 999, '₹70 Flat / Free > ₹999')}
            className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
              standardShippingFee === 70 && freeShippingThreshold === 999
                ? 'border-[#171717] bg-[#171717] text-white'
                : 'border-[#e5e4df] bg-[#faf9f5] hover:bg-neutral-100 text-[#171717]'
            }`}
          >
            ₹70 Flat / Free &gt; ₹999 (Default)
          </button>
          <button
            type="button"
            disabled={isSavingShipping}
            onClick={() => handleApplyPreset(50, 499, '₹50 Flat / Free > ₹499')}
            className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
              standardShippingFee === 50 && freeShippingThreshold === 499
                ? 'border-[#171717] bg-[#171717] text-white'
                : 'border-[#e5e4df] bg-[#faf9f5] hover:bg-neutral-100 text-[#171717]'
            }`}
          >
            ₹50 Flat / Free &gt; ₹499
          </button>
          <button
            type="button"
            disabled={isSavingShipping}
            onClick={() => handleApplyPreset(100, 1499, '₹100 Flat / Free > ₹1499')}
            className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer ${
              standardShippingFee === 100 && freeShippingThreshold === 1499
                ? 'border-[#171717] bg-[#171717] text-white'
                : 'border-[#e5e4df] bg-[#faf9f5] hover:bg-neutral-100 text-[#171717]'
            }`}
          >
            ₹100 Flat / Free &gt; ₹1499
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e5e4df]">
          <div className="text-[11px] text-[#737373] flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Updates live across the Cart Drawer, Cart page, and Checkout immediately.</span>
          </div>

          <div className="flex items-center gap-2">
            {(shippingFeeInput !== String(standardShippingFee) || freeThresholdInput !== String(freeShippingThreshold)) && (
              <button
                type="button"
                onClick={() => {
                  isEditingShippingRef.current = false;
                  setShippingFeeInput(String(standardShippingFee));
                  setFreeThresholdInput(String(freeShippingThreshold));
                }}
                className="px-3 py-2 text-xs font-bold text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="submit"
              disabled={isSavingShipping}
              className="bg-[#171717] hover:bg-[#333333] disabled:opacity-50 text-[#f5f4f0] text-xs font-bold uppercase tracking-wider py-2.5 px-5 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isSavingShipping ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={14} /> Save Shipping Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

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
          CATALOG / INVENTORY ({productsList.length})
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`pb-3 transition-colors flex items-center gap-1.5 ${
            activeTab === 'shipping' ? 'border-b-2 border-[#171717] text-[#171717]' : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          <Truck size={13} />
          SHIPPING & CART (₹{standardShippingFee})
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

          {isLoadingOrders && orders.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373] space-y-3">
              <Loader2 size={24} className="animate-spin text-[#171717] mx-auto" />
              <p className="font-bold uppercase tracking-widest text-[#171717]">Loading live orders from Supabase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
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

          {/* Cart Shipping & Delivery Configuration Card */}
          {renderShippingSettingsCard()}

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

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(prod)}
                        className="min-h-[36px] px-2.5 flex items-center justify-center gap-1 border border-[#171717] bg-white hover:bg-[#171717] hover:text-white text-[#171717] transition-colors text-[10px] font-bold uppercase tracking-wider"
                        title={`Edit ${prod.name}`}
                      >
                        <Pencil size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-red-200 text-red-700 hover:bg-red-700 hover:text-white transition-colors"
                        title={`Delete ${prod.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
                            onClick={() => handleStartEdit(prod)}
                            className="border border-[#171717] bg-white hover:bg-[#171717] hover:text-white text-[#171717] text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 flex items-center gap-1 transition-colors"
                            title={`Edit ${prod.name}`}
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
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
                  {CATEGORY_LIST.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                  FABRIC GSM (WEIGHT)
                </label>
                <span className="text-[10px] text-[#737373]">Optional • Leave blank if not applicable</span>
              </div>
              <input
                type="text"
                value={newProductForm.gsm}
                onChange={e => setNewProductForm({ ...newProductForm, gsm: e.target.value })}
                placeholder="e.g. 240 GSM, 280 GSM, 420 GSM (or leave blank)"
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

            {/* AVAILABLE SIZES SELECTOR */}
            <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                  AVAILABLE SIZES ({newProductForm.sizes.length} selected) *
                </label>
                <span className="text-[10px] font-medium text-[#737373]">
                  Tap preset or type custom size below
                </span>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {SIZE_PRESETS.map(sz => {
                  const isSelected = newProductForm.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setNewProductForm(prev => {
                          const current = prev.sizes || [];
                          const next = current.includes(sz)
                            ? current.filter(s => s !== sz)
                            : [...current, sz];
                          return { ...prev, sizes: next };
                        });
                      }}
                      className={`text-xs font-bold px-3 py-1.5 border transition-all ${
                        isSelected
                          ? 'bg-[#171717] text-[#f5f4f0] border-[#171717] shadow-xs'
                          : 'bg-white text-[#737373] border-[#d5d4ce] hover:border-[#171717] hover:text-[#171717]'
                      }`}
                    >
                      {sz} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={e => setCustomSizeInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = customSizeInput.trim().toUpperCase();
                      if (val && !newProductForm.sizes.includes(val)) {
                        setNewProductForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                        setCustomSizeInput('');
                      }
                    }
                  }}
                  placeholder="Custom size (e.g. 40, UK 9, FREE SIZE)"
                  className="flex-1 bg-white border border-[#e5e4df] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customSizeInput.trim().toUpperCase();
                    if (val && !newProductForm.sizes.includes(val)) {
                      setNewProductForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                      setCustomSizeInput('');
                    }
                  }}
                  className="bg-[#171717] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  + Add Size
                </button>
              </div>

              {/* Active Sizes Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="font-bold text-[#171717] uppercase tracking-wider text-[10px]">Selected:</span>
                {newProductForm.sizes.length === 0 ? (
                  <span className="text-red-600 font-bold">⚠️ Please select at least one size</span>
                ) : (
                  newProductForm.sizes.map(sz => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1 bg-[#171717] text-white px-2 py-0.5 text-xs font-bold"
                    >
                      {sz}
                      <button
                        type="button"
                        onClick={() => setNewProductForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== sz) }))}
                        className="hover:text-red-300 ml-1 text-xs font-bold"
                        title="Remove size"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* MULTI-PHOTO CATALOG GALLERY UPLOADER */}
            <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                  CATALOG PHOTOS ({newProductForm.images?.length || (newProductForm.imageUrl ? 1 : 0)}) *
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 tracking-wider">
                  ☁️ Multi-Photo Upload Supported
                </span>
              </div>

              {/* Hidden Native File Input supporting MULTIPLE photo selection */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhonePhotoUpload}
                className="hidden"
              />

              {/* Touch Button for Phone Gallery & Multi-Selection */}
              <div
                onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
                className={`border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isUploadingPhoto
                    ? 'border-[#171717] bg-white cursor-wait'
                    : 'border-[#d5d4ce] hover:border-[#171717] bg-white active:bg-neutral-100'
                }`}
              >
                {isUploadingPhoto ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={18} className="animate-spin text-[#171717]" />
                    <span className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                      Uploading Photos to Cloudinary CDN...
                    </span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={24} className="text-[#171717]" />
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#171717]">
                      📱 UPLOAD MULTIPLE PHOTOS (PHONE GALLERY / CAMERA)
                    </div>
                    <p className="text-[10px] text-[#737373]">
                      Tap to select multiple photos at once from your gallery or camera roll.
                    </p>
                  </>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2 border border-red-200">
                  ⚠️ {uploadError}
                </p>
              )}

              {/* MULTI-PHOTO GALLERY THUMBNAIL GRID */}
              {newProductForm.images && newProductForm.images.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#e5e4df]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#171717] block">
                    Attached Photos ({newProductForm.images.length}) - Tap to set primary photo
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {newProductForm.images.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        className={`relative group bg-white border p-1.5 flex flex-col items-center gap-1 transition-all ${
                          idx === 0 ? 'border-[#171717] shadow-sm bg-neutral-50' : 'border-[#e5e4df]'
                        }`}
                      >
                        <div className="w-full h-24 bg-neutral-200 overflow-hidden relative">
                          <img
                            src={imgUrl}
                            alt={`Catalog photo ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#171717] text-white text-[8px] font-extrabold px-1.5 py-0.5 tracking-wider uppercase">
                              PRIMARY
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between w-full pt-1 text-[10px]">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="text-[9px] font-bold text-neutral-600 hover:text-black uppercase tracking-tight"
                            >
                              Make Primary
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 uppercase">Cover Photo</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(idx)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Remove Photo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Manual URL section */}
              <div className="pt-2 border-t border-[#e5e4df]">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-[#737373] mb-1">
                  Add image by URL manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={manualUrlInput}
                    onChange={e => setManualUrlInput(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
                    className="flex-1 bg-white border border-[#e5e4df] p-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-3 py-2 bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black"
                  >
                    Add URL
                  </button>
                </div>
              </div>
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

      {/* TAB 5: SHIPPING & CART DELIVERY CHARGES */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          {renderShippingSettingsCard()}

          {/* Shipping Policy & Live Cart Integration Explainer Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white border border-[#e5e4df] p-4 space-y-2">
              <div className="font-heading font-extrabold text-[#171717] flex items-center gap-1.5 uppercase">
                <Truck size={14} className="text-[#cc785c]" /> Cart Drawer Integration
              </div>
              <p className="text-[#737373] leading-relaxed">
                The slide-out Cart Drawer displays a live progress bar toward the free delivery threshold. If the cart subtotal is less than the threshold, ₹{standardShippingFee} is added to the subtotal.
              </p>
            </div>

            <div className="bg-white border border-[#e5e4df] p-4 space-y-2">
              <div className="font-heading font-extrabold text-[#171717] flex items-center gap-1.5 uppercase">
                <ShieldCheck size={14} className="text-emerald-700" /> Cashfree Order Security
              </div>
              <p className="text-[#737373] leading-relaxed">
                When a customer clicks &quot;Pay Now&quot;, the backend server calculates the exact grand total using these authoritative shipping settings so tampering in the browser is impossible.
              </p>
            </div>

            <div className="bg-white border border-[#e5e4df] p-4 space-y-2">
              <div className="font-heading font-extrabold text-[#171717] flex items-center gap-1.5 uppercase">
                <CheckCircle2 size={14} className="text-blue-700" /> Instant Zero-Build Sync
              </div>
              <p className="text-[#737373] leading-relaxed">
                Settings persist immediately and are broadcast live to all active shopper carts and checkout sessions with instant rollback and quick presets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT DETAILS (FULL EDITING SUITE) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-[#e5e4df] pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-[#171717] uppercase tracking-wider">
                  EDIT PRODUCT
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  ID: <span className="font-mono text-neutral-800">{editingProduct.id}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-9 h-9 flex items-center justify-center border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProductForm.name}
                    onChange={e => setEditProductForm({ ...editProductForm, name: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
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
                    value={editProductForm.price}
                    onChange={e => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={editProductForm.category}
                    onChange={e => setEditProductForm({ ...editProductForm, category: e.target.value as any })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {CATEGORY_LIST.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    STATUS BADGE *
                  </label>
                  <select
                    value={editProductForm.badge}
                    onChange={e => setEditProductForm({ ...editProductForm, badge: e.target.value as any })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="SOLD OUT">SOLD OUT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    STOCK COUNT *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProductForm.availableStock}
                    onChange={e => setEditProductForm({ ...editProductForm, availableStock: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  SHORT TAGLINE
                </label>
                <input
                  type="text"
                  value={editProductForm.tagline}
                  onChange={e => setEditProductForm({ ...editProductForm, tagline: e.target.value })}
                  placeholder="Tagline displayed on cards"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                    FABRIC GSM (WEIGHT)
                  </label>
                  <span className="text-[10px] text-[#737373]">Optional • Leave blank to remove GSM</span>
                </div>
                <input
                  type="text"
                  value={editProductForm.gsm}
                  onChange={e => setEditProductForm({ ...editProductForm, gsm: e.target.value })}
                  placeholder="e.g. 240 GSM, 280 GSM, 420 GSM (or leave blank)"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  FULL DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={editProductForm.description}
                  onChange={e => setEditProductForm({ ...editProductForm, description: e.target.value })}
                  placeholder="Detailed specifications"
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              {/* SIZES MANAGEMENT IN EDIT */}
              <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                    AVAILABLE SIZES ({editProductForm.sizes.length} selected) *
                  </label>
                  <span className="text-[10px] text-[#737373]">Tap to toggle or add custom</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map(sz => {
                    const isSelected = editProductForm.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setEditProductForm(prev => {
                            const current = prev.sizes || [];
                            const next = current.includes(sz)
                              ? current.filter(s => s !== sz)
                              : [...current, sz];
                            return { ...prev, sizes: next };
                          });
                        }}
                        className={`text-xs font-bold px-3 py-1.5 border transition-all ${
                          isSelected
                            ? 'bg-[#171717] text-[#f5f4f0] border-[#171717] shadow-xs'
                            : 'bg-white text-[#737373] border-[#d5d4ce] hover:border-[#171717] hover:text-[#171717]'
                        }`}
                      >
                        {sz} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={editCustomSizeInput}
                    onChange={e => setEditCustomSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = editCustomSizeInput.trim().toUpperCase();
                        if (val && !editProductForm.sizes.includes(val)) {
                          setEditProductForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                          setEditCustomSizeInput('');
                        }
                      }
                    }}
                    placeholder="Custom size (e.g. 38, UK 10)"
                    className="flex-1 bg-white border border-[#e5e4df] px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = editCustomSizeInput.trim().toUpperCase();
                      if (val && !editProductForm.sizes.includes(val)) {
                        setEditProductForm(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
                        setEditCustomSizeInput('');
                      }
                    }}
                    className="bg-[#171717] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    + Add Size
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="font-bold text-[#171717] uppercase tracking-wider text-[10px]">Active Sizes:</span>
                  {editProductForm.sizes.length === 0 ? (
                    <span className="text-red-600 font-bold">⚠️ Please select at least one size</span>
                  ) : (
                    editProductForm.sizes.map(sz => (
                      <span
                        key={sz}
                        className="inline-flex items-center gap-1 bg-[#171717] text-white px-2 py-0.5 text-xs font-bold"
                      >
                        {sz}
                        <button
                          type="button"
                          onClick={() => setEditProductForm(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== sz) }))}
                          className="hover:text-red-300 ml-1 text-xs font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* PHOTOS IN EDIT */}
              <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                    PRODUCT PHOTOS ({editProductForm.images?.length || 0})
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 font-bold">
                    ☁️ Add / Reorder / Delete
                  </span>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditPhonePhotoUpload}
                  className="hidden"
                />

                <div
                  onClick={() => !isUploadingEditPhoto && editFileInputRef.current?.click()}
                  className={`border-2 border-dashed p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                    isUploadingEditPhoto
                      ? 'border-[#171717] bg-white cursor-wait'
                      : 'border-[#d5d4ce] hover:border-[#171717] bg-white active:bg-neutral-100'
                  }`}
                >
                  {isUploadingEditPhoto ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={16} className="animate-spin text-[#171717]" />
                      <span className="text-xs font-bold text-[#171717] uppercase">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-[#171717]" />
                      <span className="text-xs font-extrabold uppercase text-[#171717]">
                        Upload Additional Photos From Phone/Device
                      </span>
                    </>
                  )}
                </div>

                {editUploadError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 border border-red-200">
                    ⚠️ {editUploadError}
                  </p>
                )}

                {/* Manual URL input in Edit */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editManualUrlInput}
                    onChange={e => setEditManualUrlInput(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="flex-1 bg-white border border-[#e5e4df] p-2 text-xs text-[#171717] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editManualUrlInput.trim()) {
                        const url = editManualUrlInput.trim();
                        setEditProductForm(prev => ({
                          ...prev,
                          images: Array.from(new Set([...(prev.images || []), url])),
                        }));
                        setEditManualUrlInput('');
                      }
                    }}
                    className="bg-[#171717] text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-black"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Thumbnails Grid in Edit */}
                {editProductForm.images && editProductForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e5e4df]">
                    {editProductForm.images.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        className={`relative bg-white border p-1 flex flex-col items-center gap-1 ${
                          idx === 0 ? 'border-[#171717] bg-neutral-50 shadow-xs' : 'border-[#e5e4df]'
                        }`}
                      >
                        <div className="w-full h-20 bg-neutral-100 overflow-hidden relative">
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-contain" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#171717] text-white text-[8px] font-extrabold px-1.5 py-0.2 uppercase">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full pt-0.5 text-[9px]">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...editProductForm.images];
                                const target = list.splice(idx, 1)[0];
                                list.unshift(target);
                                setEditProductForm(prev => ({ ...prev, images: list }));
                              }}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              Make 1st
                            </button>
                          ) : (
                            <span className="text-[#737373] font-semibold">1st photo</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditProductForm(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== idx),
                              }));
                            }}
                            className="text-red-600 font-bold hover:underline ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e4df]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> SAVE PRODUCT CHANGES
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
