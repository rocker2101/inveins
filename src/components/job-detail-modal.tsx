"use client";

import React, { useState } from "react";
import {
  X,
  ExternalLink,
  Building,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { JobListing, ApplicationStatus } from "@/lib/types";
import { RadarScoreBadge } from "./radar-score-badge";
import { calculateRadarScore } from "@/lib/radar-engine";
import { useUserProfile } from "@/context/user-profile-context";
import { getFreshnessLabel, safeOpenApplyUrl } from "@/lib/utils";

interface JobDetailModalProps {
  job: JobListing | null;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const { profile, isJobSaved, saveJob, unsaveJob, updateApplicationStatus, getApplication } =
    useUserProfile();
  const [activeTab, setActiveTab] = useState<"intel" | "description" | "company">("intel");

  if (!job) return null;

  const saved = isJobSaved(job.id);
  const application = getApplication(job.id);
  const scores = calculateRadarScore(job, profile);
  const freshness = getFreshnessLabel(job.postedTimestamp);

  const userSkillsSet = new Set(profile.skills.map((s) => s.toLowerCase()));
  const matchedSkills = job.requiredSkills.filter((s) => userSkillsSet.has(s.toLowerCase()));
  const missingSkills = job.requiredSkills.filter((s) => !userSkillsSet.has(s.toLowerCase()));

  const handleStatusChange = (status: ApplicationStatus) => {
    updateApplicationStatus(job.id, status);
  };

  const handleApplyExternal = () => {
    updateApplicationStatus(job.id, "applied");
    safeOpenApplyUrl(job.sourceUrl, job.company);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-[#faf9f5] shadow-claude-lg overflow-hidden border border-[#e6dfd8] text-[#141413]">
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between border-b border-[#e6dfd8] bg-[#efe9de] px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#141413] text-white text-lg">
              💼
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-medium text-[#141413] line-clamp-1">{job.title}</h2>
                <span className="rounded-full bg-[#cc785c] px-2.5 py-0.5 text-[10px] font-sans font-medium text-white">
                  {freshness.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-sans text-[#6c6a64] mt-0.5">
                <span className="font-medium text-[#141413] flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-[#8e8b82]" />
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#6c6a64]">
                  <MapPin className="h-3.5 w-3.5 text-[#8e8b82]" />
                  {job.location} ({job.workModel})
                </span>
                <span>•</span>
                <span className="font-mono text-[#141413] font-semibold">{job.salaryText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (saved ? unsaveJob(job.id) : saveJob(job.id))}
              className="p-2 rounded-md hover:bg-[#f5f0e8] text-[#6c6a64] hover:text-[#141413] transition"
              title={saved ? "Saved" : "Save Job"}
            >
              {saved ? <BookmarkCheck className="h-5 w-5 text-[#cc785c]" /> : <Bookmark className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-[#f5f0e8] text-[#6c6a64] hover:text-[#141413] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e6dfd8] bg-[#efe9de] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("intel")}
            className={`px-4 py-2 text-xs font-sans font-medium rounded-t-md transition ${
              activeTab === "intel"
                ? "bg-[#faf9f5] text-[#141413] border-t border-x border-[#e6dfd8]"
                : "text-[#6c6a64] hover:text-[#141413]"
            }`}
          >
            🎯 Radar Match & Intel
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`px-4 py-2 text-xs font-sans font-medium rounded-t-md transition ${
              activeTab === "description"
                ? "bg-[#faf9f5] text-[#141413] border-t border-x border-[#e6dfd8]"
                : "text-[#6c6a64] hover:text-[#141413]"
            }`}
          >
            📄 Role Description & Scope
          </button>
          <button
            onClick={() => setActiveTab("company")}
            className={`px-4 py-2 text-xs font-sans font-medium rounded-t-md transition ${
              activeTab === "company"
                ? "bg-[#faf9f5] text-[#141413] border-t border-x border-[#e6dfd8]"
                : "text-[#6c6a64] hover:text-[#141413]"
            }`}
          >
            🏢 Company & Hiring Velocity
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#faf9f5]">
          {activeTab === "intel" && (
            <div className="space-y-6">
              {/* Dual Radar Score Hero Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RadarScoreBadge
                  score={scores.compositeRadarScore}
                  breakdown={scores}
                  size="lg"
                  showSubscores={true}
                />

                {/* Explainable Match Card */}
                <div className="md:col-span-2 rounded-xl bg-[#efe9de] p-5 flex flex-col justify-between border border-[#e6dfd8] shadow-claude">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#cc785c]" />
                        AI Recommendation & Explanation
                      </h4>
                      <span className="rounded-full bg-[#cc785c] px-2.5 py-0.5 text-[10px] font-sans font-medium text-white uppercase">
                        {job.aiRecommendation}
                      </span>
                    </div>
                    <p className="text-xs text-[#3d3d3a] leading-relaxed mb-4 font-sans">
                      {job.aiSummary}
                    </p>

                    {/* Matched vs Missing */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#e6dfd8] text-xs">
                      <div>
                        <div className="text-[11px] font-medium text-[#141413] mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#5db872]" />
                          Matched Skills ({matchedSkills.length}/{job.requiredSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {matchedSkills.map((s) => (
                            <span key={s} className="rounded-md bg-[#faf9f5] px-2.5 py-1 text-[10px] text-[#141413] font-sans border border-[#e6dfd8]">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-medium text-[#6c6a64] mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-[#e8a55a]" />
                          Missing / Learning Skills ({missingSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {missingSkills.length > 0 ? (
                            missingSkills.map((s) => (
                              <span key={s} className="rounded-md bg-[#f5f0e8] px-2.5 py-1 text-[10px] text-[#6c6a64] font-sans border border-[#e6dfd8]">
                                ⚠️ {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#8e8b82] font-sans">All core skills matched!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Signal Detailed Breakdown Table */}
              <div className="rounded-xl bg-[#efe9de] p-5 border border-[#e6dfd8] shadow-claude">
                <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-[#141413] mb-3.5 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#cc785c]" />
                  5-Signal Candidate Fit Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Target Role</div>
                    <div className="text-sm font-mono font-bold text-[#141413] mt-0.5">{scores.roleFit}/25</div>
                    <div className="text-[9px] text-[#6c6a64]">SDE-1 / Grad</div>
                  </div>
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Experience</div>
                    <div className="text-sm font-mono font-bold text-[#141413] mt-0.5">{scores.experienceFit}/20</div>
                    <div className="text-[9px] text-[#6c6a64]">0 YoE (Fresher)</div>
                  </div>
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Skills Overlap</div>
                    <div className="text-sm font-mono font-bold text-[#141413] mt-0.5">{scores.skillFit}/20</div>
                    <div className="text-[9px] text-[#6c6a64]">{matchedSkills.length} Matched</div>
                  </div>
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Salary Target</div>
                    <div className="text-sm font-mono font-bold text-[#141413] mt-0.5">{scores.salaryFit}/15</div>
                    <div className="text-[9px] text-[#6c6a64]">≥ ₹12 LPA</div>
                  </div>
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Location Fit</div>
                    <div className="text-sm font-mono font-bold text-[#141413] mt-0.5">{scores.locationFit}/10</div>
                    <div className="text-[9px] text-[#6c6a64]">{job.location.split(",")[0]}</div>
                  </div>
                  <div className="rounded-md bg-[#faf9f5] p-3 border border-[#e6dfd8]">
                    <div className="text-[9px] font-sans font-medium text-[#8e8b82] uppercase">Freshness</div>
                    <div className="text-sm font-mono font-bold text-[#5db872] mt-0.5">{scores.freshnessScore * 10}%</div>
                    <div className="text-[9px] text-[#6c6a64]">{job.postedAt}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="rounded-xl bg-[#efe9de] p-6 space-y-4 text-xs leading-relaxed text-[#3d3d3a] border border-[#e6dfd8] font-sans">
              <h3 className="text-sm font-serif font-medium text-[#141413]">About the Position</h3>
              <p className="whitespace-pre-wrap">{job.description}</p>

              <div className="pt-4 border-t border-[#e6dfd8]">
                <h4 className="text-xs font-sans font-semibold text-[#141413] mb-2">Required Qualifications</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-[#3d3d3a]">
                  <li>0 to 2 years of software engineering experience or 2025/2026 CS graduate.</li>
                  <li>Hands-on experience building projects with {job.requiredSkills.join(", ")}.</li>
                  <li>Good foundation in Data Structures, Algorithms, and Object-Oriented design.</li>
                  <li>Ability to write clean, maintainable code with unit tests.</li>
                </ul>
              </div>

              {job.preferredSkills.length > 0 && (
                <div className="pt-4 border-t border-[#e6dfd8]">
                  <h4 className="text-xs font-sans font-semibold text-[#141413] mb-2">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map((s) => (
                      <span key={s} className="rounded-md bg-[#faf9f5] px-2.5 py-1 text-[11px] text-[#141413] border border-[#e6dfd8]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "company" && (
            <div className="rounded-xl bg-[#efe9de] p-6 space-y-4 text-xs border border-[#e6dfd8] font-sans">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#141413] text-white text-xl">
                  🏢
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-[#141413]">{job.company}</h3>
                  <p className="text-[#6c6a64]">{job.department} Squad • {job.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-md bg-[#faf9f5] p-3.5 border border-[#e6dfd8]">
                  <div className="text-[10px] font-sans font-medium text-[#8e8b82] uppercase">Hiring Velocity</div>
                  <div className="text-sm font-semibold text-[#141413] mt-0.5">{job.hiringVelocity}</div>
                </div>
                <div className="rounded-md bg-[#faf9f5] p-3.5 border border-[#e6dfd8]">
                  <div className="text-[10px] font-sans font-medium text-[#8e8b82] uppercase">ATS Source</div>
                  <div className="text-sm font-semibold text-[#141413] mt-0.5">{job.source} Verified</div>
                </div>
                <div className="rounded-md bg-[#faf9f5] p-3.5 border border-[#e6dfd8]">
                  <div className="text-[10px] font-sans font-medium text-[#8e8b82] uppercase">Work Model</div>
                  <div className="text-sm font-semibold text-[#141413] mt-0.5">{job.workModel}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="border-t border-[#e6dfd8] bg-[#efe9de] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Pipeline Stage Quick Move */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#6c6a64] font-medium">Move Stage:</span>
            {(["apply_now", "shortlisted", "applied", "oa", "technical", "offer"] as ApplicationStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`rounded-md px-3 py-1.5 text-[10px] font-sans font-medium uppercase transition ${
                  application?.status === st
                    ? "bg-[#cc785c] text-white"
                    : "bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] hover:bg-[#f5f0e8]"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleApplyExternal}
            className="btn-primary text-xs py-2.5 px-5 w-full sm:w-auto"
          >
            <span>Apply on {job.source} ATS</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
