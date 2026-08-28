"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CropOverlay } from "@/components/image-lab/CropOverlay";
import { Dropzone } from "@/components/image-lab/Dropzone";
import {
  CheckerboardImage,
  ErrorBanner,
  GhostButton,
  ProgressOverlay,
} from "@/components/image-lab/primitives";
import {
  defaultParams,
  ToolControls,
  type LabParams,
} from "@/components/image-lab/ToolControls";
import { Icon } from "@/components/ui/icon";
import type { Section } from "@/lib/catalog";
import {
  blobToCanvas,
  compositeCanvas,
  removeBackgroundBlob,
} from "@/lib/image/background";
import {
  canvasFromSource,
  cropCanvas,
  encodeCanvas,
  enhanceCanvas,
  extensionFor,
  formatBytes,
  loadSourceImage,
  resizeCanvas,
  sharpenCanvas,
  upscaleCanvas,
} from "@/lib/image/engine";
import type {
  CropRect,
  EncodedFormat,
  ResultImage,
  SourceImage,
} from "@/lib/image/types";
import { cn } from "@/lib/utils";

const MAX_FILE_MB = 25;
const STAGE_MAX_HEIGHT = 520;

function useContainerWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

function parseAspect(value: string): number | null {
  if (value === "free") return null;
  const [w, h] = value.split(":").map(Number);
  if (!w || !h) return null;
  return w / h;
}

