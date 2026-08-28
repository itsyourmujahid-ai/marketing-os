import type { CropRect, EncodedFormat, ResultImage, SourceImage } from "@/lib/image/types";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function loadSourceImage(file: File): Promise<SourceImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image. Please upload a PNG, JPG, WebP or GIF.");
  }

  const objectUrl = URL.createObjectURL(file);

  const element = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The image could not be loaded. The file may be corrupted."));
    };
    image.src = objectUrl;
  });

  const dot = file.name.lastIndexOf(".");
  const baseName = dot > 0 ? file.name.slice(0, dot) : file.name;

  return {
    element,
    file,
    name: file.name,
    baseName,
    width: element.naturalWidth,
    height: element.naturalHeight,
    bytes: file.size,
    type: file.type,
    objectUrl,
  };
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function canvasFromSource(source: SourceImage): HTMLCanvasElement {
  const canvas = createCanvas(source.width, source.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source.element, 0, 0);
  return canvas;
}

export function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: EncodedFormat,
  quality: number,
): Promise<ResultImage> {
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        const result: ResultImage = {
          canvas,
          width: canvas.width,
          height: canvas.height,
          blob,
          codec: format,
          objectUrl: blob ? URL.createObjectURL(blob) : null,
        };
        resolve(result);
      },
      mime,
      format === "png" ? undefined : quality,
    );
    canvas.addEventListener(
      "error",
      () => reject(new Error("The image could not be encoded.")),
      { once: true },
    );
  });
}

/**
 * Auto-enhance: per-channel levels stretch + gentle saturation boost.
 */
export function enhanceCanvas(source: HTMLCanvasElement, intensity = 0.6): HTMLCanvasElement {
  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, out.width, out.height);
  const { data } = image;

  const bins = 256;
  const hist: Uint32Array[] = [new Uint32Array(bins), new Uint32Array(bins), new Uint32Array(bins)];
  const total = out.width * out.height;
  for (let i = 0; i < data.length; i += 4) {
    hist[0][data[i]]++;
    hist[1][data[i + 1]]++;
    hist[2][data[i + 2]]++;
  }

  const clip = Math.max(1, total * 0.004);
  const limits = [0, 1, 2].map((channel) => {
    let lo = 0;
    let sum = 0;
    while (lo < 255 && sum < clip) sum += hist[channel][lo++];
    let hi = 255;
    sum = 0;
    while (hi > 0 && sum < clip) sum += hist[channel][hi--];
    return Math.max(1, (Math.min(255, hi + 1) - Math.max(0, lo - 1)));
  });

  const amount = 0.55 + intensity * 0.55;
  const satFactor = 1 + intensity * 0.45;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    r = (r / 255) * limits[0];
    g = (g / 255) * limits[1];
    b = (b / 255) * limits[2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * satFactor;
    g = gray + (g - gray) * satFactor;
    b = gray + (b - gray) * satFactor;
    const boost = Math.min(255, Math.max(0, 128 + (gray - 128) * amount * 2));
    const k = amount * 0.12;
    data[i] = r * (1 - k) + boost * k;
    data[i + 1] = g * (1 - k) + boost * k;
    data[i + 2] = b * (1 - k) + boost * k;
  }

  ctx.putImageData(image, 0, 0);
  return out;
}

/**
 * Unsharp-mask sharpen with a separable box blur.
 */
