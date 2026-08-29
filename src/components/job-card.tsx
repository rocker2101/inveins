"use client";

import React from "react";
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { JobListing } from "@/lib/types";
import { RadarScoreBadge } from "./radar-score-badge";
import { calculateRadarScore } from "@/lib/radar-engine";
import { useUserProfile } from "@/context/user-profile-context";
import { getFreshnessLabel, safeOpenApplyUrl } from "@/lib/utils";

interface JobCardProps {
  job: JobListing;
  onSelectJob: (job: JobListing) => void;
  compact?: boolean;
}

export function JobCard({ job, onSelectJob, compact = false }: JobCardProps) {
  const { profile, isJobSaved, saveJob, unsaveJob, updateApplicationStatus, getApplication } =
    useUserProfile();
  const saved = isJobSaved(job.id);
  const application = getApplication(job.id);
  const scores = calculateRadarScore(job, profile);
  const freshness = getFreshnessLabel(job.postedTimestamp);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      unsaveJob(job.id);
    } else {
      saveJob(job.id);
    }
  };

  const handleQuickApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateApplicationStatus(job.id, "applied");
    safeOpenApplyUrl(job.sourceUrl, job.company);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateApplicationStatus(job.id, "apply_now");
  };

  const userSkillsSet = new Set(profile.skills.map((s) => s.toLowerCase()));

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="group relative cursor-pointer rounded-xl bg-[#efe9de] border border-[#e6dfd8] p-5 shadow-claude transition-all duration-200 hover:-translate-y-1 hover:shadow-claude-lg hover:border-[#cc785c]/40 flex flex-col justify-between"
    >
      <div>
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#cc785c] px-2.5 py-0.5 text-[10px] font-sans font-medium text-white">
              {freshness.label}
            </span>
            <span className="rounded-full bg-[#f5f0e8] px-2 py-0.5 text-[10px] font-mono text-[#6c6a64] border border-[#e6dfd8]">
              {job.source}
            </span>
            {job.hiringVelocity === "Very High" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8a55a]/20 text-[#252523] px-2 py-0.5 text-[10px] font-sans font-medium border border-[#e8a55a]/30">
                <TrendingUp className="h-3 w-3 text-[#cc785c]" /> High Velocity
              </span>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleToggleSave}
            className="p-1.5 rounded-md hover:bg-[#f5f0e8] text-[#6c6a64] hover:text-[#141413] transition"
            title={saved ? "Saved" : "Save Job"}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-[#cc785c]" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Title, Company & Score */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div>
            <h3 className="text-base font-serif font-medium text-[#141413] group-hover:text-[#cc785c] transition line-clamp-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-xs font-sans text-[#6c6a64] mt-1">
              <span className="font-medium text-[#141413] flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-[#8e8b82]" />
                {job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#6c6a64]">
                <MapPin className="h-3.5 w-3.5 text-[#8e8b82]" />
                {job.location}
              </span>
            </div>
          </div>

          <RadarScoreBadge score={scores.compositeRadarScore} size="md" />
        </div>

        {/* Salary & YoE Bracket */}
        <div className="flex items-center justify-between rounded-md bg-[#faf9f5] border border-[#e6dfd8] px-3.5 py-2 text-xs mb-3.5 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8e8b82] font-sans text-[11px]">Salary:</span>
            <span className="font-semibold text-[#141413]">{job.salaryText}</span>
          </div>
          <div className="text-[#6c6a64] font-medium text-[11px]">
            {job.experienceRequired}
          </div>
        </div>

        {/* Skill Matching Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {job.requiredSkills.map((skill) => {
            const hasSkill = userSkillsSet.has(skill.toLowerCase());
            return (
              <span
                key={skill}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-sans transition ${
                  hasSkill
                    ? "bg-[#faf9f5] text-[#141413] border border-[#cc785c]/40 font-medium"
                    : "bg-[#f5f0e8] text-[#8e8b82] border border-[#e6dfd8]"
                }`}
              >
                {hasSkill && <span className="text-[#cc785c]">✓</span>} {skill}
              </span>
            );
          })}
        </div>

        {/* AI Recommendation Snippet */}
        <div className="rounded-md bg-[#faf9f5] border border-[#e6dfd8] p-3 text-[11px] text-[#3d3d3a] mb-3.5 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#cc785c] shrink-0 mt-0.5" />
          <p className="line-clamp-2 leading-relaxed font-sans">
            <strong className="text-[#141413] font-medium">{job.aiRecommendation}: </strong>
            {job.aiSummary}
          </p>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-[#8e8b82] font-sans">
          <Clock className="h-3 w-3" />
          <span>{job.postedAt}</span>
          {application && (
            <span className="ml-1 rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2 py-0.5 text-[9px] font-medium uppercase border border-[#cc785c]/20">
              {application.status.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {application?.status !== "apply_now" && application?.status !== "applied" && (
            <button
              onClick={handleAddToQueue}
              className="btn-secondary text-[11px] py-1 px-2.5"
            >
              + Queue
            </button>
          )}

          <button
            onClick={handleQuickApply}
            className="btn-primary text-[11px] py-1 px-3"
          >
            Apply Direct
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
