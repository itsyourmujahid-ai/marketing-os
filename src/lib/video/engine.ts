import { formatBytes } from "@/lib/image/engine";
import type {
  CleanPatch,
  EraseResult,
  ExportCallbacks,
  ExportOptions,
  ExportResolution,
  MarkRegion,
  SourceVideo,
} from "./types";

export { formatBytes };

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function makeVideo(src: string): HTMLVideoElement {
  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.muted = true;
  video.src = src;
  return video;
}

export function loadSourceVideo(file: File): Promise<SourceVideo> {
  if (!file.type.startsWith("video/")) {
    return Promise.reject(
      new Error("That file is not a video. Please upload an MP4, WebM or MOV."),
    );
  }

  const objectUrl = URL.createObjectURL(file);
  const video = makeVideo(objectUrl);

  return new Promise<SourceVideo>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onError);
    };
    const onLoaded = () => {
      cleanup();
      if (
        !video.videoWidth ||
        !video.videoHeight ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("The video has no usable frames."));
        return;
      }
      const dot = file.name.lastIndexOf(".");
      resolve({
        file,
        name: file.name,
        baseName: dot > 0 ? file.name.slice(0, dot) : file.name,
        objectUrl,
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        bytes: file.size,
      });
    };
    const onError = () => {
      cleanup();
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The video could not be loaded. It may be corrupted or unsupported."));
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onError);
  });
}

export function resolveExportSize(
  source: SourceVideo,
  resolution: ExportResolution,
): { width: number; height: number } {
  const caps: Record<ExportResolution, number> = {
    original: Infinity,
    "1080p": 1920,
    "720p": 1280,
    "480p": 854,
  };
  const maxDim = caps[resolution];
  const natural = Math.max(source.width, source.height);
  const scale = natural <= maxDim ? 1 : maxDim / natural;
  const width = Math.max(2, Math.round(source.width * scale));
  const height = Math.max(2, Math.round(source.height * scale));
  return { width: width & ~1, height: height & ~1 };
}

export function regionsToRects(
  regions: MarkRegion[],
  width: number,
  height: number,
): Array<{ x: number; y: number; w: number; h: number }> {
  return regions.map((r) => {
    const x = Math.round(r.x * width);
    const y = Math.round(r.y * height);
    const x2 = Math.min(width, x + Math.round(r.width * width));
    const y2 = Math.min(height, y + Math.round(r.height * height));
    return { x: Math.max(0, x), y: Math.max(0, y), w: Math.max(0, x2 - x), h: Math.max(0, y2 - y) };
  });
}

function seekTo(video: HTMLVideoElement, t: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(true);
      }
    };
    const fail = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(false);
      }
    };
    const cleanup = () => {
      video.removeEventListener("seeked", done);
      video.removeEventListener("error", fail);
      window.clearTimeout(timer);
    };
    const timer = window.setTimeout(done, 3500);
    video.addEventListener("seeked", done);
    video.addEventListener("error", fail);
    try {
      video.currentTime = t;
    } catch {
      fail();
    }
  });
}

/**
 * Builds a temporal-median "clean plate" for every marked region: it samples
 * frames across the clip and, per pixel, keeps the median colour. Static
 * logos/watermarks disappear while moving background content is preserved.
 */
export async function buildCleanPlates(
  source: SourceVideo,
  regions: MarkRegion[],
  width: number,
  height: number,
  onProgress?: (pct: number) => void,
): Promise<CleanPatch[]> {
  const rectsRaw = regionsToRects(regions, width, height);
  const valid = rectsRaw.filter((r) => r.w > 0 && r.h > 0);
  if (!valid.length) return [];

  const duration = Math.max(0.5, source.duration);
  const count = Math.max(12, Math.min(40, Math.round(duration * 8)));
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    times.push(count === 1 ? duration / 2 : (i / (count - 1)) * Math.max(0.05, duration - 0.05));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const video = makeVideo(source.objectUrl);
  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => resolve();
    const onError = () => reject(new Error("The video could not be read."));
    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
  });

  const samples = valid.map((r) => new Uint8Array(count * r.w * r.h * 3));
  const pxPerRegion = valid.map((r) => r.w * r.h);

  for (let s = 0; s < count; s++) {
    await seekTo(video, times[s]);
    ctx.drawImage(video, 0, 0, width, height);
    for (let ri = 0; ri < valid.length; ri++) {
      const r = valid[ri];
      if (!r.w || !r.h) continue;
      const img = ctx.getImageData(r.x, r.y, r.w, r.h);
      const d = img.data;
      const base = s * pxPerRegion[ri] * 3;
      let i = 0;
      for (let p = 0; p < d.length; p += 4) {
        samples[ri][base + i] = d[p];
        samples[ri][base + i + 1] = d[p + 1];
        samples[ri][base + i + 2] = d[p + 2];
        i += 3;
      }
    }
    onProgress?.(s / count);
  }

  const patches: CleanPatch[] = [];
  const scratch = new Uint8Array(count);
  for (let ri = 0; ri < valid.length; ri++) {
    const r = valid[ri];
    const out = new ImageData(r.w, r.h);
    const pxCount = pxPerRegion[ri];
    for (let p = 0; p < pxCount; p++) {
      const pixBase = p * 3;
      for (let c = 0; c < 3; c++) {
        for (let s = 0; s < count; s++) {
          scratch[s] = samples[ri][s * pxCount * 3 + pixBase + c];
        }
        scratch.sort();
        const m = count >> 1;
        out.data[p * 4 + c] =
          count & 1 ? scratch[m] : (scratch[m - 1] + scratch[m]) >> 1;
      }
    }
    patches.push({ rect: r, data: out.data });
  }
  return patches;
}

