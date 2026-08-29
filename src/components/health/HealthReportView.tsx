"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { HealthScore } from "@/components/health/HealthScore";
import { Icon } from "@/components/ui/icon";
import { getHealthService } from "@/lib/health/service";
import type {
  HealthCategory,
  HealthRecommendation,
  HealthReport,
  RecommendationPriority,
} from "@/lib/health/types";
import { cn } from "@/lib/utils";

const PRIORITY_STYLE: Record<RecommendationPriority, string> = {
  Critical: "bg-rose-500/10 text-rose-300 ring-rose-400/25",
  High: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
  Medium: "bg-sky-500/10 text-sky-300 ring-sky-400/25",
  Low: "bg-white/[0.06] text-zinc-400 ring-white/10",
};

export function HealthReportView() {
  const service = useMemo(() => getHealthService(), []);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await service.getReport();
      setReport(next);
    } catch {
      setError("Could not generate the health report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    // Auto-recalculate on mount so the report is never stale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (loading && !report) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-8 w-80 rounded-xl bg-white/[0.04]" />
        <div className="mt-3 h-4 w-[30rem] rounded-lg bg-white/[0.03]" />
        <div className="mt-8 h-48 rounded-3xl bg-white/[0.03]" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 rounded-3xl bg-white/[0.03]" />
          <div className="h-48 rounded-3xl bg-white/[0.03]" />
          <div className="h-48 rounded-3xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8 text-center">
        <Icon name="info" className="mx-auto h-8 w-8 text-rose-300" />
        <h2 className="mt-3 font-display text-lg font-bold text-white">Something went wrong</h2>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.14]"
        >
          <Icon name="refresh" className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Diagnostic engine</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">Marketing Health</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            A deterministic readiness score derived from your real Business &amp; Brand data — no AI, no guesswork.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.14] disabled:opacity-50"
        >
          <Icon name="refresh" className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Recalculating…" : "Recalculate"}
        </button>
      </div>

      {/* Empty / minimal-data guidance */}
      {!report.hasSubstantialData && <MinimalDataNotice report={report} />}

      {/* Overall score hero */}
      <section className="glass-panel anim-rise-in rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <HealthScore
            score={report.overallScore}
            label="Marketing Health Score"
            explanation={report.explanation}
            size="lg"
          />
          <div className="w-full max-w-sm lg:w-80">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-zinc-600">
              <span>Overall readiness</span>
              <span className="font-semibold text-zinc-300">{report.overallScore}%</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <Icon name="check-circle" className="h-4 w-4 text-zinc-500" />
              Profile completeness: {report.completenessScore}%
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
              <Icon name="calendar" className="h-4 w-4 text-zinc-600" />
              Generated {formatTime(report.generatedAt)} · updates automatically
            </div>
          </div>
        </div>
      </section>

      {/* Marketing readiness */}
      <section className="mt-8">
        <SectionHeading
          kicker="Marketing readiness"
          title="Readiness by module"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.readiness.map((dim) => (
            <Link
              key={dim.id}
              href={dim.relatedRoute}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-300">{dim.label}</p>
                <span className="font-display text-lg font-bold text-white">{dim.score}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn("h-full rounded-full", readinessBar(dim.score))}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Score breakdown */}
      <section className="mt-10">
        <SectionHeading
          kicker="Score breakdown"
          title="Why this score?"
          description="Overall score &rarr; categories &rarr; individual checks. Every point is explained, not a black box."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {report.categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Strengths / Weaknesses */}
      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/[0.04] p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Icon name="check-circle" className="h-5 w-5 text-emerald-300" />
            Strengths
          </h3>
          {report.strengths.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {report.strengths.map((s) => (
                <li key={s.id} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <Icon name="check" className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                  {s.label}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint text="Add business data to start recognizing strengths." />
          )}
        </div>

        <div className="rounded-3xl border border-amber-400/15 bg-amber-500/[0.04] p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Icon name="info" className="h-5 w-5 text-amber-300" />
            Weaknesses
          </h3>
          {report.weaknesses.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {report.weaknesses.map((w) => (
                <li key={w.id} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <Icon name="info" className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
                  {w.label}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint text="No major gaps detected — great work." />
          )}
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-10">
        <SectionHeading kicker="Prioritized actions" title="Recommendations" />
        {report.recommendations.length > 0 ? (
          <div className="space-y-3">
            {report.recommendations.map((rec) => (
              <RecommendationRow key={rec.id} rec={rec} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-4">
            <Icon name="check-circle" className="h-5 w-5 text-emerald-300" />
            <p className="text-sm text-emerald-200">
              Everything checks out — keep the data fresh as your business changes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{kicker}</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-zinc-500">{text}</p>;
}

function MinimalDataNotice({ report }: { report: HealthReport }) {
  const missing: string[] = [];
  const market = report.categories.find((c) => c.id === "market");
  const goals = report.categories.find((c) => c.id === "goals");
  const brand = report.categories.find((c) => c.id === "brand");
  const offer = report.categories.find((c) => c.id === "offer");

  if (!market?.checks.some((c) => c.passed)) missing.push("Target market");
  if (!goals?.checks.some((c) => c.passed)) missing.push("Goals");
  if (!brand?.checks.some((c) => c.passed)) missing.push("Brand voice");
  if (!offer?.checks.some((c) => c.passed)) missing.push("Product information");

  return (
    <section className="mb-6 rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-bold text-white">
            Your profile needs more information
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            We evaluate readiness against the real data saved in Business &amp; Brand Setup. Fill in
            the essentials first so the score is accurate.
          </p>
          {missing.length > 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              Missing:{" "}
              {missing.map((m, i) => (
                <span key={m}>
                  {i > 0 && ", "}
                  <span className="text-zinc-300">{m}</span>
                </span>
              ))}
            </p>
          )}
        </div>
        <Link
          href="/business"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02]"
        >
          <Icon name="pen" className="h-4 w-4" />
          Complete Business Profile
        </Link>
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: HealthCategory }) {
  const [open, setOpen] = useState(false);
  const missingCount = category.missing.length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
            <Icon name={category.icon} className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white">{category.name}</h3>
            <p className="text-xs text-zinc-500">
              {category.checks.length} checks
              {missingCount > 0 && ` · ${missingCount} missing`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-white">
            {category.score}
            <span className="ml-0.5 text-sm font-medium text-zinc-500">/100</span>
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              category.status === "Excellent" && "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
              category.status === "Good" && "bg-sky-500/10 text-sky-300 ring-sky-400/20",
              category.status === "Needs Attention" && "bg-amber-500/10 text-amber-300 ring-amber-400/20",
              category.status === "Critical" && "bg-rose-500/10 text-rose-300 ring-rose-400/20",
            )}
          >
            {category.status}
          </span>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full", readinessBar(category.score))}
          style={{ width: `${category.score}%` }}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{category.explanation}</p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      >
        <Icon name={open ? "chevronUp" : "chevronDown"} className="h-3.5 w-3.5" />
        {open ? "Hide checks" : `Show all ${category.checks.length} checks`}
      </button>

      {open && (
        <ul className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
          {category.checks.map((check) => (
            <li key={check.id} className="flex items-start gap-2 text-[13px]">
              <Icon
                name={check.passed ? "check" : "info"}
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 flex-shrink-0",
                  check.passed ? "text-emerald-300" : "text-amber-300",
                )}
              />
              <span className={check.passed ? "text-zinc-300" : "text-zinc-400"}>
                {check.label}
                {!check.passed && <span className="text-zinc-600"> — needs attention</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecommendationRow({ rec }: { rec: HealthRecommendation }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset",
              PRIORITY_STYLE[rec.priority],
            )}
          >
            {rec.priority}
          </span>
          <span className="text-[11px] text-zinc-500">{rec.categoryName}</span>
        </div>
        <h3 className="mt-2 font-display text-base font-bold text-white">{rec.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{rec.description}</p>
      </div>
      <Link
        href={rec.relatedRoute}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.14]"
      >
        {rec.actionLabel}
        <Icon name="arrowRight" className="h-4 w-4" />
      </Link>
    </div>
  );
}

function readinessBar(score: number): string {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-sky-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}