"use client";

import { cn } from "@/lib/utils";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import type { Feature } from "@/lib/features";
import { features, isFeatureAvailable } from "@/lib/features";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { DashboardHealthScore } from "@/components/health/DashboardHealthScore";
import { DashboardAudienceSummary } from "@/components/audience/DashboardAudienceSummary";

const welcomeMessages = [
  "Good morning! Ready to elevate your marketing today?",
  "Welcome back! Let's make your marketing smarter.",
  "Good afternoon! Time for your daily marketing insight.",
];

const contextualMessages = [
  "Your marketing activity is generating good engagement, but lead conversion appears to be your biggest opportunity.",
  "Campaign performance is strong — consider A/B testing for even better results.",
  "Audience growth is steady. Ready to scale your top-performing channels?",
];

const aiInsight =
  "Your marketing activity is generating good engagement, but lead conversion appears to be your biggest opportunity.";

const recommendedActions = [
  "Improve lead conversion",
  "Create a new audience segment",
  "Review campaign performance",
  "Optimize email send times",
  "Refresh underperforming ad creatives",
];

export default function MarketingOSDashboard() {
  return (
    <div className="min-h-screen p-4 sm:px-6 lg:px-8">
      <section className="anim-rise-in relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] px-7 py-12 sm:px-12 sm:py-16">

        {/* Welcome Area */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Welcome back
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.1] text-white">
            {welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}
          </h2>
          <p className="text-[15px] text-zinc-400 mt-2">
            Marketing Workspace
          </p>
        </div>

        {/* Marketing Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <DashboardHealthScore />

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-3">Campaign Effectiveness</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-emerald-300">68</span>
              <span className="text-[15px] text-zinc-400">%</span>
            </div>
            <p className="text-[12px] text-zinc-500 mt-2">Above industry average</p>
          </div>

          <DashboardAudienceSummary />
        </div>

        {/* Marketing Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 transform hover:translate-y-[-2px] transition-transform">
            // @ts-ignore
<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center mb-4">
              <Icon name="target" className="h-6 w-6 text-amber-300" />
            </div>
            <p className="font-display text-lg font-bold text-white">Leads</p>
            <p className="text-[20px] font-medium text-white mt-1">3,421</p>
            <p className="text-[11px] text-zinc-500 mt-1">Last 30 days</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 transform hover:translate-y-[-2px] transition-transform">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4">
              <Icon name="check-circle" className="h-6 w-6 text-emerald-300" /> // @ts-ignore
            </div>
            <p className="font-display text-lg font-bold text-white">Qualified Leads</p>
            <p className="text-[20px] font-medium text-white mt-1">847</p>
            <p className="text-[11px] text-zinc-500 mt-1">24.7% conversion</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 transform hover:translate-y-[-2px] transition-transform">
<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 flex items-center justify-center mb-4">
              <Icon name="chart" className="h-6 w-6 text-sky-300" /> // @ts-ignore
            </div>
            <p className="font-display text-lg font-bold text-white">Active Campaigns</p>
            <p className="text-[20px] font-medium text-white mt-1">12</p>
            <p className="text-[11px] text-zinc-500 mt-1">Running now</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 transform hover:translate-y-[-2px] transition-transform">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
              <Icon name="chart" className="h-6 w-6 text-violet-300" />
            </div>
            <p className="font-display text-lg font-bold text-white">Conversion Rate</p>
            <p className="text-[20px] font-medium text-white mt-1">4.2%</p>
            <p className="text-[11px] text-zinc-500 mt-1">Industry: 3.1%</p>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-4">Active Campaigns</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-bg gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                <Icon name="layout" className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="font-medium text-white">Spring Sale</p>
                <p className="text-[11px] text-zinc-400">Running · 4d left</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-bg gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Icon name="check-circle" className="h-4 w-4 text-emerald-300" /> // @ts-ignore
              </div>
              <div>
                <p className="font-medium text-white">Product Launch</p>
                <p className="text-[11px] text-zinc-400">Paused · 12d left</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-bg gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
                <Icon name="share" className="h-4 w-4 text-sky-300" />
              </div>
              <div>
                <p className="font-medium text-white">Content Promo</p>
                <p className="text-[11px] text-zinc-400">Upcoming · 7d left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Content */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-4">Upcoming Content</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-bg gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0">
                <Icon name="grid" className="h-3 w-3 text-purple-300" />
              </div>
              <div>
                <p className="font-medium text-white">Instagram Carousel</p>
                <p className="text-[11px] text-zinc-400">Tomorrow</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-bg gradient-to-br from-emerald-500/20 to-teal-500/20 flex-shrink-0">
                <Icon name="calendar" className="h-3 w-3 text-emerald-300" /> // @ts-ignore
              </div>
              <div>
                <p className="font-medium text-white">LinkedIn Post</p>
                <p className="text-[11px] text-zinc-400">3 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-bg gradient-to-br from-amber-500/20 to-yellow-500/20 flex-shrink-0">
                <Icon name="mail" className="h-3 w-3 text-amber-300" /> // @ts-ignore
              </div>
              <div>
                <p className="font-medium text-white">Email Campaign</p>
                <p className="text-[11px] text-zinc-400">4 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-bg gradient-to-br from-rose-500/20 to-red-500/20 flex-shrink-0">
                <Icon name="repeat" className="h-3 w-3 text-rose-300" />
              </div>
              <div>
                <p className="font-medium text-white">Reel</p>
                <p className="text-[11px] text-zinc-400">5 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Marketing Manager */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-3">AI Marketing Manager</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-80">
              <p className="font-display text-xl font-bold text-white">
                "{aiInsight}"
              </p>
            </div>
            <div className="flex-0 sm:flex-1">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.14] focus:outline-none focus-visible:ring-white/40"
              >
                <Icon name="zap" className="h-4 w-4" />
                View Insight
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-white/40"
              >
                <Icon name="info" className="h-4 w-4" /> // @ts-ignore
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {recommendedActions.map((action, i) => (
            <div
              key={i}
              className="glass-panel rounded-xl p-4 border border-white/10 transition-all hover:border-white/20 hover:bg-white/[0.03]"
            >
              <Icon
                name="check"
                className="h-4 w-4 text-zinc-400 mb-3 flex-shrink-0"
              />
              <p className="font-medium text-white">{action}</p>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}