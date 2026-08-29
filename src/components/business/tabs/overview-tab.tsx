"use client";

import type { Business } from "@/lib/business/types";
import type { CompletenessReport } from "@/lib/business/completeness";

import { Badge, Button, SectionCard } from "@/components/business/primitives";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function OverviewTab({
  business,
  report,
  onGoTab,
}: {
  business: Business;
  report: CompletenessReport;
  onGoTab: (tab: number) => void;
}) {
  const profileName = business.profile.businessName.trim();

  return (
    <div className="space-y-6">
      {/* Completeness */}
      <SectionCard>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <ScoreRing score={report.score} />
            <div>
              <h2 className="font-display text-lg font-bold text-white">Business Profile Completeness</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {report.score >= 100
                  ? "Fully set up — ready for the next Marketing OS modules."
                  : report.missingCount === 0
                    ? "Nearly there — fill a few more fields to complete your profile."
                    : `${report.missingCount} item${report.missingCount === 1 ? "" : "s"} missing across the workspace.`}
              </p>
              {report.score < 100 && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => onGoTab(report.groups[0]?.tab ?? 1)}
                >
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  Complete Profile
                </Button>
              )}
            </div>
          </div>

          <div className="w-full max-w-sm lg:w-80">
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                style={{ width: `${report.score}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-zinc-600">
              <span>Setup progress</span>
              <span className="font-semibold text-zinc-300">{report.score}%</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Profile snapshot */}
      <SectionCard
        title={profileName || "Your Business"}
        description="A snapshot of everything stored in this workspace."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Snapshot icon="building" label="Products & services" value={count(business.products.length)} />
          <Snapshot icon="target" label="Business goals" value={count(business.businessGoals.length)} />
          <Snapshot icon="users" label="Target market" value={marketSummary(business)} />
          <Snapshot icon="palette" label="Brand identity" value={brandSummary(business)} />
        </div>
      </SectionCard>

      {/* Checklist */}
      <SectionCard
        title="Missing areas"
        description="Based on the fields you've actually filled in."
      >
        {report.groups.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3">
            <Icon name="check-circle" className="h-5 w-5 text-emerald-300" />
            <p className="text-sm text-emerald-200">Every area is complete. Your business profile is fully set up.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {report.groups.map((group) => (
              <li key={group.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full",
                        group.complete
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-300",
                      )}
                    >
                      <Icon name={group.complete ? "check" : "info"} className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-sm font-medium text-zinc-200">
                      {group.label}
                      <span className="ml-2 text-xs text-zinc-600">
                        {group.completed}/{group.total}
                      </span>
                    </p>
                  </div>
                  <Button variant="subtle" size="sm" onClick={() => onGoTab(group.tab)}>
                    Go to setup
                  </Button>
                </div>
                {group.missing.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-8.5">
                    {group.missing.map((item) => (
                      <Badge key={item} tone="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Quick explainer */}
      <SectionCard title="Why Business & Brand Setup matters">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Everything you save here becomes the central source of truth for Marketing OS. Future modules —
          Strategy, Market Research, Audience, Campaigns, Content, Leads, CRM, Email, Automation and Analytics —
          will read this data (and the AI Marketing Manager will use it as context). No AI or other features are
          implemented yet; this phase only prepares the foundation.
        </p>
      </SectionCard>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-24 w-24 flex-shrink-0">
      <svg viewBox="0 0 84 84" className="h-24 w-24 -rotate-90">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-white">{score}</p>
          <p className="-mt-0.5 text-[10px] text-zinc-500">/100</p>
        </div>
      </div>
    </div>
  );
}

function Snapshot({ icon, label, value }: { icon: "building" | "target" | "users" | "palette"; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/10">
          <Icon name={icon} className="h-4.5 w-4.5 text-amber-300" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      </div>
      <p className="mt-2.5 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function count(n: number): string {
  return `${n} item${n === 1 ? "" : "s"}`;
}

function marketSummary(business: Business): string {
  const tm = business.targetMarket;
  const parts = [tm.customerType, tm.countries.length > 0 ? `${tm.countries.length} country${tm.countries.length === 1 ? "" : "ies"}` : ""];
  return parts.filter(Boolean).join(" · ") || "Not defined";
}

function brandSummary(business: Business): string {
  const bi = business.brandIdentity;
  const parts: string[] = [];
  if (bi.logoDataUrl) parts.push("Logo");
  if (bi.primaryColor) parts.push(bi.primaryColor);
  if (bi.preferredFont) parts.push(bi.preferredFont);
  return parts.join(" · ") || "Not set";
}