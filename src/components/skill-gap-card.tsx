"use client";

import React from "react";
import { TrendingUp, CheckCircle, Plus, ExternalLink } from "lucide-react";
import { useJobs } from "@/context/job-context";
import { useUserProfile } from "@/context/user-profile-context";
import { generateSkillGapAnalysis } from "@/lib/radar-engine";

export function SkillGapCard() {
  const { jobs } = useJobs();
  const { profile, addSkill } = useUserProfile();

  const skillGaps = generateSkillGapAnalysis(jobs, profile);

  return (
    <div className="rounded-xl bg-[#efe9de] p-6 border border-[#e6dfd8] shadow-claude space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#141413] text-white">
            <TrendingUp className="h-4 w-4 text-[#cc785c]" />
          </div>
          <div>
            <h3 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
              Skill Gap Intelligence & Learning Loop
              <span className="rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2.5 py-0.5 text-[10px] font-sans font-medium border border-[#cc785c]/20">
                ₹12–25 LPA Roles
              </span>
            </h3>
            <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
              Skills appearing most frequently in your target high-paying SDE-1 opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#e6dfd8]">
        {skillGaps.slice(0, 7).map((item) => (
          <div key={item.skill} className="py-3 flex items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2.5 min-w-[140px]">
              <span className="font-semibold text-[#141413]">{item.skill}</span>
              <span className="font-mono text-[10px] text-[#8e8b82]">
                {item.frequency}% of jobs
              </span>
            </div>

            {/* Frequency bar */}
            <div className="hidden sm:block flex-1 max-w-xs">
              <div className="h-2 w-full rounded-full bg-[#faf9f5] border border-[#e6dfd8] overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full ${
                    item.userStatus === "Strong"
                      ? "bg-[#cc785c]"
                      : item.userStatus === "Learning"
                      ? "bg-[#e8a55a]"
                      : "bg-[#8e8b82]"
                  }`}
                  style={{ width: `${item.frequency}%` }}
                ></div>
              </div>
            </div>

            {/* Status & Action */}
            <div className="flex items-center gap-2">
              {item.userStatus === "Strong" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#5db872]/15 text-[#2e6b3e] px-2.5 py-0.5 text-[10px] font-medium border border-[#5db872]/30">
                  <CheckCircle className="h-3 w-3 text-[#5db872]" /> Strong
                </span>
              ) : item.userStatus === "Learning" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f0e8] text-[#6c6a64] px-2.5 py-0.5 text-[10px] font-medium border border-[#e6dfd8]">
                  ⏳ Learning
                </span>
              ) : (
                <button
                  onClick={() => addSkill(item.skill)}
                  className="inline-flex items-center gap-1 rounded-md bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] px-2.5 py-1 text-[10px] font-medium hover:border-[#cc785c] transition"
                  title="Mark as learned to boost Radar Score"
                >
                  <Plus className="h-3 w-3 text-[#cc785c]" /> + Add to Profile
                </button>
              )}

              {item.learningResourceUrl && (
                <a
                  href={item.learningResourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8e8b82] hover:text-[#141413] p-1"
                  title="View learning roadmap"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
