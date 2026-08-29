'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen, setIsSearchOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Retail', href: '/retail' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f5f4f0]/90 backdrop-blur-md border-b border-[#e5e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Mobile Menu Toggle */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#171717] hover:text-black focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading font-extrabold text-2xl tracking-tighter text-[#171717] group-hover:opacity-80 transition-opacity">
              INVEINS
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                  isActive ? 'text-[#171717] border-b-2 border-[#171717] pb-1' : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls (Search & Shopping Bag) */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:opacity-75 transition-opacity p-2"
            aria-label="Search"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#171717] hover:opacity-75 transition-opacity p-2"
            aria-label="Shopping Bag"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Bag</span>
            {totalCount > 0 && (
              <span className="ml-0.5 bg-[#171717] text-[#f5f4f0] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e5e4df] bg-[#f5f4f0] px-4 pt-4 pb-6 space-y-3 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-sm font-semibold uppercase tracking-widest py-2 border-b border-[#e5e4df]/50 ${
                pathname === link.href ? 'text-[#171717]' : 'text-[#737373]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
