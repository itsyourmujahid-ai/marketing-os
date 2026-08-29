export interface SourceVideo {
  file: File;
  name: string;
  baseName: string;
  objectUrl: string;
  width: number;
  height: number;
  duration: number;
  bytes: number;
}

/** A fixed on-screen region to erase, in normalized coordinates (0..1). */
export interface MarkRegion {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ExportResolution = "original" | "1080p" | "720p" | "480p";

export interface ExportOptions {
  resolution: ExportResolution;
  bitrate: number;
  featherPx: number;
}

export interface ExportCallbacks {
  onStage: (stage: "plates" | "export") => void;
  onProgress: (pct: number) => void;
}

export interface EraseResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  mime: string;
  ext: string;
}

/** A re-synthesised background patch for one marked region. */
export interface CleanPatch {
  rect: { x: number; y: number; w: number; h: number };
  data: Uint8ClampedArray;
}