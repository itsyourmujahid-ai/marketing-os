import { getBusinessService } from "@/lib/business/service";
import type { Business } from "@/lib/business/types";

import { computeHealthReport } from "./scoring";
import type { HealthReport } from "./types";

/**
 * HealthService is the single entry point for the Marketing Health engine.
 *
 * The score is NEVER hard-coded and NEVER computed inside React components:
 * components ask this service for a `HealthReport`, which the deterministic
 * scoring engine derives from the real Business & Brand data.
 */
export class HealthService {
  constructor(private readonly read: () => Promise<Business>) {}

  /** Reads the latest business data and computes a fresh health report. */
  async getReport(): Promise<HealthReport> {
    const business = await this.read();
    return computeHealthReport(business);
  }
}

let healthService: HealthService | null = null;

export function getHealthService(): HealthService {
  if (!healthService) {
    const businessService = getBusinessService();
    healthService = new HealthService(() => businessService.getBusiness());
  }
  return healthService;
}