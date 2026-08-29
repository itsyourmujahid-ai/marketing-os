import type { IconName } from "@/components/ui/icon";
import type { Business } from "@/lib/business/types";
import type { HealthCategoryId, HealthCheck } from "./types";

export interface CategoryRuleResult {
  checks: HealthCheck[];
  explanation: string;
}

function filled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function listFilled(items: string[] | undefined | null): boolean {
  return Array.isArray(items) && items.length > 0;
}

function positiveNumeric(value: string): boolean {
  const n = Number(String(value).trim());
  return Number.isFinite(n) && n > 0;
}

function p(id: string, label: string, passed: boolean, points: number, detail?: string): HealthCheck {
  return { id, label, passed, points, detail };
}

/** Normalize a raw points sum to 0-100. */
function toScore(earned: number, total: number): number {
  return total <= 0 ? 0 : Math.round((earned / total) * 100);
}

function missingFrom(checks: HealthCheck[]): string[] {
  return checks.filter((c) => !c.passed).map((c) => c.label);
}

// ---------------------------------------------------------------------------
// 1. Business Foundation
// ---------------------------------------------------------------------------

export function foundationRules(b: Business): CategoryRuleResult {
  const pr = b.profile;
  const checks: HealthCheck[] = [
    p("name", "Business name", filled(pr.businessName) && pr.businessName.trim().length >= 2, 15),
    p("industry", "Industry", filled(pr.industry), 10),
    p("type", "Business type", filled(pr.businessType), 10),
    p("location", "Location (country / region)", filled(pr.country) || filled(pr.cityRegion), 10),
    p("website", "Website", filled(pr.website) && /^https?:\/\//i.test(pr.website.trim()), 8),
    p("contact", "Contact (email or phone)", filled(pr.businessEmail) || filled(pr.businessPhone), 7),
    p("shortDescription", "Short description", filled(pr.shortDescription), 10),
    p("fullDescription", "Full description", filled(pr.fullDescription), 10),
    p("offers", "Products or services", b.products.length > 0, 15),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  let explanation: string;
  if (score >= 80) {
    explanation = "Your business foundation is well defined — identity, offering and contact details are in place.";
  } else if (score >= 55) {
    explanation = "Your business has a solid start; completing the missing identity and offering details raises your foundation.";
  } else {
    explanation =
      "A defined business identity and offering are the baseline for every marketing decision. Prioritize business name, industry, description and products.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 2. Brand Readiness
// ---------------------------------------------------------------------------

export function brandRules(b: Business): CategoryRuleResult {
  const v = b.brandVoice;
  const id = b.brandIdentity;
  const hasAnyColor = filled(id.primaryColor) || filled(id.secondaryColor) || filled(id.accentColor);
  const hasFullPalette = filled(id.primaryColor) && filled(id.secondaryColor) && filled(id.accentColor);

  const checks: HealthCheck[] = [
    p("logo", "Primary logo", Boolean(id.logoDataUrl), 15),
    p("altLogo", "Secondary logo or favicon", Boolean(id.secondaryLogoDataUrl || id.faviconDataUrl), 5),
    p("colorAny", "Brand colors", hasAnyColor, 12),
    p("colorPalette", "Full color palette", hasFullPalette, 6),
    p("bgColor", "Background color", filled(id.backgroundColor), 2),
    p("font", "Preferred font", filled(id.preferredFont), 5),
    p("tones", "Brand tone", v.tones.length > 0, 15),
    p("personality", "Brand personality", filled(v.personality), 10),
    p("communication", "Communication style", filled(v.communicationStyle), 8),
    p("wordsUse", "Words to use", listFilled(v.wordsToUse), 6),
    p("wordsAvoid", "Words to avoid", listFilled(v.wordsToAvoid), 6),
    p("guidelines", "Writing guidelines", filled(v.writingPreferences) || filled(v.additionalGuidelines), 10),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  const voiceDone = v.tones.length > 0 && (filled(v.personality) || filled(v.communicationStyle));
  let explanation: string;
  if (score >= 80) {
    explanation = "Your brand is visually and verbally defined — logos, colors and voice give content a consistent identity.";
  } else if (score >= 55) {
    explanation = "A partially defined brand. Add the missing visual and voice elements to keep every touchpoint consistent.";
  } else if (voiceDone) {
    explanation = "Your brand voice exists, but visual identity (logo, colors, font) is missing and undermines recognition.";
  } else {
    explanation = "Missing brand information reduces recognition and consistency. Define logo, colors and brand voice.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 3. Target Market
// ---------------------------------------------------------------------------

const B2B_TYPES = new Set<string>(["B2B", "Agency", "SaaS", "Service Business"]);
const B2C_TYPES = new Set<string>(["B2C", "D2C", "Local Business", "E-commerce"]);

interface MarketRelevance {
  b2b: boolean;
  b2c: boolean;
}

export function marketRelevance(b: Business): MarketRelevance {
  const ct = b.targetMarket.customerType;
  if (ct === "Business (B2B)") return { b2b: true, b2c: false };
  if (ct === "Consumer (B2C)") return { b2b: false, b2c: true };
  if (ct === "Both (B2B + B2C)") return { b2b: true, b2c: true };

  const bt = b.profile.businessType;
  return {
    b2b: B2B_TYPES.has(bt),
    b2c: B2C_TYPES.has(bt),
  };
}

export function marketRules(b: Business): CategoryRuleResult {
  const m = b.targetMarket;
  const rel = marketRelevance(b);

  // Generic checks apply to every business.
  const checks: HealthCheck[] = [
    p("primaryMarket", "Primary market", filled(m.primaryMarket), 10),
    p("customerType", "Customer type (B2B / B2C)", filled(m.customerType), 10),
    p("location", "Location", listFilled(m.countries) || listFilled(m.citiesRegions), 6),
    p("channels", "Preferred channels", listFilled(m.preferredChannels), 6),
  ];

  // B2B-specific checks.
  const b2bChecks: HealthCheck[] = [
    p("b2bIndustries", "Target industries (B2B)", listFilled(m.industries), 18),
    p("b2bRoles", "Job roles / departments (B2B)", listFilled(m.jobRoles) || listFilled(m.departments), 16),
    p("b2bDecision", "Decision-maker type (B2B)", filled(m.decisionMakerType), 16),
    p("b2bSize", "Company size (B2B)", filled(m.companySize), 8),
    p("b2bLocation", "B2B location", listFilled(m.countries) || listFilled(m.citiesRegions), 10),
  ];

  // B2C-specific checks.
  const b2cChecks: HealthCheck[] = [
    p("b2cAudience", "Audience interests / lifestyle (B2C)", listFilled(m.interests) || filled(m.lifestyle), 18),
    p("b2cAge", "Age range (B2C)", filled(m.ageRange), 12),
    p("b2cBehavior", "Buying behavior (B2C)", filled(m.buyingBehavior), 16),
    p("b2cChannels", "B2C channels", listFilled(m.preferredChannels), 12),
    p("b2cLocation", "B2C location", listFilled(m.countries) || listFilled(m.citiesRegions), 10),
  ];

  let earned = checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0);
  let total = checks.reduce((s, c) => s + c.points, 0);

  if (rel.b2b) {
    checks.push(...b2bChecks);
    earned += b2bChecks.reduce((s, c) => s + (c.passed ? c.points : 0), 0);
    total += b2bChecks.reduce((s, c) => s + c.points, 0);
  }
  if (rel.b2c) {
    checks.push(...b2cChecks);
    earned += b2cChecks.reduce((s, c) => s + (c.passed ? c.points : 0), 0);
    total += b2cChecks.reduce((s, c) => s + c.points, 0);
  }

  const score = toScore(earned, total);
  const noAudience = !filled(m.customerType) && !rel.b2b && !rel.b2c;

  let explanation: string;
  if (noAudience) {
    explanation =
      "Your market is not yet defined. Choose your customer type and primary market before segmenting who you sell to.";
  } else if (rel.b2b && rel.b2c) {
    explanation =
      score >= 70
      ? "Both your B2B and B2C audiences are well described."
      : "You sell to both businesses and consumers, but audience segments are incomplete on one or both sides.";
  } else if (rel.b2b) {
    explanation = score >= 60
      ? "Your B2B market is defined, including who the buyer is and how you reach them."
      : "Your business has a defined market, but B2B customer segments and decision-maker information are incomplete.";
  } else if (rel.b2c) {
    explanation = score >= 60
      ? "Your consumer market is defined with clear segments and channels."
      : "Your business has a defined market, but consumer segments and buying information are incomplete.";
  } else {
    explanation = "Your market needs a customer type and primary market so audits and segments fit your model.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 4. Goals
// ---------------------------------------------------------------------------

export function goalsRules(b: Business): CategoryRuleResult {
  const goals = b.businessGoals;
  const mg = b.marketingGoal;

  const goalCount = goals.length;
  const measurableGoals = goals.filter((g) => filled(g.targetValue) && filled(g.unit)).length;
  const deadlineGoals = goals.filter((g) => filled(g.deadline)).length;
  const prioritizedGoals = goals.filter((g) => g.priority === "High" || g.priority === "Critical").length;
  const describedGoals = goals.filter((g) => filled(g.description)).length;

  const checks: HealthCheck[] = [
    p("bgNamed", "Business goal defined", goalCount > 0, 10),
    p("bgMeasurable", "Goals have measurable targets", goalCount > 0 && measurableGoals >= 1, 12),
    p("bgDeadline", "Goals have deadlines", deadlineGoals >= 1, 8),
    p("bgPriority", "Goals have explicit priorities", prioritizedGoals >= 1, 6),
    p("bgDescription", "Goals documented", describedGoals >= 1, 6),
    p("mgPrimary", "Primary marketing goal", filled(mg.primaryGoal), 12),
    p("mgSecondary", "Secondary marketing goals", listFilled(mg.secondaryGoals), 4),
    p("mgLeads", "Monthly lead target", positiveNumeric(mg.monthlyLeadTarget), 12),
    p("mgRevenue", "Monthly revenue target", positiveNumeric(mg.monthlyRevenueTarget), 6),
    p("mgConversion", "Conversion target", positiveNumeric(mg.targetConversionRate), 6),
    p("mgBudget", "Marketing budget", positiveNumeric(mg.marketingBudget), 10),
    p("mgChannels", "Goal channels", listFilled(mg.preferredChannels), 8),
  ];

  const earned = checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0);
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(earned, total);

  let explanation: string;
  if (goalCount === 0 && !filled(mg.primaryGoal)) {
    explanation = "No business or marketing goals exist yet. Goals turn strategy into measurable outcomes.";
  } else if (measureableRatio(goals) < 0.5 && goalCount > 0) {
    explanation =
      "Vague goals score lower than measurable goals — add target values, units and deadlines so progress can be tracked";
  } else {
    explanation = score >= 70
      ? "Goals are defined and mostly measurable with targets and deadlines."
      : "Goals are partly defined, but missing targets, deadlines or measurable marketing KPIs limit tracking.";
  }

  return { checks, explanation };
}

function measureableRatio(goals: { targetValue: string; unit: string }[]): number {
  if (goals.length === 0) return 0;
  const perc = goals.filter((g) => filled(g.targetValue) && filled(g.unit)).length / goals.length;
  return perc;
}

// ---------------------------------------------------------------------------
// 5. Offer Readiness
// ---------------------------------------------------------------------------

export function offerRules(b: Business): CategoryRuleResult {
  const vp = b.valueProposition;
  const withDescription =
    b.products.length > 0 &&
    b.products.some((pr) => filled(pr.shortDescription) || filled(pr.detailedDescription));
  const withBenefits = b.products.some((pr) => listFilled(pr.keyBenefits));
  const withFeatures = b.products.some((pr) => listFilled(pr.features));

  const checks: HealthCheck[] = [
    p("products", "Products or services exist", b.products.length > 0, 15),
    p("descriptions", "Products are described", withDescription, 12),
    p("benefits", "Product benefits defined", withBenefits, 12),
    p("features", "Product features listed", withFeatures, 6),
    p("mainValue", "Value proposition", filled(vp.mainValue), 15),
    p("usp", "Unique selling point", filled(vp.usp), 10),
    p("problem", "Customer problem solved", filled(vp.problemSolved), 10),
    p("solution", "Solution provided", filled(vp.solutionProvided), 10),
    p("differentiators", "Key differentiators", listFilled(vp.differentiators), 10),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  let explanation: string;
  if (score >= 80) {
    explanation = "Your offer is clearly defined with products, benefits and a strong value proposition.";
  } else if (score >= 55) {
    explanation = "Your offer has a foundation, but benefits, USP or positioning need to be spelled out.";
  } else {
    explanation = "An undefined offer makes marketing impossible. Define what you sell, its benefits and why it wins.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 6. Conversion Readiness
// ---------------------------------------------------------------------------

export function conversionRules(b: Business): CategoryRuleResult {
  const tm = b.targetMarket;
  const vp = b.valueProposition;
  const marketDefined = filled(tm.customerType) && filled(tm.primaryMarket);
  const offerDefined = b.products.length > 0;
  const valueDefined = filled(vp.mainValue);
  // A CTA concept is possible once offer + value + a channel to act are all present.
  const ctaReady = offerDefined && valueDefined && listFilled(tm.preferredChannels);
  const websiteOk = filled(b.profile.website) && /^https?:\/\//i.test(b.profile.website.trim());

  const checks: HealthCheck[] = [
    p("market", "Clear target market", marketDefined, 30),
    p("offer", "Clear offer", offerDefined, 15),
    p("value", "Clear value proposition", valueDefined, 15),
    p("cta", "Clear CTA concept", ctaReady, 20),
    p("website", "Website availability", websiteOk, 20),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  let explanation: string;
  if (score >= 80) {
    explanation = "You have the core inputs to start converting — market, offer, value and a place to act.";
  } else if (ctaReady) {
    explanation = "Offer and value are clear, but define your target market and a destination (website) to convert.";
  } else {
    explanation =
      "Conversion readiness is low — a clear market, offer, value proposition and CTA concept come first.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 7. Content Readiness
// ---------------------------------------------------------------------------

export function contentRules(b: Business): CategoryRuleResult {
  const v = b.brandVoice;
  const tm = b.targetMarket;
  const rel = marketRelevance(b);
  const audienceDetail =
    (rel.b2c && (listFilled(tm.interests) || filled(tm.lifestyle) || filled(tm.ageRange))) ||
    (rel.b2b && (listFilled(tm.jobRoles) || listFilled(tm.departments) || filled(tm.decisionMakerType)));

  const checks: HealthCheck[] = [
    p("audience", "Target audience defined", filled(tm.customerType) && filled(tm.primaryMarket), 15),
    p("audienceDetail", "Audience detail", audienceDetail, 5),
    p("voice", "Brand voice (tone + personality)", v.tones.length > 0 && filled(v.personality), 15),
    p("communication", "Communication style", filled(v.communicationStyle), 5),
    p("products", "Products to write about", b.products.length > 0, 15),
    p("value", "Value proposition", filled(b.valueProposition.mainValue), 10),
    p("usp", "Unique selling point", filled(b.valueProposition.usp), 10),
    p("problem", "Customer problem", filled(b.valueProposition.problemSolved), 10),
    p("channels", "Preferred channels", listFilled(tm.preferredChannels), 15),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  let explanation: string;
  if (score >= 80) {
    explanation = "You have everything needed to create consistent, on-brand content that speaks to your audience.";
  } else if (score >= 55) {
    explanation = "Content foundations are partly in place — tighten voice, audience detail and channels to publish effectively.";
  } else {
    explanation = "Content needs an audience, a brand voice and products to write about before the studio becomes useful.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// 8. Measurement Readiness
// ---------------------------------------------------------------------------

export function measurementRules(b: Business): CategoryRuleResult {
  const mg = b.marketingGoal;
  const measurableGoals = b.businessGoals.filter((g) => filled(g.targetValue) && filled(g.unit)).length;
  const deadlineGoals = b.businessGoals.filter((g) => filled(g.deadline)).length;

  const checks: HealthCheck[] = [
    p("mgPrimary", "Primary marketing goal", filled(mg.primaryGoal), 10),
    p("mgLeads", "Monthly lead target", positiveNumeric(mg.monthlyLeadTarget), 15),
    p("mgRevenue", "Monthly revenue target", positiveNumeric(mg.monthlyRevenueTarget), 10),
    p("mgConversion", "Conversion target", positiveNumeric(mg.targetConversionRate), 10),
    p("mgBudget", "Marketing budget", positiveNumeric(mg.marketingBudget), 15),
    p("mgChannels", "Preferred channels", listFilled(mg.preferredChannels), 10),
    p("mgMeasurable", "Measurable business goals", b.businessGoals.length > 0 && measurableGoals >= 1, 20),
    p("mgDeadlines", "Goals with deadlines", b.businessGoals.length > 0 && deadlineGoals >= 1, 10),
  ];
  const total = checks.reduce((s, c) => s + c.points, 0);
  const score = toScore(checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0), total);

  let explanation: string;
  if (score >= 80) {
    explanation = "You can measure outcomes — targets, budget and deadlines set you up for real reporting.";
  } else if (score >= 55) {
    explanation = "Partial measurement setup — add concrete lead, revenue and conversion targets to track progress.";
  } else {
    explanation = "Without measurable marketing goals and a budget, performance cannot be evaluated. Start with targets.";
  }

  return { checks, explanation };
}

// ---------------------------------------------------------------------------
// Category catalog
// ---------------------------------------------------------------------------

export interface CategoryDefinition {
  id: HealthCategoryId;
  name: string;
  icon: IconName;
  weight: number;
  run: (b: Business) => CategoryRuleResult;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { id: "foundation", name: "Business Foundation", icon: "building", weight: 20, run: foundationRules },
  { id: "brand", name: "Brand Readiness", icon: "palette", weight: 15, run: brandRules },
  { id: "market", name: "Target Market", icon: "users", weight: 15, run: marketRules },
  { id: "goals", name: "Goals", icon: "target", weight: 15, run: goalsRules },
  { id: "offer", name: "Offer Readiness", icon: "briefcase", weight: 15, run: offerRules },
  { id: "conversion", name: "Conversion Readiness", icon: "share", weight: 10, run: conversionRules },
  { id: "content", name: "Content Readiness", icon: "layout", weight: 5, run: contentRules },
  { id: "measurement", name: "Measurement Readiness", icon: "chart", weight: 5, run: measurementRules },
];

// Clean helpers used by the scoring engine.
export { filled, listFilled, positiveNumeric, missingFrom, toScore };