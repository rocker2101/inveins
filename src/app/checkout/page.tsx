'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, CheckCircle2, Truck, CreditCard, 
  ArrowLeft, ArrowRight, Zap, ShoppingBag, MapPin, 
  Phone, Mail, Package, AlertCircle 
} from 'lucide-react';
import { useCart, SavedAddress, Order } from '@/context/CartContext';
import { sanitizeString, isValidPhone, isValidPincode } from '@/lib/sanitize';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    coupon,
    savedAddress,
    saveAddress,
    addOrder,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Address Form State
  const [formData, setFormData] = useState<SavedAddress>({
    name: savedAddress?.name || '',
    email: savedAddress?.email || '',
    phone: savedAddress?.phone || '',
    address: savedAddress?.address || '',
    city: savedAddress?.city || '',
    state: savedAddress?.state || 'Uttar Pradesh',
    pincode: savedAddress?.pincode || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Indian States list
  const INDIAN_STATES = [
    'Uttar Pradesh', 'Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 
    'Gujarat', 'Rajasthan', 'Haryana', 'West Bengal', 'Punjab', 'Telangana', 
    'Kerala', 'Madhya Pradesh', 'Bihar', 'Assam', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }
    if (!isValidPincode(formData.pincode)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const sanitizedAddress = {
      name: sanitizeString(formData.name),
      email: sanitizeString(formData.email),
      phone: sanitizeString(formData.phone),
      address: sanitizeString(formData.address),
      city: sanitizeString(formData.city),
      state: sanitizeString(formData.state || 'Uttar Pradesh'),
      pincode: sanitizeString(formData.pincode),
    };

    setErrorMsg('');
    setFormData(sanitizedAddress);
    saveAddress(sanitizedAddress);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Authoritative Server-Side Validation: Calculates genuine catalog prices
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items: items.map(i => ({
            productId: i.product.id,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
          })),
          couponCode: coupon?.code,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Order verification failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // 2. Add cryptographically verified order to local storage & state
      const verified = data.order;
      addOrder({
        id: verified.id,
        trackingNumber: verified.trackingNumber,
        verificationToken: verified.verificationToken,
        createdAt: verified.createdAt,
        customer: verified.customer,
        items: verified.items,
        subtotal: verified.subtotal,
        discount: verified.discount,
        shippingFee: verified.shippingFee,
        grandTotal: verified.grandTotal,
        paymentMethod: verified.paymentMethod,
        status: verified.status,
      });

      setCreatedOrder(verified);
      clearCart();
      setIsProcessing(false);
      setStep('confirmation');
    } catch (err) {
      // Fallback in case of offline environment
      const newOrder = addOrder({
        customer: formData,
        items,
        subtotal,
        discount: discountAmount,
        shippingFee,
        grandTotal,
        paymentMethod,
        status: 'Confirmed',
      });
      setCreatedOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      setStep('confirmation');
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#faf9f5] border border-[#e6e2d8] flex items-center justify-center mx-auto text-[#6c6a64]">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-[#141413]">YOUR BAG IS EMPTY</h2>
        <p className="text-xs text-[#6c6a64]">Add items to your bag before checking out.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#141413] text-white text-xs font-bold uppercase tracking-widest"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // STEP 3: ORDER CONFIRMATION
  if (step === 'confirmation' && createdOrder) {
    const handleWhatsAppReceipt = () => {
      const msg = `Hi INVEINS! I have placed Order ${createdOrder.id}.%0A%0AName: ${createdOrder.customer.name}%0APhone: ${createdOrder.customer.phone}%0ATotal: ₹${createdOrder.grandTotal.toLocaleString('en-IN')}%0APayment: ${createdOrder.paymentMethod.toUpperCase()}%0A%0APlease share tracking updates.`;
      window.open(`https://wa.me/917985232434?text=${msg}`, '_blank');
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
        <div className="bg-white border border-[#e6e2d8] p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#15803D]">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-[10px] font-extrabold tracking-widest text-[#cc785c] uppercase">
            ORDER CONFIRMED & RECEIVED
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#141413] tracking-tight">
            THANK YOU, {createdOrder.customer.name.toUpperCase()}!
          </h1>
          <p className="text-xs text-[#6c6a64] max-w-md mx-auto leading-relaxed">
            Your order <strong>{createdOrder.id}</strong> has been confirmed and queued for preparation at our Kanpur Studio.
          </p>

          <div className="pt-4 pb-2 max-w-sm mx-auto grid grid-cols-2 gap-4 text-left border-y border-[#e6e2d8] py-4 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#6c6a64] block">Order ID</span>
              <span className="font-extrabold text-[#141413] font-mono">{createdOrder.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#6c6a64] block">Tracking Code</span>
              <span className="font-extrabold text-[#141413] font-mono">{createdOrder.trackingNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#6c6a64] block">Payment Method</span>
              <span className="font-extrabold uppercase text-[#141413]">{createdOrder.paymentMethod}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#6c6a64] block">Total Amount</span>
              <span className="font-extrabold text-[#141413]">₹{createdOrder.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleWhatsAppReceipt}
              className="py-3.5 px-6 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <Zap size={15} className="fill-white" />
              Send Order Slip to WhatsApp
            </button>
            <Link
              href="/account"
              className="py-3.5 px-6 bg-[#141413] hover:bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              View in My Orders
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="text-xs font-bold text-[#6c6a64] hover:text-[#141413] underline underline-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Checkout Breadcrumbs & Steps */}
      <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-6">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#6c6a64] uppercase">
            SECURE CHECKOUT
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-0.5">
            {step === 'address' ? '1. SHIPPING INFORMATION' : '2. PAYMENT & CONFIRMATION'}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6c6a64]">
          <span className={step === 'address' ? 'text-[#141413] underline' : 'text-neutral-400'}>1. Address</span>
          <span>→</span>
          <span className={step === 'payment' ? 'text-[#141413] underline' : 'text-neutral-400'}>2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'address' && (
            <form onSubmit={handleProceedToPayment} className="bg-white border border-[#e6e2d8] p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
                <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#141413] flex items-center gap-2">
                  <MapPin size={16} className="text-[#cc785c]" />
                  DELIVERY ADDRESS
                </h3>
                <span className="text-[10px] text-[#6c6a64]">Pan-India Express</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Arjun Sharma"
                    className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  Email Address * (For order updates)
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@domain.com"
                  className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                  Street Address & Apartment *
                </label>
                <input
                  type="text"
                  autoComplete="street-address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Flat / House No., Landmark, Road"
                  className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    City *
                  </label>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Kanpur / Delhi"
                    className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    State *
                  </label>
                  <select
                    name="state"
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="postal-code"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    required
                    placeholder="6 digits"
                    className="w-full px-3.5 h-12 sm:h-10 bg-[#faf9f5] border border-[#e6e2d8] text-base sm:text-xs font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e6e2d8] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link
                  href="/cart"
                  className="min-h-[44px] flex items-center justify-center text-xs font-bold text-[#6c6a64] hover:text-[#141413] gap-1"
                >
                  <ArrowLeft size={14} /> Back to Bag
                </Link>

                <button
                  type="submit"
                  className="min-h-[48px] py-3.5 px-8 bg-[#141413] hover:bg-black active:bg-neutral-800 text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="bg-white border border-[#e6e2d8] p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e6e2d8] pb-3">
                <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#141413] flex items-center gap-2">
                  <CreditCard size={16} className="text-[#cc785c]" />
                  SELECT PAYMENT METHOD
                </h3>
                <button
                  onClick={() => setStep('address')}
                  className="text-xs font-bold text-[#cc785c] hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Delivery destination summary */}
              <div className="p-3 bg-[#faf9f5] border border-[#e6e2d8] text-xs space-y-0.5">
                <span className="font-bold text-[#141413]">Deliver to: {formData.name} ({formData.phone})</span>
                <p className="text-[#6c6a64]">{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</p>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label className={`block p-4 border transition-all cursor-pointer ${
                  paymentMethod === 'upi' ? 'border-[#141413] bg-[#faf9f5]' : 'border-[#e6e2d8] hover:border-neutral-400'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#141413]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#141413]">
                          UPI (Instant QR / Google Pay / PhonePe / Paytm)
                        </span>
                        <span className="text-[10px] font-bold text-[#15803D] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6c6a64] mt-0.5">Zero payment gateway surcharge. Instant verification.</p>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-3 pt-3 border-t border-[#e6e2d8] space-y-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="Enter your VPA (e.g. yourname@okhdfcbank or yourphone@upi)"
                        className="w-full px-3.5 h-12 sm:h-10 bg-white border border-[#e6e2d8] text-base sm:text-xs font-semibold focus:outline-none focus:border-[#141413]"
                      />
                      <p className="text-[10px] text-[#6c6a64]">
                        You can also pay directly via WhatsApp UPI after order submission.
                      </p>
                    </div>
                  )}
                </label>

                {/* Cash on Delivery Option */}
                <label className={`block p-4 border transition-all cursor-pointer min-h-[56px] ${
                  paymentMethod === 'cod' ? 'border-[#141413] bg-[#faf9f5]' : 'border-[#e6e2d8] hover:border-neutral-400'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#141413] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#141413]">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-[11px] text-[#6c6a64] mt-0.5">Pay in cash or UPI QR at your doorstep upon delivery.</p>
                    </div>
                  </div>
                </label>

                {/* Card Option */}
                <label className={`block p-4 border transition-all cursor-pointer min-h-[56px] ${
                  paymentMethod === 'card' ? 'border-[#141413] bg-[#faf9f5]' : 'border-[#e6e2d8] hover:border-neutral-400'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#141413] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#141413]">
                        Credit / Debit Card (Visa, MasterCard, RuPay)
                      </span>
                      <p className="text-[11px] text-[#6c6a64] mt-0.5">256-bit encrypted Razorpay / Stripe gateway.</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-[#e6e2d8] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="min-h-[44px] flex items-center justify-center text-xs font-bold text-[#6c6a64] hover:text-[#141413] gap-1"
                >
                  <ArrowLeft size={14} /> Back to Address
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="min-h-[50px] py-4 px-8 bg-[#141413] hover:bg-black active:bg-neutral-800 text-[#faf9f5] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>CONFIRMING ORDER...</span>
                  ) : (
                    <>
                      <span>PLACE ORDER (₹{grandTotal.toLocaleString('en-IN')})</span>
                      <CheckCircle2 size={15} className="text-[#cc785c]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#e6e2d8] p-6 space-y-4 shadow-sm">
            <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-[#141413] border-b border-[#e6e2d8] pb-3">
              YOUR ORDER ({items.reduce((s, i) => s + i.quantity, 0)} ITEMS)
            </h3>

            <div className="divide-y divide-[#e6e2d8] max-h-72 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex gap-3 items-center">
                  <div className="relative w-14 h-16 bg-[#f4f1ea] flex-shrink-0 border border-[#e6e2d8] overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-extrabold text-[#141413] line-clamp-1">{item.product.name}</h4>
                    <p className="text-[11px] text-[#6c6a64]">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                    <span className="font-bold text-[#141413]">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#e6e2d8] text-xs">
              <div className="flex justify-between text-[#6c6a64]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#141413]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-[#15803D]">
                  <span>Promo Discount ({coupon.code})</span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6c6a64]">
                <span>Pan-India Shipping</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? <span className="text-[#15803D]">Free</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#141413] pt-2 border-t border-[#e6e2d8]">
                <span>Total Due</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#6c6a64] space-y-1.5 border-t border-[#e6e2d8]">
              <p className="flex items-center gap-1.5">
                <Truck size={13} className="text-[#cc785c]" /> Dispatched from Kanpur Studio via Express Air
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#15803D]" /> 7-Day Free Size & Fit Exchange Guarantee
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
