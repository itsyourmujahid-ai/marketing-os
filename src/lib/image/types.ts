export interface SourceImage {
  element: HTMLImageElement;
  file: File;
  name: string;
  baseName: string;
  width: number;
  height: number;
  bytes: number;
  type: string;
  objectUrl: string;
}

export interface ResultImage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  blob: Blob | null;
  codec: "png" | "jpeg" | "webp";
  objectUrl: string | null;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EncodedFormat = "png" | "jpeg" | "webp";