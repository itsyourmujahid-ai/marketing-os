import { computeCompleteness } from "@/lib/business/completeness";
import type { Business } from "@/lib/business/types";

import {
  CATEGORY_DEFINITIONS,
  filled,
  missingFrom,
} from "./rules";
import type {
  HealthCategory,
  HealthCategoryId,
  HealthRecommendation,
  HealthReport,
  HealthStatus,
  HealthStrength,
  HealthWeakness,
  ReadinessDimension,
  RecommendationPriority,
} from "./types";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export function healthStatusOf(score: number): HealthStatus {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Attention";
  return "Critical";
}

export function priorityOf(score: number): RecommendationPriority {
  if (score < 40) return "Critical";
  if (score < 60) return "High";
  if (score < 80) return "Medium";
  return "Low";
}

// ---------------------------------------------------------------------------
// Recommendation templates keyed by "category:checkId"
// ---------------------------------------------------------------------------

interface RecTemplate {
  title: string;
  description: string;
  relatedRoute: string;
  actionLabel: string;
}

const RECS: Record<string, RecTemplate> = {
  "foundation:name": {
    title: "Add Your Business Name",
    description: "A clear business name is the anchor for every asset and campaign.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:industry": {
    title: "Define Your Industry",
    description: "Your industry shapes positioning, competitors and channel choices.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:type": {
    title: "Select Your Business Type",
    description: "B2B, B2C or service — the engine uses this to score the right audience checks.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:location": {
    title: "Add Your Location",
    description: "Country and region scope your market, ads and content.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:website": {
    title: "Add Your Website",
    description: "A working website is where most campaigns will send people to act.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:contact": {
    title: "Add Contact Details",
    description: "Email or phone makes the business reachable and complete.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:shortDescription": {
    title: "Write a Short Description",
    description: "One or two lines that explain what the business does.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:fullDescription": {
    title: "Write Your Business Description",
    description: "A full description powers content, briefs and future AI context.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "foundation:offers": {
    title: "Add Products or Services",
    description: "Nothing can be marketed until the offer exists — add at least one.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },

  "brand:logo": {
    title: "Add Your Logo",
    description: "A primary logo is the most visible part of your brand identity.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:altLogo": {
    title: "Add a Secondary Logo or Favicon",
    description: "Variants keep the brand consistent across favicons and dark backgrounds.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:colorAny": {
    title: "Define Brand Colors",
    description: "Primary, secondary and accent colors give every asset a consistent look.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:colorPalette": {
    title: "Complete Your Color Palette",
    description: "Add the full primary, secondary and accent set for consistency.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:bgColor": {
    title: "Set a Background Color",
    description: "A background tone keeps surfaces consistent with your identity.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:font": {
    title: "Pick a Preferred Font",
    description: "Frequent fonts keep your layouts and content consistent.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:tones": {
    title: "Define Your Brand Tone",
    description: "Choose the tones your brand speaks in — this drives all copy.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:personality": {
    title: "Describe Brand Personality",
    description: "How would friends describe your brand? This guides voice everywhere.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:communication": {
    title: "Set Your Communication Style",
    description: "Formal, casual or direct — the style steers how messages are written.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:wordsUse": {
    title: "List Words to Use",
    description: "A vocabulary allow-list keeps tone consistent across writers and AI.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:wordsAvoid": {
    title: "List Words to Avoid",
    description: "An avoid-list prevents off-brand phrasing in future content.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "brand:guidelines": {
    title: "Document Brand Guidelines",
    description: "Writing preferences and guidelines complete the brand voice.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },

  "market:primaryMarket": {
    title: "Define Your Primary Market",
    description: "Name the market you operate in so targeting can begin.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:customerType": {
    title: "Choose Your Customer Type",
    description: "B2B, B2C or both — the engine scores the correct audience checks for your model.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "market:location": {
    title: "Add Market Location",
    description: "Specify countries or regions where your audience lives.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:channels": {
    title: "Choose Preferred Channels",
    description: "Knowing where your audience spends time focuses every campaign.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2bIndustries": {
    title: "Define Target Industries (B2B)",
    description: "Which industries should your business serve?",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2bRoles": {
    title: "Identify Job Roles or Departments",
    description: "Name the roles and departments you sell into.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2bDecision": {
    title: "Define Your Decision-Maker",
    description: "Who signs off the purchase? The decision-maker is who you must reach.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2bSize": {
    title: "Specify Company Size (B2B)",
    description: "Target company size helps tailor offers and outreach.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2bLocation": {
    title: "Add B2B Market Location",
    description: "Where are the companies you sell to based?",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2cAudience": {
    title: "Define Consumer Interests or Lifestyle",
    description: "Interests and lifestyle narrow your consumer segments.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2cAge": {
    title: "Set an Age Range (B2C)",
    description: "An age range sharpens messaging and channel selection.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2cBehavior": {
    title: "Describe Buying Behavior",
    description: "How do consumers decide and purchase? Drives funnel and content design.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2cChannels": {
    title: "Pick Consumer Channels (B2C)",
    description: "Where do your consumers hang out online?",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "market:b2cLocation": {
    title: "Add Consumer Market Location",
    description: "Where do the consumers you sell to live?",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },

  "goals:bgNamed": {
    title: "Add Business Goals",
    description: "Goals give your marketing direction and a reason to exist.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:bgMeasurable": {
    title: "Make Goals Measurable",
    description: "Vague goals score lower — add target values and units to every goal.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:bgDeadline": {
    title: "Set Goal Deadlines",
    description: "Deadlines create urgency and make progress reviewable.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:bgPriority": {
    title: "Prioritize Your Goals",
    description: "Mark high-value goals as High or Critical so work is focused.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:bgDescription": {
    title: "Document Your Goals",
    description: "Write a short description so goals are understood by anyone.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgPrimary": {
    title: "Define a Primary Marketing Goal",
    description: "Choose what marketing should achieve first — leads, awareness, revenue.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgSecondary": {
    title: "Add Secondary Marketing Goals",
    description: "Supporting goals round out the plan.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgLeads": {
    title: "Set a Monthly Lead Target",
    description: "A numeric lead target makes marketing measurable.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgRevenue": {
    title: "Set a Monthly Revenue Target",
    description: "Connect marketing volume to actual revenue outcomes.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgConversion": {
    title: "Set a Conversion Target",
    description: "A conversion rate target defines success for funnels.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgBudget": {
    title: "Set a Marketing Budget",
    description: "A budget turns goals into a realistic execution plan.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "goals:mgChannels": {
    title: "List Channels for Each Goal",
    description: "Knowing the channels makes goals actionable.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },

  "offer:products": {
    title: "Define Your Offer",
    description: "Products or service descriptions are the core of any offer.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "offer:descriptions": {
    title: "Describe Your Products",
    description: "Clear descriptions help buyers understand what they get.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "offer:benefits": {
    title: "List Product Benefits",
    description: "Benefits sell outcomes — name what each product actually delivers.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "offer:features": {
    title: "List Product Features",
    description: "Features support benefits with specifics.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "offer:mainValue": {
    title: "Write Your Value Proposition",
    description: "One sentence that explains the core value you deliver.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "offer:usp": {
    title: "Clarify Your USP",
    description: "What makes you different? A clear USP powers positioning.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "offer:problem": {
    title: "Document the Problem You Solve",
    description: "The customer pain your offer removes — essential for messaging.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "offer:solution": {
    title: "Define Your Solution",
    description: "How exactly does your offer solve the problem?",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "offer:differentiators": {
    title: "List Key Differentiators",
    description: "Why should buyers pick you over alternatives?",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },

  "conversion:market": {
    title: "Define Your Target Market",
    description: "Conversion starts with knowing exactly who to convert.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "conversion:offer": {
    title: "Define a Clear Offer",
    description: "You cannot convert without something concrete to sell.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "conversion:value": {
    title: "Write a Clear Value Proposition",
    description: "The value must be obvious in the first seconds of any touchpoint.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "conversion:cta": {
    title: "Define a Call-to-Action Concept",
    description: "Offer, value and a channel in place make a CTA possible — name what you want people to do.",
    relatedRoute: "/offers",
    actionLabel: "Go to Offers",
  },
  "conversion:website": {
    title: "Add Your Website",
    description: "Most campaigns need a destination — a working website is critical for conversion.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },

  "content:audience": {
    title: "Define Your Target Audience",
    description: "Content without an audience in mind speaks to nobody.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "content:audienceDetail": {
    title: "Add Audience Detail",
    description: "Interests, roles or ages make content feel personal.",
    relatedRoute: "/audience",
    actionLabel: "Go to Audience",
  },
  "content:voice": {
    title: "Define Your Brand Voice",
    description: "Tone plus personality keep every piece of content on-brand.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "content:communication": {
    title: "Set a Communication Style",
    description: "A consistent style makes content recognizable.",
    relatedRoute: "/business",
    actionLabel: "Go to Brand Setup",
  },
  "content:products": {
    title: "Catalog Products to Write About",
    description: "Content needs subjects — add products or services first.",
    relatedRoute: "/business",
    actionLabel: "Go to Business Setup",
  },
  "content:value": {
    title: "Write Your Value Proposition",
    description: "Every post should reinforce the core value you deliver.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "content:usp": {
    title: "Clarify Your USP",
    description: "A clear USP gives content a differentiating angle.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "content:problem": {
    title: "Document the Problem You Solve",
    description: "Problem-focused content resonates — define the pain upfront.",
    relatedRoute: "/business",
    actionLabel: "Go to Value Proposition",
  },
  "content:channels": {
    title: "Choose Content Channels",
    description: "Pick the channels your audience uses so content reaches them.",
    relatedRoute: "/content",
    actionLabel: "Go to Content Studio",
  },

  "measurement:mgPrimary": {
    title: "Define a Primary Marketing Goal",
    description: "Measure against the one thing marketing must achieve first.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgLeads": {
    title: "Set a Monthly Lead Target",
    description: "A numeric lead target enables real performance tracking.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgRevenue": {
    title: "Set a Monthly Revenue Target",
    description: "Revenue targets tie marketing effort to business outcomes.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgConversion": {
    title: "Set a Conversion Target",
    description: "Without a conversion target, funnel performance is unmeasurable.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgBudget": {
    title: "Set a Marketing Budget",
    description: "A budget defines what measurement and execution are possible.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgChannels": {
    title: "Define Your Channel Mix",
    description: "Known channels make spend and attribution trackable.",
    relatedRoute: "/analytics",
    actionLabel: "Go to Analytics",
  },
  "measurement:mgMeasurable": {
    title: "Make Goals Measurable",
    description: "Goals with target values and units give measurement something to count.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
  "measurement:mgDeadlines": {
    title: "Add Deadlines to Goals",
    description: "Time-boxed goals let you measure progress over time.",
    relatedRoute: "/business",
    actionLabel: "Go to Goals",
  },
};

function recTemplateFor(category: HealthCategoryId, checkId: string): RecTemplate {
  return (
    RECS[`${category}:${checkId}`] ?? {
      title: `Improve ${category} data`,
      description: "Complete the missing details for this area.",
      relatedRoute: "/business",
      actionLabel: "Go to Business Setup",
    }
  );
}

// ---------------------------------------------------------------------------
// Strengths / weaknesses / readiness
// ---------------------------------------------------------------------------

function buildStrengths(categories: HealthCategory[], b: Business): HealthStrength[] {
  const strength: HealthStrength[] = [];

  for (const cat of categories) {
    if (cat.score >= 80) {
      strength.push({
        id: `cat-${cat.id}`,
        label: `Strong ${cat.name}`,
        category: cat.id,
        score: cat.score,
      });
    }
  }

  const id = b.brandIdentity;
  if (id.logoDataUrl || filled(id.primaryColor) || filled(id.secondaryColor)) {
    strength.push({
      id: "brand-identity",
      label: "Strong brand identity",
      category: "brand",
      score: 95,
    });
  }
  const describedProducts =
    b.products.length > 0 &&
    b.products.some((pr) => filled(pr.shortDescription) || filled(pr.detailedDescription));
  if (describedProducts) {
    strength.push({
      id: "clear-offering",
      label: "Clear service offering",
      category: "offer",
      score: 90,
    });
  }
  if (filled(b.targetMarket.customerType) && filled(b.targetMarket.primaryMarket)) {
    strength.push({
      id: "target-market",
      label: "Defined target market",
      category: "market",
      score: 88,
    });
  }
  const measurableGoal =
    b.businessGoals.some((g) => filled(g.targetValue) && filled(g.unit)) &&
    filled(b.marketingGoal.primaryGoal);
  if (measurableGoal) {
    strength.push({
      id: "measurable-goals",
      label: "Measurable marketing goals",
      category: "goals",
      score: 86,
    });
  }

  const seen = new Set<string>();
  const unique: HealthStrength[] = [];
  for (const s of strength) {
    if (seen.has(s.label)) continue;
    seen.add(s.label);
    unique.push(s);
  }
  return unique.sort((a, b) => b.score - a.score).slice(0, 6);
}

function buildWeaknesses(categories: HealthCategory[]): HealthWeakness[] {
  const weaknesses: HealthWeakness[] = [];

  for (const cat of categories) {
    const severity = 100 - cat.score;
    if (cat.score < 60) {
      weaknesses.push({
        id: `cat-${cat.id}`,
        label: `${cat.name} needs attention`,
        category: cat.id,
        score: cat.score,
        severity,
      });
    }
    for (const check of cat.checks) {
      if (check.passed) continue;
      const label = weaknessLabel(cat.id, check.id);
      if (label) {
        weaknesses.push({
          id: `check-${cat.id}-${check.id}`,
          label,
          category: cat.id,
          score: cat.score,
          severity: severity + 12,
        });
      }
    }
  }

  const seen = new Set<string>();
  const unique: HealthWeakness[] = [];
  for (const w of weaknesses) {
    if (seen.has(w.label)) continue;
    seen.add(w.label);
    unique.push(w);
  }
  return unique.sort((a, b) => b.severity - a.severity).slice(0, 8);
}

function weaknessLabel(category: HealthCategoryId, checkId: string): string | null {
  switch (`${category}:${checkId}`) {
    case "foundation:name":
      return "Business identity incomplete";
    case "foundation:offers":
      return "No products or services defined";
    case "market:customerType":
      return "Target audience is not defined";
    case "market:primaryMarket":
      return "Primary market missing";
    case "market:b2bDecision":
      return "B2B decision-maker not identified";
    case "market:b2cAudience":
      return "Consumer segments are too broad";
    case "brand:tones":
      return "Missing brand voice";
    case "brand:logo":
      return "Missing brand identity (logo / colors)";
    case "goals:bgMeasurable":
      return "Business goals lack measurable targets";
    case "goals:mgPrimary":
      return "No measurable marketing goal";
    case "measurement:mgLeads":
      return "No monthly lead target";
    case "measurement:mgConversion":
      return "No conversion target";
    case "measurement:mgBudget":
      return "Marketing budget not set";
    case "conversion:website":
      return "No website to drive conversion";
    case "conversion:cta":
      return "No clear call-to-action concept";
    default:
      return null;
  }
}

function buildReadiness(categories: HealthCategory[]): ReadinessDimension[] {
  const byId = new Map(categories.map((c) => [c.id, c] as const));
  const score = (id: HealthCategoryId) => byId.get(id)?.score ?? 0;

  return [
    { id: "strategy", label: "Strategy", score: score("goals"), relatedRoute: "/strategy" },
    { id: "audience", label: "Audience", score: score("market"), relatedRoute: "/audience" },
    { id: "brand", label: "Brand", score: score("brand"), relatedRoute: "/business" },
    { id: "conversion", label: "Conversion", score: score("conversion"), relatedRoute: "/landing-pages" },
    { id: "content", label: "Content", score: score("content"), relatedRoute: "/content" },
    { id: "offers", label: "Offers", score: score("offer"), relatedRoute: "/offers" },
    { id: "measurement", label: "Measurement", score: score("measurement"), relatedRoute: "/analytics" },
  ];
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function computeHealthReport(business: Business): HealthReport {
  const now = new Date().toISOString();

  const categories: HealthCategory[] = CATEGORY_DEFINITIONS.map((def) => {
    const { checks, explanation } = def.run(business);
    const total = checks.reduce((s, c) => s + c.points, 0);
    const earned = checks.reduce((s, c) => s + (c.passed ? c.points : 0), 0);
    const score = total <= 0 ? 0 : Math.round((earned / total) * 100);

    const activeChecks = checks.filter((c) => !c.passed);
    const recs: HealthRecommendation[] = activeChecks.map((c) => {
      const tpl = recTemplateFor(def.id, c.id);
      return {
        id: `${def.id}-${c.id}`,
        title: tpl.title,
        description: tpl.description,
        category: def.id,
        categoryName: def.name,
        priority: priorityOf(score <= 100 ? score : 0),
        relatedRoute: tpl.relatedRoute,
        actionLabel: tpl.actionLabel,
        severity: 100 - score,
      };
    });

    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      weight: def.weight,
      score,
      status: healthStatusOf(score),
      explanation,
      checks,
      missing: missingFrom(checks),
      recommendations: recs,
    };
  });

  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  const overallScore =
    totalWeight === 0
      ? 0
      : Math.round(categories.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight);

  const recs = categories
    .flatMap((c) => c.recommendations)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.severity - a.severity)
    .slice(0, 12);

  const completeness = computeCompleteness(business).score;
  const hasSubstantialData =
    filled(business.profile.businessName) ||
    business.products.length > 0 ||
    filled(business.targetMarket.customerType) ||
    filled(business.valueProposition.mainValue) ||
    business.brandVoice.tones.length > 0;

  return {
    overallScore,
    status: healthStatusOf(overallScore),
    explanation: overallExplanation(overallScore),
    hasSubstantialData,
    categories,
    strengths: buildStrengths(categories, business),
    weaknesses: buildWeaknesses(categories),
    recommendations: recs,
    readiness: buildReadiness(categories),
    completenessScore: completeness,
    generatedAt: now,
  };
}

function overallExplanation(score: number): string {
  if (score >= 80) return "Strong marketing foundation — future modules can build directly on this data.";
  if (score >= 60) return "Solid marketing setup with a few gaps worth closing.";
  if (score >= 40) return "You have a base to build on, but several important gaps hold your marketing back.";
  return "Your marketing foundation needs attention before campaigns can succeed.";
}