import type { BrandTone, BusinessType, CustomerType, GoalPriority, GoalStatus, OfferKind, ProductStatus } from "./types";

export const BUSINESS_TYPES: BusinessType[] = [
  "B2B",
  "B2C",
  "D2C",
  "Agency",
  "SaaS",
  "Local Business",
  "E-commerce",
  "Service Business",
  "Other",
];

export const CUSTOMER_TYPES: CustomerType[] = [
  "Business (B2B)",
  "Consumer (B2C)",
  "Both (B2B + B2C)",
];

export const INDUSTRIES = [
  "Technology & Software",
  "SaaS",
  "E-commerce",
  "Retail",
  "Health & Wellness",
  "Education",
  "Finance & Insurance",
  "Real Estate",
  "Food & Beverage",
  "Hospitality & Travel",
  "Media & Entertainment",
  "Professional Services",
  "Manufacturing",
  "Automotive",
  "Fashion & Apparel",
  "Fitness & Sports",
  "Beauty & Personal Care",
  "Home & Lifestyle",
  "Marketing & Advertising",
  "Consulting",
  "Agency",
  "Nonprofit",
  "Other",
];

export const OFFER_KINDS: OfferKind[] = ["Product", "Service"];

export const PRODUCT_STATUSES: ProductStatus[] = ["Active", "Inactive", "Draft"];

export const GOAL_PRIORITIES: GoalPriority[] = ["Low", "Medium", "High", "Critical"];

export const GOAL_STATUSES: GoalStatus[] = ["Not Started", "In Progress", "Completed", "Paused"];

export const GOAL_SUGGESTIONS = [
  "Increase revenue",
  "Generate leads",
  "Increase sales",
  "Launch product",
  "Increase brand awareness",
  "Enter new market",
  "Increase customer retention",
  "Increase website traffic",
  "Improve customer experience",
  "Build an audience",
  "Other",
];

export const MARKETING_GOAL_SUGGESTIONS = [
  "Increase lead generation",
  "Increase brand awareness",
  "Improve conversion rate",
  "Increase website traffic",
  "Grow social media following",
  "Improve customer engagement",
  "Boost email list growth",
  "Win back lapsed customers",
  "Establish thought leadership",
  "Other",
];

export const BRAND_TONES: BrandTone[] = [
  "Professional",
  "Friendly",
  "Premium",
  "Bold",
  "Playful",
  "Technical",
  "Educational",
  "Minimal",
  "Luxury",
  "Conversational",
];

const PREFERRED_CHANNELS = [
  "Email",
  "Social Media",
  "SEO",
  "Google Ads",
  "Content Marketing",
  "Influencer Marketing",
  "Events",
  "Webinars",
  "Referral Program",
  "Direct Sales",
  "SMS",
  "Podcast",
  "Outdoor / Print",
  "Paid Social",
  "Affiliate",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Hindi",
  "Urdu",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Italian",
  "Dutch",
  "Turkish",
  "Russian",
  "Korean",
];

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AED",
  "SAR",
  "PKR",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "BRL",
  "TRY",
  "RUB",
  "KRW",
];

export const OPTIONS = {
  channels: PREFERRED_CHANNELS,
  languages: LANGUAGES,
  currencies: CURRENCIES,
};

export function uniqueCurrencyOptions(): string[] {
  return [...new Set(CURRENCIES)];
}