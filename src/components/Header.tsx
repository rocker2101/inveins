'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Phone,
  Layers,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

type MegaMenuKey = 'MEN' | 'NEW_ARRIVALS' | 'CATEGORIES' | null;

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, wishlistCount, setIsCartOpen, setIsSearchOpen } = useCart();

  // Desktop Mega Menu & Dropdown state
  const [activeMenu, setActiveMenu] = useState<MegaMenuKey>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile Drawer & Accordion state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  // Hover Debounce Timers (Prevent flicker when moving between nav item and mega dropdown)
  const openTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for sticky compact header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard accessibility (ESC closes open menus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setIsAccountOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setActiveMenu(null);
    setIsAccountOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hover Handlers with intentional delays
  const handleMouseEnter = (menu: MegaMenuKey) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    openTimerRef.current = setTimeout(() => {
      setActiveMenu(menu);
      setIsAccountOpen(false);
    }, 60);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const handleAccountMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveMenu(null);
    setIsAccountOpen(true);
  };

  const handleAccountMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsAccountOpen(false);
    }, 180);
  };

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(prev => (prev === section ? null : section));
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-[#faf9f5]/95 backdrop-blur-md border-b border-[#e6e2d8] transition-all duration-200 ${
        isScrolled ? 'shadow-xs' : ''
      }`}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary Top Bar */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-200 ${
          isScrolled ? 'h-16' : 'h-18 lg:h-20'
        }`}
      >
        {/* ==================== LEFT: LOGO / WORDMARK ==================== */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#141413] hover:text-black focus:outline-none lg:hidden"
            aria-label="Open Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group py-1">
            <div className="relative h-9 sm:h-10 w-28 sm:w-32 flex items-center">
              <Image
                src="/images/logo/inveins-logo-dark.png"
                alt="Inveins™"
                fill
                sizes="130px"
                className="object-contain object-left group-hover:opacity-85 transition-opacity"
                priority
              />
            </div>
            <div className="hidden xl:flex flex-col border-l border-[#e6e2d8] pl-2.5 py-0.5">
              <span className="text-[8px] font-extrabold tracking-widest text-[#6c6a64] uppercase leading-tight">
                EST. 2025
              </span>
              <span className="text-[8px] font-bold text-[#6c6a64] uppercase leading-tight">
                KANPUR
              </span>
            </div>
          </Link>
        </div>

        {/* ==================== CENTER: DESKTOP PRIMARY NAVIGATION ==================== */}
        <nav
          className="hidden lg:flex items-center space-x-6 xl:space-x-8"
          role="menubar"
          aria-label="Main Navigation"
        >
          {/* 1. MEN (Mega Menu) */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter('MEN')}
          >
            <button
              onClick={() => router.push('/shop')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors py-1 ${
                activeMenu === 'MEN'
                  ? 'text-[#cc785c] border-b-2 border-[#cc785c]'
                  : 'text-[#141413] hover:text-[#cc785c]'
              }`}
              aria-haspopup="true"
              aria-expanded={activeMenu === 'MEN'}
            >
              <span>MEN</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  activeMenu === 'MEN' ? 'rotate-180 text-[#cc785c]' : 'text-[#6c6a64]'
                }`}
              />
            </button>
          </div>

          {/* 2. NEW ARRIVALS (Mega Menu) */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter('NEW_ARRIVALS')}
          >
            <button
              onClick={() => router.push('/shop?badge=NEW')}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors py-1 ${
                activeMenu === 'NEW_ARRIVALS'
                  ? 'text-[#cc785c] border-b-2 border-[#cc785c]'
                  : 'text-[#141413] hover:text-[#cc785c]'
              }`}
              aria-haspopup="true"
              aria-expanded={activeMenu === 'NEW_ARRIVALS'}
            >
              <span>NEW ARRIVALS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c]" />
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  activeMenu === 'NEW_ARRIVALS' ? 'rotate-180 text-[#cc785c]' : 'text-[#6c6a64]'
                }`}
              />
            </button>
          </div>

          {/* 3. CATEGORIES (Mega Menu) */}
          <div
            className="relative py-4"
            onMouseEnter={() => handleMouseEnter('CATEGORIES')}
          >
            <button
              onClick={() => router.push('/shop')}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors py-1 ${
                activeMenu === 'CATEGORIES'
                  ? 'text-[#cc785c] border-b-2 border-[#cc785c]'
                  : 'text-[#141413] hover:text-[#cc785c]'
              }`}
              aria-haspopup="true"
              aria-expanded={activeMenu === 'CATEGORIES'}
            >
              <span>CATEGORIES</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  activeMenu === 'CATEGORIES' ? 'rotate-180 text-[#cc785c]' : 'text-[#6c6a64]'
                }`}
              />
            </button>
          </div>

          {/* 4. B2B (Direct Link to Wholesale) */}
          <Link
            href="/wholesale"
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-1 transition-colors ${
              pathname === '/wholesale'
                ? 'text-[#cc785c] border-b-2 border-[#cc785c]'
                : 'text-[#141413] hover:text-[#cc785c]'
            }`}
          >
            <span>B2B</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#141413] text-[#faf9f5] rounded-xs">
              Wholesale
            </span>
          </Link>

          {/* 6. OUR STORY (Direct Link to Brand Story) */}
          <Link
            href="/about"
            className={`text-xs font-bold uppercase tracking-wider py-1 transition-colors ${
              pathname === '/about'
                ? 'text-[#cc785c] border-b-2 border-[#cc785c]'
                : 'text-[#141413] hover:text-[#cc785c]'
            }`}
          >
            OUR STORY
          </Link>
        </nav>

        {/* ==================== RIGHT: SEARCH, WISHLIST, ACCOUNT, BAG ==================== */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Desktop Search Trigger / Input Simulation */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 text-xs font-medium text-[#6c6a64] bg-white border border-[#e6e2d8] hover:border-[#141413] hover:text-[#141413] px-3 py-1.5 transition-all shadow-2xs"
            aria-label="Search catalog"
          >
            <Search size={15} className="text-[#6c6a64]" />
            <span className="hidden sm:inline pr-4">Search catalog...</span>
            <kbd className="hidden md:inline-block text-[9px] font-mono font-bold bg-[#faf9f5] border border-[#e6e2d8] px-1.5 py-0.5 rounded-xs text-[#6c6a64]">
              ⌘K
            </kbd>
          </button>

          {/* Wishlist Link with Dynamic Count Badge */}
          <Link
            href="/wishlist"
            className="relative p-2 text-[#141413] hover:text-[#cc785c] transition-colors"
            aria-label={`Wishlist (${wishlistCount} items)`}
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#cc785c] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown Trigger */}
          <div
            className="relative py-2"
            onMouseEnter={handleAccountMouseEnter}
            onMouseLeave={handleAccountMouseLeave}
          >
            <button
              onClick={() => router.push('/account')}
              className="p-2 text-[#141413] hover:text-[#cc785c] transition-colors flex items-center gap-1"
              aria-label="User Account"
              aria-haspopup="true"
              aria-expanded={isAccountOpen}
            >
              <User size={19} />
              <ChevronDown
                size={11}
                className={`hidden md:block transition-transform duration-150 ${
                  isAccountOpen ? 'rotate-180 text-[#cc785c]' : 'text-[#6c6a64]'
                }`}
              />
            </button>

            {/* Account Popover Menu */}
            {isAccountOpen && (
              <div
                className="absolute right-0 top-full pt-1 w-64 animate-fade-in z-50"
                onMouseEnter={handleAccountMouseEnter}
                onMouseLeave={handleAccountMouseLeave}
              >
                <div className="bg-white border border-[#e6e2d8] shadow-xl p-4 space-y-3">
                  <div className="border-b border-[#e6e2d8] pb-3">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#141413]">
                      INVEINS Account
                    </p>
                    <p className="text-[11px] text-[#6c6a64]">
                      Access orders, tracking & addresses
                    </p>
                  </div>
                  <div className="space-y-1 text-xs font-bold uppercase tracking-wider">
                    <Link
                      href="/account"
                      className="block px-2.5 py-2 hover:bg-[#faf9f5] hover:text-[#cc785c] transition-colors"
                    >
                      My Profile & Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-2.5 py-2 hover:bg-[#faf9f5] hover:text-[#cc785c] transition-colors flex items-center justify-between"
                    >
                      <span>Saved Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="text-[10px] bg-[#cc785c] text-white px-1.5 py-0.2 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/wholesale"
                      className="block px-2.5 py-2 hover:bg-[#faf9f5] hover:text-[#cc785c] transition-colors"
                    >
                      Wholesale B2B Portal
                    </Link>
                    <Link
                      href="/admin"
                      className="block px-2.5 py-2 hover:bg-[#faf9f5] hover:text-[#cc785c] transition-colors text-[#6c6a64]"
                    >
                      Catalog Studio Admin
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shopping Bag Button (Shows count badge ONLY when > 0, NO "Bag 0") */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#141413] text-[#faf9f5] hover:bg-black px-3 py-2 transition-all shadow-2xs"
            aria-label={`Shopping Bag ${totalCount > 0 ? `(${totalCount} items)` : ''}`}
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Bag</span>
            {totalCount > 0 && (
              <span className="ml-1 bg-[#cc785c] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== DESKTOP MEGA MENUS (HOVER-TRIGGERED) ==================== */}
      <div
        className={`absolute left-0 right-0 top-full bg-white border-b border-[#e6e2d8] shadow-2xl transition-all duration-200 origin-top ${
          activeMenu
            ? 'opacity-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 -translate-y-2 pointer-events-none invisible'
        }`}
        onMouseEnter={() => {
          if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
          }
        }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* ---------- 1. MEN MEGA MENU ---------- */}
          {activeMenu === 'MEN' && (
            <div className="grid grid-cols-5 gap-8">
              {/* Col 1: Topwear */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  TOPWEAR
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/shop?category=Tees"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>T-Shirts</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹149+</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/imported-oversized-acid-wash-french-terry-tshirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Oversized Acid Wash Tee
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-french-terry-printed-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      French Terry Printed Tee
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/oversized-streetwear-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Signature Oversized (240 GSM)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/imported-premium-polo-tshirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Imported Piqué Polos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-custom-dtf-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Custom DTF Graphic Tees
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?category=Tees"
                      className="text-[#cc785c] hover:underline font-bold pt-1 inline-block"
                    >
                      View All Topwear →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 2: Bottomwear */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  BOTTOMWEAR
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/shop?category=Joggers"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Joggers & Lowers</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹319+</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/imported-french-terry-straight-fit-baggy-lowers"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      French Terry Baggy Lowers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/organic-antibacterial-bamboo-pant"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Organic Bamboo Comfort Pant
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/women-cotton-linen-pant"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Relaxed Linen-Cotton Trousers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?category=Joggers"
                      className="text-[#cc785c] hover:underline font-bold pt-1 inline-block"
                    >
                      View All Bottomwear →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Activewear */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  ACTIVEWEAR
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/shop?category=Gym+Compression"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Gym Compression</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹299</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/black-spandex-blend-gym-compression-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Spandex Form-Locking Tee
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/black-poly-cotton-gym-compression-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Poly-Cotton Hybrid Compression
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/black-spandex-blend-gym-tighty"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Gym Compression Tights (₹309)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/mens-tactical-compression-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Tactical Core Compression
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/red-spandex-blend-gym-compression-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Crimson Performance Top
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop?category=Gym+Compression"
                      className="text-[#cc785c] hover:underline font-bold pt-1 inline-block"
                    >
                      View All Compression →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 4: Outerwear & Featured */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  OUTERWEAR & LAYERS
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/product/cotton-men-drop-shoulder-pullover-hoodie"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>430 GSM Loopknit Hoodie</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹499</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-fleece-pullover-hoodie"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Architectural Fleece Hoodie (₹299)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-pink-cotton-blend-sweatshirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Dusty Pink Sweatshirt (₹229)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/women-black-cotton-blend-sweatshirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium"
                    >
                      Minimal Black Crewneck (₹299)
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-[#e6e2d8]">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#141413] block mb-1.5">
                      CURATED HIGHLIGHTS
                    </span>
                    <Link
                      href="/shop?badge=HOT"
                      className="text-xs text-[#cc785c] hover:underline font-bold block"
                    >
                      • Hot Studio Drops
                    </Link>
                    <Link
                      href="/shop?badge=BESTSELLER"
                      className="text-xs text-[#6c6a64] hover:text-[#141413] font-medium block mt-1"
                    >
                      • Weekly Bestsellers
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 5: Editorial Image Showcase (Real INVEINS Fashion) */}
              <div className="bg-[#faf9f5] border border-[#e6e2d8] p-4 flex flex-col justify-between group">
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 mb-3">
                  <Image
                    src="https://5.imimg.com/data5/SELLER/Default/2025/12/571500800/WG/MX/MS/180956315/premium-acid-wash-tshirt-500x500.jpeg"
                    alt="INVEINS Acid Wash French Terry"
                    fill
                    sizes="(max-width: 1280px) 250px, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#141413] text-[#faf9f5] text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-wider">
                    STUDIO DROP • ₹250
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#cc785c] uppercase tracking-widest">
                    ARCHITECTURAL ESSENTIAL
                  </p>
                  <h4 className="text-xs font-extrabold text-[#141413] leading-tight">
                    Acid Wash 280 GSM French Terry
                  </h4>
                  <p className="text-[11px] text-[#6c6a64] line-clamp-2">
                    Individually artisan stonewashed with dropped shoulders.
                  </p>
                  <Link
                    href="/product/imported-oversized-acid-wash-french-terry-tshirt"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#141413] hover:text-[#cc785c] pt-2"
                  >
                    <span>Shop Piece</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ---------- 2. NEW ARRIVALS MEGA MENU ---------- */}
          {activeMenu === 'NEW_ARRIVALS' && (
            <div className="grid grid-cols-4 gap-8">
              {/* Col 1: Latest T-Shirts */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  LATEST T-SHIRTS
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/product/imported-oversized-acid-wash-french-terry-tshirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Acid Wash French Terry</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹250</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-french-terry-printed-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Men French Terry Printed</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹249</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/oversized-streetwear-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Signature Oversized Tee</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹199</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-cotton-printed-t-shirt"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Brutalist Typography Tee</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹240</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 2: Latest Bottoms & Layers */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  LATEST LOWERS & LAYERS
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link
                      href="/product/imported-french-terry-straight-fit-baggy-lowers"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>French Terry Baggy Lowers</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹349</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/cotton-men-drop-shoulder-pullover-hoodie"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>430 GSM Heavyweight Hoodie</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹499</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/men-fleece-pullover-hoodie"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Architectural Fleece Hoodie</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹299</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/product/organic-antibacterial-bamboo-pant"
                      className="text-[#6c6a64] hover:text-[#141413] transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Organic Bamboo Pant</span>
                      <span className="text-[10px] text-[#cc785c] font-bold">₹320</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Drop Highlights */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  DROP SCHEDULE
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#faf9f5] border border-[#e6e2d8]">
                    <span className="text-[10px] font-extrabold text-[#cc785c] uppercase block">
                      DROPPED THIS WEEK
                    </span>
                    <p className="font-bold text-[#141413]">
                      Heavyweight Acid Wash & Baggy Lowers
                    </p>
                    <p className="text-[11px] text-[#6c6a64]">
                      280-320 GSM French Terry loopknit sets.
                    </p>
                  </div>
                  <Link
                    href="/shop?badge=NEW"
                    className="text-xs font-bold text-[#141413] hover:text-[#cc785c] inline-flex items-center gap-1 pt-1"
                  >
                    <span>View All New Drops</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Col 4: Editorial Showcase */}
              <div className="bg-[#faf9f5] border border-[#e6e2d8] p-4 flex flex-col justify-between group">
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 mb-3">
                  <Image
                    src="https://5.imimg.com/data5/SELLER/Default/2026/4/599813452/RE/UW/PV/180956315/oversized-t-shirt-500x500.jpeg"
                    alt="INVEINS Signature Oversized Tee"
                    fill
                    sizes="(max-width: 1280px) 250px, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#cc785c] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-wider">
                    NEW RELEASE • ₹199
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-[#141413]">
                    Signature 240 GSM Oversized
                  </h4>
                  <p className="text-[11px] text-[#6c6a64]">
                    Pre-shrunk architectural boxy cut with reinforced shoulder tape.
                  </p>
                  <Link
                    href="/product/oversized-streetwear-t-shirt"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#141413] hover:text-[#cc785c] pt-1"
                  >
                    <span>Discover Piece →</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ---------- 3. CATEGORIES MEGA MENU ---------- */}
          {activeMenu === 'CATEGORIES' && (
            <div className="grid grid-cols-5 gap-8">
              {/* Col 1: Tees & Tops */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  TEES & TOPS
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/shop?category=Tees" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Oversized Streetwear Tees
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Tees" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      280 GSM Heavyweight Terry
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Tees" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Bio-Washed Everyday Basics
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Tees" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Graphic Silkscreen & DTF
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Tees" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Women Relaxed Combed Tees
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 2: Gym Compression */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  GYM COMPRESSION
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/shop?category=Gym+Compression" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Spandex Form-Locking Tops
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Gym+Compression" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Poly-Cotton Hybrid Tops
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Gym+Compression" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Compression Training Tights
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Gym+Compression" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Tactical Base Layer Systems
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Lowers & Joggers */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  BOTTOMS & LOWERS
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/shop?category=Joggers" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Straight Fit Baggy Lowers
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Joggers" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      French Terry Heavy Joggers
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Joggers" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Antibacterial Bamboo Pants
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Joggers" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Relaxed Cotton Linen Trousers
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 4: Polos & Hoodies */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#141413] border-b border-[#e6e2d8] pb-2">
                  POLOS & OUTERWEAR
                </h3>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/shop?category=Shirts" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Piqué Double-Knit Polos
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Shirts" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Technical UV Collar Shirts
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Outerwear" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      430 GSM Heavy Hoodies
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=Outerwear" className="text-[#6c6a64] hover:text-[#141413] font-medium">
                      Pigment-Washed Sweatshirts
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 5: Editorial Visual */}
              <div className="bg-[#faf9f5] border border-[#e6e2d8] p-4 flex flex-col justify-between group">
                <div className="relative aspect-4/5 overflow-hidden bg-neutral-100 mb-3">
                  <Image
                    src="https://5.imimg.com/data5/SELLER/Default/2025/12/571500385/RH/RN/IE/180956315/premium-gym-compression-tshirt-500x500.png"
                    alt="INVEINS Gym Compression"
                    fill
                    sizes="(max-width: 1280px) 250px, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-[#141413] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 tracking-wider">
                    HIGH PERFORMANCE • ₹299
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-[#141413]">
                    Gym Compression Line
                  </h4>
                  <p className="text-[11px] text-[#6c6a64]">
                    4-way stretch spandex engineered for muscle stability and sweat evaporation.
                  </p>
                  <Link
                    href="/shop?category=Gym+Compression"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#141413] hover:text-[#cc785c] pt-1"
                  >
                    <span>Explore Compression →</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== DEDICATED MOBILE DRAWER NAVIGATION ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Content Panel */}
          <div className="relative w-full max-w-sm bg-[#faf9f5] h-full shadow-2xl overflow-y-auto flex flex-col z-10 animate-slide-in-left">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#e6e2d8] flex items-center justify-between bg-white sticky top-0 z-10">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative h-8 w-28 flex items-center">
                <Image
                  src="/images/logo/inveins-logo-dark.png"
                  alt="Inveins™"
                  fill
                  sizes="120px"
                  className="object-contain object-left"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#141413] hover:text-[#cc785c]"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="p-4 bg-white border-b border-[#e6e2d8]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-medium text-[#6c6a64]"
              >
                <Search size={15} />
                <span>Search 280 GSM, compression, baggy lowers...</span>
              </button>
            </div>

            {/* Accordion Navigation Links */}
            <div className="flex-1 divide-y divide-[#e6e2d8]/70 px-4 py-2">
              {/* Accordion 1: MEN */}
              <div className="py-2">
                <button
                  onClick={() => toggleMobileSection('men')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <span className="flex items-center gap-2">
                    <span>MEN</span>
                  </span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform text-[#6c6a64] ${
                      expandedMobileSection === 'men' ? 'rotate-90 text-[#cc785c]' : ''
                    }`}
                  />
                </button>
                {expandedMobileSection === 'men' && (
                  <div className="pl-4 py-2 space-y-2 text-xs font-medium border-l-2 border-[#cc785c] ml-1 my-1">
                    <Link
                      href="/shop?category=Tees"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Topwear & T-Shirts (from ₹149)
                    </Link>
                    <Link
                      href="/shop?category=Gym+Compression"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Gym Compression Activewear (₹299)
                    </Link>
                    <Link
                      href="/shop?category=Joggers"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Baggy Lowers & Bamboo Pants (₹319–₹349)
                    </Link>
                    <Link
                      href="/shop?category=Outerwear"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Hoodies & Heavy Loopknit (₹299–₹499)
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#cc785c] font-bold pt-1"
                    >
                      Browse Entire Catalog →
                    </Link>
                  </div>
                )}
              </div>

              {/* Accordion 2: NEW ARRIVALS */}
              <div className="py-2">
                <button
                  onClick={() => toggleMobileSection('new')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <span className="flex items-center gap-2">
                    <span>NEW ARRIVALS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c]" />
                  </span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform text-[#6c6a64] ${
                      expandedMobileSection === 'new' ? 'rotate-90 text-[#cc785c]' : ''
                    }`}
                  />
                </button>
                {expandedMobileSection === 'new' && (
                  <div className="pl-4 py-2 space-y-2 text-xs font-medium border-l-2 border-[#cc785c] ml-1 my-1">
                    <Link
                      href="/product/imported-oversized-acid-wash-french-terry-tshirt"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Acid Wash French Terry Tee (₹250)
                    </Link>
                    <Link
                      href="/product/men-french-terry-printed-t-shirt"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Men French Terry Printed Tee (₹249)
                    </Link>
                    <Link
                      href="/product/cotton-men-drop-shoulder-pullover-hoodie"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      430 GSM Heavyweight Hoodie (₹499)
                    </Link>
                    <Link
                      href="/shop?badge=NEW"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#cc785c] font-bold pt-1"
                    >
                      View All New Releases →
                    </Link>
                  </div>
                )}
              </div>

              {/* Accordion 3: CATEGORIES */}
              <div className="py-2">
                <button
                  onClick={() => toggleMobileSection('categories')}
                  className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <span>CATEGORIES</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform text-[#6c6a64] ${
                      expandedMobileSection === 'categories' ? 'rotate-90 text-[#cc785c]' : ''
                    }`}
                  />
                </button>
                {expandedMobileSection === 'categories' && (
                  <div className="pl-4 py-2 space-y-2 text-xs font-medium border-l-2 border-[#cc785c] ml-1 my-1">
                    <Link
                      href="/shop?category=Tees"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Tees & Graphic Tops
                    </Link>
                    <Link
                      href="/shop?category=Gym+Compression"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Gym Compression Performance
                    </Link>
                    <Link
                      href="/shop?category=Joggers"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Lowers & Trousers
                    </Link>
                    <Link
                      href="/shop?category=Shirts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Polos & Collared Shirts
                    </Link>
                    <Link
                      href="/shop?category=Outerwear"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-[#6c6a64] hover:text-[#141413] py-1"
                    >
                      Hoodies & Outerwear
                    </Link>
                  </div>
                )}
              </div>

              {/* Direct Link 4: B2B WHOLESALE */}
              <div className="py-2">
                <Link
                  href="/wholesale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <span>B2B WHOLESALE</span>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#141413] text-[#faf9f5]">
                    MOQ 10+
                  </span>
                </Link>
              </div>

              {/* Direct Link 6: OUR STORY */}
              <div className="py-2">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  OUR STORY
                </Link>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-white border-t border-[#e6e2d8] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <Heart size={14} />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#faf9f5] border border-[#e6e2d8] text-xs font-bold uppercase tracking-wider text-[#141413]"
                >
                  <User size={14} />
                  <span>Account</span>
                </Link>
              </div>

              {/* WhatsApp Assistant Direct Link */}
              <a
                href="https://wa.me/917985232434?text=Hi%20INVEINS%2C%20I%20have%20an%20order%20or%20product%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#15803D] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#166534] transition-colors"
              >
                <Phone size={14} /> Direct WhatsApp Assistant
              </a>

              <div className="flex items-center justify-between text-[11px] text-[#6c6a64] pt-1">
                <span>GST: 09CLWPV7429M2ZO</span>
                <span>Kanpur Studio, UP</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
