import { getAudienceService } from "@/lib/audience/service";
import type { AudienceState } from "@/lib/audience/types";
import { getBusinessService } from "@/lib/business/service";
import type { Business } from "@/lib/business/types";

import { computeHealthReport } from "./scoring";
import type { HealthReport } from "./types";

/**
 * HealthService is the single entry point for the Marketing Health engine.
 *
 * The score is NEVER hard-coded and NEVER computed inside React components:
 * components ask this service for a `HealthReport`, which the deterministic
 * scoring engine derives from the real Business & Brand data plus the Audience
 * module state.
 */
export class HealthService {
  constructor(
    private readonly read: () => Promise<Business>,
    private readonly readAudience: () => Promise<AudienceState>,
  ) {}

  /** Reads the latest business & audience data and computes a fresh report. */
  async getReport(): Promise<HealthReport> {
    const [business, audience] = await Promise.all([this.read(), this.readAudience()]);
    return computeHealthReport(business, audience);
  }
}

let healthService: HealthService | null = null;

export function getHealthService(): HealthService {
  if (!healthService) {
    const businessService = getBusinessService();
    const audienceService = getAudienceService();
    healthService = new HealthService(
      () => businessService.getBusiness(),
      () => audienceService.getState(),
    );
  }
  return healthService;
}