import { createEmptyPersona, createEmptySegment, createId } from "./factory";
import { LocalStorageAudienceRepository, type AudienceRepository } from "./persistence";
import type {
  AudienceSegment,
  AudienceState,
  Persona,
  PersonaDraft,
  SegmentDraft,
} from "./types";

/**
 * AudienceService owns every write to audience state (segments + personas).
 *
 * The service enforces the relationship rules the UI depends on: personas must
 * belong to an existing segment, and a segment with attached personas can only
 * be removed with an explicit cascade. UI code never mutates storage directly.
 */
export class AudienceService {
  constructor(private readonly repository: AudienceRepository) {}

  async getState(): Promise<AudienceState> {
    return this.repository.load();
  }

  private async update(transform: (state: AudienceState) => AudienceState): Promise<AudienceState> {
    const state = await this.repository.load();
    const next = transform(state);
    await this.repository.save(next);
    return next;
  }

  async createSegment(draft: SegmentDraft): Promise<AudienceState> {
    return this.update((s) => ({
      ...s,
      segments: [...s.segments, createEmptySegment(draft)],
    }));
  }

  async updateSegment(id: string, patch: Partial<AudienceSegment>): Promise<AudienceState> {
    return this.update((s) => ({
      ...s,
      segments: s.segments.map((seg) =>
        seg.id === id
          ? { ...seg, ...patch, id: seg.id, updatedAt: new Date().toISOString() }
          : seg,
      ),
    }));
  }

  /**
   * Removing a segment that still has personas is a destructive action: without
   * an explicit cascade the service refuses, so the UI can warn first.
   */
  async removeSegment(id: string, options?: { cascade?: boolean }): Promise<AudienceState> {
    return this.update((s) => {
      const attached = s.personas.filter((p) => p.segmentId === id);
      if (attached.length > 0 && !options?.cascade) {
        throw new Error(
          `This segment has ${attached.length} attached persona${attached.length === 1 ? "" : "s"}. Delete them first or confirm to remove the segment and its personas.`,
        );
      }
      return {
        ...s,
        segments: s.segments.filter((seg) => seg.id !== id),
        personas: s.personas.filter((p) => p.segmentId !== id),
      };
    });
  }

  async createPersona(draft: PersonaDraft): Promise<AudienceState> {
    const state = await this.repository.load();
    if (!state.segments.some((seg) => seg.id === draft.segmentId)) {
      throw new Error("Personas must belong to an existing audience segment.");
    }
    return this.update((s) => ({
      ...s,
      personas: [...s.personas, createEmptyPersona(draft.segmentId, draft)],
    }));
  }

  async updatePersona(id: string, patch: Partial<Persona>): Promise<AudienceState> {
    return this.update((s) => ({
      ...s,
      personas: s.personas.map((persona) =>
        persona.id === id
          ? { ...persona, ...patch, id: persona.id, updatedAt: new Date().toISOString() }
          : persona,
      ),
    }));
  }

  async removePersona(id: string): Promise<AudienceState> {
    return this.update((s) => ({
      ...s,
      personas: s.personas.filter((p) => p.id !== id),
    }));
  }

  /** Duplicate a persona into a fresh editable copy (new id, Draft status). */
  async duplicatePersona(id: string): Promise<AudienceState> {
    return this.update((s) => {
      const source = s.personas.find((p) => p.id === id);
      if (!source) throw new Error("Persona not found.");
      const now = new Date().toISOString();
      const copy: Persona = {
        ...createEmptyPersona(source.segmentId),
        ...source,
        id: createId("persona"),
        name: `${source.name} (copy)`,
        status: "Draft",
        createdAt: now,
        updatedAt: now,
      };
      return { ...s, personas: [...s.personas, copy] };
    });
  }
}

let audienceService: AudienceService | null = null;

export function getAudienceService(): AudienceService {
  if (!audienceService) {
    audienceService = new AudienceService(new LocalStorageAudienceRepository());
  }
  return audienceService;
}