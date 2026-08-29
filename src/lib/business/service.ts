import { createEmptyBusiness } from "./factory";
import type {
  Business,
  BrandIdentity,
  BrandVoice,
  BusinessGoal,
  BusinessProfile,
  MarketingGoal,
  ProductOrService,
  TargetMarket,
  ValueProposition,
} from "./types";
import type { BusinessRepository } from "./persistence";

type Sections = keyof Business;

type SectionValue<K extends Sections> = Business[K];

/**
 * Single point of entry for reading/writing the business aggregate.
 *
 * UI never touches the repository directly — it calls these methods. Future
 * modules (Strategy, Audience, Campaigns, Content, Analytics, AI Marketing
 * Manager) should also read through `getBusiness()` so the data stays the
 * workspace's single source of truth.
 */
export class BusinessService {
  constructor(private readonly repository: BusinessRepository) {}

  async getBusiness(): Promise<Business> {
    return this.repository.load();
  }

  async patch<K extends Sections>(key: K, value: SectionValue<K>): Promise<Business> {
    const current = await this.repository.load();
    const next: Business = {
      ...current,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(next);
    return next;
  }

  async saveProfile(profile: BusinessProfile): Promise<Business> {
    return this.patch("profile", profile);
  }

  async saveValueProposition(vp: ValueProposition): Promise<Business> {
    return this.patch("valueProposition", vp);
  }

  async saveProducts(products: ProductOrService[]): Promise<Business> {
    return this.patch("products", products);
  }

  async saveTargetMarket(targetMarket: TargetMarket): Promise<Business> {
    return this.patch("targetMarket", targetMarket);
  }

  async saveBusinessGoals(goals: BusinessGoal[]): Promise<Business> {
    return this.patch("businessGoals", goals);
  }

  async saveMarketingGoal(goal: MarketingGoal): Promise<Business> {
    return this.patch("marketingGoal", goal);
  }

  async saveBrandVoice(voice: BrandVoice): Promise<Business> {
    return this.patch("brandVoice", voice);
  }

  async saveBrandIdentity(identity: BrandIdentity): Promise<Business> {
    return this.patch("brandIdentity", identity);
  }

  /** Reset the whole business workspace. */
  async resetBusiness(): Promise<Business> {
    const empty = createEmptyBusiness();
    await this.repository.save(empty);
    return empty;
  }
}

// ---------------------------------------------------------------------------
// Singleton for the client
// ---------------------------------------------------------------------------

import { LocalStorageBusinessRepository } from "./persistence";

let businessService: BusinessService | null = null;

export function getBusinessService(): BusinessService {
  if (!businessService) {
    businessService = new BusinessService(new LocalStorageBusinessRepository());
  }
  return businessService;
}