'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { sanitizeString, isValidEmail } from '@/lib/sanitize';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setEmailError('Please provide a valid email address.');
      return;
    }
    setEmailError('');
    // Sanitized submission payload
    const safeData = {
      name: sanitizeString(formData.name),
      email: sanitizeString(formData.email),
      subject: sanitizeString(formData.subject),
      message: sanitizeString(formData.message),
    };
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="border-b border-[#e5e4df] pb-8 text-center max-w-3xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
          SAY HELLO
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-[#171717] tracking-tight mt-1">
          CONTACT
        </h1>
        <p className="text-xs sm:text-base text-[#737373] mt-3 leading-relaxed">
          For product questions, order support or just to talk clothes.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Direct Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 border border-[#e5e4df] space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
                DIRECT INQUIRIES
              </span>
              <h3 className="font-heading font-extrabold text-xl uppercase tracking-wider text-[#171717] mt-1">
                GET IN TOUCH
              </h3>
            </div>

            <div className="space-y-4 text-xs text-[#171717]">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-[#171717] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">EMAIL</p>
                  <a href="mailto:hello@inveins.studio" className="text-[#737373] hover:underline">
                    hello@inveins.studio
                  </a>
                  <br />
                  <a href="mailto:inveins24@gmail.com" className="text-[#737373] hover:underline">
                    inveins24@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-[#171717] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">PHONE & WHATSAPP</p>
                  <p className="text-[#737373]">+91 79852 32434</p>
                  <p className="text-[#737373]">+91 90000 00000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#171717] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">SUPPORT HOURS</p>
                  <p className="text-[#737373]">Mon—Fri / 10:00—18:00 IST</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e5e4df]">
              <a
                href="https://wa.me/917985232434"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare size={16} /> WHATSAPP US DIRECTLY
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-[#e5e4df]">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-heading font-extrabold text-2xl uppercase tracking-wider text-[#171717]">
                MESSAGE SENT!
              </h2>
              <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out, <strong>{formData.name}</strong>. We will review your message regarding <em>"{formData.subject}"</em> and respond to <strong>{formData.email}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-[#171717] text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-3 px-8 hover:bg-black transition-colors"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#e5e4df] pb-4">
                <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-[#171717]">
                  SEND US A MESSAGE
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    placeholder="name@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  SUBJECT *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Order inquiry, fit advice, feedback..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#171717] mb-1">
                  MESSAGE *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#f5f4f0] border border-[#e5e4df] p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  placeholder="Write your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#171717] hover:bg-black text-[#f5f4f0] text-xs font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-colors"
              >
                <Send size={15} /> SEND MESSAGE
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
