"use client";

import Link from "next/link";
import { useState } from "react";

import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { Icon } from "@/components/ui/icon";
import type { Section, Tool } from "@/lib/catalog";
import { sections, totalTools } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const stats = [
  { value: "11", label: "Main sections" },
  { value: String(totalTools), label: "Design tools" },
  { value: "0", label: "APIs or databases" },
  { value: "100%", label: "Modular & ready" },
];

function StudioCard({ section, onTool }: { section: Section; onTool: (tool: Tool) => void }) {
  const live = section.slug === "image-lab";

  return (
    <div
      className="glass-panel glass-hover anim-rise-in group relative flex flex-col rounded-2xl p-6"
      style={{ animationDelay: "0ms" }}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            section.accent.gradient,
            section.accent.glow,
          )}
        >
          <Icon name={section.icon} className="h-6 w-6" />
        </span>
        <Link
          href={`/${section.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          Open studio
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>

      <h3 className="font-display mt-5 text-lg font-bold text-white">{section.name}</h3>
      <p className={cn("mt-0.5 text-[13px] font-medium", section.accent.text)}>
        {section.tagline}
      </p>
      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">
        {section.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {section.tools.map((tool) =>
          live ? (
            <Link
              key={tool.name}
              href={`/${section.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white",
                section.accent.border,
              )}
              aria-label={`${tool.name} — open Image Lab`}
            >
              <Icon name={tool.icon} className="h-3 w-3 opacity-60" />
              {tool.name}
            </Link>
          ) : (
            <button
              key={tool.name}
              type="button"
              onClick={() => onTool(tool)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white",
                section.accent.border,
              )}
              aria-label={`${tool.name} — coming soon`}
            >
              <Icon name={tool.icon} className="h-3 w-3 opacity-60" />
              {tool.name}
            </button>
          ),
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
        <span className="text-xs text-zinc-500">{section.tools.length} tools</span>
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              section.accent.border,
              section.accent.text,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", section.accent.dot)} />
            Coming soon
          </span>
        )}
      </div>
    </div>
  );
}

export function OverviewDashboard() {
  const [selected, setSelected] = useState<{ tool: Tool; section: Section } | null>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <section className="anim-rise-in relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] px-7 py-12 sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300">
            <Icon name="gem" className="h-4 w-4 text-amber-300" />
            Design Khajana · v0.1 Foundation
          </span>

          <h1 className="font-display mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Your design treasure chest,{" "}
            <span className="text-gradient">unlocked.</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Eleven dedicated studios — images, icons, colour, typography, grid
            and everything in between. One clean, modular dashboard that grows
            with your workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#studios"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.03]"
            >
              Explore the studios
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/[0.08]"
            >
              <Icon name="github" className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="relative mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-panel rounded-2xl px-5 py-4 text-center lg:text-left"
            >
              <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="studios" className="mt-12 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              The treasure map
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-white">
              All studios
            </h2>
          </div>
          <p className="hidden text-xs text-zinc-500 sm:block">
            Click any tool chip to preview its status
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <StudioCard key={section.slug} section={section} onTool={(tool) => setSelected({ tool, section })} />
          ))}
        </div>
      </section>

      <section className="anim-rise-in mt-12 overflow-hidden rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-8 text-center sm:p-10">
        <Icon name="sparkles" className="mx-auto h-8 w-8 text-amber-300" />
        <h2 className="font-display mt-4 text-xl font-bold text-white sm:text-2xl">
          Every interface is ready. The engines start here.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
          This foundation ships all 11 sections and 68 tool surfaces with a
          shared, reusable design system — so adding real functionality later is
          pure plug-and-play.
        </p>
      </section>

      {selected && (
        <ComingSoonModal
          tool={selected.tool}
          section={selected.section}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}