import { create } from "zustand";

export interface Point {
  x: number;
  y: number;
}
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type ViewportMode = "idle" | "panning" | "shiftPanning";

// Utility helpers

/** Clamps a value between min and max. */
export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Converts a screen-space point to canvas world coordinates. */
export const screenToWorld = (
  screen: Point,
  translate: Point,
  scale: number,
): Point => ({
  x: (screen.x - translate.x) / scale,
  y: (screen.y - translate.y) / scale,
});

/** Converts a canvas world point to screen-space coordinates. */
export const worldToScreen = (
  world: Point,
  translate: Point,
  scale: number,
): Point => ({
  x: world.x * scale + translate.x,
  y: world.y * scale + translate.y,
});

/** Computes the new translate needed to keep a screen point stationary during a zoom. */
export const zoomAroundScreenPoint = (
  originScreen: Point,
  newScale: number,
  currentTranslate: Point,
  currentScale: number,
): Point => {
  const worldAtOrigin = screenToWorld(
    originScreen,
    currentTranslate,
    currentScale,
  );
  return {
    x: originScreen.x - worldAtOrigin.x * newScale,
    y: originScreen.y - worldAtOrigin.y * newScale,
  };
};

/** Returns the Euclidean distance between two points. */
export const distance = (a: Point, b: Point) =>
  Math.hypot(b.x - a.x, b.y - a.y);

/** Returns the midpoint between two points. */
export const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

interface ViewportState {
  scale: number;
  minScale: number;
  maxScale: number;
  translate: Point;
  mode: ViewportMode;
  panStartScreen: Point | null;
  panStartTranslate: Point | null;
  wheelPanSpeed: number;
  zoomStep: number;

  /** Directly sets the canvas translation (pan offset). */
  setTranslate: (p: Point) => void;
  /** Sets an absolute zoom level, optionally anchored to a screen point. */
  setScale: (payload: { scale: number; originScreen?: Point }) => void;
  /** Multiplies the current scale by a factor, anchored to a screen point. */
  zoomBy: (payload: { factor: number; originScreen: Point }) => void;
  /** Handles mouse wheel zoom, converting deltaY to a smooth scale factor. */
  wheelZoom: (payload: { deltaY: number; originScreen: Point }) => void;
  /** Handles mouse wheel panning by shifting the translate by dx/dy. */
  wheelPan: (payload: { dx: number; dy: number }) => void;
  /** Records the starting screen position and translate when a pan gesture begins. */
  panStart: (payload: { screen: Point; mode?: ViewportMode }) => void;
  /** Updates translate as the pointer moves during an active pan gesture. */
  panMove: (screen: Point) => void;
  /** Ends the active pan gesture and resets mode to idle. */
  panEnd: () => void;
  /** Activates shift-pan mode when the spacebar / hand tool is held. */
  handToolEnable: () => void;
  /** Deactivates shift-pan mode when the spacebar / hand tool is released. */
  handToolDisable: () => void;
  /** Pans the viewport so that a world point aligns with a given screen position. */
  centerOnWorld: (payload: { world: Point; toScreen?: Point }) => void;
  /** Zooms and pans to fit a bounding rect fully within the viewport with optional padding. */
  zoomToFit: (payload: {
    bounds: Rect;
    viewportPx: { width: number; height: number };
    padding?: number;
  }) => void;
  /** Resets zoom to 1x and translation to the origin. */
  resetView: () => void;
  /** Restores a previously saved viewport state (used when re-opening a project). */
  restoreViewport: (payload: { scale: number; translate: Point }) => void;
}

export const useViewportStore = create<ViewportState>((set, get) => ({
  scale: 1,
  minScale: 0.1,
  maxScale: 8,
  translate: { x: 0, y: 0 },
  mode: "idle",
  panStartScreen: null,
  panStartTranslate: null,
  wheelPanSpeed: 0.5,
  zoomStep: 1.06,

  setTranslate: (p) => set({ translate: { x: p.x, y: p.y } }),

  setScale: ({ scale, originScreen }) =>
    set((s) => {
      const clamped = clamp(scale, s.minScale, s.maxScale);
      if (originScreen) {
        const t = zoomAroundScreenPoint(
          originScreen,
          clamped,
          s.translate,
          s.scale,
        );
        return { scale: clamped, translate: t };
      }
      return { scale: clamped };
    }),

  zoomBy: ({ factor, originScreen }) =>
    set((s) => {
      const next = clamp(s.scale * factor, s.minScale, s.maxScale);
      const t = zoomAroundScreenPoint(originScreen, next, s.translate, s.scale);
      return { scale: next, translate: t };
    }),

  wheelZoom: ({ deltaY, originScreen }) =>
    set((s) => {
      const factor = Math.pow(s.zoomStep, -deltaY / 53);
      const next = clamp(s.scale * factor, s.minScale, s.maxScale);
      const t = zoomAroundScreenPoint(originScreen, next, s.translate, s.scale);
      return { scale: next, translate: t };
    }),

  wheelPan: ({ dx, dy }) =>
    set((s) => ({
      translate: {
        x: s.translate.x + dx * s.wheelPanSpeed,
        y: s.translate.y + dy * s.wheelPanSpeed,
      },
    })),

  panStart: ({ screen, mode }) =>
    set((s) => ({
      mode: mode ?? "panning",
      panStartScreen: screen,
      panStartTranslate: { x: s.translate.x, y: s.translate.y },
    })),

  panMove: (screen) =>
    set((s) => {
      if (s.mode !== "panning" && s.mode !== "shiftPanning") return s;
      if (!s.panStartScreen || !s.panStartTranslate) return s;
      return {
        translate: {
          x: s.panStartTranslate.x + (screen.x - s.panStartScreen.x),
          y: s.panStartTranslate.y + (screen.y - s.panStartScreen.y),
        },
      };
    }),

  panEnd: () =>
    set({ mode: "idle", panStartScreen: null, panStartTranslate: null }),

  handToolEnable: () =>
    set((s) => (s.mode === "idle" ? { mode: "shiftPanning" } : s)),

  handToolDisable: () =>
    set((s) => (s.mode === "shiftPanning" ? { mode: "idle" } : s)),

  centerOnWorld: ({ world, toScreen = { x: 0, y: 0 } }) =>
    set((s) => ({
      translate: {
        x: toScreen.x - world.x * s.scale,
        y: toScreen.y - world.y * s.scale,
      },
    })),

  zoomToFit: ({ bounds, viewportPx, padding = 50 }) =>
    set((s) => {
      const aw = Math.max(1, viewportPx.width - padding * 2);
      const ah = Math.max(1, viewportPx.height - padding * 2);
      const bw = Math.max(1e-6, bounds.width);
      const bh = Math.max(1e-6, bounds.height);
      const next = clamp(Math.min(aw / bw, ah / bh), s.minScale, s.maxScale);
      const centerX = viewportPx.width / 2;
      const centerY = viewportPx.height / 2;
      return {
        scale: next,
        translate: {
          x: centerX - (bounds.x + bounds.width / 2) * next,
          y: centerY - (bounds.y + bounds.height / 2) * next,
        },
      };
    }),

  resetView: () =>
    set({
      scale: 1,
      translate: { x: 0, y: 0 },
      mode: "idle",
      panStartScreen: null,
      panStartTranslate: null,
    }),

  restoreViewport: ({ scale, translate }) =>
    set((s) => ({
      scale: clamp(scale, s.minScale, s.maxScale),
      translate: { x: translate.x, y: translate.y },
      mode: "idle",
      panStartScreen: null,
      panStartTranslate: null,
    })),
}));