export function sharpenCanvas(source: HTMLCanvasElement, amount = 1): HTMLCanvasElement {
  const out = createCanvas(source.width, source.height);
  const ctx = out.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, out.width, out.height);

  const w = out.width;
  const h = out.height;
  const src = image.data;
  const tmp = new Float32Array(w * h * 3);

  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - 1);
    const y1 = Math.min(h - 1, y + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(w - 1, x + 1);
      const o = (y * w + x) * 3;
      for (let c = 0; c < 3; c++) {
        tmp[o + c] =
          (src[(y0 * w + x0) * 4 + c] +
            src[(y0 * w + x) * 4 + c] +
            src[(y0 * w + x1) * 4 + c] +
            src[(y * w + x0) * 4 + c] +
            src[(y * w + x) * 4 + c] +
            src[(y * w + x1) * 4 + c] +
            src[(y1 * w + x0) * 4 + c] +
            src[(y1 * w + x) * 4 + c] +
            src[(y1 * w + x1) * 4 + c]) /
          9;
      }
    }
  }

  const strength = 0.4 + amount * 0.6;
  for (let i = 0; i < src.length; i += 4) {
    const o = (i / 4) * 3;
    for (let c = 0; c < 3; c++) {
      const sharp = src[i + c] + strength * (src[i + c] - tmp[o + c]);
      src[i + c] = Math.max(0, Math.min(255, sharp));
    }
  }

  ctx.putImageData(image, 0, 0);
  return out;
}

/**
 * Upscale an image to fit a 4K canvas (3840x2160) keeping aspect ratio.
 * Output is never smaller than the input in either dimension.
 */
export function upscaleCanvas(source: SourceImage | HTMLCanvasElement, sharpenAmount = 0.5): HTMLCanvasElement {
  let w = 0;
  let h = 0;
  let draw: CanvasImageSource;
  if (source instanceof HTMLCanvasElement) {
    w = source.width;
    h = source.height;
    draw = source;
  } else {
    w = source.width;
    h = source.height;
    draw = source.element;
  }

  const maxW = 3840;
  const maxH = 2160;
  const fits4K = w <= maxW && h <= maxH;

  let targetW: number;
  let targetH: number;
  if (fits4K) {
    const ratio = w / h;
    if (ratio >= maxW / maxH) {
      targetW = maxW;
      targetH = Math.max(h, Math.round(maxW / ratio));
    } else {
      targetH = maxH;
      targetW = Math.max(w, Math.round(maxH * ratio));
    }
  } else {
    if (w >= maxW) {
      targetW = w;
      targetH = Math.round(w / (w / h));
    } else {
      targetH = h;
      targetW = w;
    }
    targetW = w;
    targetH = h;
  }

  const out = createCanvas(targetW, targetH);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(draw, 0, 0, targetW, targetH);

  if (sharpenAmount > 0.01) {
    return sharpenCanvas(out, sharpenAmount);
  }
  return out;
}

export function resizeCanvas(source: HTMLCanvasElement | SourceImage, width: number, height: number): HTMLCanvasElement {
  let draw: CanvasImageSource;
  if (source instanceof HTMLCanvasElement) {
    draw = source;
  } else {
    draw = source.element;
  }
  if (!Number.isFinite(width) || width <= 0) throw new Error("Please enter a valid width.");
  if (!Number.isFinite(height) || height <= 0) throw new Error("Please enter a valid height.");

  const out = createCanvas(Math.round(width), Math.round(height));
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(draw, 0, 0, out.width, out.height);
  return out;
}

export function cropCanvas(source: HTMLCanvasElement | SourceImage, rect: CropRect): HTMLCanvasElement {
  let draw: CanvasImageSource;
  let dw: number;
  let dh: number;
  if (source instanceof HTMLCanvasElement) {
    draw = source;
    dw = source.width;
    dh = source.height;
  } else {
    draw = source.element;
    dw = source.width;
    dh = source.height;
  }

  const x = Math.max(0, Math.min(dw - 1, Math.round(rect.x)));
  const y = Math.max(0, Math.min(dh - 1, Math.round(rect.y)));
  const width = Math.max(1, Math.min(dw - x, Math.round(rect.width)));
  const height = Math.max(1, Math.min(dh - y, Math.round(rect.height)));

  const out = createCanvas(width, height);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(draw, x, y, width, height, 0, 0, width, height);
  return out;
}

export function mimeFor(format: EncodedFormat): string {
  return format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
}

export function extensionFor(format: EncodedFormat): string {
  return format;
}