export function ImageLab({ section }: { section: Section }) {
  const accent = section.accent;

  const [source, setSource] = useState<SourceImage | null>(null);
  const [result, setResult] = useState<ResultImage | null>(null);
  const [activeTool, setActiveTool] = useState<string>("enhance");
  const [processing, setProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [progressLabel, setProgressLabel] = useState("Processing…");
  const [progressNote, setProgressNote] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"original" | "result">("original");
  const [params, setParams] = useState<LabParams>(defaultParams);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });

  const cutoutCache = useRef<{ key: string; canvas: HTMLCanvasElement; blob: Blob } | null>(null);

  const inputKey = `${result?.objectUrl ?? source?.objectUrl ?? ""}`;
  const inputWidth = result?.width ?? source?.width ?? 0;
  const inputHeight = result?.height ?? source?.height ?? 0;
  const inputUrl = result?.objectUrl ?? source?.objectUrl ?? "";
  const inputIsAlpha = (result?.codec ?? "png") === "png";

  const tool = section.tools.find((t) => t.id === activeTool);

  const runError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        runError(`Please upload an image under ${MAX_FILE_MB} MB.`);
        return;
      }
      try {
        if (source) URL.revokeObjectURL(source.objectUrl);
        setResult((prev) => {
          if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
          return null;
        });
        cutoutCache.current = null;
        const loaded = await loadSourceImage(file);
        setSource(loaded);
        setCropRect({ x: 0, y: 0, width: loaded.width, height: loaded.height });
        setParams(defaultParams());
        setView("original");
        setActiveTool("enhance");
      } catch (err) {
        runError(err instanceof Error ? err.message : "The image could not be loaded.");
      }
    },
    [source, runError],
  );

  const getInputCanvas = useCallback((): HTMLCanvasElement => {
    if (result?.canvas) return result.canvas;
    if (source) return canvasFromSource(source);
    throw new Error("No image to process.");
  }, [result, source]);

  const setProcessed = useCallback(
    async (canvas: HTMLCanvasElement, format: EncodedFormat, quality: number): Promise<ResultImage> => {
      const next = await encodeCanvas(canvas, format, quality);
      setResult((prev) => {
        if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
        return null;
      });
      setResult(next);
      setView("result");
      return next;
    },
    [],
  );

  const runTool = async () => {
    if (!source || processing) return;
    setError(null);
    setProcessing(true);
    setProgressPct(null);

    try {
      const inputCanvas = getInputCanvas();

      if (activeTool === "bg-remove" || activeTool === "background-change") {
        setProgressLabel("Running AI background removal…");
        setProgressPct(0);
        setProgressNote(
          inputIsAlpha && result?.codec === "png"
            ? undefined
            : "Downloads a free open-source model on first use (~80 MB), then runs 100% on your device.",
        );

        let cutoutBlob: Blob;
        if (cutoutCache.current?.key === inputKey) {
          cutoutBlob = cutoutCache.current.blob;
          setProgressPct(100);
        } else {
          const inputBlob = result?.blob ?? source.file;
          cutoutBlob = await removeBackgroundBlob(inputBlob, setProgressPct);
        }

        const canvas = await blobToCanvas(cutoutBlob);
        cutoutCache.current = { key: inputKey, canvas, blob: cutoutBlob };

        if (activeTool === "bg-remove") {
          await setProcessed(canvas, "png", 1);
        } else {
          const composed = compositeCanvas(canvas, {
            kind: params.bgKind,
            from: params.bgFrom,
            to: params.bgTo,
          });
          await setProcessed(composed, "png", 0.95);
        }
        return;
      }

      setProgressLabel(
        activeTool === "upscale-4k"
          ? "Upscaling to 4K…"
          : activeTool === "enhance"
            ? "Enhancing…"
            : activeTool === "sharpen"
              ? "Sharpening…"
              : activeTool === "resize"
                ? "Resizing…"
                : "Processing…",
      );

      if (activeTool === "upscale-4k") {
        await setProcessed(upscaleCanvas(inputCanvas, params.sharpenAmount), "png", 1);
      } else if (activeTool === "enhance") {
        await setProcessed(enhanceCanvas(inputCanvas, params.enhanceIntensity / 100), "png", 1);
      } else if (activeTool === "sharpen") {
        await setProcessed(sharpenCanvas(inputCanvas, params.sharpenAmount), "png", 1);
      } else if (activeTool === "resize") {
        const width = Number(params.resizeWidth);
        const height = Number(params.resizeHeight);
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
          throw new Error("Please enter a valid width and height.");
        }
        await setProcessed(resizeCanvas(inputCanvas, width, height), "png", 1);
      } else if (activeTool === "crop") {
        const cropped = cropCanvas(inputCanvas, cropRect);
        await setProcessed(cropped, "png", 1);
        setCropRect({ x: 0, y: 0, width: cropped.width, height: cropped.height });
      } else if (activeTool === "compress") {
        await setProcessed(inputCanvas, params.compressFormat, params.compressQuality / 100);
      } else if (activeTool === "format-convert") {
        await setProcessed(inputCanvas, params.convertFormat, params.convertQuality / 100);
      }
    } catch (err) {
      runError(err instanceof Error ? err.message : "Processing failed. Please try again.");
    } finally {
      setProcessing(false);
      setProgressPct(null);
      setProgressNote(undefined);
    }
  };

  const resetTool = () => {
    setResult((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setView("original");
    setCropRect({ x: 0, y: 0, width: inputWidth || 1, height: inputHeight || 1 });
    setParams(defaultParams());
    setError(null);
  };

  const clearAll = () => {
    setResult((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    if (source) URL.revokeObjectURL(source.objectUrl);
    setSource(null);
    setCropRect({ x: 0, y: 0, width: 1, height: 1 });
    setParams(defaultParams());
    setView("original");
    setActiveTool("enhance");
    setError(null);
    cutoutCache.current = null;
  };

  const patchParams = useCallback(
    (patch: Partial<LabParams>) => {
      setParams((prev) => {
        const next = { ...prev, ...patch };

        if (next.lockAspect && inputWidth > 0 && inputHeight > 0) {
          if (patch.resizeWidth && patch.resizeWidth !== prev.resizeWidth) {
            next.resizeHeight = String(
              Math.round((Number(next.resizeWidth) * inputHeight) / inputWidth),
            );
          } else if (patch.resizeHeight && patch.resizeHeight !== prev.resizeHeight) {
            next.resizeWidth = String(
              Math.round((Number(next.resizeHeight) * inputWidth) / inputHeight),
            );
          }
        }
        return next;
      });
    },
    [inputWidth, inputHeight],
  );

  const [stageRef, stageWidth] = useContainerWidth<HTMLDivElement>();
  const availableWidth = stageWidth || 720;

  const displayImage = (() => {
    if (activeTool === "crop") {
      return {
        url: inputUrl,
        width: inputWidth,
        height: inputHeight,
        alpha: inputIsAlpha,
      };
    }
    if (view === "result" && result) {
      return {
        url: result.objectUrl ?? "",
        width: result.width,
        height: result.height,
        alpha: result.codec === "png",
      };
    }
    return {
      url: source?.objectUrl ?? "",
      width: source?.width ?? 0,
      height: source?.height ?? 0,
      alpha: false,
    };
  })();

  const aspect = displayImage.width > 0 && displayImage.height > 0 ? displayImage.width / displayImage.height : 1;
  let displayW = availableWidth;
  let displayH = displayW / aspect;
  if (displayH > STAGE_MAX_HEIGHT) {
    displayH = STAGE_MAX_HEIGHT;
    displayW = displayH * aspect;
  }

  const showChecker =
    displayImage.alpha && (activeTool === "bg-remove" || activeTool === "background-change");

  const download = () => {
    if (!result?.blob) return;
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(result.blob);
    anchor.download = `${source?.baseName ?? "image"}-${activeTool}.${extensionFor(result.codec)}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 4000);
  };

  const aspectValue = parseAspect(params.cropAspect);
  const handleToolSelect = (id: string | undefined) => {
    if (!id) return;
    setActiveTool(id);
    if (id === "crop" && inputWidth > 0 && inputHeight > 0) {
      setCropRect({ x: 0, y: 0, width: inputWidth, height: inputHeight });
    }
    if (result) setView("result");
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <section className="anim-rise-in relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
        <div
          aria-hidden
          className={cn(
            "absolute -right-24 -top-28 h-64 w-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
            accent.gradient,
          )}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-xl",
              accent.gradient,
              accent.glow,
            )}
          >
            <Icon name="image" className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Design Studio · Functional
            </p>
            <h1 className="font-display mt-0.5 text-2xl font-bold tracking-tight text-white">
              Image Lab
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              100% browser-side processing — your images never leave this device.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live tools
          </span>
        </div>
      </section>

      {error && (
        <div className="mx-auto mb-6 max-w-3xl">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {!source ? (
        <Dropzone onFile={handleFile} accent={accent} disabled={processing} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)_320px]">
          {/* Tool rail */}
          <aside className="order-1">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Tools
            </p>
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {section.tools.map((item) => {
                const active = item.id === activeTool;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToolSelect(item.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-[13px] font-medium transition-colors lg:w-full",
                      active
                        ? "border-white/10 bg-white/[0.07] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
                        : "border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                    )}
                    aria-pressed={active}
                  >
                    <Icon
                      name={item.icon}
                      className={cn("h-[18px] w-[18px]", active ? accent.text : "text-zinc-500")}
                    />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Stage */}
          <section className="order-2 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{source.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {source.width} × {source.height} px · {formatBytes(source.bytes)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {(["original", "result"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    disabled={v === "result" && !result}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      view === v ? "bg-white/[0.1] text-white" : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    {v === "result" && result ? `Result · ${formatBytes(result.blob?.size ?? 0)}` : v}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={stageRef}
              className="relative mt-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c14] p-4"
            >
              <div className="relative flex justify-center">
                {displayImage.width > 0 && (
                  <>
                    {showChecker ? (
                      <CheckerboardImage
                        url={displayImage.url}
                        alt="Result"
                        width={displayW}
                        height={displayH}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayImage.url}
                        alt="Preview"
                        className="block select-none rounded-lg"
                        style={{ width: displayW, height: displayH }}
                        draggable={false}
                      />
                    )}

                    {activeTool === "crop" && (
                      <CropOverlay
                        naturalWidth={inputWidth}
                        naturalHeight={inputHeight}
                        displayWidth={displayW}
                        displayHeight={displayH}
                        rect={cropRect}
                        aspectRatio={aspectValue}
                        accent={accent}
                        onChange={setCropRect}
                      />
                    )}
                  </>
                )}
                {processing && <ProgressOverlay label={progressLabel} pct={progressPct} note={progressNote} />}
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-zinc-600">
              {activeTool === "bg-remove" &&
                "Checkerboard shows transparency — downloads stay true transparent PNGs."}
              {activeTool === "crop" && "Drag to draw a crop area · drag inside to reposition it."}
              {["enhance", "sharpen", "upscale-4k"].includes(activeTool) &&
                "Switch between Original and Result above to compare before and after."}
            </p>
          </section>

          {/* Controls */}
          <aside className="order-3 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white",
                    accent.gradient,
                  )}
                >
                  <Icon name={tool?.icon ?? "image"} className="h-[18px] w-[18px]" />
                </span>
                <h2 className="font-display text-base font-bold text-white">
                  {tool?.name ?? "Tool"}
                </h2>
              </div>

              <div className="mt-5">
                {tool && (
                  <ToolControls
                    tool={tool}
                    accent={accent}
                    params={params}
                    update={patchParams}
                    onApply={runTool}
                    onClearCrop={() =>
                      setCropRect({ x: 0, y: 0, width: inputWidth, height: inputHeight })
                    }
                    processing={processing}
                    source={source}
                    result={result}
                  />
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.06] pt-5">
                <GhostButton onClick={download} disabled={!result?.blob || processing} className="w-full">
                  {result?.blob ? "Download result" : "Nothing to download yet"}
                </GhostButton>
                <div className="flex gap-2">
                  <GhostButton onClick={resetTool} disabled={!result || processing} className="flex-1 text-xs">
                    Reset
                  </GhostButton>
                  <GhostButton onClick={clearAll} disabled={processing} className="flex-1 text-xs">
                    New image
                  </GhostButton>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}