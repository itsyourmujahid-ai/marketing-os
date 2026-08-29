"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { computeAudienceOverview } from "@/lib/audience/overview";
import { getAudienceService } from "@/lib/audience/service";
import type { AudienceState } from "@/lib/audience/types";

/**
 * Dashboard card. Every number comes from the real Audience module —
 * never a hard-coded figure.
 */
export function DashboardAudienceSummary() {
  const service = useMemo(() => getAudienceService(), []);
  const [state, setState] = useState<AudienceState | null>(null);

  useEffect(() => {
    let active = true;
    service
      .getState()
      .then((s) => {
        if (active) setState(s);
      })
      .catch(() => {
        if (active) setState(null);
      });
    return () => {
      active = false;
    };
  }, [service]);

  const overview = useMemo(() => (state ? computeAudienceOverview(state) : null), [state]);
  const segmentName =
    state &&
    (state.segments.find((s) => s.role === "Primary" && s.status === "Active") ??
      state.segments.find((s) => s.status === "Active") ??
      state.segments[0])?.name;

  return (
    <Link
      href="/audience"
      className="glass-panel rounded-2xl border border-white/10 p-6 transition-transform hover:translate-y-[-2px]"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Audience &amp; Personas
      </p>
      {overview === null ? (
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-xl bg-white/[0.05]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
          </div>
        </div>
      ) : overview.totalSegments === 0 ? (
        <div>
          <p className="font-display text-xl font-bold text-white">No segments yet</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Define who you want to reach — segments and personas power your Marketing OS.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-6">
            <div>
              <p className="font-display text-3xl font-bold text-sky-300">
                {overview.avgSegmentCompleteness}
                <span className="text-[15px] text-zinc-400">%</span>
              </p>
              <p className="text-[12px] text-zinc-500">avg segment detail</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white">
                {overview.totalSegments}
                <span className="text-[13px] text-zinc-400"> segments</span>
              </p>
              <p className="text-[12px] text-zinc-500">
                {overview.totalPersonas} personas · {overview.primarySegments} primary
              </p>
            </div>
          </div>
          {segmentName && (
            <p className="mt-2 truncate text-xs text-zinc-500">
              Focus: <span className="text-zinc-300">{segmentName}</span>
            </p>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-500">Open audience planner &rarr;</p>
    </Link>
  );
}