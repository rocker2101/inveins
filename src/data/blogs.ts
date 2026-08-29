import { BlogPost } from "../lib/types";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-crack-off-campus-sde-15-lpa",
    title: "The 2026 Blueprint: How CS Freshers Land ₹15+ LPA Off-Campus SDE Offers",
    excerpt:
      "Why cold-applying to 500 LinkedIn jobs fails, and how reverse-engineering ATS freshness cycles and project depth lands interview loops.",
    publishedAt: "August 24, 2026",
    readingTime: "6 min read",
    category: "Career Strategy",
    author: {
      name: "Aditya Verma",
      role: "Ex-SDE @ Razorpay, Founder @ TechLead",
      avatar: "👨‍💻",
    },
    content: `
### The Off-Campus Hiring Reality in 2026

Traditional job search is fundamentally broken for freshers. The average Indian tier-1/tier-2 CS graduate applies to 300+ generic postings on Naukri and LinkedIn, only to receive silence or automated rejection emails.

Here is why:
1. **The 48-Hour ATS Funnel**: 75% of interview shortlists are decided within the first 48 hours of an ATS listing going live on Greenhouse or Ashby. Listings that remain open for 2 weeks already have 2,000+ candidates in pipeline.
2. **Generic Resume Traps**: Submitting the same resume with basic ToDo apps or clones guarantees ATS filtering.
3. **The Signal over Volume Rule**: Applying to 10 high-match roles with 90%+ skill relevance and tailor-fit project proof outperforms 200 random submissions by 8.4x in interview callback rates.

### The 4 Pillars of High-Package Off-Campus Hiring

#### 1. Real-time Freshness Targeting
Monitor company career feeds directly via JobRadar AI. Set alerts for when companies like CRED, Zepto, or Postman push a new opening to their Greenhouse portal. Apply within the first 2 hours.

#### 2. Deep Full-Stack Proof
Replace toy tutorial apps with production architectures:
- Include PostgreSQL database indexes and schema migrations (Prisma).
- Implement rate limiting, Redis caching, and Docker containerization.
- Provide live production URLs and GitHub repositories with clean documentation and tests.

#### 3. Targeted DSA Mastery
Focus on high-frequency patterns rather than solving 1,000 random problems:
- Arrays, Sliding Window, Two Pointers (Razorpay, Swiggy favorites).
- Trees, Binary Search, Graphs & BFS/DFS (CRED, BrowserStack, Atlassian).
- Dynamic Programming basics and System Design fundamentals for SDE-1.
    `,
  },
  {
    slug: "understanding-ats-greenhouse-ashby-algorithms",
    title: "Demystifying ATS: How Greenhouse & Ashby Actually Parse Your Resume",
    excerpt:
      "An insider breakdown of keyword tokenization, semantic scoring, and how recruiter screening dashboards rank candidates.",
    publishedAt: "August 20, 2026",
    readingTime: "5 min read",
    category: "ATS & Resume Intel",
    author: {
      name: "Pooja Hegde",
      role: "Senior Technical Recruiter",
      avatar: "👩‍💼",
    },
    content: `
### What Recruiters See When You Hit 'Submit'

When you submit an application to a top startup using modern ATS platforms like Ashby or Greenhouse, human recruiters do not read through every single 2-page PDF. 

Instead, modern ATS platforms:
- Extract your technology tags (e.g. React, TypeScript, Node.js, PostgreSQL).
- Compare your graduation year and stated years of experience against candidate filtering rules.
- Highlight missing core requirements before a recruiter even opens the document.

### How to Score in the Top 5%

1. **Explicit Skill Keyword Consistency**: If a role asks for TypeScript and REST APIs, ensure those exact strings appear in your skills list and project descriptions.
2. **Quantifiable Metrics**: Instead of *"Built backend APIs"*, write *"Engineered REST microservices in Node.js & PostgreSQL, handling 2,000 req/sec with sub-50ms p95 latency."*
3. **Clean Single-Column Format**: Avoid multi-column graphics or heavy tables that break text parsing engines.
    `,
  },
  {
    slug: "skill-gap-analysis-what-startups-demand-2026",
    title: "Skill Gap Report: The Top 5 Missing Skills in 2026 Fresher Resumes",
    excerpt:
      "We analyzed 1,500+ Indian SDE job postings. Here are the 5 high-impact skills that differentiate ₹18 LPA candidates from ₹6 LPA candidates.",
    publishedAt: "August 16, 2026",
    readingTime: "7 min read",
    category: "Market Intelligence",
    author: {
      name: "Dr. Vikram Rao",
      role: "Head of AI Research @ JobRadar",
      avatar: "🔬",
    },
    content: `
### The 2026 Fresher Tech Stack Benchmark

Based on JobRadar AI's aggregate scan across 1,500+ high-growth tech openings in Bangalore, Hyderabad, and Gurgaon:

1. **Docker & Container Basics (81% frequency)**: Startups expect candidates to spin up local environments with docker-compose rather than manual local installations.
2. **TypeScript Mastery (78% frequency)**: Pure JavaScript is no longer sufficient for high-tier frontend or full-stack roles. Strict typing is the standard.
3. **Relational Databases & Indexing (72% frequency)**: Knowing how to write raw SQL joins, explain query plans, and manage indexing in PostgreSQL is prized over basic MongoDB operations.
4. **Redis Caching & Pub/Sub (48% frequency)**: Understanding in-memory caching and session state management gives candidates an immediate edge in SDE-1 backend rounds.
5. **Git Workflows & CI/CD (89% frequency)**: Familiarity with pull request reviews, feature branching, and GitHub Actions.
    `,
  },
];
