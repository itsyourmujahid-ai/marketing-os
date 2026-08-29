import type { AudienceSegment, Persona } from "./types";

export interface ScoreField {
  label: string;
  complete: boolean;
}

export interface CompletenessResult {
  score: number;
  items: ScoreField[];
  missing: string[];
  total: number;
}

function filled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function listFilled(items: string[] | undefined | null): boolean {
  return Array.isArray(items) && items.length > 0;
}

function weighted(
  fields: Array<{ label: string; complete: boolean; weight: number }>,
): CompletenessResult {
  const items: ScoreField[] = fields.map((f) => ({ label: f.label, complete: f.complete }));
  const total = fields.reduce((s, f) => s + f.weight, 0);
  const earned = fields.reduce((s, f) => s + (f.complete ? f.weight : 0), 0);
  const score = total <= 0 ? 0 : Math.round((earned / total) * 100);
  const missing = items.filter((i) => !i.complete).map((i) => i.label);
  return { score, items, missing, total };
}

const B2B_SEGMENT_RESOLVERS: Array<{
  label: string;
  weight: number;
  get: (s: AudienceSegment) => boolean;
}> = [
  { label: "Location", weight: 10, get: (s) => listFilled(s.location) },
  { label: "Target industries", weight: 12, get: (s) => listFilled(s.industries) },
  { label: "Company size", weight: 6, get: (s) => filled(s.companySize) },
  { label: "Company revenue", weight: 4, get: (s) => filled(s.companyRevenue) },
  { label: "Departments", weight: 6, get: (s) => listFilled(s.department) },
  { label: "Job titles", weight: 10, get: (s) => listFilled(s.jobTitle) },
  { label: "Seniority", weight: 8, get: (s) => listFilled(s.seniority) },
  { label: "Decision maker", weight: 14, get: (s) => filled(s.decisionMakerRole) },
  { label: "Buying authority", weight: 8, get: (s) => filled(s.buyingAuthority) },
  { label: "Pain points", weight: 8, get: (s) => listFilled(s.painPoints) },
  { label: "Business goals", weight: 6, get: (s) => listFilled(s.businessGoals) },
  { label: "Buying triggers", weight: 8, get: (s) => listFilled(s.buyingTriggers) },
  { label: "Objections", weight: 4, get: (s) => listFilled(s.objections) },
  { label: "Procurement process", weight: 6, get: (s) => filled(s.procurementProcess) },
  { label: "Preferred channels", weight: 8, get: (s) => listFilled(s.preferredChannels) },
];

const B2C_SEGMENT_RESOLVERS: Array<{
  label: string;
  weight: number;
  get: (s: AudienceSegment) => boolean;
}> = [
  { label: "Location", weight: 10, get: (s) => listFilled(s.location) },
  { label: "Age range", weight: 10, get: (s) => filled(s.ageRange) },
  { label: "Interests", weight: 12, get: (s) => listFilled(s.interests) },
  { label: "Lifestyle", weight: 6, get: (s) => filled(s.lifestyle) },
  { label: "Buying behavior", weight: 10, get: (s) => filled(s.buyingBehavior) },
  { label: "Purchase frequency", weight: 6, get: (s) => filled(s.purchaseFrequency) },
  { label: "Occupation", weight: 6, get: (s) => listFilled(s.occupation) },
  { label: "Demographics", weight: 4, get: (s) => listFilled(s.demographics) },
  { label: "Pain points", weight: 10, get: (s) => listFilled(s.painPoints) },
  { label: "Buying triggers", weight: 8, get: (s) => listFilled(s.buyingTriggers) },
  { label: "Objections", weight: 6, get: (s) => listFilled(s.objections) },
  { label: "Preferred channels", weight: 8, get: (s) => listFilled(s.preferredChannels) },
];

export function computeSegmentCompleteness(segment: AudienceSegment): CompletenessResult {
  const resolvers =
    segment.audienceType === "B2C" ? B2C_SEGMENT_RESOLVERS : B2B_SEGMENT_RESOLVERS;
  return weighted(resolvers.map((r) => ({ label: r.label, complete: r.get(segment), weight: r.weight })));
}

const PERSONA_RESOLVERS: Array<{
  label: string;
  weight: number;
  get: (p: Persona) => boolean;
}> = [
  { label: "Persona name", weight: 10, get: (p) => filled(p.name) },
  { label: "Short description", weight: 8, get: (p) => filled(p.shortDescription) },
  { label: "Age range", weight: 4, get: (p) => filled(p.ageRange) },
  { label: "Job / role", weight: 6, get: (p) => filled(p.job) },
  { label: "Industry", weight: 6, get: (p) => filled(p.industry) },
  { label: "Location", weight: 6, get: (p) => filled(p.location) },
  { label: "Company size", weight: 2, get: (p) => filled(p.companySize) },
  { label: "Seniority", weight: 4, get: (p) => filled(p.seniority) },
  { label: "Primary goals", weight: 8, get: (p) => listFilled(p.primaryGoals) },
  { label: "Pain points", weight: 8, get: (p) => listFilled(p.painPoints) },
  { label: "Frustrations", weight: 4, get: (p) => listFilled(p.frustrations) },
  { label: "Risks / challenges", weight: 4, get: (p) => listFilled(p.risks) || listFilled(p.challenges) },
  { label: "Buying triggers", weight: 8, get: (p) => listFilled(p.buyingTriggers) },
  { label: "Motivations", weight: 4, get: (p) => listFilled(p.motivations) },
  { label: "Objections", weight: 6, get: (p) => listFilled(p.objections) },
  { label: "Decision factors", weight: 6, get: (p) => listFilled(p.decisionFactors) },
  { label: "Preferred platforms", weight: 4, get: (p) => listFilled(p.preferredPlatforms) },
  { label: "Preferred content types", weight: 6, get: (p) => listFilled(p.preferredContentTypes) },
  { label: "Research behavior", weight: 2, get: (p) => filled(p.researchBehavior) },
  { label: "Communication preferences", weight: 4, get: (p) => filled(p.communicationPreferences) },
  { label: "What they care about", weight: 6, get: (p) => filled(p.whatCaresAbout) },
  { label: "Resonant message", weight: 8, get: (p) => filled(p.resonantMessage) },
  { label: "Language / tone", weight: 2, get: (p) => filled(p.languageTone) },
  { label: "CTA preference", weight: 4, get: (p) => filled(p.ctaPreference) },
];

export function computePersonaCompleteness(persona: Persona): CompletenessResult {
  return weighted(
    PERSONA_RESOLVERS.map((r) => ({ label: r.label, complete: r.get(persona), weight: r.weight })),
  );
}