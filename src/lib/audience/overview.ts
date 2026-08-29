import { computePersonaCompleteness, computeSegmentCompleteness } from "./completeness";
import type { AudienceOverview, AudienceState } from "./types";

/** Dashboard-level summary derived from the saved audience state. */
export function computeAudienceOverview(state: AudienceState): AudienceOverview {
  const { segments, personas } = state;

  const segScores = segments.map((s) => computeSegmentCompleteness(s).score);
  const personaScores = personas.map((p) => computePersonaCompleteness(p).score);

  const avg = (values: number[]) =>
    values.length === 0 ? 0 : Math.round(values.reduce((s, v) => s + v, 0) / values.length);

  const primarySegments = segments.filter((s) => s.role === "Primary");
  const primaryPersonas = personas.filter((p) => primarySegments.some((s) => s.id === p.segmentId));

  const mostImportantPersonaId =
    [...primaryPersonas, ...personas].sort((a, b) => {
      const diff =
        computePersonaCompleteness(b).score - computePersonaCompleteness(a).score;
      if (diff !== 0) return diff;
      return a.createdAt.localeCompare(b.createdAt);
    })[0]?.id ?? null;

  return {
    totalSegments: segments.length,
    totalPersonas: personas.length,
    activeSegments: segments.filter((s) => s.status === "Active").length,
    activePersonas: personas.filter((p) => p.status === "Active").length,
    primarySegments: primarySegments.length,
    primaryPersonaCount: primaryPersonas.length,
    avgSegmentCompleteness: avg(segScores),
    avgPersonaCompleteness: avg(personaScores),
    mostImportantPersonaId,
  };
}