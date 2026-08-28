"use client";

import {
  Field,
  GhostButton,
  PrimaryButton,
  RangeInput,
  SelectChips,
} from "@/components/image-lab/primitives";
import { Icon } from "@/components/ui/icon";
import type { Accent, Tool } from "@/lib/catalog";
import type { ResultImage, SourceImage } from "@/lib/image/types";
import { formatBytes } from "@/lib/image/engine";
import { colorPresets, gradientPresets } from "@/lib/image/background";
import type { EncodedFormat } from "@/lib/image/types";
import { cn } from "@/lib/utils";

export interface LabParams {
  sharpenAmount: number;
  enhanceIntensity: number;
  resizeWidth: string;
  resizeHeight: string;
  lockAspect: boolean;
  cropAspect: string;
  compressFormat: EncodedFormat;
  compressQuality: number;
  convertFormat: EncodedFormat;
  convertQuality: number;
  bgKind: "solid" | "gradient";
  bgFrom: string;
  bgTo: string;
}

export function defaultParams(): LabParams {
  return {
    sharpenAmount: 1,
    enhanceIntensity: 60,
    resizeWidth: "1920",
    resizeHeight: "1080",
    lockAspect: true,
    cropAspect: "free",
    compressFormat: "webp",
    compressQuality: 80,
    convertFormat: "png",
    convertQuality: 92,
    bgKind: "solid",
    bgFrom: "#ffffff",
    bgTo: "#0ea5e9",
  };
}

const CROP_ASPECTS = [
  { value: "free", label: "Free" },
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
];

const FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
  { value: "webp", label: "WebP" },
];

interface Props {
  tool: Tool;
  accent: Accent;
  params: LabParams;
  update: (patch: Partial<LabParams>) => void;
  onApply: () => void;
  onClearCrop: () => void;
  processing: boolean;
  source: SourceImage;
  result: ResultImage | null;
}

