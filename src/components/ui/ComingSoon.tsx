"use client";

import { useEffect } from "react";
import { Icon, IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  featureName: string;
  description: string;
  icon: IconName;
  category?: string;
  previewFeatures?: string[];
  onBack: () => void;
}

export function ComingSoon({ featureName, description, icon, category, previewFeatures, onBack }: ComingSoonProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const previewItems = previewFeatures || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#070910" }}>
      <div className="relative w-full max-w-2xl mx-auto text-center">
        <div
          className={cn(
            "absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-25 blur-3xl",
            "from-amber-500/10 to-violet-500/10",
          )}
        />

        <div className="relative transform pt-24 pb-8">
          <Icon
            name={icon}
            className={cn(
              "mx-auto h-12 w-12 text-amber-400 mb-6",
            )}
          />

          <h1 className="font-display text-3xl font-bold text-white mb-4">
            {featureName}
          </h1>

          <p className="text-[15px] text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {category && (
            <div className="mb-6 text-sm text-zinc-500">
              {category}
            </div>
          )}

          {previewFeatures && previewFeatures.length > 0 ? (
            <div className="mb-8 pt-6 border-t border-white/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 mb-3">
                Preview features coming soon
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {previewFeatures.map((feat, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-zinc-400",
                    )}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-10">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/[0.14] focus:outline-none focus-visible:ring-white/40"
            >
              <Icon name="close" className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}