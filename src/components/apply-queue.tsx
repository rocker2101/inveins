"use client";

import React from "react";
import { Flame, ExternalLink } from "lucide-react";
import { useJobs } from "@/context/job-context";
import { useUserProfile } from "@/context/user-profile-context";
import { calculateRadarScore } from "@/lib/radar-engine";
import { JobListing } from "@/lib/types";
import { safeOpenApplyUrl } from "@/lib/utils";

interface ApplyQueueProps {
  onSelectJob: (job: JobListing) => void;
}

export function ApplyQueue({ onSelectJob }: ApplyQueueProps) {
  const { jobs } = useJobs();
  const { profile, updateApplicationStatus } = useUserProfile();

  // Filter top 4 highest radar match jobs for apply queue
  const queueJobs = jobs
    .map((j) => ({ job: j, score: calculateRadarScore(j, profile) }))
    .filter(
      (item) =>
        item.job.isFresh &&
        item.job.minLPA >= profile.targetMinSalaryLPA &&
        item.score.compositeRadarScore >= 80
    )
    .sort((a, b) => b.score.compositeRadarScore - a.score.compositeRadarScore)
    .slice(0, 4);

  const handleApply = (e: React.MouseEvent, job: JobListing) => {
    e.stopPropagation();
    updateApplicationStatus(job.id, "applied");
    safeOpenApplyUrl(job.sourceUrl, job.company);
  };

  return (
    <div className="rounded-xl bg-[#efe9de] p-6 relative overflow-hidden border border-[#e6dfd8] shadow-claude space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#cc785c] text-white">
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-normal text-[#141413] flex items-center gap-2">
              Your Daily Apply Queue
              <span className="rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2.5 py-0.5 text-xs font-sans font-medium border border-[#cc785c]/20">
                {queueJobs.length} Priority Roles
              </span>
            </h2>
            <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
              The top opportunities to apply to <strong className="text-[#141413]">TODAY</strong> based on freshness, CTC, and skill overlap.
            </p>
          </div>
        </div>
      </div>

      {/* Queue Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queueJobs.map(({ job, score }) => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="group cursor-pointer rounded-lg bg-[#faf9f5] border border-[#e6dfd8] p-4 shadow-claude transition-all hover:border-[#cc785c]/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#cc785c] inline-block"></span>
                  <span className="font-mono text-xs font-semibold text-[#cc785c]">
                    {score.compositeRadarScore}% Radar Match
                  </span>
                  <span className="text-[10px] text-[#8e8b82] font-sans">• {job.postedAt}</span>
                </div>
                <span className="rounded bg-[#f5f0e8] px-2 py-0.5 text-[9px] font-mono text-[#6c6a64] border border-[#e6dfd8]">
                  {job.source}
                </span>
              </div>

              <h4 className="text-sm font-serif font-medium text-[#141413] group-hover:text-[#cc785c] transition line-clamp-1">
                {job.title}
              </h4>
              <div className="text-xs text-[#6c6a64] font-sans mb-3">
                {job.company} • <span className="text-[#141413] font-mono font-semibold">{job.salaryText}</span>
              </div>

              {/* Skills matched tag */}
              <div className="flex flex-wrap gap-1 mb-3">
                {job.requiredSkills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded bg-[#f5f0e8] px-2 py-0.5 text-[9px] text-[#3d3d3a] font-sans border border-[#e6dfd8]"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#8e8b82] truncate max-w-[150px]">
                {job.experienceRequired}
              </span>
              <button
                onClick={(e) => handleApply(e, job)}
                className="btn-primary text-[11px] py-1 px-3"
              >
                Apply Direct
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