/**
 * Paints the clean plate back over each region for the current frame, with
 * per-channel exposure drift correction (from the ring just outside the
 * region) and a feathered blend so edges don't look cut out.
 */
export function applyPatches(
  canvas: HTMLCanvasElement,
  patches: CleanPatch[],
  feather: number,
): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const MARGIN = 3;
  for (const patch of patches) {
    const { rect, data } = patch;
    if (rect.w <= 0 || rect.h <= 0) continue;

    const x0 = Math.max(0, rect.x - MARGIN);
    const y0 = Math.max(0, rect.y - MARGIN);
    const x1 = Math.min(canvas.width, rect.x + rect.w + MARGIN);
    const y1 = Math.min(canvas.height, rect.y + rect.h + MARGIN);
    const bw = x1 - x0;
    const bh = y1 - y0;
    if (bw <= 0 || bh <= 0) continue;

    const block = ctx.getImageData(x0, y0, bw, bh);
    const bd = block.data;

    let ringR = 0;
    let ringG = 0;
    let ringB = 0;
    let ringCount = 0;
    let patchR = 0;
    let patchG = 0;
    let patchB = 0;
    let patchCount = 0;

    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const gx = x0 + x;
        const gy = y0 + y;
        const inside =
          gx >= rect.x && gx < rect.x + rect.w && gy >= rect.y && gy < rect.y + rect.h;
        const o = (y * bw + x) * 4;
        if (!inside) {
          ringR += bd[o];
          ringG += bd[o + 1];
          ringB += bd[o + 2];
          ringCount++;
        } else {
          const lx = gx - rect.x;
          const ly = gy - rect.y;
          const nearEdge =
            lx < MARGIN ||
            ly < MARGIN ||
            rect.w - 1 - lx < MARGIN ||
            rect.h - 1 - ly < MARGIN;
          if (nearEdge) {
            const po = (ly * rect.w + lx) * 4;
            patchR += data[po];
            patchG += data[po + 1];
            patchB += data[po + 2];
            patchCount++;
          }
        }
      }
    }

    const gain = [1, 1, 1];
    if (ringCount && patchCount) {
      const fr = ringR / ringCount;
      const fg = ringG / ringCount;
      const fb = ringB / ringCount;
      const pr = patchR / patchCount;
      const pg = patchG / patchCount;
      const pb = patchB / patchCount;
      const clampGain = (v: number) => Math.max(0.5, Math.min(2, v));
      if (fr > 0 && pr > 0) gain[0] = clampGain(fr / pr);
      if (fg > 0 && pg > 0) gain[1] = clampGain(fg / pg);
      if (fb > 0 && pb > 0) gain[2] = clampGain(fb / pb);
    }

    const f = Math.max(1, Math.min(feather, Math.floor(Math.min(rect.w, rect.h) / 3)));

    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const gx = x0 + x;
        const gy = y0 + y;
        const inside =
          gx >= rect.x && gx < rect.x + rect.w && gy >= rect.y && gy < rect.y + rect.h;
        const o = (y * bw + x) * 4;
        if (!inside) continue;
        const dx = Math.min(gx - rect.x, rect.x + rect.w - 1 - gx);
        const dy = Math.min(gy - rect.y, rect.y + rect.h - 1 - gy);
        const d = Math.min(dx, dy);
        let alpha = Math.min(1, d / f);
        alpha = alpha * alpha * (3 - 2 * alpha);
        const po = ((gy - rect.y) * rect.w + (gx - rect.x)) * 4;
        bd[o] = bd[o] * (1 - alpha) + Math.min(255, Math.max(0, data[po] * gain[0])) * alpha;
        bd[o + 1] = bd[o + 1] * (1 - alpha) + Math.min(255, Math.max(0, data[po + 1] * gain[1])) * alpha;
        bd[o + 2] = bd[o + 2] * (1 - alpha) + Math.min(255, Math.max(0, data[po + 2] * gain[2])) * alpha;
        bd[o + 3] = 255;
      }
    }

    ctx.putImageData(block, x0, y0);
  }
}

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=av1,opus",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) return candidate;
    }
  }
  return "";
}

