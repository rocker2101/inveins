'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  UploadCloud,
  Loader2,
  MessageSquare,
  Package,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { WholesaleProduct } from '@/types/wholesale';
import { WholesaleEnquiry } from '@/context/CartContext';

interface WholesaleManagerProps {
  wholesaleEnquiries: WholesaleEnquiry[];
  onDeleteEnquiry: (enquiry: WholesaleEnquiry) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const WHOLESALE_CATEGORIES = [
  'Tees & Blanks',
  'Hoodies & Outerwear',
  'Printing & Customization',
  'Embroidery & Badges',
  'Gym Compression',
  'Custom Uniforms & Merch',
];

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const CUSTOMIZATION_PRESETS = [
  'DTF Printing',
  'High-Density Screen Print',
  'Computerized Embroidery',
  'Puff 3D Print',
  'Custom Woven Neck Labels',
  'Blank Supplies',
];

const BADGE_PRESETS = ['BULK READY', 'FACTORY DIRECT', 'CUSTOM ORDER', 'BESTSELLER', 'NEW'];

export default function WholesaleManager({
  wholesaleEnquiries,
  onDeleteEnquiry,
  showToast,
}: WholesaleManagerProps) {
  const [wholesaleProducts, setWholesaleProducts] = useState<WholesaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<'products' | 'enquiries'>('products');

  // Add Product Form State (Strictly NO PRICE FIELD)
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    category: 'Tees & Blanks',
    moq: '50 Pieces',
    gsm: '240 GSM',
    tagline: '',
    description: '',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    customizationOptions: ['DTF Printing', 'Embroidery', 'Blank Supplies'],
    images: [] as string[],
    badge: 'BULK READY',
  });
  const [newManualUrl, setNewManualUrl] = useState('');
  const [newCustomSize, setNewCustomSize] = useState('');
  const [newCustomOption, setNewCustomOption] = useState('');
  const [isUploadingNewPhoto, setIsUploadingNewPhoto] = useState(false);
  const [newUploadError, setNewUploadError] = useState<string | null>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Product Modal State (Strictly NO PRICE FIELD)
  const [editingProduct, setEditingProduct] = useState<WholesaleProduct | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Tees & Blanks',
    moq: '50 Pieces',
    gsm: '',
    tagline: '',
    description: '',
    availableSizes: [] as string[],
    customizationOptions: [] as string[],
    images: [] as string[],
    badge: 'BULK READY',
  });
  const [editManualUrl, setEditManualUrl] = useState('');
  const [editCustomSize, setEditCustomSize] = useState('');
  const [editCustomOption, setEditCustomOption] = useState('');
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<WholesaleProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Wholesale Products from API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wholesale/products?all=true&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setWholesaleProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load wholesale products:', err);
      showToast('Could not fetch wholesale products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Upload handler to Cloudinary via /api/admin/upload
  const handlePhotoUpload = async (
    files: FileList | null,
    isEdit: boolean = false
  ) => {
    if (!files || files.length === 0) return;
    const filesArray = Array.from(files);

    if (isEdit) {
      setIsUploadingEditPhoto(true);
      setEditUploadError(null);
    } else {
      setIsUploadingNewPhoto(true);
      setNewUploadError(null);
    }

    try {
      const formData = new FormData();
      for (const file of filesArray) {
        formData.append('files', file);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || (!data.success && !data.urls && !data.url)) {
        throw new Error(data.message || 'Image upload failed');
      }

      const returnedUrls: string[] = data.urls || (data.url ? [data.url] : []);

      if (isEdit) {
        setEditForm(prev => ({
          ...prev,
          images: Array.from(new Set([...prev.images, ...returnedUrls])),
        }));
      } else {
        setNewForm(prev => ({
          ...prev,
          images: Array.from(new Set([...prev.images, ...returnedUrls])),
        }));
      }

      showToast(`✓ ${returnedUrls.length} image(s) uploaded via Cloudinary!`, 'success');
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      if (isEdit) setEditUploadError(err?.message || 'Upload failed');
      else setNewUploadError(err?.message || 'Upload failed');
      showToast(err?.message || 'Failed to upload photo', 'error');
    } finally {
      if (isEdit) {
        setIsUploadingEditPhoto(false);
        if (editFileInputRef.current) editFileInputRef.current.value = '';
      } else {
        setIsUploadingNewPhoto(false);
        if (newFileInputRef.current) newFileInputRef.current.value = '';
      }
    }
  };

  // Add Product Submit (NO PRICE FIELD)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) {
      showToast('Product title is required', 'error');
      return;
    }

    setIsSavingNew(true);
    try {
      const res = await fetch('/api/wholesale/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newForm.name.trim(),
          category: newForm.category,
          moq: newForm.moq.trim() || '50 Pieces',
          gsm: newForm.gsm.trim() || undefined,
          tagline: newForm.tagline.trim(),
          description: newForm.description.trim(),
          availableSizes: newForm.availableSizes,
          customizationOptions: newForm.customizationOptions,
          images: newForm.images.length > 0 ? newForm.images : ['https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg'],
          badge: newForm.badge,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create wholesale product');
      }

      showToast(`✓ "${newForm.name}" created in Wholesale Catalog!`, 'success');
      setIsAdding(false);
      setNewForm({
        name: '',
        category: 'Tees & Blanks',
        moq: '50 Pieces',
        gsm: '240 GSM',
        tagline: '',
        description: '',
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        customizationOptions: ['DTF Printing', 'Embroidery', 'Blank Supplies'],
        images: [],
        badge: 'BULK READY',
      });
      loadProducts();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create product', 'error');
    } finally {
      setIsSavingNew(false);
    }
  };

  // Open Edit Modal
  const handleStartEdit = (prod: WholesaleProduct) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      category: prod.category || 'Tees & Blanks',
      moq: prod.moq || '50 Pieces',
      gsm: prod.gsm || '',
      tagline: prod.tagline || '',
      description: prod.description || '',
      availableSizes: Array.isArray(prod.availableSizes) ? [...prod.availableSizes] : ['S', 'M', 'L', 'XL'],
      customizationOptions: Array.isArray(prod.customizationOptions) ? [...prod.customizationOptions] : ['DTF Printing', 'Embroidery'],
      images: Array.isArray(prod.images) ? [...prod.images] : [],
      badge: prod.badge || 'BULK READY',
    });
    setEditManualUrl('');
    setEditCustomSize('');
    setEditCustomOption('');
    setEditUploadError(null);
  };

  // Save Edit Submit (NO PRICE FIELD)
  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/wholesale/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          category: editForm.category,
          moq: editForm.moq.trim() || '50 Pieces',
          gsm: editForm.gsm.trim() || null,
          tagline: editForm.tagline.trim(),
          description: editForm.description.trim(),
          availableSizes: editForm.availableSizes,
          customizationOptions: editForm.customizationOptions,
          images: editForm.images.length > 0 ? editForm.images : editingProduct.images,
          badge: editForm.badge,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update wholesale product');
      }

      showToast(`✓ "${editForm.name}" updated successfully!`, 'success');
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update product', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wholesale/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product');
      }

      showToast(`✓ "${productToDelete.name}" removed from Wholesale Catalog`, 'success');
      setProductToDelete(null);
      setWholesaleProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    } catch (err: any) {
      showToast(err?.message || 'Delete failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e5e4df] p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('products')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'products'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-[#faf9f5] text-[#737373] hover:text-[#171717] border border-[#e5e4df]'
            }`}
          >
            <Package size={14} />
            WHOLESALE PRODUCTS ({wholesaleProducts.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('enquiries')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'enquiries'
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-[#faf9f5] text-[#737373] hover:text-[#171717] border border-[#e5e4df]'
            }`}
          >
            <MessageSquare size={14} />
            ESTIMATES & ENQUIRIES ({wholesaleEnquiries.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'products' && (
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="bg-[#cc785c] hover:bg-[#b8674c] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              {isAdding ? 'Close Form' : '+ Add Wholesale Item (No Price)'}
            </button>
          )}

          <a
            href="/wholesale"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#e5e4df] hover:border-[#171717] text-[#171717] text-xs font-bold uppercase tracking-wider px-3 py-2 flex items-center gap-1 transition-colors"
          >
            <span>Live Page</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* SUB-TAB 1: PRODUCTS / B2B CATALOG */}
      {subTab === 'products' && (
        <div className="space-y-6">

          {/* INLINE ADD PRODUCT FORM (NO PRICING FIELD) */}
          {isAdding && (
            <div className="bg-white border-2 border-[#171717] p-6 shadow-md space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#e5e4df] pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#171717] text-white text-[10px] font-extrabold uppercase px-2 py-0.5">
                    B2B CLOTH SPECIFICATION
                  </span>
                  <h3 className="font-heading font-extrabold text-base text-[#171717] uppercase tracking-wide">
                    Add New Wholesale Product (Estimate Only • No Fixed Price)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-[#737373] hover:text-[#171717] p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-[#faf9f5] border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                <span>
                  <strong>Wholesale Rule:</strong> Pricing field is intentionally disabled. Customers see &quot;Custom Estimate On Request&quot; and submit direct quotation inquiries.
                </span>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      PRODUCT / SERVICE NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={newForm.name}
                      onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                      placeholder="e.g. 240 GSM Oversized Combed Cotton Blank Tee"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      CATEGORY *
                    </label>
                    <select
                      value={newForm.category}
                      onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      {WHOLESALE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      MINIMUM ORDER QTY (MOQ) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newForm.moq}
                      onChange={e => setNewForm({ ...newForm, moq: e.target.value })}
                      placeholder="e.g. 50 Pieces"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      FABRIC GSM & WEIGHT
                    </label>
                    <input
                      type="text"
                      value={newForm.gsm}
                      onChange={e => setNewForm({ ...newForm, gsm: e.target.value })}
                      placeholder="e.g. 240 GSM or 380 GSM Terry"
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                      BADGE / TAG
                    </label>
                    <select
                      value={newForm.badge}
                      onChange={e => setNewForm({ ...newForm, badge: e.target.value })}
                      className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                    >
                      {BADGE_PRESETS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    SHORT TAGLINE
                  </label>
                  <input
                    type="text"
                    value={newForm.tagline}
                    onChange={e => setNewForm({ ...newForm, tagline: e.target.value })}
                    placeholder="e.g. Pre-washed 100% combed cotton, drop shoulder cut for independent brands."
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    FULL MANUFACTURING SPECIFICATIONS
                  </label>
                  <textarea
                    rows={3}
                    value={newForm.description}
                    onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Detail stitching techniques, fabric composition, ink wash fastness, turn-around times..."
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                {/* SIZES MANAGEMENT */}
                <div className="space-y-2 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                      AVAILABLE SIZES ({newForm.availableSizes.length}) *
                    </label>
                    <span className="text-[10px] text-[#737373]">Click to toggle</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {SIZE_PRESETS.map(sz => {
                      const isSel = newForm.availableSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setNewForm(prev => ({
                              ...prev,
                              availableSizes: isSel
                                ? prev.availableSizes.filter(s => s !== sz)
                                : [...prev.availableSizes, sz],
                            }));
                          }}
                          className={`px-2.5 py-1 text-xs font-mono font-bold border transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-white text-[#737373] border-[#e5e4df] hover:border-[#171717]'
                          }`}
                        >
                          {sz} {isSel && '✓'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newCustomSize}
                      onChange={e => setNewCustomSize(e.target.value)}
                      placeholder="Add custom size (e.g. Chest 4x4)"
                      className="bg-white border border-[#e5e4df] p-1.5 text-xs text-[#171717] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCustomSize.trim() && !newForm.availableSizes.includes(newCustomSize.trim())) {
                          setNewForm(prev => ({
                            ...prev,
                            availableSizes: [...prev.availableSizes, newCustomSize.trim()],
                          }));
                          setNewCustomSize('');
                        }
                      }}
                      className="bg-[#171717] text-white text-[10px] font-bold uppercase px-3 py-1 hover:bg-black"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* CUSTOMIZATION OPTIONS */}
                <div className="space-y-2 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                      CUSTOMIZATION / PRINTING SERVICES OFFERED
                    </label>
                    <span className="text-[10px] text-[#737373]">Select supported services</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {CUSTOMIZATION_PRESETS.map(opt => {
                      const isSel = newForm.customizationOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setNewForm(prev => ({
                              ...prev,
                              customizationOptions: isSel
                                ? prev.customizationOptions.filter(o => o !== opt)
                                : [...prev.customizationOptions, opt],
                            }));
                          }}
                          className={`px-2.5 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-white text-[#737373] border-[#e5e4df] hover:border-[#171717]'
                          }`}
                        >
                          {opt} {isSel && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PHOTOS UPLOAD (Cloudinary + URL) */}
                <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                      PRODUCT PHOTOS ({newForm.images.length})
                    </label>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 font-bold">
                      ☁️ Direct Cloudinary Upload
                    </span>
                  </div>

                  <input
                    ref={newFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => handlePhotoUpload(e.target.files, false)}
                    className="hidden"
                  />

                  <div
                    onClick={() => !isUploadingNewPhoto && newFileInputRef.current?.click()}
                    className={`border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isUploadingNewPhoto
                        ? 'border-[#171717] bg-white cursor-wait'
                        : 'border-[#d5d4ce] hover:border-[#171717] bg-white active:bg-neutral-100'
                    }`}
                  >
                    {isUploadingNewPhoto ? (
                      <div className="flex items-center gap-2 py-1">
                        <Loader2 size={16} className="animate-spin text-[#171717]" />
                        <span className="text-xs font-bold uppercase text-[#171717]">Uploading to Cloudinary CDN...</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-[#171717]" />
                        <span className="text-xs font-extrabold uppercase text-[#171717]">
                          Upload Wholesale Photos From Phone / Device
                        </span>
                        <span className="text-[10px] text-[#737373]">Supports JPG, PNG, WEBP</span>
                      </>
                    )}
                  </div>

                  {newUploadError && (
                    <p className="text-xs text-red-600 font-bold bg-red-50 p-2 border border-red-200">
                      ⚠️ {newUploadError}
                    </p>
                  )}

                  {/* Manual URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newManualUrl}
                      onChange={e => setNewManualUrl(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="flex-1 bg-white border border-[#e5e4df] p-2 text-xs text-[#171717] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newManualUrl.trim()) {
                          setNewForm(prev => ({
                            ...prev,
                            images: Array.from(new Set([...prev.images, newManualUrl.trim()])),
                          }));
                          setNewManualUrl('');
                        }
                      }}
                      className="bg-[#171717] text-white px-3 py-1.5 text-xs font-bold uppercase hover:bg-black"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Thumbnails Grid */}
                  {newForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e5e4df]">
                      {newForm.images.map((imgUrl, idx) => (
                        <div
                          key={imgUrl + idx}
                          className={`relative bg-white border p-1 flex flex-col items-center gap-1 ${
                            idx === 0 ? 'border-[#171717] shadow-xs' : 'border-[#e5e4df]'
                          }`}
                        >
                          <div className="w-full h-20 bg-neutral-100 overflow-hidden relative">
                            <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain" />
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
                                  const list = [...newForm.images];
                                  const target = list.splice(idx, 1)[0];
                                  list.unshift(target);
                                  setNewForm(prev => ({ ...prev, images: list }));
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
                                setNewForm(prev => ({
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

                {/* Form Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e4df]">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingNew}
                    className="bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-6 flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isSavingNew ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving Item...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> PUBLISH WHOLESALE ITEM
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LIST OF WHOLESALE PRODUCTS */}
          {isLoading ? (
            <div className="py-16 text-center bg-white border border-[#e5e4df] text-xs text-[#737373] flex flex-col items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#171717]" />
              <span>Loading Wholesale Catalog...</span>
            </div>
          ) : wholesaleProducts.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373] space-y-3">
              <p>No wholesale products in catalog yet.</p>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="bg-[#171717] text-white text-xs font-bold uppercase tracking-wider py-2 px-4 hover:bg-black"
              >
                + Add First Wholesale Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wholesaleProducts.map(prod => {
                const mainImg = prod.images?.[0] || 'https://5.imimg.com/data5/SELLER/Default/2026/4/599804502/KY/OU/QE/180956315/cotton-t-shirts-500x500.jpeg';

                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#e5e4df] p-4 flex flex-col justify-between space-y-3 hover:border-[#171717] transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="relative w-20 h-20 bg-[#faf9f5] border border-[#e5e4df] shrink-0 overflow-hidden">
                          <img src={mainImg} alt={prod.name} className="w-full h-full object-cover" />
                          {prod.badge && (
                            <span className="absolute top-1 left-1 bg-[#171717] text-white text-[7px] font-extrabold uppercase px-1 py-0.2">
                              {prod.badge}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-[#cc785c] uppercase">
                            {prod.category}
                          </div>
                          <h4 className="font-heading font-extrabold text-sm text-[#171717] line-clamp-2 leading-snug">
                            {prod.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                            {prod.moq && (
                              <span className="bg-[#171717] text-white font-bold px-1.5 py-0.2">
                                MOQ: {prod.moq}
                              </span>
                            )}
                            {prod.gsm && (
                              <span className="font-mono text-[#737373] bg-[#faf9f5] border border-[#e5e4df] px-1 py-0.2">
                                {prod.gsm}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {prod.tagline && (
                        <p className="text-[11px] text-[#737373] line-clamp-2 leading-relaxed">
                          {prod.tagline}
                        </p>
                      )}

                      {/* Explicit No Price Badge */}
                      <div className="bg-[#faf9f5] border border-[#e5e4df] p-2 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#737373] uppercase tracking-wider">Pricing:</span>
                        <span className="font-heading font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase">
                          Custom Estimate On Request
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[#e5e4df] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#737373] truncate max-w-[120px]">
                        {prod.id}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(prod)}
                          className="px-2.5 py-1.5 border border-[#e5e4df] hover:border-[#171717] text-xs font-bold text-[#171717] hover:bg-[#faf9f5] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(prod)}
                          className="px-2 py-1.5 border border-red-200 text-red-700 hover:bg-red-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                          title="Delete wholesale product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: WHOLESALE ENQUIRIES / ESTIMATES */}
      {subTab === 'enquiries' && (
        <div className="space-y-4">
          {wholesaleEnquiries.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#e5e4df] text-xs text-[#737373]">
              No B2B wholesale enquiries submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wholesaleEnquiries.map(enq => {
                const waText = `Hi ${enq.name}, thank you for your wholesale enquiry with INVEINS regarding "${enq.productInterest}" (Quantity: ${enq.quantity}). Here is your requested estimate:`;
                const waUrl = `https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waText)}`;

                return (
                  <div key={enq.id} className="bg-white border border-[#e5e4df] p-4 space-y-3 shadow-xs flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2 border-b border-[#e5e4df] pb-2">
                        <div>
                          <div className="font-heading font-extrabold text-sm text-[#171717]">
                            {enq.company || enq.name}
                          </div>
                          <div className="text-[10px] text-[#737373] mt-0.5">
                            {enq.createdAt} • ID: <span className="font-mono">{enq.id}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteEnquiry(enq)}
                          className="p-1.5 border border-red-200 text-red-700 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                          title="Delete enquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-[#737373]">Contact Person: </span>
                          <span className="font-bold text-[#171717]">{enq.name}</span>
                          {enq.cityCountry && <span className="text-[#737373]"> ({enq.cityCountry})</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                          <a
                            href={`tel:${enq.phone}`}
                            className="text-[#cc785c] font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone size={12} /> {enq.phone}
                          </a>
                          <a
                            href={`mailto:${enq.email}`}
                            className="text-[#171717] font-semibold hover:underline flex items-center gap-1"
                          >
                            <Mail size={12} /> {enq.email}
                          </a>
                        </div>
                      </div>

                      {/* Product Interest Box */}
                      <div className="bg-[#faf9f5] p-3 border border-[#e5e4df] space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#171717]">{enq.productInterest}</span>
                          <span className="bg-[#171717] text-white text-[10px] font-bold px-2 py-0.5">
                            Target: {enq.quantity}
                          </span>
                        </div>
                        {enq.message && (
                          <p className="text-[11px] text-[#737373] italic pt-1.5 border-t border-[#e5e4df]">
                            &quot;{enq.message}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Follow-Up Actions */}
                    <div className="pt-2 border-t border-[#e5e4df] flex items-center justify-between gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider py-2 px-3 text-center transition-colors"
                      >
                        💬 WhatsApp Estimate
                      </a>

                      <a
                        href={`tel:${enq.phone}`}
                        className="bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider py-2 px-3 transition-colors"
                      >
                        📞 Call
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT WHOLESALE PRODUCT (NO PRICE FIELD) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-[#e5e4df] pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#171717] uppercase tracking-wide">
                  Edit Wholesale Product Specifications
                </h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  ID: <span className="font-mono">{editingProduct.id}</span> • (No Price Mode)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 flex items-center justify-center border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs font-bold text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    CATEGORY *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs font-bold text-[#171717] focus:outline-none"
                  >
                    {WHOLESALE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    MOQ *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.moq}
                    onChange={e => setEditForm({ ...editForm, moq: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    FABRIC GSM
                  </label>
                  <input
                    type="text"
                    value={editForm.gsm}
                    onChange={e => setEditForm({ ...editForm, gsm: e.target.value })}
                    placeholder="e.g. 240 GSM"
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs font-bold text-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    BADGE
                  </label>
                  <select
                    value={editForm.badge}
                    onChange={e => setEditForm({ ...editForm, badge: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs font-bold text-[#171717] focus:outline-none"
                  >
                    {BADGE_PRESETS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  SHORT TAGLINE
                </label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  FULL SPECIFICATIONS
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none"
                />
              </div>

              {/* Photos upload in Edit */}
              <div className="space-y-3 p-4 bg-[#faf9f5] border border-[#e5e4df]">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717]">
                    PRODUCT PHOTOS ({editForm.images.length})
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 font-bold">
                    ☁️ Cloudinary Upload
                  </span>
                </div>

                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handlePhotoUpload(e.target.files, true)}
                  className="hidden"
                />

                <div
                  onClick={() => !isUploadingEditPhoto && editFileInputRef.current?.click()}
                  className={`border-2 border-dashed p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                    isUploadingEditPhoto
                      ? 'border-[#171717] bg-white cursor-wait'
                      : 'border-[#d5d4ce] hover:border-[#171717] bg-white'
                  }`}
                >
                  {isUploadingEditPhoto ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={16} className="animate-spin text-[#171717]" />
                      <span className="text-xs font-bold uppercase text-[#171717]">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-[#171717]" />
                      <span className="text-xs font-extrabold uppercase text-[#171717]">
                        Upload Additional Photos From Device
                      </span>
                    </>
                  )}
                </div>

                {editUploadError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2 border border-red-200">
                    ⚠️ {editUploadError}
                  </p>
                )}

                {/* Thumbnails in edit */}
                {editForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e5e4df]">
                    {editForm.images.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        className={`relative bg-white border p-1 flex flex-col items-center gap-1 ${
                          idx === 0 ? 'border-[#171717] shadow-xs' : 'border-[#e5e4df]'
                        }`}
                      >
                        <div className="w-full h-16 bg-neutral-100 overflow-hidden relative">
                          <img src={imgUrl} alt="Thumb" className="w-full h-full object-contain" />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-[#171717] text-white text-[8px] font-extrabold px-1.5 py-0.2 uppercase">
                              1ST
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full pt-0.5 text-[9px]">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...editForm.images];
                                const target = list.splice(idx, 1)[0];
                                list.unshift(target);
                                setEditForm(prev => ({ ...prev, images: list }));
                              }}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              Make 1st
                            </button>
                          ) : (
                            <span className="text-[#737373]">Primary</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm(prev => ({
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e4df]">
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

      {/* MODAL: DELETE CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e5e4df] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#171717]">
                  Delete Wholesale Product?
                </h3>
                <p className="text-[11px] text-[#737373]">
                  &quot;{productToDelete.name}&quot; will be permanently deleted from the B2B catalog.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="border border-[#e5e4df] hover:bg-[#f5f4f0] text-[#171717] text-xs font-bold uppercase tracking-wider py-2 px-4 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-5 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
