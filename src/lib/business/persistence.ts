import { BUSINESS_STORAGE_KEY, BUSINESS_VERSION, type Business } from "./types";
import { createEmptyBusiness } from "./factory";

export interface BusinessRepository {
  load(): Promise<Business>;
  save(business: Business): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Temporary local persistence for Phase 1.
 *
 * The app has no backend/database yet, so the repository layer behind this
 * interface stores the business aggregate in browser localStorage. Every
 * consumer only depends on `BusinessRepository`, so swapping this implementation
 * for a real database (API / IndexedDB / server) later requires no UI changes.
 */
export class LocalStorageBusinessRepository implements BusinessRepository {
  private readonly key: string;

  constructor(key: string = BUSINESS_STORAGE_KEY) {
    this.key = key;
  }

  async load(): Promise<Business> {
    const base = createEmptyBusiness();
    if (typeof window === "undefined") return base;

    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return base;
      const parsed = JSON.parse(raw) as Partial<Business>;
      return migrate(parsed, base);
    } catch {
      return base;
    }
  }

  async save(business: Business): Promise<void> {
    const payload = { ...business, version: business.version, updatedAt: new Date().toISOString() };
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(payload));
    } catch (error) {
      const message = error instanceof DOMException ? error.name : String(error);
      if (message === "QuotaExceededError") {
        throw new Error(
          "Storage is full. Large image uploads can fill localStorage — try smaller files (under 1 MB) or remove old brand assets.",
        );
      }
      throw new Error("Could not save business data locally.");
    }
    // Persist a non-blocking microtask flush semantics for repository consumers.
    await Promise.resolve();
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.key);
  }
}

function deepMerge<T>(fallback: T, stored: Partial<T>, keys: ReadonlyArray<keyof T>): T {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const value = stored[key];
    result[key as string] = value === undefined || value === null ? fallback[key] : value;
  }
  return result as T;
}

/**
 * Merge stored JSON over a fresh empty aggregate so missing/legacy keys never
 * result in undefined slices reaching the UI.
 */
function migrate(stored: Partial<Business>, base: Business): Business {
  return {
    version: BUSINESS_VERSION,
    updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : base.updatedAt,
    profile: deepMerge(base.profile, stored.profile ?? {}, Object.keys(base.profile) as (keyof Business["profile"])[]),
    valueProposition: deepMerge(
      base.valueProposition,
      stored.valueProposition ?? {},
      Object.keys(base.valueProposition) as (keyof Business["valueProposition"])[],
    ),
    products: Array.isArray(stored.products) ? stored.products : base.products,
    targetMarket: deepMerge(
      base.targetMarket,
      stored.targetMarket ?? {},
      Object.keys(base.targetMarket) as (keyof Business["targetMarket"])[],
    ),
    businessGoals: Array.isArray(stored.businessGoals)
      ? stored.businessGoals
      : base.businessGoals,
    marketingGoal: deepMerge(
      base.marketingGoal,
      stored.marketingGoal ?? {},
      Object.keys(base.marketingGoal) as (keyof Business["marketingGoal"])[],
    ),
    brandVoice: deepMerge(
      base.brandVoice,
      stored.brandVoice ?? {},
      Object.keys(base.brandVoice) as (keyof Business["brandVoice"])[],
    ),
    brandIdentity: deepMerge(
      base.brandIdentity,
      stored.brandIdentity ?? {},
      Object.keys(base.brandIdentity) as (keyof Business["brandIdentity"])[],
    ),
  };
}