export function extensionForMime(mime: string): string {
  return mime.includes("mp4") ? "mp4" : "webm";
}

type VideoWithExtra = HTMLVideoElement & {
  captureStream?(frameRate?: number): MediaStream;
};

/**
 * Erases the marked regions and records the result to a downloadable file.
 * The clip plays back in real time while each frame is patched onto a canvas
 * that a MediaRecorder captures — audio is carried through when supported.
 */
export async function eraseAndExport(
  source: SourceVideo,
  regions: MarkRegion[],
  opts: ExportOptions,
  cb: ExportCallbacks,
): Promise<EraseResult> {
  const valid = regions.filter((r) => r.width > 0.004 && r.height > 0.004);
  if (!valid.length) {
    throw new Error("Draw at least one eraser region before exporting.");
  }
  const size = resolveExportSize(source, opts.resolution);

  cb.onStage("plates");
  cb.onProgress(0);
  const patches = await buildCleanPlates(source, valid, size.width, size.height, (p) =>
    cb.onProgress(p * 0.25),
  );
  cb.onStage("export");
  cb.onProgress(0.25);

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const video = makeVideo(source.objectUrl);
  video.volume = 0;
  video.muted = false;
  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => resolve();
    const onError = () => reject(new Error("The video could not be read."));
    video.addEventListener("loadeddata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
  });

  const canvasVideo = canvas as HTMLCanvasElement & { captureStream?(fps?: number): MediaStream };
  const stream = canvasVideo.captureStream?.(30);
  if (!stream) {
    throw new Error("This browser can't record canvas output — try Chrome, Edge or Firefox.");
  }
  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) throw new Error("This browser could not open a video capture stream.");

  let audioTrack: MediaStreamTrack | null = null;
  try {
    const audioStream = (video as VideoWithExtra).captureStream?.(30);
    audioTrack = audioStream?.getAudioTracks()[0] ?? null;
  } catch {
    audioTrack = null;
  }

  const tracks: MediaStreamTrack[] = [videoTrack, ...(audioTrack ? [audioTrack] : [])];
  const combined = new MediaStream(tracks);
  const mimeType = pickMimeType();
  const recorderOptions: MediaRecorderOptions = {
    videoBitsPerSecond: opts.bitrate,
    audioBitsPerSecond: 128000,
  };
  if (mimeType) recorderOptions.mimeType = mimeType;
  const recorder = new MediaRecorder(combined, recorderOptions);

  return new Promise<EraseResult>((resolve, reject) => {
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => reject(new Error("Export failed while recording."));
    recorder.onstop = () => {
      for (const track of tracks) track.stop();
      const type = mimeType || "video/webm";
      const blob = new Blob(chunks, { type });
      resolve({
        blob,
        objectUrl: URL.createObjectURL(blob),
        width: size.width,
        height: size.height,
        mime: type,
        ext: extensionForMime(type),
      });
    };

    const duration = Math.max(0.001, source.duration);
    let last = -1;
    const draw = () => {
      ctx.drawImage(video, 0, 0, size.width, size.height);
      applyPatches(canvas, patches, opts.featherPx);
    };

    const step = () => {
      if (recorder.state === "inactive") return;
      const t = video.currentTime;
      if (t !== last) {
        last = t;
        draw();
      }
      cb.onProgress(Math.min(0.99, 0.25 + 0.75 * (t / duration)));
      if (video.ended) {
        draw();
        window.setTimeout(() => {
          if (recorder.state !== "inactive") recorder.stop();
        }, 80);
        return;
      }
      window.requestAnimationFrame(step);
    };

    video.onended = () => {
      if (recorder.state === "recording") recorder.stop();
    };

    video.currentTime = 0;
    video
      .play()
      .then(() => {
        draw();
        recorder.start(250);
        window.requestAnimationFrame(step);
      })
      .catch(() => {
        for (const track of tracks) track.stop();
        reject(new Error("The video could not play for export."));
      });
  });
}