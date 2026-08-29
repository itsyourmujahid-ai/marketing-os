"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getHealthService } from "@/lib/health/service";

import { HealthScore } from "./HealthScore";

/**
 * Dashboard card. The score comes from the same Health Engine as /health —
 * there is exactly one source of truth, never a hard-coded number.
 */
export function DashboardHealthScore() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getHealthService()
      .getReport()
      .then((report) => {
        if (active) setScore(report.overallScore);
      })
      .catch(() => {
        if (active) setScore(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link
      href="/health"
      className="glass-panel rounded-2xl border border-white/10 p-6 transition-transform hover:translate-y-[-2px]"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Marketing Health Score
      </p>
      {score === null ? (
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
          </div>
        </div>
      ) : (
        <HealthScore score={score} size="sm" />
      )}
      <p className="mt-3 text-xs text-zinc-500">View full health report &rarr;</p>
    </Link>
  );
}