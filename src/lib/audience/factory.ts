import type { Business } from "@/lib/business/types";

import type {
  AudienceSegment,
  AudienceState,
  AudienceType,
  Persona,
} from "./types";
import { AUDIENCE_VERSION } from "./types";

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const SEGMENT_DEFAULTS = {
  name: "",
  description: "",
  audienceType: "B2B",
  priority: "Medium",
  role: "Secondary",
  status: "Draft",
  location: [],
  industries: [],
  companySize: "",
  department: [],
  jobTitle: [],
  seniority: [],
  decisionMakerRole: "",
  buyingAuthority: "",
  companyRevenue: "",
  ageRange: "",
  gender: "",
  occupation: [],
  incomeRange: "",
  interests: [],
  lifestyle: "",
  buyingBehavior: "",
  purchaseFrequency: "",
  demographics: [],
  painPoints: [],
  businessGoals: [],
  buyingTriggers: [],
  objections: [],
  procurementProcess: "",
  preferredChannels: [],
  notes: "",
};

const PERSONA_DEFAULTS = {
  name: "",
  shortDescription: "",
  ageRange: "",
  job: "",
  industry: "",
  location: "",
  companySize: "",
  seniority: "",
  primaryGoals: [],
  secondaryGoals: [],
  painPoints: [],
  frustrations: [],
  risks: [],
  challenges: [],
  buyingTriggers: [],
  motivations: [],
  objections: [],
  concerns: [],
  decisionFactors: [],
  preferredPlatforms: [],
  preferredContentTypes: [],
  researchBehavior: "",
  communicationPreferences: "",
  whatCaresAbout: "",
  resonantMessage: "",
  languageTone: "",
  ctaPreference: "",
  status: "Draft",
};

export function createEmptySegment(partial: Partial<AudienceSegment> = {}): AudienceSegment {
  const now = new Date().toISOString();
  return {
    ...SEGMENT_DEFAULTS,
    ...partial,
    id: createId("segment"),
    createdAt: now,
    updatedAt: now,
  } as AudienceSegment;
}

export function createEmptyPersona(segmentId: string, partial: Partial<Persona> = {}): Persona {
  const now = new Date().toISOString();
  return {
    ...PERSONA_DEFAULTS,
    ...partial,
    id: createId("persona"),
    segmentId,
    createdAt: now,
    updatedAt: now,
  } as Persona;
}

export function createEmptyState(): AudienceState {
  return { version: AUDIENCE_VERSION, segments: [], personas: [] };
}

/**
 * Pick the most likely audience model for a new segment based on the saved
 * business data. Consumers stay free to choose B2B or B2C explicitly.
 */
export function suggestedAudienceType(business: Business | null): AudienceType {
  if (!business) return "B2C";

  const customerType = business.targetMarket.customerType;
  if (customerType === "Consumer (B2C)") return "B2C";
  if (customerType === "Business (B2B)") return "B2B";

  const businessType = business.profile.businessType;
  const b2c = new Set(["B2C", "D2C", "Local Business", "E-commerce"]).has(businessType);
  const b2b = new Set(["B2B", "Agency", "SaaS", "Service Business"]).has(businessType);
  if (b2c && !b2b) return "B2C";
  return "B2B";
}