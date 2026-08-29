"use client";

import { useState } from "react";

import { ImageLab } from "@/components/image-lab/ImageLab";
import { VideoLab } from "@/components/video-lab/VideoLab";
import { ToolCard } from "@/components/sections/ToolCard";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { Icon } from "@/components/ui/icon";
import type { Section, Tool } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function SectionStudio({ section }: { section: Section }) {
  const [selected, setSelected] = useState<Tool | null>(null);

  if (section.slug === "image-lab") {
    return <ImageLab section={section} />;
  }

  if (section.slug === "video-lab") {
    return <VideoLab section={section} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="anim-rise-in relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 sm:p-10">
        <div
          aria-hidden
          className={cn(
            "absolute -right-24 -top-28 h-64 w-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
            section.accent.gradient,
          )}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className={cn(
              "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-xl",
              section.accent.gradient,
              section.accent.glow,
            )}
          >
            <Icon name={section.icon} className="h-8 w-8" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Design Studio
            </p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {section.name}
            </h1>
            <p className={cn("mt-1 text-sm font-medium", section.accent.text)}>
              {section.tagline}
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              {section.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-300">
              <Icon name="grid" className="h-4 w-4 text-zinc-500" />
              {section.tools.length} tools
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300">
              <Icon name="sparkles" className="h-4 w-4" />
              Coming soon
            </span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">
          Tools in {section.name}
        </h2>
        <p className="text-xs text-zinc-500">
          Click a tool to preview its status
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {section.tools.map((tool, index) => (
          <ToolCard
            key={tool.name}
            tool={tool}
            section={section}
            index={index}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected && (
        <ComingSoonModal
          tool={selected}
          section={section}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}