export function ToolControls({
  tool,
  accent,
  params,
  update,
  onApply,
  onClearCrop,
  processing,
  source,
  result,
}: Props) {
  const applyLabel =
    tool.id === "bg-remove"
      ? "Remove background"
      : tool.id === "upscale-4k"
        ? "Upscale to 4K"
        : tool.id === "enhance"
          ? "Enhance image"
          : tool.id === "sharpen"
            ? "Sharpen image"
            : tool.id === "resize"
              ? "Resize image"
              : tool.id === "crop"
                ? "Apply crop"
                : tool.id === "compress"
                  ? "Compress image"
                  : tool.id === "format-convert"
                    ? "Convert image"
                    : "Change background";

  return (
    <div className="space-y-6">
      {tool.id === "bg-remove" && (
        <>
          <Field label="About this tool">
            <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[13px] leading-relaxed text-zinc-400">
              Uses a free, open-source AI model that runs entirely on your
              device. The first run downloads the ~80 MB model (cached
              afterwards) — no image ever leaves your browser.
            </p>
          </Field>
          <Field label="Output">
            <p className="text-[13px] text-zinc-400">
              Transparent PNG, original resolution.
            </p>
          </Field>
        </>
      )}

      {tool.id === "upscale-4k" && (
        <Field label="Post-sharpen" hint="Restore crisp edges after scaling">
          <RangeInput
            value={params.sharpenAmount}
            min={0}
            max={2}
            step={0.1}
            onChange={(value) => update({ sharpenAmount: value })}
            format={(v) => v.toFixed(1)}
            accent={accent}
          />
        </Field>
      )}

      {tool.id === "enhance" && (
        <Field label="Enhancement strength">
          <RangeInput
            value={params.enhanceIntensity}
            min={10}
            max={100}
            step={1}
            onChange={(value) => update({ enhanceIntensity: value })}
            format={(v) => `${v}%`}
            accent={accent}
          />
        </Field>
      )}

      {tool.id === "sharpen" && (
        <Field label="Sharpening amount">
          <RangeInput
            value={params.sharpenAmount}
            min={0.2}
            max={3}
            step={0.1}
            onChange={(value) => update({ sharpenAmount: value })}
            format={(v) => v.toFixed(1) + "×"}
            accent={accent}
          />
        </Field>
      )}

      {tool.id === "resize" && (
        <>
          <Field label="Output size">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8192}
                value={params.resizeWidth}
                onChange={(event) => update({ resizeWidth: event.target.value })}
                className={cn(
                  "w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600",
                  "border-white/10 focus:border-amber-400/50",
                )}
                aria-label="Width in pixels"
              />
              <span className="text-zinc-500">×</span>
              <input
                type="number"
                min={1}
                max={8192}
                value={params.resizeHeight}
                onChange={(event) => update({ resizeHeight: event.target.value })}
                className={cn(
                  "w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-zinc-600",
                  "border-white/10 focus:border-amber-400/50",
                )}
                aria-label="Height in pixels"
              />
            </div>
          </Field>
          <Field label="Keep aspect ratio">
            <button
              type="button"
              onClick={() => update({ lockAspect: !params.lockAspect })}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                params.lockAspect
                  ? cn("border-transparent bg-gradient-to-br text-white shadow", accent.gradient)
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200",
              )}
            >
              <Icon name="link" className="h-4 w-4" />
              {params.lockAspect ? "Locked" : "Unlocked"}
            </button>
          </Field>
          <p className="text-[11px] text-zinc-500">
            Original: {source.width} × {source.height} px
          </p>
        </>
      )}

      {tool.id === "crop" && (
        <>
          <Field label="Aspect ratio">
            <SelectChips
              options={CROP_ASPECTS}
              value={params.cropAspect}
              onChange={(value) => update({ cropAspect: value })}
              accent={accent}
            />
          </Field>
          <GhostButton onClick={onClearCrop} disabled={processing}>
            Reset crop area
          </GhostButton>
          <p className="text-[11px] text-zinc-500">
            Drag on the image to draw a selection, or drag inside it to move it.
          </p>
        </>
      )}

      {tool.id === "compress" && (
        <>
          <Field label="Output format">
            <SelectChips
              options={FORMATS}
              value={params.compressFormat}
              onChange={(value) => update({ compressFormat: value as EncodedFormat })}
              accent={accent}
            />
          </Field>
          <Field label="Quality" hint={params.compressFormat === "png" ? "PNG is lossless" : undefined}>
            <RangeInput
              value={params.compressQuality}
              min={10}
              max={100}
              step={1}
              onChange={(value) => update({ compressQuality: value })}
              format={(v) => `${v}%`}
              accent={accent}
            />
          </Field>
          <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[13px]">
            <div className="flex justify-between text-zinc-400">
              <span>Original</span>
              <span className="tabular-nums text-zinc-200">{formatBytes(source.bytes)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Compressed</span>
              <span className="tabular-nums text-zinc-200">
                {result && (result.codec !== "png" || params.compressFormat === "png" || result.blob)
                  ? formatBytes(result.blob?.size ?? 0)
                  : "—"}
              </span>
            </div>
            {result?.blob && (
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5 font-medium text-emerald-300">
                <span>Saved</span>
                <span className="tabular-nums">
                  {Math.max(0, Math.round((1 - result.blob.size / source.bytes) * 100))}%
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {tool.id === "format-convert" && (
        <>
          <Field label="Convert to">
            <SelectChips
              options={FORMATS}
              value={params.convertFormat}
              onChange={(value) => update({ convertFormat: value as EncodedFormat })}
              accent={accent}
            />
          </Field>
          {params.convertFormat !== "png" && (
            <Field label="Quality">
              <RangeInput
                value={params.convertQuality}
                min={50}
                max={100}
                step={1}
                onChange={(value) => update({ convertQuality: value })}
                format={(v) => `${v}%`}
                accent={accent}
              />
            </Field>
          )}
          <Field label="Result">
            <p className="text-[13px] text-zinc-400">
              {result
                ? `${formatBytes(result.blob?.size ?? 0)} · ${result.width} × ${result.height}`
                : "Run the conversion to preview the output."}
            </p>
          </Field>
        </>
      )}

      {tool.id === "background-change" && (
        <>
          <Field label="Background type">
            <SelectChips
              options={[
                { value: "solid", label: "Solid" },
                { value: "gradient", label: "Gradient" },
              ]}
              value={params.bgKind}
              onChange={(value) => update({ bgKind: value as "solid" | "gradient" })}
              accent={accent}
            />
          </Field>

          {params.bgKind === "solid" ? (
            <>
              <Field label="Colour">
                <div className="flex flex-wrap gap-2">
                  {colorPresets().map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      title={preset.label}
                      onClick={() => update({ bgFrom: preset.value })}
                      className={cn(
                        "h-9 w-9 rounded-xl border-2 transition-transform hover:scale-110",
                        params.bgFrom === preset.value ? "border-white" : "border-white/15",
                      )}
                      style={{ backgroundColor: preset.value }}
                      aria-label={preset.label}
                    />
                  ))}
                  <label className="cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-white/[0.03] p-1.5">
                    <input
                      type="color"
                      value={params.bgFrom}
                      onChange={(event) => update({ bgFrom: event.target.value })}
                      className="h-6 w-9 cursor-pointer appearance-none border-0 bg-transparent p-0"
                      aria-label="Custom background colour"
                    />
                  </label>
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Gradient">
                <div className="flex flex-col gap-2">
                  {gradientPresets().map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => update({ bgFrom: preset.from, bgTo: preset.to })}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[13px] transition-colors",
                        params.bgFrom === preset.from && params.bgTo === preset.to
                          ? "border-white/40 bg-white/[0.07] text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200",
                      )}
                    >
                      <span>{preset.label}</span>
                      <span
                        className="h-5 w-16 rounded-md"
                        style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                      />
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex items-center gap-2">
                <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="text-xs text-zinc-400">From</span>
                  <input
                    type="color"
                    value={params.bgFrom}
                    onChange={(event) => update({ bgFrom: event.target.value })}
                    className="h-7 w-full max-w-16 cursor-pointer appearance-none border-0 bg-transparent p-0"
                    aria-label="Gradient start colour"
                  />
                </label>
                <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="text-xs text-zinc-400">To</span>
                  <input
                    type="color"
                    value={params.bgTo}
                    onChange={(event) => update({ bgTo: event.target.value })}
                    className="h-7 w-full max-w-16 cursor-pointer appearance-none border-0 bg-transparent p-0"
                    aria-label="Gradient end colour"
                  />
                </label>
              </div>
            </>
          )}
          <p className="text-[11px] leading-relaxed text-zinc-500">
            The subject is cut out with the on-device AI model, then placed on
            your chosen background.
          </p>
        </>
      )}

      <PrimaryButton onClick={onApply} disabled={processing} className="w-full">
        {processing ? "Working…" : applyLabel}
      </PrimaryButton>
    </div>
  );
}