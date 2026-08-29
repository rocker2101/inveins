import { JobListing, RadarScoreBreakdown, UserProfile, SkillGapItem } from "./types";

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Rohan Sharma",
  email: "rohan.sharma@example.com",
  targetRole: "Software Engineer / SDE I",
  experienceYears: 0, // Fresher
  targetMinSalaryLPA: 12,
  preferredLocations: ["Bangalore", "Hyderabad", "Pune", "Remote", "Gurgaon"],
  preferredWorkModel: ["Remote", "Hybrid", "In-office"],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "PostgreSQL",
    "MongoDB",
    "Prisma",
    "REST APIs",
    "Git",
    "DSA",
  ],
  learningSkills: ["Docker", "Redis"],
  savedJobIds: ["job-1", "job-3", "job-5"],
  applications: [
    {
      jobId: "job-1",
      status: "apply_now",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      notes: "Top match! High freshness, need to emphasize React and Node.js projects.",
    },
    {
      jobId: "job-2",
      status: "oa",
      appliedDate: "2026-08-20",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      notes: "HackerRank OA link received. 3 DSA problems scheduled for Saturday.",
      oaDate: "2026-08-29",
    },
    {
      jobId: "job-4",
      status: "technical",
      appliedDate: "2026-08-15",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      notes: "Cleared Round 1 System Design basics. Round 2 Live Coding next Tuesday.",
      interviewDate: "2026-09-01",
    },
    {
      jobId: "job-7",
      status: "offer",
      appliedDate: "2026-08-01",
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      notes: "Received offer letter! Base ₹14 LPA + ₹2L retention bonus.",
    },
  ],
  telegramConnected: true,
  telegramChatId: "@rohan_cs_2026",
  emailDigestEnabled: true,
  minMatchScoreAlert: 85,
};

export function calculateRadarScore(
  job: JobListing,
  profile: UserProfile = DEFAULT_USER_PROFILE
): RadarScoreBreakdown {
  // 1. Role Match (Max 25)
  let roleFit = 25;
  const lowerTitle = job.title.toLowerCase();
  const lowerTarget = profile.targetRole.toLowerCase();
  if (
    lowerTitle.includes("senior") ||
    lowerTitle.includes("staff") ||
    lowerTitle.includes("lead") ||
    lowerTitle.includes("principal") ||
    lowerTitle.includes("manager")
  ) {
    roleFit = 8;
  } else if (
    lowerTitle.includes("sde i") ||
    lowerTitle.includes("sde 1") ||
    lowerTitle.includes("software engineer i") ||
    lowerTitle.includes("junior") ||
    lowerTitle.includes("associate") ||
    lowerTitle.includes("graduate") ||
    lowerTitle.includes("fresher")
  ) {
    roleFit = 25;
  } else if (
    lowerTitle.includes("software engineer") ||
    lowerTitle.includes("full stack") ||
    lowerTitle.includes("backend") ||
    lowerTitle.includes("frontend")
  ) {
    roleFit = 23;
  }

  // 2. Experience Fit (Max 20)
  let experienceFit = 20;
  if (profile.experienceYears >= job.minYoE && profile.experienceYears <= job.maxYoE) {
    experienceFit = 20;
  } else if (job.minYoE <= 1 && profile.experienceYears === 0) {
    experienceFit = 18;
  } else if (job.minYoE > profile.experienceYears) {
    const diff = job.minYoE - profile.experienceYears;
    experienceFit = Math.max(5, 20 - diff * 8);
  }

  // 3. Skills Fit (Max 20)
  const reqSkills = job.requiredSkills;
  const userSkillsSet = new Set(profile.skills.map((s) => s.toLowerCase()));
  const matchedReq = reqSkills.filter((s) => userSkillsSet.has(s.toLowerCase()));
  const skillRatio = reqSkills.length > 0 ? matchedReq.length / reqSkills.length : 1;
  const skillFit = Math.round(skillRatio * 20);

  // 4. Salary Fit (Max 15)
  let salaryFit = 15;
  if (job.maxLPA >= profile.targetMinSalaryLPA) {
    if (job.minLPA >= profile.targetMinSalaryLPA) {
      salaryFit = 15;
    } else {
      salaryFit = 13;
    }
  } else {
    salaryFit = Math.max(4, Math.round((job.maxLPA / profile.targetMinSalaryLPA) * 15));
  }

  // 5. Location Fit (Max 10)
  let locationFit = 5;
  const jobLoc = job.location.toLowerCase();
  const matchedLoc = profile.preferredLocations.some((loc) =>
    jobLoc.includes(loc.toLowerCase())
  );
  if (job.workModel === "Remote" || matchedLoc) {
    locationFit = 10;
  } else {
    locationFit = 6;
  }

  // 6. Freshness Score (Max 10)
  const hoursOld = (Date.now() - job.postedTimestamp) / (1000 * 60 * 60);
  let freshnessScore = 10;
  if (hoursOld <= 2) freshnessScore = 10;
  else if (hoursOld <= 12) freshnessScore = 9;
  else if (hoursOld <= 24) freshnessScore = 8;
  else if (hoursOld <= 48) freshnessScore = 6;
  else if (hoursOld <= 96) freshnessScore = 4;
  else freshnessScore = 2;

  // Fit score (Max 100)
  const totalFitScore = Math.min(
    100,
    roleFit + experienceFit + skillFit + salaryFit + locationFit + (freshnessScore >= 8 ? 0 : 0)
  );

  // Opportunity Score (Quality signals: Source reliability, Hiring velocity, Role clarity, Salary transparency)
  let opportunityScore = 88;
  if (job.source === "Greenhouse" || job.source === "Ashby" || job.source === "Lever") {
    opportunityScore += 4;
  }
  if (job.hiringVelocity === "Very High") opportunityScore += 5;
  if (job.maxLPA >= 18) opportunityScore += 3;
  opportunityScore = Math.min(99, Math.max(70, opportunityScore));

  // Composite Radar Score (Weighted: Fit 55% + Opportunity 30% + Freshness 15%)
  const compositeRadarScore = Math.round(
    totalFitScore * 0.55 + opportunityScore * 0.3 + (freshnessScore * 10) * 0.15
  );

  return {
    roleFit,
    experienceFit,
    skillFit,
    salaryFit,
    locationFit,
    freshnessScore,
    totalFitScore,
    opportunityScore,
    compositeRadarScore,
  };
}

