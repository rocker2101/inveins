"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { JobListing, WorkModel } from "@/lib/types";
import { INITIAL_JOBS } from "@/data/jobs";
import { calculateRadarScore } from "@/lib/radar-engine";
import { useUserProfile } from "./user-profile-context";

interface FilterState {
  searchQuery: string;
  roleFilter: string;
  locationFilter: string;
  workModelFilter: WorkModel | "All";
  minSalaryLPA: number;
  minMatchScore: number;
  freshOnly: boolean;
  selectedSkill: string;
  sourceFilter: string;
  sortBy: "radarScore" | "freshest" | "salaryHigh" | "opportunityScore";
}

interface JobContextType {
  jobs: JobListing[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredJobs: JobListing[];
  selectedJob: JobListing | null;
  setSelectedJob: (job: JobListing | null) => void;
  resetFilters: () => void;
  stats: {
    totalJobs: number;
    highMatchCount: number;
    freshCount: number;
    topSalaryCount: number;
  };
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: "",
  roleFilter: "All",
  locationFilter: "All",
  workModelFilter: "All",
  minSalaryLPA: 10,
  minMatchScore: 0,
  freshOnly: false,
  selectedSkill: "All",
  sourceFilter: "All",
  sortBy: "radarScore",
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs] = useState<JobListing[]>(INITIAL_JOBS);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const { profile } = useUserProfile();

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Recalculate dynamic scores based on profile and apply filtering/sorting
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const scores = calculateRadarScore(job, profile);

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkills = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
          const matchLoc = job.location.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchSkills && !matchLoc) {
            return false;
          }
        }

        // Role filter
        if (filters.roleFilter !== "All") {
          if (!job.title.toLowerCase().includes(filters.roleFilter.toLowerCase())) {
            return false;
          }
        }

        // Location filter
        if (filters.locationFilter !== "All") {
          if (filters.locationFilter === "Remote") {
            if (job.workModel !== "Remote") return false;
          } else if (!job.location.toLowerCase().includes(filters.locationFilter.toLowerCase())) {
            return false;
          }
        }

        // Work Model
        if (filters.workModelFilter !== "All") {
          if (job.workModel !== filters.workModelFilter) return false;
        }

        // Salary
        if (job.maxLPA < filters.minSalaryLPA) {
          return false;
        }

        // Min Match Score
        if (scores.compositeRadarScore < filters.minMatchScore) {
          return false;
        }

        // Fresh only
        if (filters.freshOnly && !job.isFresh) {
          return false;
        }

        // Skill filter
        if (filters.selectedSkill !== "All") {
          const hasSkill = [...job.requiredSkills, ...job.preferredSkills].some(
            (s) => s.toLowerCase() === filters.selectedSkill.toLowerCase()
          );
          if (!hasSkill) return false;
        }

        // Source filter
        if (filters.sourceFilter !== "All") {
          if (job.source !== filters.sourceFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const scoreA = calculateRadarScore(a, profile);
        const scoreB = calculateRadarScore(b, profile);

        if (filters.sortBy === "radarScore") {
          return scoreB.compositeRadarScore - scoreA.compositeRadarScore;
        }
        if (filters.sortBy === "freshest") {
          return b.postedTimestamp - a.postedTimestamp;
        }
        if (filters.sortBy === "salaryHigh") {
          return b.maxLPA - a.maxLPA;
        }
        if (filters.sortBy === "opportunityScore") {
          return scoreB.opportunityScore - scoreA.opportunityScore;
        }
        return 0;
      });
  }, [jobs, filters, profile]);

  const stats = useMemo(() => {
    const highMatch = jobs.filter(
      (j) => calculateRadarScore(j, profile).compositeRadarScore >= 90
    ).length;
    const fresh = jobs.filter((j) => j.isFresh).length;
    const topSalary = jobs.filter((j) => j.maxLPA >= 18).length;

    return {
      totalJobs: jobs.length,
      highMatchCount: highMatch,
      freshCount: fresh,
      topSalaryCount: topSalary,
    };
  }, [jobs, profile]);

  return (
    <JobContext.Provider
      value={{
        jobs,
        filters,
        setFilters,
        filteredJobs,
        selectedJob,
        setSelectedJob,
        resetFilters,
        stats,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
}
