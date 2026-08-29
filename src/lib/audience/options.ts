import type { AudiencePriority, AudienceRole, AudienceType, RecordStatus } from "./types";

export const AUDIENCE_TYPES: AudienceType[] = ["B2B", "B2C"];

export const PRIORITIES: AudiencePriority[] = ["Critical", "High", "Medium", "Low"];

export const ROLES: AudienceRole[] = ["Primary", "Secondary", "Experimental"];

export const STATUSES: RecordStatus[] = ["Draft", "Active", "Archived"];

export const SENIORITY_OPTIONS = [
  "Owner / Founder",
  "C-Level",
  "VP / Director",
  "Manager",
  "Individual Contributor",
];

export const BUYING_AUTHORITY_OPTIONS = [
  "Recommends",
  "Influences",
  "Approves",
  "Signs off / Final approver",
  "Buys with a team",
];

export const COMPANY_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export const COMPANY_REVENUE_OPTIONS = [
  "Under $1M",
  "$1M - $5M",
  "$5M - $20M",
  "$20M - $100M",
  "$100M+",
];

export const B2B_INDUSTRY_SUGGESTIONS = [
  "Construction & Facilities",
  "Oil & Gas / Energy",
  "Logistics & Supply Chain",
  "Real Estate & Property",
  "Retail & Wholesale",
  "Healthcare Providers",
  "Education & Training",
  "Technology & Software",
  "SaaS",
  "Manufacturing",
  "Banking & Finance",
  "Hospitality",
  "E-commerce",
  "Government / Public Sector",
  "Telecom",
  "Agency / Marketing",
  "Professional Services",
];

export const DEPARTMENT_SUGGESTIONS = [
  "Marketing",
  "Sales",
  "Operations",
  "Procurement",
  "HR",
  "Finance",
  "IT",
  "Executive / Founders",
];

export const B2C_INTEREST_SUGGESTIONS = [
  "Fitness & Sports",
  "Travel & Adventure",
  "Food & Cooking",
  "Gaming",
  "Fashion & Style",
  "Tech Gadgets",
  "Parenting",
  "Home & Garden",
  "Arts & Crafts",
  "Personal Finance",
  "Outdoors",
  "Pets",
  "Beauty & Self-care",
  "Music & Entertainment",
];

export const LOCATION_SUGGESTIONS = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Egypt",
  "Pakistan",
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "India",
];

export const CHANNEL_SUGGESTIONS = [
  "Email",
  "LinkedIn",
  "WhatsApp",
  "Phone / Cold Calling",
  "SMS",
  "Website Chat",
  "Facebook",
  "Instagram",
  "X / Twitter",
  "TikTok",
  "YouTube",
  "Google Ads",
  "SEO",
  "Trade Shows / Events",
  "Referral Program",
  "Direct Mail",
  "Paid Social",
  "Content Marketing",
];

export const PLATFORM_SUGGESTIONS = [
  "LinkedIn",
  "Facebook",
  "Instagram",
  "TikTok",
  "X / Twitter",
  "YouTube",
  "WhatsApp",
  "Email",
  "Website",
  "Marketplace",
  "Trade events",
  "Print",
];

export const CONTENT_TYPE_SUGGESTIONS = [
  "Case Studies",
  "Whitepapers",
  "Blog Posts",
  "Webinars",
  "Demo Videos",
  "Email Newsletters",
  "Social Posts",
  "Infographics",
  "E-books",
  "Templates / Tools",
  "Podcasts",
];

export const PAIN_POINT_SUGGESTIONS = [
  "High operational costs",
  "Low visibility / awareness",
  "Inconsistent lead flow",
  "Limited reach",
  "Wasting budget on wrong channels",
  "Slow sales cycles",
  "Weak brand recognition",
  "Poor customer retention",
  "Outdated tools / processes",
  "Price sensitivity",
  "Lack of time / resources",
];

export const TRIGGER_SUGGESTIONS = [
  "Rapid growth phase",
  "New product launch",
  "Facing a budget review",
  "Competitor pressure",
  "Seasonal demand spike",
  "Hiring / expansion",
  "Cost cutting",
  "Regulatory change",
  "Rebranding",
];

export const OBJECTION_SUGGESTIONS = [
  "Price",
  "Trust / credibility",
  "Implementation effort",
  "No budget",
  "Already using a competitor",
  "Low priority now",
  "Hard to integrate",
];