"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { features, getFeature, isFeatureAvailable } from "@/lib/features";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/25 transition-transform duration-300 group-hover:scale-105">
        <Icon name="gem" className="h-5 w-5 text-zinc-950" />
      </span>
      <span className="font-display text-[17px] font-bold leading-none text-white">
        Marketing <span className="text-gradient">OS</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="mt-8 flex-1 overflow-y-auto pr-1">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Marketing OS
      </p>
      <ul className="mt-3 space-y-1">
        {features.map((feature) => {
          const active = pathname === feature.route;
          const isAvailable = isFeatureAvailable(feature.route);
          return (
            <li key={feature.id}>
              <Link
                href={feature.route}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-white/10 bg-white/[0.07] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                    : isAvailable
                      ? "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                      : "text-zinc-500",
                )}
              >
                <Icon
                  name={feature.icon}
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    active ? "text-amber-300" : isAvailable ? "text-zinc-500" : "text-zinc-400",
                  )}
                />
                <span className="truncate">{feature.name}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-zinc-300">
        <Icon name="sparkles" className="h-4 w-4 text-amber-300" />
        <p className="text-sm font-semibold">Foundation ready</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {features.length} modules — marketing operating system
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        Coming soon
      </span>
    </div>
  );
}

function SidebarFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col border-r border-white/[0.06] bg-[#090b13]/85 p-5 backdrop-blur-xl">
      <Brand />
      {children}
      <SidebarFooter />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const feature = getFeature(pathname) || getFeature("/dashboard");
  const title = feature ? feature.name : "Marketing OS";

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarFrame>
          <NavList />
        </SidebarFrame>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="anim-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="anim-pop-in absolute inset-y-0 left-0 w-[300px] max-w-[85vw]">
            <SidebarFrame>
              <NavList onNavigate={() => setDrawerOpen(false)} />
            </SidebarFrame>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#070910]/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Marketing OS
              </p>
              <h1 className="font-display truncate text-lg font-bold leading-tight text-white">
                {title}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <div
                className="hidden items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-500 md:flex"
                title="Tool search is coming soon"
              >
                <Icon name="search" className="h-4 w-4" />
                <span className="min-w-40">Search tools…</span>
                <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[11px] text-zinc-400">
                  ⌘K
                </kbd>
              </div>

              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Design Khajana on GitHub"
              >
                <Icon name="github" className="h-[18px] w-[18px]" />
              </a>

              <span className="hidden items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-400 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                v0.1
              </span>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}