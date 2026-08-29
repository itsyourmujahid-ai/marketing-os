"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAudienceService } from "@/lib/audience/service";
import type { AudienceState } from "@/lib/audience/types";
import { getBusinessService } from "@/lib/business/service";
import type { Business } from "@/lib/business/types";
import { computeCompleteness } from "@/lib/business/completeness";
import { computeHealthReport } from "@/lib/health/scoring";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { ProfileTab } from "./tabs/profile-tab";
import { ProductsTab } from "./tabs/products-tab";
import { ValuePropositionTab } from "./tabs/value-tab";
import { TargetMarketTab } from "./tabs/market-tab";
import { GoalsTab } from "./tabs/goals-tab";
import { BrandTab } from "./tabs/brand-tab";
import { OverviewTab } from "./tabs/overview-tab";

const TABS: Array<{ id: string; label: string; icon: IconName; blurb: string }> = [
  { id: "overview", label: "Overview", icon: "gauge", blurb: "Setup progress and workspace health" },
  { id: "profile", label: "Profile", icon: "building", blurb: "Business name, industry, contact details" },
  { id: "products", label: "Products & Services", icon: "grid", blurb: "Everything your business sells" },
  { id: "value", label: "Value Proposition", icon: "zap", blurb: "USP, differentiators and positioning" },
  { id: "market", label: "Target Market", icon: "users", blurb: "B2B and B2C audiences" },
  { id: "goals", label: "Goals", icon: "target", blurb: "Business and marketing targets" },
  { id: "brand", label: "Brand", icon: "palette", blurb: "Voice, identity and assets" },
];

export function BusinessPage() {
  const service = useMemo(() => getBusinessService(), []);
  const audienceService = useMemo(() => getAudienceService(), []);
  const [business, setBusiness] = useState<Business | null>(null);
  const [audience, setAudience] = useState<AudienceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [biz, aud] = await Promise.all([
        service.getBusiness(),
        audienceService.getState(),
      ]);
      setBusiness(biz);
      setAudience(aud);
    } catch {
      setLoadError("Could not load business data.");
    } finally {
      setLoading(false);
    }
  }, [service, audienceService]);

  useEffect(() => {
    // Load the workspace on mount; setState calls happen inside the async fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const persist = useCallback(
    async (saved: Business) => {
      setBusiness(saved);
    },
    [],
  );

  const report = useMemo(
    () => (business ? computeCompleteness(business) : null),
    [business],
  );

  const healthReport = useMemo(
    () => (business ? computeHealthReport(business, audience ?? undefined) : null),
    [business, audience],
  );

  if (loading && !business) {
    return <BusinessSkeleton />;
  }

  if (loadError && !business) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8 text-center">
        <Icon name="info" className="mx-auto h-8 w-8 text-rose-300" />
        <h2 className="mt-3 font-display text-lg font-bold text-white">Something went wrong</h2>
        <p className="mt-1 text-sm text-zinc-500">{loadError}</p>
        <div className="mt-4 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.14]"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!business || !report) return null;

  const tab = TABS[activeTab];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Business &amp; Brand Setup
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-white">
            {business.profile.businessName.trim() || "Your Business"}
          </h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
              report.score >= 100
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : "bg-amber-500/10 text-amber-300 ring-amber-400/20",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {report.score}% complete
          </span>
          <Link
            href="/health"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            <Icon name="gauge" className="h-3.5 w-3.5 text-amber-300" />
            Health {healthReport?.overallScore ?? "—"}%
          </Link>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {tab.blurb} — the central source of truth for every Marketing OS module.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(index)}
            aria-current={activeTab === index ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
              activeTab === index
                ? "bg-white/[0.08] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Active tab */}
      {activeTab === 0 && <OverviewTab business={business} report={report} onGoTab={setActiveTab} />}
      {activeTab === 1 && (
        <ProfileTab
          profile={business.profile}
          onSave={async (next) => persist(await service.saveProfile(next))}
        />
      )}
      {activeTab === 2 && (
        <ProductsTab
          products={business.products}
          onSave={async (next) => persist(await service.saveProducts(next))}
        />
      )}
      {activeTab === 3 && (
        <ValuePropositionTab
          value={business.valueProposition}
          onSave={async (next) => persist(await service.saveValueProposition(next))}
        />
      )}
      {activeTab === 4 && (
        <TargetMarketTab
          market={business.targetMarket}
          onSave={async (next) => persist(await service.saveTargetMarket(next))}
        />
      )}
      {activeTab === 5 && (
        <GoalsTab
          businessGoals={business.businessGoals}
          marketingGoal={business.marketingGoal}
          onSaveBusinessGoals={async (next) => persist(await service.saveBusinessGoals(next))}
          onSaveMarketingGoal={async (next) => persist(await service.saveMarketingGoal(next))}
        />
      )}
      {activeTab === 6 && (
        <BrandTab
          voice={business.brandVoice}
          identity={business.brandIdentity}
          onSaveVoice={async (next) => persist(await service.saveBrandVoice(next))}
          onSaveIdentity={async (next) => persist(await service.saveBrandIdentity(next))}
        />
      )}
    </div>
  );
}

function BusinessSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-64 rounded-xl bg-white/[0.04]" />
      <div className="mt-3 h-4 w-96 rounded-lg bg-white/[0.03]" />
      <div className="mt-8 h-12 rounded-2xl bg-white/[0.03]" />
      <div className="mt-8 h-72 rounded-3xl bg-white/[0.03]" />
    </div>
  );
}