export function generateSkillGapAnalysis(
  jobs: JobListing[],
  profile: UserProfile = DEFAULT_USER_PROFILE
): SkillGapItem[] {
  const skillCount: Record<string, number> = {};
  const highTierJobs = jobs.filter((j) => j.maxLPA >= 12);

  highTierJobs.forEach((job) => {
    [...job.requiredSkills, ...job.preferredSkills].forEach((skill) => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  const userSkillsSet = new Set(profile.skills.map((s) => s.toLowerCase()));
  const learningSkillsSet = new Set(profile.learningSkills.map((s) => s.toLowerCase()));

  const total = highTierJobs.length || 1;

  const result: SkillGapItem[] = Object.entries(skillCount)
    .map(([skill, count]) => {
      const lower = skill.toLowerCase();
      let userStatus: "Strong" | "Learning" | "Missing" = "Missing";
      if (userSkillsSet.has(lower)) {
        userStatus = "Strong";
      } else if (learningSkillsSet.has(lower)) {
        userStatus = "Learning";
      }

      return {
        skill,
        frequency: Math.round((count / total) * 100),
        userStatus,
        learningResourceUrl: `https://roadmap.sh/${skill.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  return result;
}

export function exportJobsToCSV(jobs: JobListing[]): string {
  const headers = [
    "Radar Score",
    "Fit Score",
    "Opportunity Score",
    "Company",
    "Role",
    "Location",
    "Work Model",
    "Salary",
    "Experience",
    "Required Skills",
    "Source",
    "Source URL",
    "Recommendation",
    "Posted Time",
  ];

  const rows = jobs.map((job) => {
    const scores = calculateRadarScore(job);
    return [
      scores.compositeRadarScore,
      scores.totalFitScore,
      scores.opportunityScore,
      `"${job.company}"`,
      `"${job.title}"`,
      `"${job.location}"`,
      job.workModel,
      `"${job.salaryText}"`,
      `"${job.experienceRequired}"`,
      `"${job.requiredSkills.join(", ")}"`,
      job.source,
      job.sourceUrl,
      job.aiRecommendation,
      `"${job.postedAt}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
