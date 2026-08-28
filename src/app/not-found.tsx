import Link from "next/link";

import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-4 text-center">
      <div className="anim-rise-in">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon name="search" className="h-7 w-7 text-zinc-400" />
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Lost in the vault
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white">
          Page not found
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
          That path doesn&apos;t exist yet. The treasure map only knows eleven
          sections — head back to the overview.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.03]"
        >
          <Icon name="home" className="h-4 w-4" />
          Back to overview
        </Link>
      </div>
    </div>
  );
}