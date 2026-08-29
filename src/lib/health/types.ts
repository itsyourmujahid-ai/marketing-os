import type { IconName } from "@/components/ui/icon";

export type HealthStatus = "Critical" | "Needs Attention" | "Good" | "Excellent";

export type RecommendationPriority = "Critical" | "High" | "Medium" | "Low";

export type HealthCategoryId =
  | "foundation"
  | "brand"
  | "market"
  | "goals"
  | "offer"
  | "conversion"
  | "content"
  | "measurement";

export interface HealthCheck {
  id: string;
  label: string;
  passed: boolean;
  /** Human note explaining why this check did or did not pass. */
  detail?: string;
  points: number;
}

export interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  category: HealthCategoryId;
  categoryName: string;
  priority: RecommendationPriority;
  relatedRoute: string;
  actionLabel: string;
  /** 0-100, higher = more urgent gap. Drives sorting. */
  severity: number;
}

export interface HealthStrength {
  id: string;
  label: string;
  category: HealthCategoryId;
  score: number;
}

export interface HealthWeakness {
  id: string;
  label: string;
  category: HealthCategoryId;
  score: number;
  /** 0 = strong, 100 = worst gap. Higher is more severe. */
  severity: number;
}

/** A diagnostic readiness figure for a future Marketing OS module. */
export interface ReadinessDimension {
  id: string;
  label: string;
  score: number;
  relatedRoute: string;
}

export interface HealthCategory {
  id: HealthCategoryId;
  name: string;
  icon: IconName;
  /** Relative weight in the overall score (sums to 100 across categories). */
  weight: number;
  score: number;
  status: HealthStatus;
  explanation: string;
  checks: HealthCheck[];
  missing: string[];
  recommendations: HealthRecommendation[];
}

export interface HealthReport {
  overallScore: number;
  status: HealthStatus;
  explanation: string;
  /** True when there is at least some Business & Brand data to evaluate. */
  hasSubstantialData: boolean;
  categories: HealthCategory[];
  strengths: HealthStrength[];
  weaknesses: HealthWeakness[];
  recommendations: HealthRecommendation[];
  readiness: ReadinessDimension[];
  completenessScore: number;
  generatedAt: string;
}