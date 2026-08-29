'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    clearCart();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('form');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#f5f4f0] w-full max-w-xl border border-[#e5e4df] shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#171717]"
        >
          <X size={22} />
        </button>

        {step === 'form' ? (
          <div>
            <h2 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717] mb-1">
              CHECKOUT & SHIPPING
            </h2>
            <p className="text-xs text-[#737373] mb-6">
              Complete your order with express Pan-India shipping.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="+91 90000 00000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    PINCODE *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-white border border-[#e5e4df] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="e.g. 110001"
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
                  placeholder="Street, apartment, landmark"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-2">
                  PAYMENT METHOD
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 text-center border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span>UPI / GPay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 text-center border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'card' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 text-center border text-xs font-bold flex flex-col items-center gap-1 ${
                      paymentMethod === 'cod' ? 'bg-[#171717] text-[#f5f4f0] border-[#171717]' : 'bg-white text-[#171717] border-[#e5e4df]'
                    }`}
                  >
                    <Banknote size={18} />
                    <span>COD</span>
                  </button>
                </div>
              </div>

              {/* Order Total Summary */}
              <div className="p-4 bg-white border border-[#e5e4df] flex justify-between items-center text-xs font-bold text-[#171717]">
                <span>TOTAL DUE:</span>
                <span className="text-base font-extrabold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3.5 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> PLACE ORDER NOW
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
              ORDER CONFIRMED!
            </h2>
            <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
              Thank you, <strong className="text-[#171717]">{formData.name}</strong>. Your order #INV-{Math.floor(100000 + Math.random() * 900000)} has been placed successfully. A confirmation message will be sent to <strong>{formData.email}</strong>.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-8 hover:bg-black transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
