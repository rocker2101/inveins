"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Copy, X, BellRing, Sparkles } from "lucide-react";
import { INITIAL_JOBS } from "@/data/jobs";
import { calculateRadarScore } from "@/lib/radar-engine";

interface TelegramPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramPreviewModal({ isOpen, onClose }: TelegramPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const sampleJob = INITIAL_JOBS[0];
  const sampleScore = calculateRadarScore(sampleJob);

  if (!isOpen) return null;

  const telegramPayload = `🚨 NEW HIGH RADAR MATCH: ${sampleScore.compositeRadarScore}%
━━━━━━━━━━━━━━━━━━━━
💼 Role: ${sampleJob.title}
🏢 Company: ${sampleJob.company}
📍 Location: ${sampleJob.location} (${sampleJob.workModel})
💰 Salary: ${sampleJob.salaryText}
⏱️ Posted: ${sampleJob.postedAt} (🔥 VERY FRESH)
🏷️ Source: ${sampleJob.source} Direct ATS

🎯 Matched Skills:
${sampleJob.requiredSkills.map((s) => `  ✓ ${s}`).join("\n")}

⚠️ Missing / Learning:
  • Docker (81% frequency in SDE-1 roles)
  • Redis (48% frequency)

💡 AI Recommendation: ${sampleJob.aiRecommendation}
"${sampleJob.aiSummary}"

🔗 Direct ATS Application:
${sampleJob.sourceUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(telegramPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-xl bg-[#faf9f5] border border-[#e6dfd8] p-7 shadow-claude-lg text-[#141413]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-md hover:bg-[#efe9de] text-[#6c6a64]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#cc785c] text-white">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
              Telegram Radar Bot Push Preview
              <span className="rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2 py-0.5 text-[10px] font-sans font-medium">
                Instant Webhook
              </span>
            </h3>
            <p className="text-xs text-[#6c6a64] font-sans">
              Simulation of instant push alerts delivered within seconds of ATS listing creation.
            </p>
          </div>
        </div>

        {/* Telegram Chat Simulation */}
        <div className="rounded-md bg-[#181715] p-4 text-xs font-mono text-[#faf9f5] mb-5 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-[#252320]">
          <div className="text-[11px] text-[#cc785c] font-bold mb-2 flex items-center gap-1.5 font-sans">
            <BellRing className="h-3.5 w-3.5 animate-bounce" />
            @JobRadarAI_Bot [Verified Bot]
          </div>
          {telegramPayload}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#e6dfd8]">
          <div className="text-[11px] text-[#8e8b82] font-sans flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#cc785c]" />
            Configured for 85%+ Match Only
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="btn-secondary text-xs py-2 px-3"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#5db872]" />
                  Copied Text!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Alert Payload
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="btn-primary text-xs py-2 px-4"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
