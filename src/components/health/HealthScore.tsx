"use client";

import { cn } from "@/lib/utils";
import { healthStatusOf } from "@/lib/health/scoring";
import type { HealthStatus } from "@/lib/health/types";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, { ring: number; view: number; number: string; suffix: string; stroke: number }> = {
  sm: { ring: 64, view: 84, number: "text-2xl", suffix: "text-[10px]", stroke: 7 },
  md: { ring: 84, view: 116, number: "text-4xl", suffix: "text-xs", stroke: 8 },
  lg: { ring: 110, view: 152, number: "text-5xl", suffix: "text-sm", stroke: 9 },
  xl: { ring: 140, view: 192, number: "text-6xl", suffix: "text-base", stroke: 11 },
};

const STATUS_THEME: Record<
  HealthStatus,
  { badge: string; gradientFrom: string; gradientTo: string; dot: string }
> = {
  Critical: {
    badge: "bg-rose-500/10 text-rose-300 ring-rose-400/25",
    gradientFrom: "#fb7185",
    gradientTo: "#fda4af",
    dot: "bg-rose-400",
  },
  "Needs Attention": {
    badge: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
    gradientFrom: "#f59e0b",
    gradientTo: "#fde68a",
    dot: "bg-amber-400",
  },
  Good: {
    badge: "bg-sky-500/10 text-sky-300 ring-sky-400/25",
    gradientFrom: "#38bdf8",
    gradientTo: "#bae6fd",
    dot: "bg-sky-400",
  },
  Excellent: {
    badge: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
    gradientFrom: "#34d399",
    gradientTo: "#a7f3d0",
    dot: "bg-emerald-400",
  },
};

export function HealthScore({
  score,
  label,
  status,
  explanation,
  size = "md",
  className,
}: {
  score: number;
  label?: string;
  status?: HealthStatus;
  explanation?: string | null;
  size?: Size;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const resolvedStatus = status ?? healthStatusOf(clamped);
  const theme = STATUS_THEME[resolvedStatus];
  const dims = SIZE[size];
  const radius = (dims.view - dims.stroke) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const gradId = `health-score-${size}`;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative flex-shrink-0" style={{ width: dims.ring, height: dims.ring }}>
        <svg viewBox={`0 0 ${dims.view} ${dims.view}`} className="h-full w-full -rotate-90">
          <circle
            cx={dims.view / 2}
            cy={dims.view / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={dims.stroke}
          />
          <circle
            cx={dims.view / 2}
            cy={dims.view / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.gradientFrom} />
              <stop offset="100%" stopColor={theme.gradientTo} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-none">
            <p className={cn("font-display font-bold text-white", dims.number)}>{clamped}</p>
            <p className={cn("-mt-1 font-medium text-zinc-500", dims.suffix)}>/100</p>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        {label && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              theme.badge,
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
            {resolvedStatus}
          </span>
        </div>
        {explanation && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{explanation}</p>}
      </div>
    </div>
  );
}