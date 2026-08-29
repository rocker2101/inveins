import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(lpa: number): string {
  return `₹${lpa} LPA`;
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function safeOpenApplyUrl(url?: string, companyName?: string): void {
  let targetUrl = url?.trim();

  if (!targetUrl || targetUrl === "#" || targetUrl === "javascript:void(0)") {
    if (companyName) {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(
        companyName + " software engineer careers apply"
      )}`;
    } else {
      targetUrl = "https://razorpay.com/jobs/";
    }
  }

  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

export function getFreshnessLabel(timestamp: number): {
  label: string;
  badgeClass: string;
  isVeryFresh: boolean;
} {
  const now = Date.now();
  const diffHours = (now - timestamp) / (1000 * 60 * 60);

  if (diffHours <= 3) {
    return {
      label: "🔥 VERY FRESH",
      badgeClass: "bg-[#cc785c] text-white font-medium",
      isVeryFresh: true,
    };
  } else if (diffHours <= 24) {
    return {
      label: "⚡ FRESH (Today)",
      badgeClass: "bg-[#e8a55a]/20 text-[#141413] font-medium border border-[#e8a55a]/30",
      isVeryFresh: true,
    };
  } else if (diffHours <= 72) {
    return {
      label: "🕒 ACTIVE (2-3d)",
      badgeClass: "bg-[#f5f0e8] text-[#6c6a64] font-medium border border-[#e6dfd8]",
      isVeryFresh: false,
    };
  }
  return {
    label: "📅 > 3d ago",
    badgeClass: "bg-[#f5f0e8] text-[#8e8b82] font-normal border border-[#e6dfd8]",
    isVeryFresh: false,
  };
}

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  ring: string;
} {
  if (score >= 90) {
    return {
      text: "text-[#141413] font-bold",
      bg: "bg-[#cc785c]/15",
      border: "border-[#cc785c]/40",
      ring: "#cc785c",
    };
  }
  if (score >= 80) {
    return {
      text: "text-[#141413] font-semibold",
      bg: "bg-[#efe9de]",
      border: "border-[#e6dfd8]",
      ring: "#efe9de",
    };
  }
  if (score >= 70) {
    return {
      text: "text-[#3d3d3a] font-medium",
      bg: "bg-[#f5f0e8]",
      border: "border-[#e6dfd8]",
      ring: "#f5f0e8",
    };
  }
  return {
    text: "text-[#8e8b82] font-normal",
    bg: "bg-[#f5f0e8]",
    border: "border-[#e6dfd8]",
    ring: "#e6dfd8",
  };
}
