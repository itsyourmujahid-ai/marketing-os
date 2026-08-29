/* @ts-nocheck */

import type { IconName } from "@/components/ui/icon";

export type FeatureStatus = "available" | "coming-soon";

export interface Feature {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: IconName;
  status: FeatureStatus;
}

// Centralized feature registry for Marketing OS
// Dashboard is "available", everything else is "coming-soon" for now
export const features: Feature[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Marketing command center with health metrics and overview",
    route: "/dashboard",
    icon: "home",
    status: "available",
  },
  {
    id: "strategy-marketing-strategist",
    name: "Marketing Strategist",
    description: "Build and manage marketing strategies",
    route: "/strategy",
    icon: "type",
    status: "coming-soon",
  },
  {
    id: "strategy-market-research",
    name: "Market Research",
    description: "Research markets and identify opportunities",
    route: "/research",
    icon: "search",
    status: "coming-soon",
  },
  {
    id: "strategy-audience-personas",
    name: "Audience & Personas",
    description: "Define and manage target audiences and personas",
    route: "/audience",
    icon: "user",
    status: "coming-soon",
  },
  {
    id: "strategy-competitor-intelligence",
    name: "Competitor Intelligence",
    description: "Monitor and analyze competitor activity",
    route: "/competitors",
    icon: "grid",
    status: "coming-soon",
  },
  {
    id: "campaigns-campaigns",
    name: "Campaigns",
    description: "Plan, launch and manage marketing campaigns",
    route: "/campaigns",
    icon: "layout",
    status: "coming-soon",
  },
  {
    id: "campaigns-offers",
    name: "Offers",
    description: "Create and manage offers and promotions",
    route: "/offers",
    icon: "briefcase",
    status: "coming-soon",
  },
  {
    id: "campaigns-landing-pages",
    name: "Landing Pages",
    description: "Build and publish landing pages",
    route: "/landing-pages",
    icon: "image",
    status: "coming-soon",
  },
  {
    id: "content-content-studio",
    name: "Content Studio",
    description: "Create and manage content assets",
    route: "/content",
    icon: "palette",
    status: "coming-soon",
  },
  {
    id: "content-content-calendar",
    name: "Content Calendar",
    description: "Plan and schedule content publication",
    route: "/calendar",
    icon: "grid",
    status: "coming-soon",
  },
  {
    id: "content-creative-briefs",
    name: "Creative Briefs",
    description: "Define and track creative briefs",
    route: "/creative-briefs",
    icon: "briefcase",
    status: "coming-soon",
  },
  {
    id: "content-asset-library",
    name: "Asset Library",
    description: "Manage marketing assets and creatives",
    route: "/assets",
    icon: "image",
    status: "coming-soon",
  },
  {
    id: "leads-lead-generation",
    name: "Lead Generation",
    description: "Generate and capture leads",
    route: "/leads",
    icon: "target",
    status: "coming-soon",
  },
  {
    id: "leads-crm",
    name: "Leads / CRM",
    description: "Manage leads and customer relationships",
    route: "/crm",
    icon: "users",
    status: "coming-soon",
  },
  {
    id: "leads-lead-scoring",
    name: "Lead Scoring",
    description: "Score and qualify leads automatically",
    route: "/lead-scoring",
    icon: "sliders",
    status: "coming-soon",
  },
  {
    id: "leads-sales-pipeline",
    name: "Sales Pipeline",
    description: "Visual sales pipeline management",
    route: "/pipeline",
    icon: "slider-horizontal",
    status: "coming-soon",
  },
  {
    id: "leads-forms",
    name: "Forms",
    description: "Create and manage marketing forms",
    route: "/forms",
    icon: "form",
    status: "coming-soon",
  },
  {
    id: "automation-email-marketing",
    name: "Email Marketing",
    description: "Send and manage email campaigns",
    route: "/email",
    icon: "mail",
    status: "coming-soon",
  },
  {
    id: "automation-email-sequences",
    name: "Email Sequences",
    description: "Build automated email sequences",
    route: "/sequences",
    icon: "repeat",
    status: "coming-soon",
  },
  {
    id: "automation-automation-builder",
    name: "Automation Builder",
    description: "Build marketing automations visually",
    route: "/automation",
    icon: "wrench",
    status: "coming-soon",
  },
  {
    id: "analytics-analytics",
    name: "Analytics",
    description: "Marketing performance analysis",
    route: "/analytics",
    icon: "chart",
    status: "coming-soon",
  },
  {
    id: "analytics-attribution",
    name: "Attribution",
    description: "Track marketing attribution and ROI",
    route: "/attribution",
    icon: "calendar",
    status: "coming-soon",
  },
  {
    id: "analytics-ai-insights",
    name: "AI Insights",
    description: "Receive AI-powered marketing recommendations",
    route: "/ai-insights",
    icon: "zap",
    status: "coming-soon",
  },
  {
    id: "team-team",
    name: "Team",
    description: "Manage marketing team members",
    route: "/team",
    icon: "users",
    status: "coming-soon",
  },
  {
    id: "team-tasks",
    name: "Tasks",
    description: "Assign and track tasks",
    route: "/tasks",
    icon: "check",
    status: "coming-soon",
  },
  {
    id: "team-approvals",
    name: "Approvals",
    description: "Review and approve marketing assets",
    route: "/approvals",
    icon: "badgeCheck",
    status: "coming-soon",
  },
  {
    id: "system-integrations",
    name: "Integrations",
    description: "Connect external integrations and APIs",
    route: "/integrations",
    icon: "sync",
    status: "coming-soon",
  },
  {
    id: "system-notifications",
    name: "Notifications",
    description: "Manage marketing notifications",
    route: "/notifications",
    icon: "bell",
    status: "coming-soon",
  },
  {
    id: "system-settings",
    name: "Settings",
    description: "Application settings and preferences",
    route: "/settings",
    icon: "settings",
    status: "coming-soon",
  },
];

export function getFeature(route: string): Feature | undefined {
  return features.find((feature) => feature.route === route);
}

export function isFeatureAvailable(route: string): boolean {
  const feature = getFeature(route);
  return feature ? feature.status === "available" : false;
}

export function getAvailableFeatures(): Feature[] {
  return features.filter((feature) => feature.status === "available");
}

export function getComingSoonFeatures(): Feature[] {
  return features.filter((feature) => feature.status === "coming-soon");
}