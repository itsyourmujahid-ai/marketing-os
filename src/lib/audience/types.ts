export const AUDIENCE_STORAGE_KEY = "marketing-os.audience.v1";

export const AUDIENCE_VERSION = 1;

export type AudienceType = "B2B" | "B2C";

export type AudiencePriority = "Critical" | "High" | "Medium" | "Low";

export type AudienceRole = "Primary" | "Secondary" | "Experimental";

export type RecordStatus = "Draft" | "Active" | "Archived";

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  audienceType: AudienceType;
  priority: AudiencePriority;
  role: AudienceRole;
  status: RecordStatus;
  location: string[];
  industries: string[];
  companySize: string;
  department: string[];
  jobTitle: string[];
  seniority: string[];
  decisionMakerRole: string;
  buyingAuthority: string;
  companyRevenue: string;
  ageRange: string;
  gender: string;
  occupation: string[];
  incomeRange: string;
  interests: string[];
  lifestyle: string;
  buyingBehavior: string;
  purchaseFrequency: string;
  demographics: string[];
  painPoints: string[];
  businessGoals: string[];
  buyingTriggers: string[];
  objections: string[];
  procurementProcess: string;
  preferredChannels: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Persona {
  id: string;
  segmentId: string;
  name: string;
  shortDescription: string;
  ageRange: string;
  job: string;
  industry: string;
  location: string;
  companySize: string;
  seniority: string;
  primaryGoals: string[];
  secondaryGoals: string[];
  painPoints: string[];
  frustrations: string[];
  risks: string[];
  challenges: string[];
  buyingTriggers: string[];
  motivations: string[];
  objections: string[];
  concerns: string[];
  decisionFactors: string[];
  preferredPlatforms: string[];
  preferredContentTypes: string[];
  researchBehavior: string;
  communicationPreferences: string;
  whatCaresAbout: string;
  resonantMessage: string;
  languageTone: string;
  ctaPreference: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceState {
  version: number;
  segments: AudienceSegment[];
  personas: Persona[];
}

export type SegmentDraft = Omit<AudienceSegment, "id" | "createdAt" | "updatedAt">;
export type PersonaDraft = Omit<Persona, "id" | "createdAt" | "updatedAt">;

export type AudienceInsightTone = "positive" | "warning" | "info";

export interface AudienceInsight {
  id: string;
  tone: AudienceInsightTone;
  message: string;
}

export interface AudienceRecommendation {
  id: string;
  missing: string;
  recommendation: string;
}

export interface AudienceOverview {
  totalSegments: number;
  totalPersonas: number;
  activeSegments: number;
  activePersonas: number;
  primarySegments: number;
  primaryPersonaCount: number;
  avgSegmentCompleteness: number;
  avgPersonaCompleteness: number;
  mostImportantPersonaId: string | null;
}