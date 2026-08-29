import type {
  BrandIdentity,
  BrandVoice,
  Business,
  BusinessGoal,
  BusinessProfile,
  MarketingGoal,
  ProductOrService,
  TargetMarket,
  ValueProposition,
} from "./types";

export interface CompletenessGroup {
  id: string;
  label: string;
  complete: boolean;
  completed: number;
  total: number;
  missing: string[];
  /** Tab index the group lives under, used by the "Complete Profile" action. */
  tab: number;
}

export interface CompletenessReport {
  score: number; // 0-100
  groups: CompletenessGroup[];
  totalCompleted: number;
  totalPossible: number;
  missingCount: number;
}

function bool(value: boolean): number {
  return value ? 1 : 0;
}

function filled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function listFilled(items: string[] | undefined | null): boolean {
  return Array.isArray(items) && items.length > 0;
}

function profileGroup(p: BusinessProfile): CompletenessGroup {
  const missing: string[] = [];
  if (!filled(p.businessName)) missing.push("Business name");
  if (!filled(p.industry)) missing.push("Industry");
  if (!filled(p.businessType)) missing.push("Business type");
  if (!filled(p.country)) missing.push("Country");
  if (!filled(p.cityRegion)) missing.push("City / region");
  if (!filled(p.website)) missing.push("Website");
  if (!filled(p.businessEmail)) missing.push("Business email");
  if (!filled(p.businessPhone)) missing.push("Business phone");
  if (!filled(p.shortDescription)) missing.push("Short description");
  if (!filled(p.fullDescription)) missing.push("Full description");

  const total = 10;
  const completed = total - missing.length;
  return {
    id: "profile",
    label: "Business information",
    complete: missing.length === 0,
    completed,
    total,
    missing,
    tab: 1,
  };
}

function valueGroup(vp: ValueProposition): CompletenessGroup {
  const missing: string[] = [];
  if (!filled(vp.mainValue)) missing.push("Main value proposition");
  if (!filled(vp.usp)) missing.push("USP");
  if (vp.differentiators.length === 0) missing.push("Key differentiators");
  if (!filled(vp.problemSolved)) missing.push("Problem solved");
  if (!filled(vp.solutionProvided)) missing.push("Solution provided");

  const total = 5;
  const completed = total - missing.length;
  return {
    id: "value",
    label: "Value proposition",
    complete: missing.length === 0,
    completed,
    total,
    missing,
    tab: 3,
  };
}

function productsGroup(products: ProductOrService[]): CompletenessGroup {
  const complete = products.length > 0;
  const missing = complete ? [] : ["Add at least one product or service"];
  return {
    id: "products",
    label: "Products & services",
    complete,
    completed: bool(complete),
    total: 1,
    missing,
    tab: 2,
  };
}

function marketGroup(tm: TargetMarket): CompletenessGroup {
  let completed = 0;
  const missing: string[] = [];
  const checks: Array<[boolean, string]> = [
    [filled(tm.primaryMarket), "Primary market"],
    [filled(tm.customerType), "Customer type (B2B / B2C)"],
    [listFilled(tm.countries), "Countries"],
    [listFilled(tm.industries), "Industries"],
    [listFilled(tm.languages), "Languages"],
    [listFilled(tm.preferredChannels), "Preferred channels"],
    [
      filled(tm.ageRange) || listFilled(tm.jobRoles) || filled(tm.decisionMakerType),
      "Audience details (age / role)",
    ],
  ];
  for (const [ok, label] of checks) {
    completed += bool(ok);
    if (!ok) missing.push(label);
  }
  const total = checks.length;
  return {
    id: "market",
    label: "Target market",
    complete: completed >= Math.ceil(total * 0.6) && missing.length <= 2,
    completed,
    total,
    missing,
    tab: 4,
  };
}

function goalsGroup(businessGoals: BusinessGoal[], mg: MarketingGoal): CompletenessGroup {
  const missing: string[] = [];
  if (businessGoals.length === 0) missing.push("Add business goals");
  else if (businessGoals.every((g) => !filled(g.name))) missing.push("A named business goal");

  if (mg.primaryGoal.length === 0) missing.push("Primary marketing goal");
  if (!filled(mg.monthlyLeadTarget)) missing.push("Monthly lead target");
  if (!filled(mg.marketingBudget)) missing.push("Marketing budget");

  const total = 5;
  const completed = total - missing.length;
  return {
    id: "goals",
    label: "Goals",
    complete: missing.length === 0,
    completed,
    total,
    missing,
    tab: 5,
  };
}

function voiceGroup(bv: BrandVoice): CompletenessGroup {
  const missing: string[] = [];
  if (bv.tones.length === 0) missing.push("Brand tone(s)");
  if (!filled(bv.personality)) missing.push("Brand personality");
  if (bv.wordsToUse.length === 0) missing.push("Words to use");
  if (bv.wordsToAvoid.length === 0) missing.push("Words to avoid");
  if (!filled(bv.communicationStyle)) missing.push("Communication style");

  const total = 5;
  const completed = total - missing.length;
  return {
    id: "voice",
    label: "Brand voice",
    complete: missing.length === 0,
    completed,
    total,
    missing,
    tab: 6,
  };
}

function identityGroup(bi: BrandIdentity): CompletenessGroup {
  const missing: string[] = [];
  if (!bi.logoDataUrl) missing.push("Primary logo");
  if (!filled(bi.primaryColor)) missing.push("Primary brand color");
  if (!filled(bi.secondaryColor)) missing.push("Secondary brand color");
  if (!filled(bi.accentColor)) missing.push("Accent color");
  if (!filled(bi.preferredFont)) missing.push("Preferred font");

  const total = 5;
  const completed = total - missing.length;
  return {
    id: "identity",
    label: "Brand identity",
    complete: missing.length === 0,
    completed,
    total,
    missing,
    tab: 6,
  };
}

export function computeCompleteness(business: Business): CompletenessReport {
  let groups: CompletenessGroup[] = [
    profileGroup(business.profile),
    valueGroup(business.valueProposition),
    productsGroup(business.products),
    marketGroup(business.targetMarket),
    goalsGroup(business.businessGoals, business.marketingGoal),
    voiceGroup(business.brandVoice),
    identityGroup(business.brandIdentity),
  ];

  groups = groups.filter((group) => !group.complete);
  const totalCompleted = groups.reduce((sum, g) => sum + g.completed, 0);
  const totalPossible = groups.reduce((sum, g) => sum + g.total, 0);
  const score = totalPossible === 0 ? 100 : Math.round((totalCompleted / totalPossible) * 100);

  return {
    score,
    groups,
    totalCompleted,
    totalPossible,
    missingCount: groups.reduce((sum, g) => sum + g.missing.length, 0),
  };
}