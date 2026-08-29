"use client";

import React, { useState } from "react";
import { Terminal, ShieldCheck, Flame, Check, ArrowRight, Play, Copy } from "lucide-react";

export function ClaudeCodeWindow() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl bg-[#181715] border border-[#252320] shadow-claude-lg p-5 sm:p-6 text-[#faf9f5] space-y-4 font-mono text-xs overflow-hidden">
      {/* Code Window Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#252320]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#cc785c]/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#e8a55a]/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#5db872]/80 inline-block" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-[#a09d96] flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-[#cc785c]" />
            jobradar-agent --evaluate --target=Razorpay-SDE1
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="text-[#8e8b82] hover:text-[#faf9f5] transition flex items-center gap-1 text-[10px]"
        >
          {copied ? <Check className="h-3 w-3 text-[#5db872]" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Interactive Code / Execution Stream */}
      <div className="space-y-2 text-[12px] leading-relaxed">
        <div className="text-[#8e8b82] flex items-center justify-between">
          <span>// 1. Live ATS Feed Ingestion</span>
          <span className="text-[#5db872]">✓ Greenhouse API connected</span>
        </div>

        <div className="bg-[#1f1e1b] rounded-md p-3 font-mono text-[11px] space-y-1 text-[#e8e0d2]">
          <div><span className="text-[#cc785c]">const</span> <span className="text-[#5db8a6]">candidateProfile</span> = &#123;</div>
          <div className="pl-4 text-[#a09d96]">role: <span className="text-[#e8a55a]">"SDE-1"</span>, exp: <span className="text-[#5db8a6]">0 YoE</span>,</div>
          <div className="pl-4 text-[#a09d96]">stack: [<span className="text-[#e8a55a]">"React"</span>, <span className="text-[#e8a55a]">"Node.js"</span>, <span className="text-[#e8a55a]">"TypeScript"</span>, <span className="text-[#e8a55a]">"DSA"</span>],</div>
          <div className="pl-4 text-[#a09d96]">minSalary: <span className="text-[#5db8a6]">"₹12 LPA"</span></div>
          <div>&#125;;</div>
        </div>

        {/* Output Calculation Result */}
        <div className="pt-2 space-y-2 border-t border-[#252320]">
          <div className="flex items-center justify-between">
            <span className="text-[#5db8a6] font-semibold">★ Composite Radar Match:</span>
            <span className="bg-[#cc785c] text-white font-bold px-2 py-0.5 rounded text-[11px]">
              98 / 100
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-[#1f1e1b] p-2 rounded border border-[#252320]">
              <div className="text-[#8e8b82]">Role Fit</div>
              <div className="text-[#faf9f5] font-bold mt-0.5">25 / 25</div>
            </div>
            <div className="bg-[#1f1e1b] p-2 rounded border border-[#252320]">
              <div className="text-[#8e8b82]">Skill Match</div>
              <div className="text-[#faf9f5] font-bold mt-0.5">20 / 20</div>
            </div>
            <div className="bg-[#1f1e1b] p-2 rounded border border-[#252320]">
              <div className="text-[#8e8b82]">Freshness</div>
              <div className="text-[#5db872] font-bold mt-0.5">14m ago</div>
            </div>
          </div>
        </div>

        {/* Action Suggestion Line */}
        <div className="pt-2 text-[11px] text-[#a09d96] flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#faf9f5]">
            <span className="h-2 w-2 rounded-full bg-[#5db872] animate-pulse" />
            Recommendation: Submit Direct ATS Application
          </span>
          <span className="text-[#cc785c] font-bold">Priority #1</span>
        </div>
      </div>
    </div>
  );
}
