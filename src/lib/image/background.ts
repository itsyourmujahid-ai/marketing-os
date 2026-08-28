import type { Config } from "@imgly/background-removal";

import { createCanvas } from "@/lib/image/engine";

export interface BackgroundSpec {
  kind: "solid" | "gradient";
  from: string;
  to: string;
}

export async function removeBackgroundBlob(
  blob: Blob,
  onProgress: (pct: number) => void,
): Promise<Blob> {
  let removeBackground: (image: Blob, config?: Config) => Promise<Blob>;
  try {
    const mod = await import("@imgly/background-removal");
    removeBackground = mod.removeBackground;
  } catch {
    throw new Error(
      "The background-removal engine failed to load. Please check your connection and try again.",
    );
  }

  const config: Config = {
    device: "cpu",
    model: "isnet_fp16",
    output: { format: "image/png", quality: 0.95 },
    progress: (_key, current, total) => {
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      onProgress(Math.max(0, Math.min(99, pct)));
    },
  };

  try {
    const blobOut = await removeBackground(blob, config);
    onProgress(100);
    return blobOut;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      message.includes("publicPath") || message.includes("fetch")
        ? "The AI model could not be downloaded. Check your connection and try again."
        : "Background removal failed. Please try a different image.",
    );
  }
}

export async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("The cut-out could not be decoded."));
      el.src = url;
    });
    const canvas = createCanvas(image.naturalWidth, image.naturalHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(image, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function compositeCanvas(
  foreground: HTMLCanvasElement,
  spec: BackgroundSpec,
): HTMLCanvasElement {
  const out = createCanvas(foreground.width, foreground.height);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  if (spec.kind === "solid") {
    ctx.fillStyle = spec.from;
    ctx.fillRect(0, 0, out.width, out.height);
  } else {
    const gradient = ctx.createLinearGradient(0, out.height, out.width, 0);
    gradient.addColorStop(0, spec.from);
    gradient.addColorStop(1, spec.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, out.width, out.height);
  }

  ctx.drawImage(foreground, 0, 0);
  return out;
}

export function drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const size = 12;
  ctx.save();
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? "#ffffff" : "#d4d4d8";
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

const PRESETS: Record<string, string> = {
  "#ffffff": "White",
  "#0b0e17": "Dark",
  "#0ea5e9": "Sky",
  "#10b981": "Emerald",
  "#f59e0b": "Amber",
  "#ec4899": "Pink",
};

export function colorPresets(): Array<{ value: string; label: string }> {
  return Object.entries(PRESETS).map(([value, label]) => ({ value, label }));
}

const GRADIENT_PRESETS: Array<{ from: string; to: string; label: string }> = [
  { from: "#0ea5e9", to: "#8b5cf6", label: "Sky → Violet" },
  { from: "#f59e0b", to: "#ef4444", label: "Amber → Red" },
  { from: "#10b981", to: "#0ea5e9", label: "Emerald → Sky" },
  { from: "#0b0e17", to: "#3b82f6", label: "Night → Blue" },
];

export function gradientPresets(): Array<{ from: string; to: string; label: string }> {
  return GRADIENT_PRESETS;
}