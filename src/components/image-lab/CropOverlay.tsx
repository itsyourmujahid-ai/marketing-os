"use client";

import { useRef } from "react";

import type { CropRect } from "@/lib/image/types";
import type { Accent } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface DragState {
  mode: "draw" | "move" | null;
  startX: number;
  startY: number;
  rectX: number;
  rectY: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildRect(
  start: { x: number; y: number },
  cur: { x: number; y: number },
  aspectRatio: number | null,
  naturalWidth: number,
  naturalHeight: number,
): CropRect {
  let w = cur.x - start.x;
  let h = cur.y - start.y;

  if (aspectRatio) {
    if (Math.abs(w) >= Math.abs(h)) {
      if (w === 0) {
        w = h >= 0 ? Math.abs(h) * aspectRatio : -Math.abs(h) * aspectRatio;
      } else {
        const sign = w >= 0 ? 1 : -1;
        h = sign * (Math.abs(w) / aspectRatio);
      }
    } else {
      if (h === 0) {
        h = w >= 0 ? Math.abs(w) / aspectRatio : -Math.abs(w) / aspectRatio;
      } else {
        const sign = h >= 0 ? 1 : -1;
        w = sign * (Math.abs(h) * aspectRatio);
      }
    }
  }

  const x = w >= 0 ? start.x : start.x + w;
  const y = h >= 0 ? start.y : start.y + h;
  const width = Math.max(2, Math.abs(w));
  const height = Math.max(2, Math.abs(h));

  return clampRect({ x, y, width, height }, naturalWidth, naturalHeight);
}

function clampRect(rectIn: CropRect, naturalWidth: number, naturalHeight: number): CropRect {
  const maxX = Math.max(0, naturalWidth - 2);
  const maxY = Math.max(0, naturalHeight - 2);
  return {
    x: clamp(rectIn.x, 0, maxX),
    y: clamp(rectIn.y, 0, maxY),
    width: clamp(rectIn.width, 2, naturalWidth),
    height: clamp(rectIn.height, 2, naturalHeight),
  };
}

export function CropOverlay({
  naturalWidth,
  naturalHeight,
  displayWidth,
  displayHeight,
  rect,
  aspectRatio,
  accent,
  onChange,
}: {
  naturalWidth: number;
  naturalHeight: number;
  displayWidth: number;
  displayHeight: number;
  rect: CropRect;
  aspectRatio: number | null;
  accent: Accent;
  onChange: (rect: CropRect) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ mode: null, startX: 0, startY: 0, rectX: 0, rectY: 0 });

  function toNative(clientX: number, clientY: number): { x: number; y: number } {
    const bounds = overlayRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return {
      x: (clientX - bounds.left) / bounds.width * naturalWidth,
      y: (clientY - bounds.top) / bounds.height * naturalHeight,
    };
  }

  function handleDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pt = toNative(event.clientX, event.clientY);
    const inside =
      pt.x >= rect.x && pt.x <= rect.x + rect.width && pt.y >= rect.y && pt.y <= rect.y + rect.height;

    drag.current = {
      mode: inside ? "move" : "draw",
      startX: pt.x,
      startY: pt.y,
      rectX: rect.x,
      rectY: rect.y,
    };
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state.mode) return;
    const pt = toNative(event.clientX, event.clientY);

    if (state.mode === "draw") {
      onChange(buildRect({ x: state.startX, y: state.startY }, pt, aspectRatio, naturalWidth, naturalHeight));
    } else {
      const dx = pt.x - state.startX;
      const dy = pt.y - state.startY;
      onChange(
        clampRect(
          {
            x: state.rectX + dx,
            y: state.rectY + dy,
            width: rect.width,
            height: rect.height,
          },
          naturalWidth,
          naturalHeight,
        ),
      );
    }
  }

  function handleUp() {
    drag.current.mode = null;
  }

  const scaleX = displayWidth / naturalWidth;
  const scaleY = displayHeight / naturalHeight;
  const px = rect.x * scaleX;
  const py = rect.y * scaleY;
  const pw = rect.width * scaleX;
  const ph = rect.height * scaleY;

  const shades = [
    { top: 0, left: 0, width: displayWidth, height: py },
    { top: py, left: 0, width: px, height: ph },
    { top: py, left: px + pw, width: Math.max(0, displayWidth - px - pw), height: ph },
    { top: py + ph, left: 0, width: displayWidth, height: Math.max(0, displayHeight - py - ph) },
  ];

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 cursor-crosshair touch-none select-none"
      style={{ width: displayWidth, height: displayHeight }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {shades.map((shade, index) => (
        <div key={index} className="pointer-events-none absolute bg-black/50" style={shade} />
      ))}

      <div
        className={cn("pointer-events-none absolute border-2", accent.border)}
        style={{ left: px, top: py, width: pw, height: ph }}
      >
        {[1 / 3, 2 / 3].map((f) => (
          <div key={`v${f}`} className="absolute h-full w-px bg-white/50" style={{ left: `${f * 100}%` }} />
        ))}
        {[1 / 3, 2 / 3].map((f) => (
          <div key={`h${f}`} className="absolute h-full w-px bg-white/50" style={{ top: `${f * 100}%` }} />
        ))}

        {[
          { left: -3, top: -3 },
          { left: pw - 3, top: -3 },
          { left: -3, top: ph - 3 },
          { left: pw - 3, top: ph - 3 },
        ].map((handle, index) => (
          <span
            key={index}
            className={cn("absolute h-1.5 w-1.5 rounded-sm bg-white shadow", accent.dot)}
            style={handle}
          />
        ))}
      </div>
    </div>
  );
}