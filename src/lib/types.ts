export type ApplicationStatus =
  | "discovered"
  | "shortlisted"
  | "apply_now"
  | "applied"
  | "oa"
  | "technical"
  | "hr"
  | "offer"
  | "rejected"
  | "withdrawn";

export type WorkModel = "Remote" | "Hybrid" | "Onsite" | "In-office";

export interface RadarScoreBreakdown {
  roleFit: number;        // max 25
  experienceFit: number;  // max 20
  skillFit: number;       // max 20
  salaryFit: number;      // max 15
  locationFit: number;    // max 10
  freshnessScore: number; // max 10
  totalFitScore: number;  // 0 - 100
  opportunityScore: number; // 0 - 100
  compositeRadarScore: number; // 0 - 100
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companySlug: string;
  companyLogoUrl?: string;
  location: string;
  workModel: WorkModel;
  experienceRequired: string; // e.g. "0-1 yrs", "Fresher / 0-2 yrs"
  minYoE: number;
  maxYoE: number;
  salaryText: string;         // e.g. "₹14 – ₹20 LPA"
  minLPA: number;
  maxLPA: number;
  postedAt: string;          // ISO String or relative
  postedTimestamp: number;   // Epoch ms for freshness calculations
  source:
    | "Greenhouse"
    | "Ashby"
    | "Lever"
    | "Direct Careers"
    | "Workday"
    | "Naukri.com"
    | "Indeed.com"
    | "LinkedIn"
    | "Instahyre";
  sourceUrl: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  aiRecommendation: "APPLY NOW" | "HIGH FIT" | "SKILL UP FIRST" | "CONSIDER";
  aiSummary: string;
  matchScore: number; // Precalculated based on default user profile
  opportunityScore: number;
  hiringVelocity: "Very High" | "High" | "Moderate";
  isFresh: boolean; // < 24h
  department: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  experienceYears: number;
  targetMinSalaryLPA: number;
  preferredLocations: string[];
  preferredWorkModel: WorkModel[];
  skills: string[];
  learningSkills: string[];
  savedJobIds: string[];
  applications: ApplicationRecord[];
  telegramConnected: boolean;
  telegramChatId?: string;
  emailDigestEnabled: boolean;
  minMatchScoreAlert: number;
}

export interface ApplicationRecord {
  jobId: string;
  status: ApplicationStatus;
  appliedDate?: string;
  lastUpdated: string;
  notes: string;
  oaDate?: string;
  interviewDate?: string;
}

export interface CompanyInfo {
  slug: string;
  name: string;
  logo: string;
  headquarters: string;
  hiringVelocity: "Very High" | "High" | "Moderate";
  openRolesCount: number;
  newRolesThisWeek: number;
  engineeringTeamSize: string;
  techStack: string[];
  stage: string;
  description: string;
  verifiedSource: boolean;
}

export interface SkillGapItem {
  skill: string;
  frequency: number; // % of target jobs requiring this
  userStatus: "Strong" | "Learning" | "Missing";
  learningResourceUrl?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
}
