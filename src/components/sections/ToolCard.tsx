"use client";

import { Icon } from "@/components/ui/icon";
import type { Section, Tool } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ToolCard({
  tool,
  section,
  index,
  onSelect,
}: {
  tool: Tool;
  section: Section;
  index: number;
  onSelect: (tool: Tool) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className="glass-panel glass-hover anim-rise-in group relative flex flex-col items-start gap-4 rounded-2xl p-5 text-left"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      aria-label={`${tool.name} — coming soon`}
    >
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
          section.accent.gradient,
          section.accent.glow,
        )}
      >
        <Icon name={tool.icon} className="h-[22px] w-[22px]" />
      </span>

      <span className="min-w-0">
        <span className="font-display flex items-center gap-2 text-[15px] font-semibold text-white">
          {tool.name}
          <Icon
            name="arrowRight"
            className="h-4 w-4 -translate-x-1 text-zinc-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          />
        </span>
        <span className="mt-1.5 block text-[13px] leading-relaxed text-zinc-500">
          {tool.description}
        </span>
      </span>

      <span
        className={cn(
          "pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          section.accent.border,
          section.accent.text,
        )}
      >
        <Icon name="sparkles" className="h-3 w-3" />
        Soon
      </span>
    </button>
  );
}