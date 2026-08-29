"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Briefcase,
  Building2,
  Layers,
  Sparkles,
  BookOpen,
  Menu,
  X,
  Send,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { useUserProfile } from "@/context/user-profile-context";
import { useJobs } from "@/context/job-context";
import { TelegramPreviewModal } from "./telegram-preview-modal";
import { SheetsExportModal } from "./sheets-export-modal";

export function Navbar() {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  const { stats } = useJobs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [sheetsOpen, setSheetsOpen] = useState(false);

  const applyQueueCount = profile.applications.filter((a) => a.status === "apply_now").length;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", badge: applyQueueCount > 0 ? `${applyQueueCount} Today` : undefined },
    { href: "/jobs", label: "Find Jobs" },
    { href: "/applications", label: "Tracker", count: profile.applications.length },
    { href: "/companies", label: "Companies" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      {/* Claude Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#faf9f5]/90 backdrop-blur-md border-b border-[#e6dfd8] transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo with Anthropic Asterisk Glyph */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#141413] text-white font-mono text-sm font-bold shadow-sm group-hover:bg-[#cc785c] transition-colors">
                {/* 4-Spoke Radial Spike Mark (Anthropic Mark) */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z" fill="currentColor" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-serif font-medium tracking-tight text-[#141413]">
                  JobRadar
                </span>
                <span className="rounded-full bg-[#efe9de] px-2 py-0.5 text-[11px] font-sans font-medium text-[#6c6a64] border border-[#e6dfd8]">
                  AI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-sans font-medium rounded-md transition-all ${
                      isActive
                        ? "bg-[#efe9de] text-[#141413]"
                        : "text-[#6c6a64] hover:text-[#141413] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-[#cc785c] px-1.5 py-0.2 text-[10px] font-sans font-medium text-white">
                        {link.badge}
                      </span>
                    )}
                    {link.count !== undefined && link.count > 0 && (
                      <span className="text-[11px] font-mono text-[#8e8b82]">
                        ({link.count})
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools & Coral Primary CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTelegramOpen(true)}
              title="Telegram Alerts"
              className="hidden sm:flex items-center gap-1.5 text-xs font-sans font-medium text-[#6c6a64] hover:text-[#141413] px-2.5 py-1.5 rounded-md hover:bg-[#f5f0e8] transition"
            >
              <Send className="h-3.5 w-3.5 text-[#cc785c]" />
              <span className="hidden md:inline">Telegram Alerts</span>
            </button>

            <button
              onClick={() => setSheetsOpen(true)}
              title="Export Sheets"
              className="hidden sm:flex items-center gap-1.5 text-xs font-sans font-medium text-[#6c6a64] hover:text-[#141413] px-2.5 py-1.5 rounded-md hover:bg-[#f5f0e8] transition"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#6c6a64]" />
              <span className="hidden md:inline">Sheets Sync</span>
            </button>

            {/* Signature Anthropic Coral Primary CTA */}
            <Link
              href="/dashboard"
              className="btn-primary flex items-center gap-1.5 text-xs font-medium px-4 py-2"
            >
              <span>Try JobRadar</span>
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </Link>

            {/* User Profile avatar */}
            <Link
              href="/profile"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-[#efe9de] text-[#141413] font-mono text-xs font-semibold border border-[#e6dfd8] hover:border-[#cc785c] transition"
              title={profile.name}
            >
              RS
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden items-center justify-center p-2 rounded-md text-[#6c6a64] hover:text-[#141413]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#e6dfd8] bg-[#faf9f5] px-4 pt-3 pb-6 space-y-2">
            <div className="mb-3 rounded-lg bg-[#efe9de] p-3 flex items-center justify-between border border-[#e6dfd8]">
              <div>
                <div className="text-xs font-sans font-semibold text-[#141413]">{profile.name}</div>
                <div className="text-[11px] text-[#6c6a64]">{profile.targetRole}</div>
              </div>
              <span className="rounded-full bg-[#cc785c] px-2.5 py-0.5 text-[10px] font-sans font-medium text-white">
                {stats.highMatchCount} Matches
              </span>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-sans font-medium rounded-md transition ${
                  pathname === link.href
                    ? "bg-[#efe9de] text-[#141413]"
                    : "text-[#6c6a64] hover:bg-[#f5f0e8] hover:text-[#141413]"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="rounded-full bg-[#cc785c] px-2 py-0.5 text-[10px] font-sans font-medium text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-[#e6dfd8] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTelegramOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-md bg-[#efe9de] py-2 text-xs font-medium text-[#141413]"
              >
                <Send className="h-3.5 w-3.5 text-[#cc785c]" />
                Telegram Alert
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSheetsOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-md bg-[#efe9de] py-2 text-xs font-medium text-[#141413]"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#6c6a64]" />
                Sheets Sync
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <TelegramPreviewModal isOpen={telegramOpen} onClose={() => setTelegramOpen(false)} />
      <SheetsExportModal isOpen={sheetsOpen} onClose={() => setSheetsOpen(false)} />
    </>
  );
}
