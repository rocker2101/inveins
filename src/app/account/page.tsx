'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, Package, MapPin, Heart, ShieldCheck, 
  ExternalLink, Phone, Mail, Clock, CheckCircle2, 
  Truck, ArrowRight, Save 
} from 'lucide-react';
import { useCart, SavedAddress } from '@/context/CartContext';

export default function AccountPage() {
  const { orders, savedAddress, saveAddress, wishlistCount } = useCart();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<SavedAddress>({
    name: savedAddress?.name || '',
    email: savedAddress?.email || '',
    phone: savedAddress?.phone || '',
    address: savedAddress?.address || '',
    city: savedAddress?.city || '',
    state: savedAddress?.state || 'Uttar Pradesh',
    pincode: savedAddress?.pincode || '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddress(addressForm);
    setIsEditingAddress(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="border-b border-[#e6e2d8] pb-6">
        <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
          CUSTOMER PORTAL
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight mt-1">
          MY ACCOUNT & ORDERS
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Order History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#141413] flex items-center gap-2">
              <Package size={18} className="text-[#cc785c]" />
              ORDER HISTORY ({orders.length})
            </h2>
            <span className="text-xs text-[#6c6a64]">Live tracking from Kanpur Studio</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white border border-[#e6e2d8] p-8 text-center space-y-3">
              <p className="text-sm font-bold text-[#141413]">No orders placed yet.</p>
              <p className="text-xs text-[#6c6a64]">When you complete an order, you can track dispatch, delivery status, and tracking numbers right here.</p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block py-2.5 px-6 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest"
                >
                  Shop the Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-[#e6e2d8] p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6e2d8] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm text-[#141413] font-mono">
                          {order.id}
                        </span>
                        <span className="text-[10px] font-bold text-[#6c6a64]">
                          • {order.createdAt}
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <span className="text-[11px] text-[#6c6a64] font-mono">
                          Tracking: {order.trackingNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 tracking-wider ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {order.status}
                      </span>
                      <a
                        href={`https://wa.me/917985232434?text=Hi%20INVEINS%2C%20checking%20status%20for%20Order%20${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#cc785c] hover:underline flex items-center gap-1"
                      >
                        Track <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-2 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[#141413]">
                        <span>
                          {item.product.name} ({item.selectedSize}) <strong className="text-[#6c6a64]">x{item.quantity}</strong>
                        </span>
                        <span className="font-bold">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[#e6e2d8] text-xs">
                    <span className="text-[#6c6a64]">Payment: <strong className="uppercase text-[#141413]">{order.paymentMethod}</strong></span>
                    <span className="font-heading font-extrabold text-sm text-[#141413]">
                      Total: ₹{order.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Customer Info & Address Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Saved Address Card */}
          <div className="bg-white border border-[#e6e2d8] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#141413] flex items-center gap-2">
                <MapPin size={16} className="text-[#cc785c]" />
                SAVED ADDRESS
              </h3>
              <button
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-bold text-[#cc785c] hover:underline"
              >
                {isEditingAddress ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {savedSuccess && (
              <p className="text-xs font-bold text-[#15803D] flex items-center gap-1">
                <CheckCircle2 size={13} /> Address saved successfully!
              </p>
            )}

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#6c6a64]">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#6c6a64]">Phone</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#6c6a64]">Email</label>
                  <input
                    type="email"
                    value={addressForm.email}
                    onChange={e => setAddressForm({ ...addressForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#6c6a64]">Street Address</label>
                  <input
                    type="text"
                    value={addressForm.address}
                    onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#6c6a64]">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#6c6a64]">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] mt-1 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#141413] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Save size={13} /> Save Address
                </button>
              </form>
            ) : savedAddress?.name ? (
              <div className="space-y-1.5 text-xs text-[#141413]">
                <p className="font-extrabold">{savedAddress.name}</p>
                <p className="text-[#6c6a64]">{savedAddress.address}</p>
                <p className="text-[#6c6a64]">{savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}</p>
                <p className="text-[#6c6a64] pt-1">Phone: {savedAddress.phone}</p>
                <p className="text-[#6c6a64]">Email: {savedAddress.email}</p>
              </div>
            ) : (
              <div className="text-xs text-[#6c6a64] space-y-2">
                <p>No address saved yet. Save an address for rapid 1-click checkout.</p>
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs font-bold text-[#141413] underline"
                >
                  + Add Address Now
                </button>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-[#e6e2d8] p-5 space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#141413]">
              QUICK SHORTCUTS
            </h4>
            <div className="space-y-2 text-xs">
              <Link
                href="/wishlist"
                className="flex items-center justify-between p-2.5 bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#141413] text-[#141413] font-bold"
              >
                <span className="flex items-center gap-2">
                  <Heart size={15} className="text-[#cc785c]" /> My Wishlist
                </span>
                <span>{wishlistCount} items</span>
              </Link>
              <Link
                href="/wholesale"
                className="flex items-center justify-between p-2.5 bg-[#faf9f5] border border-[#e6e2d8] hover:border-[#141413] text-[#141413] font-bold"
              >
                <span>Wholesale & Custom Apparel</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Direct Support Card */}
          <div className="bg-[#141413] text-white p-5 space-y-2 text-xs">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#faf9f5]">
              NEED HELP WITH AN ORDER?
            </h4>
            <p className="text-neutral-300 text-[11px]">
              Direct assistance from our Kanpur studio team for size queries or exchange dispatch.
            </p>
            <div className="pt-2 space-y-1 text-[11px] text-neutral-300">
              <p className="flex items-center gap-1.5">
                <Phone size={13} className="text-[#15803D]" /> WhatsApp: +91 7985232434
              </p>
              <p className="flex items-center gap-1.5">
                <Mail size={13} className="text-[#cc785c]" /> Email: inveins24@gmail.com
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
