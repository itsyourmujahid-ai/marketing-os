import { createEmptyPersona, createEmptySegment, createEmptyState } from "./factory";
import {
  AUDIENCE_STORAGE_KEY,
  AUDIENCE_VERSION,
  type AudienceSegment,
  type AudienceState,
  type Persona,
  type RecordStatus,
} from "./types";

export interface AudienceRepository {
  load(): Promise<AudienceState>;
  save(state: AudienceState): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Temporary local persistence for Phase 3 (same contract as the Business repo).
 *
 * Every consumer depends on `AudienceRepository`, so swapping localStorage for
 * a real database later requires no UI changes.
 */
export class LocalStorageAudienceRepository implements AudienceRepository {
  private readonly key: string;

  constructor(key: string = AUDIENCE_STORAGE_KEY) {
    this.key = key;
  }

  async load(): Promise<AudienceState> {
    if (typeof window === "undefined") return createEmptyState();
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return createEmptyState();
      return migrateState(JSON.parse(raw) as Partial<AudienceState>);
    } catch {
      return createEmptyState();
    }
  }

  async save(state: AudienceState): Promise<void> {
    if (typeof window === "undefined") return;
    const payload = { ...state, version: AUDIENCE_VERSION };
    try {
      window.localStorage.setItem(this.key, JSON.stringify(payload));
    } catch (error) {
      const message = error instanceof DOMException ? error.name : String(error);
      if (message === "QuotaExceededError") {
        throw new Error("Could not save audience data — storage is full.");
      }
      throw new Error("Could not save audience data locally.");
    }
    await Promise.resolve();
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.key);
  }
}

function isRecordStatus(value: unknown): value is RecordStatus {
  return value === "Draft" || value === "Active" || value === "Archived";
}

function isSegment(value: unknown): value is AudienceSegment {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<AudienceSegment>;
  return typeof s.id === "string" && typeof s.name === "string" &&
    (s.audienceType === "B2B" || s.audienceType === "B2C");
}

function isPersona(value: unknown): value is Persona {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Persona>;
  return typeof p.id === "string" && typeof p.segmentId === "string" && typeof p.name === "string";
}

/**
 * Merge stored JSON over a fresh state so missing/legacy keys never surface as
 * undefined slices in the UI.
 */
function migrateState(stored: Partial<AudienceState>): AudienceState {
  const base = createEmptyState();
  const segments = Array.isArray(stored.segments)
    ? stored.segments
        .filter(isSegment)
        .map((seg) => ({
          ...createEmptySegment(),
          ...seg,
          id: seg.id,
          status: isRecordStatus(seg.status) ? seg.status : "Draft",
          createdAt: seg.createdAt || base.segments[0]?.createdAt || new Date().toISOString(),
          updatedAt: seg.updatedAt || seg.createdAt || new Date().toISOString(),
        }))
    : base.segments;

  const personas = Array.isArray(stored.personas)
    ? stored.personas
        .filter(isPersona)
        .map((persona) => ({
          ...createEmptyPersona(persona.segmentId),
          ...persona,
          id: persona.id,
          segmentId: persona.segmentId,
          status: isRecordStatus(persona.status) ? persona.status : "Draft",
          createdAt: typeof persona.createdAt === "string" ? persona.createdAt : new Date().toISOString(),
          updatedAt: typeof persona.updatedAt === "string" ? persona.updatedAt : new Date().toISOString(),
        }))
    : base.personas;

  return { version: AUDIENCE_VERSION, segments, personas };
}