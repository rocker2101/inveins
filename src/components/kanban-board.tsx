"use client";

import React from "react";
import { ApplicationStatus, JobListing } from "@/lib/types";
import { useUserProfile } from "@/context/user-profile-context";
import { useJobs } from "@/context/job-context";
import { calculateRadarScore } from "@/lib/radar-engine";

const STAGES: { id: ApplicationStatus; title: string }[] = [
  { id: "discovered", title: "Discovered" },
  { id: "shortlisted", title: "Shortlisted" },
  { id: "apply_now", title: "Apply Queue" },
  { id: "applied", title: "Applied" },
  { id: "oa", title: "OA (Online Test)" },
  { id: "technical", title: "Technical Round" },
  { id: "hr", title: "HR / Manager" },
  { id: "offer", title: "Offer Extended 🎉" },
];

export function KanbanBoard({ onSelectJob }: { onSelectJob: (job: JobListing) => void }) {
  const { profile, updateApplicationStatus } = useUserProfile();
  const { jobs } = useJobs();

  const getJobsByStage = (stage: ApplicationStatus) => {
    return profile.applications
      .filter((a) => a.status === stage)
      .map((a) => {
        const job = jobs.find((j) => j.id === a.jobId);
        return {
          app: a,
          job: job || ({
            id: a.jobId,
            title: "Custom Opportunity",
            company: "External Tech Firm",
            companySlug: "custom",
            location: "Bangalore",
            workModel: "Hybrid",
            experienceRequired: "0-2 yrs",
            minYoE: 0,
            maxYoE: 2,
            salaryText: "₹14 - ₹20 LPA",
            minLPA: 14,
            maxLPA: 20,
            postedAt: "Recently",
            postedTimestamp: Date.now(),
            source: "Direct Careers",
            sourceUrl: "https://razorpay.com/jobs/",
            requiredSkills: ["React", "Node.js"],
            preferredSkills: [],
            description: "Application tracking item",
            aiRecommendation: "APPLY NOW",
            aiSummary: "Tracked application",
            matchScore: 90,
            opportunityScore: 90,
            hiringVelocity: "High",
            isFresh: true,
            department: "Engineering",
          } as JobListing),
        };
      });
  };

  const handleMoveStage = (jobId: string, nextStatus: ApplicationStatus) => {
    updateApplicationStatus(jobId, nextStatus);
  };

  return (
    <div className="w-full space-y-4">
      {/* Horizontal scroll container for Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
        {STAGES.map((stage) => {
          const items = getJobsByStage(stage.id);
          return (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72 rounded-xl bg-[#efe9de] flex flex-col max-h-[75vh] border border-[#e6dfd8] shadow-claude"
            >
              {/* Stage Column Header */}
              <div className="p-3.5 border-b border-[#e6dfd8] flex items-center justify-between bg-[#f5f0e8] rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-medium text-[#141413]">{stage.title}</span>
                  <span className="rounded-full bg-[#cc785c]/10 text-[#cc785c] px-2 py-0.5 text-[10px] font-mono font-bold">
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[140px]">
                {items.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-[#e6dfd8] rounded-md text-[11px] text-[#8e8b82] text-center p-3 font-sans">
                    No jobs in {stage.title}
                  </div>
                ) : (
                  items.map(({ job, app }) => {
                    const score = calculateRadarScore(job, profile);
                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="group cursor-pointer rounded-md bg-[#faf9f5] p-3.5 border border-[#e6dfd8] transition flex flex-col justify-between hover:border-[#cc785c]/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-[#cc785c]">
                            {score.compositeRadarScore}% Match
                          </span>
                          <span className="text-[9px] text-[#8e8b82] font-mono">
                            {job.source}
                          </span>
                        </div>

                        <h5 className="text-xs font-serif font-medium text-[#141413] group-hover:text-[#cc785c] line-clamp-1">
                          {job.title}
                        </h5>

                        <div className="text-[11px] text-[#6c6a64] font-sans mb-2 flex items-center justify-between">
                          <span>{job.company}</span>
                          <span className="text-[#141413] font-mono text-[10px] font-bold">{job.salaryText}</span>
                        </div>

                        {app.notes && (
                          <p className="text-[10px] text-[#3d3d3a] bg-[#f5f0e8] rounded p-2 mb-2 line-clamp-2 leading-tight font-sans">
                            📝 {app.notes}
                          </p>
                        )}

                        {/* Quick stage advance selector */}
                        <div className="pt-2 border-t border-[#e6dfd8] flex items-center justify-between gap-1 text-[10px]">
                          <span className="text-[#8e8b82] font-sans font-medium">Move:</span>
                          <select
                            value={stage.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleMoveStage(job.id, e.target.value as ApplicationStatus)}
                            className="rounded bg-[#faf9f5] px-2 py-1 text-[10px] text-[#141413] font-sans font-medium focus:outline-none border border-[#e6dfd8]"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#faf9f5] text-[#141413]">
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
