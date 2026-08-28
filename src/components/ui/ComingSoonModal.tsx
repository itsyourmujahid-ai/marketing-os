"use client";

import { useEffect, useRef } from "react";

import { Icon } from "@/components/ui/icon";
import type { Section, Tool } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ComingSoonModal({
  tool,
  section,
  onClose,
}: {
  tool: Tool;
  section: Section;
  onClose: () => void;
}) {
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    doneRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        className="anim-fade-in absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="anim-pop-in relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d101a] shadow-2xl shadow-black/60">
        <div
          className={cn(
            "absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-25 blur-3xl",
            section.accent.gradient,
          )}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <div className="relative p-7 sm:p-8">
          <div
            className={cn(
              "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
              section.accent.gradient,
              section.accent.glow,
            )}
          >
            <Icon name={tool.icon} className="h-7 w-7" />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {section.name}
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold text-white">{tool.name}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
            {tool.description}
          </p>

          <span
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-full border bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold",
              section.accent.border,
              section.accent.text,
            )}
          >
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            Coming soon
          </span>

          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            The interface for this tool is designed and ready — its engine is
            under development. Check back soon.
          </p>

          <div className="mt-7">
            <button
              ref={doneRef}
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.14] focus:outline-none focus-visible:ring-white/40"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}