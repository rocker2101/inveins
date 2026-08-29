"use client";

import React from "react";
import { RadarScoreBreakdown } from "@/lib/types";

interface RadarScoreBadgeProps {
  score: number;
  breakdown?: RadarScoreBreakdown;
  size?: "sm" | "md" | "lg";
  showSubscores?: boolean;
}

export function RadarScoreBadge({
  score,
  breakdown,
  size = "md",
  showSubscores = false,
}: RadarScoreBadgeProps) {
  if (size === "sm") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2 py-0.5 border border-[#cc785c]/20">
        <span className="font-mono font-bold text-xs">{score}%</span>
        <span className="text-[9px] uppercase font-sans font-medium text-[#6c6a64]">Match</span>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className="rounded-xl bg-[#efe9de] p-5 text-center relative overflow-hidden border border-[#e6dfd8] shadow-claude">
        <div className="text-[10px] font-mono tracking-widest text-[#8e8b82] uppercase mb-1">
          RADAR SCORE
        </div>
        <div className="text-4xl font-serif font-normal text-[#141413] mb-1">
          {score}
          <span className="text-xl text-[#8e8b82] font-sans font-normal">/100</span>
        </div>
        <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#cc785c] text-xs font-sans font-medium text-white">
          ★ HIGH FIT OPPORTUNITY
        </div>

        {showSubscores && breakdown && (
          <div className="mt-4 pt-3 border-t border-[#e6dfd8] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-md bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Candidate Fit</div>
              <div className="font-mono font-bold text-[#141413] mt-0.5">{breakdown.totalFitScore}%</div>
            </div>
            <div className="p-2 rounded-md bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Opportunity</div>
              <div className="font-mono font-bold text-[#cc785c] mt-0.5">{breakdown.opportunityScore}%</div>
            </div>
            <div className="p-2 rounded-md bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Freshness</div>
              <div className="font-mono font-bold text-[#5db872] mt-0.5">{breakdown.freshnessScore * 10}%</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Medium (Default)
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-[#cc785c]/10 p-2 min-w-[54px] border border-[#cc785c]/20">
      <span className="text-[8px] font-mono font-semibold tracking-wider text-[#cc785c] uppercase">
        RADAR
      </span>
      <span className="text-base font-serif font-bold text-[#141413] leading-tight">
        {score}
      </span>
    </div>
  );
}
