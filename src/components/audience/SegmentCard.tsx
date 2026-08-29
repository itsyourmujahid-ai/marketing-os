"use client";

import { computeSegmentCompleteness } from "@/lib/audience/completeness";
import type { AudienceSegment, Persona } from "@/lib/audience/types";
import { cn } from "@/lib/utils";

import { Badge, Button, StatusBadge } from "@/components/business/primitives";
import { Icon } from "@/components/ui/icon";

import { PersonaCard } from "./PersonaCard";

const ROLE_TONE: Record<string, "violet" | "sky" | "neutral"> = {
  Primary: "violet",
  Secondary: "sky",
  Experimental: "neutral",
};

export function SegmentCard({
  segment,
  personas,
  onEdit,
  onDelete,
  onAddPersona,
  onEditPersona,
  onDuplicatePersona,
  onDeletePersona,
}: {
  segment: AudienceSegment;
  personas: Persona[];
  onEdit: () => void;
  onDelete: () => void;
  onAddPersona: () => void;
  onEditPersona: (persona: Persona) => void;
  onDuplicatePersona: (persona: Persona) => void;
  onDeletePersona: (persona: Persona) => void;
}) {
  const completeness = computeSegmentCompleteness(segment);
  const isB2C = segment.audienceType === "B2C";

  const stats: Array<{ label: string; value: string }> = [
    { label: "Location", value: segment.location.join(", ") },
    {
      label: isB2C ? "Interests" : "Industries",
      value: isB2C ? segment.interests.join(", ") : segment.industries.join(", "),
    },
    {
      label: isB2C ? "Buying behavior" : "Decision maker",
      value: isB2C ? segment.buyingBehavior : segment.decisionMakerRole,
    },
    { label: "Pain points", value: String(segment.painPoints.length) },
    { label: "Buying triggers", value: String(segment.buyingTriggers.length) },
    { label: "Channels", value: segment.preferredChannels.join(", ") },
  ].filter((s) => s.value);

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-white">{segment.name}</h3>
            <StatusBadge label={segment.status} />
            <Badge tone={ROLE_TONE[segment.role] ?? "neutral"}>{segment.role}</Badge>
            <Badge tone={segment.audienceType === "B2C" ? "emerald" : "sky"}>
              {segment.audienceType}
            </Badge>
            <StatusBadge label={segment.priority} />
          </div>
          {segment.description && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
              {segment.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Icon name="pen" className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Icon name="trash" className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Segment completeness
          </p>
          <span
            className={cn(
              "text-sm font-semibold",
              completeness.score >= 80
                ? "text-emerald-300"
                : completeness.score >= 40
                  ? "text-amber-300"
                  : "text-rose-300",
            )}
          >
            {completeness.score}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              completeness.score >= 80
                ? "bg-emerald-400/70"
                : completeness.score >= 40
                  ? "bg-amber-400/70"
                  : "bg-rose-400/70",
            )}
            style={{ width: `${completeness.score}%` }}
          />
        </div>
      </div>

      {completeness.items.some((i) => !i.complete) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-600">Missing:</span>
          {completeness.missing.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[11px] text-zinc-500"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm text-zinc-300">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <PersonaSection
        personas={personas}
        onAdd={onAddPersona}
        onEdit={onEditPersona}
        onDuplicate={onDuplicatePersona}
        onDelete={onDeletePersona}
      />
    </section>
  );
}

function PersonaSection({
  personas,
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  personas: Persona[];
  onAdd: () => void;
  onEdit: (persona: Persona) => void;
  onDuplicate: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
}) {
  return (
    <div className="mt-5 border-t border-white/[0.06] pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Personas ({personas.length})
        </p>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Icon name="plus" className="h-3.5 w-3.5" />
          Add persona
        </Button>
      </div>
      {personas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-center text-sm text-zinc-500">
          No personas yet. Add one to turn this segment into a person you can write to.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {personas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onEdit={() => onEdit(persona)}
              onDuplicate={() => onDuplicate(persona)}
              onDelete={() => onDelete(persona)}
            />
          ))}
        </div>
      )}
    </div>
  );
}