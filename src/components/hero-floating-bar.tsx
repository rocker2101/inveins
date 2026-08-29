"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radar, Sparkles, Flame, CheckCircle, ArrowRight, Zap } from "lucide-react";

interface HeroFloatingBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function HeroFloatingBar({ activeTab, onTabChange }: HeroFloatingBarProps) {
  return (
    <div className="w-full flex justify-center pt-6 pb-2 relative z-20">
      <div className="inline-flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl bg-[#11141b]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Brand Icon Pill (W. style from reference image) */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-extrabold text-xs shadow-md">
          <Radar className="h-4 w-4 text-black animate-spin-slow" />
        </div>

        {/* Tab 1: Info */}
        <button
          onClick={() => onTabChange("info")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "info"
              ? "bg-[#F3D053]/15 text-[#F3D053] border border-[#F3D053]/40 shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Info
        </button>

        {/* Tab 2: Live Matches */}
        <button
          onClick={() => onTabChange("matches")}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "matches"
              ? "bg-[#F3D053]/15 text-[#F3D053] border border-[#F3D053]/40 shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Live Matches
        </button>

        {/* Tab 3: Skill Radar */}
        <button
          onClick={() => onTabChange("skills")}
          className={`hidden sm:inline-flex px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "skills"
              ? "bg-[#F3D053]/15 text-[#F3D053] border border-[#F3D053]/40 shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Skill Radar
        </button>

        {/* Tab 4: ATS Crawlers */}
        <button
          onClick={() => onTabChange("ats")}
          className={`hidden md:inline-flex px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "ats"
              ? "bg-[#F3D053]/15 text-[#F3D053] border border-[#F3D053]/40 shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          ATS Feeds
        </button>

        {/* Primary CTA Button (Visit Site style in gold!) */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 ml-1 px-4 py-2 text-xs font-extrabold rounded-xl bg-[#F3D053] text-black hover:bg-[#ffe580] transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Launch Radar</span>
          <ArrowRight className="h-3.5 w-3.5 text-black" />
        </Link>
      </div>
    </div>
  );
}
