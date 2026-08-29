import type { Business } from "./types";

/**
 * Future AI context builder.
 *
 * Produces a plain, JSON-serializable snapshot the AI Marketing Manager (and
 * other agents) can consume later. NO AI/API call is made here — this only
 * prepares the shape of the context that future modules will retrieve.
 */
export interface BusinessAiContext {
  generatedAt: string;
  business: {
    name: string;
    type: string;
    industry: string;
    country: string;
    website: string;
    shortDescription: string;
    fullDescription: string;
  };
  valueProposition: {
    mainValue: string;
    usp: string;
    differentiators: string[];
    problemSolved: string;
    solutionProvided: string;
  };
  products: Array<{
    id: string;
    name: string;
    kind: string;
    summary: string;
    price: string;
    currency: string;
    keyBenefits: string[];
    features: string[];
    targetAudience: string;
    status: string;
  }>;
  targetMarket: {
    primaryMarket: string;
    customerType: string;
    countries: string[];
    citiesRegions: string[];
    industries: string[];
    companySize: string;
    jobRoles: string[];
    departments: string[];
    decisionMakerType: string;
    ageRange: string;
    gender: string;
    interests: string[];
    lifestyle: string;
    buyingBehavior: string;
    languages: string[];
    preferredChannels: string[];
  };
  goals: {
    business: Array<{
      name: string;
      description: string;
      targetValue: string;
      currentValue: string;
      unit: string;
      deadline: string;
      priority: string;
      status: string;
    }>;
    marketing: {
      primaryGoal: string;
      secondaryGoals: string[];
      monthlyLeadTarget: string;
      monthlyRevenueTarget: string;
      marketingBudget: string;
      preferredChannels: string[];
      targetConversionRate: string;
    };
  };
  brand: {
    voice: {
      tones: string[];
      personality: string;
      wordsToUse: string[];
      wordsToAvoid: string[];
      communicationStyle: string;
      writingPreferences: string;
      additionalGuidelines: string;
    };
    identity: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      preferredFont: string;
      brandNotes: string;
      hasLogo: boolean;
    };
  };
}

export function buildBusinessContext(business: Business): BusinessAiContext {
  return {
    generatedAt: new Date().toISOString(),
    business: {
      name: business.profile.businessName,
      type: business.profile.businessType,
      industry: business.profile.industry,
      country: business.profile.country,
      website: business.profile.website,
      shortDescription: business.profile.shortDescription,
      fullDescription: business.profile.fullDescription,
    },
    valueProposition: {
      mainValue: business.valueProposition.mainValue,
      usp: business.valueProposition.usp,
      differentiators: business.valueProposition.differentiators,
      problemSolved: business.valueProposition.problemSolved,
      solutionProvided: business.valueProposition.solutionProvided,
    },
    products: business.products.map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      summary: p.shortDescription,
      price: p.price,
      currency: p.currency,
      keyBenefits: p.keyBenefits,
      features: p.features,
      targetAudience: p.targetAudience,
      status: p.status,
    })),
    targetMarket: {
      primaryMarket: business.targetMarket.primaryMarket,
      customerType: business.targetMarket.customerType,
      countries: business.targetMarket.countries,
      citiesRegions: business.targetMarket.citiesRegions,
      industries: business.targetMarket.industries,
      companySize: business.targetMarket.companySize,
      jobRoles: business.targetMarket.jobRoles,
      departments: business.targetMarket.departments,
      decisionMakerType: business.targetMarket.decisionMakerType,
      ageRange: business.targetMarket.ageRange,
      gender: business.targetMarket.gender,
      interests: business.targetMarket.interests,
      lifestyle: business.targetMarket.lifestyle,
      buyingBehavior: business.targetMarket.buyingBehavior,
      languages: business.targetMarket.languages,
      preferredChannels: business.targetMarket.preferredChannels,
    },
    goals: {
      business: business.businessGoals.map((g) => ({
        name: g.name,
        description: g.description,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        deadline: g.deadline,
        priority: g.priority,
        status: g.status,
      })),
      marketing: {
        primaryGoal: business.marketingGoal.primaryGoal,
        secondaryGoals: business.marketingGoal.secondaryGoals,
        monthlyLeadTarget: business.marketingGoal.monthlyLeadTarget,
        monthlyRevenueTarget: business.marketingGoal.monthlyRevenueTarget,
        marketingBudget: business.marketingGoal.marketingBudget,
        preferredChannels: business.marketingGoal.preferredChannels,
        targetConversionRate: business.marketingGoal.targetConversionRate,
      },
    },
    brand: {
      voice: {
        tones: business.brandVoice.tones,
        personality: business.brandVoice.personality,
        wordsToUse: business.brandVoice.wordsToUse,
        wordsToAvoid: business.brandVoice.wordsToAvoid,
        communicationStyle: business.brandVoice.communicationStyle,
        writingPreferences: business.brandVoice.writingPreferences,
        additionalGuidelines: business.brandVoice.additionalGuidelines,
      },
      identity: {
        primaryColor: business.brandIdentity.primaryColor,
        secondaryColor: business.brandIdentity.secondaryColor,
        accentColor: business.brandIdentity.accentColor,
        backgroundColor: business.brandIdentity.backgroundColor,
        preferredFont: business.brandIdentity.preferredFont,
        brandNotes: business.brandIdentity.brandNotes,
        hasLogo: Boolean(business.brandIdentity.logoDataUrl),
      },
    },
  };
}