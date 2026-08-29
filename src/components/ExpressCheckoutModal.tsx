'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, ShieldCheck, Zap, Smartphone, CreditCard, Banknote, MessageSquare, ArrowRight } from 'lucide-react';
import { useCart, SavedAddress, Order } from '@/context/CartContext';

export const ExpressCheckoutModal: React.FC = () => {
  const {
    isExpressOpen,
    setIsExpressOpen,
    expressProduct,
    expressSize,
    savedAddress,
    saveAddress,
    addOrder
  } = useCart();

  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [selectedSize, setSelectedSize] = useState<string>(expressSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState<SavedAddress>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (expressSize) setSelectedSize(expressSize);
    if (savedAddress) setFormData(savedAddress);
  }, [expressSize, savedAddress, isExpressOpen]);

  if (!isExpressOpen || !expressProduct) return null;

  const handleClose = () => {
    setIsExpressOpen(false);
    setStep('checkout');
    setErrorMsg('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Input Validations
    if (!/^\d{10}$/.test(formData.phone.trim().replace(/\D/g, ''))) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    // Save address for future 1-Click checkouts
    saveAddress(formData);

    const totalAmount = expressProduct.price * quantity;

    // Create Order
    const newOrder = addOrder({
      customer: formData,
      items: [{ product: expressProduct, selectedSize, quantity }],
      subtotal: totalAmount,
      paymentMethod,
      status: 'Pending',
    });

    setPlacedOrder(newOrder);
    setStep('success');
  };

  const generateWhatsAppLink = () => {
    if (!placedOrder) return '#';
    const text = encodeURIComponent(
      `🛍️ *NEW INVEINS ORDER #${placedOrder.id}*\n\n` +
      `*Customer:* ${placedOrder.customer.name}\n` +
      `*Phone:* ${placedOrder.customer.phone}\n` +
      `*Address:* ${placedOrder.customer.address}, ${placedOrder.customer.city} - ${placedOrder.customer.pincode}\n\n` +
      `*Item:* ${expressProduct.name} (Size: ${selectedSize}) x${quantity}\n` +
      `*Total Amount:* ₹${placedOrder.subtotal.toLocaleString('en-IN')}\n` +
      `*Payment Mode:* ${placedOrder.paymentMethod.toUpperCase()}\n\n` +
      `Please confirm my order dispatch!`
    );
    return `https://wa.me/917985232434?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-xl border border-[#e5e4df] shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#171717] p-1"
        >
          <X size={22} />
        </button>

        {step === 'checkout' ? (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="flex items-center gap-2 border-b border-[#e5e4df] pb-3">
              <span className="bg-[#171717] text-[#f5f4f0] p-1.5 rounded-none">
                <Zap size={16} />
              </span>
              <div>
                <h2 className="font-heading font-extrabold text-lg uppercase tracking-wider text-[#171717]">
                  1-CLICK EXPRESS BUY
                </h2>
                <p className="text-[11px] text-[#737373]">
                  Select size → Delivery Address → Confirm Payment
                </p>
              </div>
            </div>

            {/* Selected Product Summary Card */}
            <div className="flex gap-4 p-3 bg-white border border-[#e5e4df] items-center">
              <div className="relative w-16 h-20 bg-[#f0efe9] flex-shrink-0 border border-[#e5e4df]">
                <Image
                  src={expressProduct.images[0]}
                  alt={expressProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-sm text-[#171717]">
                  {expressProduct.name}
                </h3>
                <p className="text-xs font-bold text-[#171717] mt-0.5">
                  ₹{expressProduct.price.toLocaleString('en-IN')}
                </p>

                {/* Size Selector in Modal */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">SIZE:</span>
                  <div className="flex gap-1">
                    {expressProduct.sizes.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-2 py-0.5 text-[11px] font-bold border ${
                          selectedSize === sz ? 'bg-[#171717] text-white border-[#171717]' : 'bg-[#f5f4f0] text-[#171717] border-[#e5e4df]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PHONE NUMBER (10 DIGITS) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="name@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PINCODE *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="e.g. 400001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  SHIPPING ADDRESS *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="House / Flat No., Street, Landmark"
                />
              </div>

              {/* Payment Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-2">
                  PAYMENT METHOD
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 text-center border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === 'upi' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <Smartphone size={16} />
                    <span>UPI / GPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 text-center border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === 'card' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 text-center border text-xs font-bold flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === 'cod' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <Banknote size={16} />
                    <span>COD</span>
                  </button>
                </div>
              </div>

              {/* Total Due */}
              <div className="p-3 bg-white border border-[#e5e4df] flex justify-between items-center text-xs font-bold text-[#171717]">
                <span>TOTAL AMOUNT:</span>
                <span className="text-base font-extrabold">₹{expressProduct.price.toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-extrabold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ShieldCheck size={18} /> CONFIRM ORDER & PAY NOW
              </button>

            </form>

          </div>
        ) : (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                ORDER SUCCESSFUL
              </span>
              <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717] mt-0.5">
                ORDER CONFIRMED!
              </h2>
            </div>

            {placedOrder && (
              <div className="p-4 bg-white border border-[#e5e4df] text-left text-xs space-y-2 text-[#171717]">
                <div className="flex justify-between font-bold border-b border-[#e5e4df] pb-2">
                  <span>ORDER ID:</span>
                  <span className="text-[#171717] font-mono">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{placedOrder.customer.name} ({placedOrder.customer.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span>Item:</span>
                  <span>{expressProduct.name} (Size: {selectedSize})</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Total Paid:</span>
                  <span>₹{placedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageSquare size={16} /> SEND ORDER DETAILS TO WHATSAPP
              </a>

              <button
                onClick={handleClose}
                className="w-full bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 hover:bg-black transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
