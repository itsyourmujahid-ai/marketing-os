"use client";

import { computePersonaCompleteness } from "@/lib/audience/completeness";
import type { Persona } from "@/lib/audience/types";

import { StatusBadge } from "@/components/business/primitives";
import { Icon, type IconName } from "@/components/ui/icon";

export function PersonaCard({
  persona,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  persona: Persona;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const completeness = computePersonaCompleteness(persona);
  const goals = persona.primaryGoals.slice(0, 3);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{persona.name}</p>
            <StatusBadge label={persona.status} />
            <span className="text-[11px] font-medium text-zinc-500">{completeness.score}% complete</span>
          </div>
          {persona.shortDescription && (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{persona.shortDescription}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ActionIcon icon="pen" label="Edit persona" onClick={onEdit} />
          <ActionIcon icon="layers" label="Duplicate persona" onClick={onDuplicate} />
          <ActionIcon icon="trash" label="Delete persona" tone="danger" onClick={onDelete} />
        </div>
      </div>

      {goals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {goals.map((goal) => (
            <span
              key={goal}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-zinc-400"
            >
              {goal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionIcon({
  icon,
  label,
  onClick,
  tone = "subtle",
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  tone?: "subtle" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
        tone === "danger"
          ? "text-zinc-600 hover:bg-rose-500/10 hover:text-rose-300"
          : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
      }`}
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
    </button>
  );
}