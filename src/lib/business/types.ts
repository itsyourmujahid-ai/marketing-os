export const BUSINESS_VERSION = 1;
export const BUSINESS_STORAGE_KEY = "marketing-os.business.v1";

// ---------------------------------------------------------------------------
// Business Profile
// ---------------------------------------------------------------------------

export type BusinessType =
  | "B2B"
  | "B2C"
  | "D2C"
  | "Agency"
  | "SaaS"
  | "Local Business"
  | "E-commerce"
  | "Service Business"
  | "Other";

export const OTHER_BUSINESS_TYPE = "Other";

export interface BusinessProfile {
  businessName: string;
  industry: string;
  businessType: BusinessType | "";
  country: string;
  cityRegion: string;
  website: string;
  businessEmail: string;
  businessPhone: string;
  shortDescription: string;
  fullDescription: string;
}

// ---------------------------------------------------------------------------
// Products & Services
// ---------------------------------------------------------------------------

export type OfferKind = "Product" | "Service";
export type ProductStatus = "Active" | "Inactive" | "Draft";

export interface ProductOrService {
  id: string;
  kind: OfferKind;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  price: string;
  currency: string;
  keyBenefits: string[];
  features: string[];
  targetAudience: string;
  status: ProductStatus;
}

// ---------------------------------------------------------------------------
// Value Proposition
// ---------------------------------------------------------------------------

export interface ValueProposition {
  mainValue: string;
  usp: string;
  differentiators: string[];
  problemSolved: string;
  solutionProvided: string;
}

// ---------------------------------------------------------------------------
// Target Market
// ---------------------------------------------------------------------------

export type CustomerType = "Business (B2B)" | "Consumer (B2C)" | "Both (B2B + B2C)";

export interface TargetMarket {
  primaryMarket: string;
  customerType: CustomerType | "";
  countries: string[];
  citiesRegions: string[];
  industries: string[];
  // B2B
  companySize: string;
  jobRoles: string[];
  departments: string[];
  decisionMakerType: string;
  // B2C
  ageRange: string;
  gender: string;
  interests: string[];
  lifestyle: string;
  buyingBehavior: string;
  // Shared
  languages: string[];
  preferredChannels: string[];
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export type GoalPriority = "Low" | "Medium" | "High" | "Critical";
export type GoalStatus = "Not Started" | "In Progress" | "Completed" | "Paused";

export interface BusinessGoal {
  id: string;
  name: string;
  description: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  deadline: string;
  priority: GoalPriority;
  status: GoalStatus;
}

export interface MarketingGoal {
  primaryGoal: string;
  secondaryGoals: string[];
  monthlyLeadTarget: string;
  monthlyRevenueTarget: string;
  marketingBudget: string;
  preferredChannels: string[];
  targetConversionRate: string;
}

// ---------------------------------------------------------------------------
// Brand Voice
// ---------------------------------------------------------------------------

export type BrandTone =
  | "Professional"
  | "Friendly"
  | "Premium"
  | "Bold"
  | "Playful"
  | "Technical"
  | "Educational"
  | "Minimal"
  | "Luxury"
  | "Conversational";

export interface BrandVoice {
  tones: BrandTone[];
  personality: string;
  wordsToUse: string[];
  wordsToAvoid: string[];
  communicationStyle: string;
  writingPreferences: string;
  additionalGuidelines: string;
}

// ---------------------------------------------------------------------------
// Brand Identity & Assets
// ---------------------------------------------------------------------------

export type BrandAssetType = "Logo" | "Image" | "Reference" | "Document";

export interface BrandAsset {
  id: string;
  type: BrandAssetType;
  name: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  /** Local data URL (temporary local persistence only). Replaced by real storage later. */
  dataUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface BrandIdentity {
  logoDataUrl?: string;
  logoFileName?: string;
  secondaryLogoDataUrl?: string;
  secondaryLogoFileName?: string;
  faviconDataUrl?: string;
  faviconFileName?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  preferredFont: string;
  brandNotes: string;
  assets: BrandAsset[];
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export interface Business {
  version: number;
  updatedAt: string;
  profile: BusinessProfile;
  valueProposition: ValueProposition;
  products: ProductOrService[];
  targetMarket: TargetMarket;
  businessGoals: BusinessGoal[];
  marketingGoal: MarketingGoal;
  brandVoice: BrandVoice;
  brandIdentity: BrandIdentity;
}