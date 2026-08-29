"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, ApplicationStatus, ApplicationRecord } from "@/lib/types";
import { DEFAULT_USER_PROFILE } from "@/lib/radar-engine";

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;
  updateApplicationStatus: (jobId: string, status: ApplicationStatus, notes?: string) => void;
  getApplication: (jobId: string) => ApplicationRecord | undefined;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  resetToDefault: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const STORAGE_KEY = "jobradar_user_profile_v1";

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load user profile from storage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {
        console.warn("Could not persist user profile", e);
      }
    }
  }, [profile, isLoaded]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const saveJob = (jobId: string) => {
    setProfile((prev) => {
      if (prev.savedJobIds.includes(jobId)) return prev;
      return { ...prev, savedJobIds: [...prev.savedJobIds, jobId] };
    });
  };

  const unsaveJob = (jobId: string) => {
    setProfile((prev) => ({
      ...prev,
      savedJobIds: prev.savedJobIds.filter((id) => id !== jobId),
    }));
  };

  const isJobSaved = (jobId: string) => {
    return profile.savedJobIds.includes(jobId);
  };

  const updateApplicationStatus = (
    jobId: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    setProfile((prev) => {
      const existingIndex = prev.applications.findIndex((a) => a.jobId === jobId);
      const now = new Date().toISOString();
      const updatedApplications = [...prev.applications];

      if (existingIndex >= 0) {
        updatedApplications[existingIndex] = {
          ...updatedApplications[existingIndex],
          status,
          lastUpdated: now,
          notes: notes ?? updatedApplications[existingIndex].notes,
          appliedDate:
            status === "applied" && !updatedApplications[existingIndex].appliedDate
              ? new Date().toISOString().split("T")[0]
              : updatedApplications[existingIndex].appliedDate,
        };
      } else {
        updatedApplications.push({
          jobId,
          status,
          lastUpdated: now,
          notes: notes || `Moved to ${status}`,
          appliedDate: status === "applied" ? new Date().toISOString().split("T")[0] : undefined,
        });
      }

      return { ...prev, applications: updatedApplications };
    });
  };

  const getApplication = (jobId: string) => {
    return profile.applications.find((a) => a.jobId === jobId);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setProfile((prev) => {
      if (prev.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return prev;
      return {
        ...prev,
        skills: [...prev.skills, trimmed],
        learningSkills: prev.learningSkills.filter(
          (s) => s.toLowerCase() !== trimmed.toLowerCase()
        ),
      };
    });
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.toLowerCase() !== skill.toLowerCase()),
    }));
  };

  const resetToDefault = () => {
    setProfile(DEFAULT_USER_PROFILE);
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        updateProfile,
        saveJob,
        unsaveJob,
        isJobSaved,
        updateApplicationStatus,
        getApplication,
        addSkill,
        removeSkill,
        resetToDefault,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
