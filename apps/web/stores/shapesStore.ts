import { create } from "zustand";

export type Tool =
  | "select"
  | "frame"
  | "rect"
  | "ellipse"
  | "freedraw"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  id: string;
  stroke: string;
  strokeWidth: number;
  fill?: string | null;
}
export interface FrameShape extends BaseShape {
  type: "frame";
  x: number;
  y: number;
  w: number;
  h: number;
  frameNumber: number;
}
export interface RectShape extends BaseShape {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  frameId: string | null;
}
export interface EllipseShape extends BaseShape {
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  frameId: string | null;
}
export interface FreeDrawShape extends BaseShape {
  type: "freedraw";
  points: Point[];
  frameId: string | null;
}
export interface ArrowShape extends BaseShape {
  type: "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  frameId: string | null;
}
export interface LineShape extends BaseShape {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  frameId: string | null;
}
export interface TextShape extends BaseShape {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  frameId: string | null;
}
export interface GeneratedUIShape extends BaseShape {
  type: "generatedui";
  x: number;
  y: number;
  w: number;
  h: number;
  uiSpecData: string | null;
  sourceFrameId: string;
  isWorkflowPage?: boolean;
}

export type Shape =
  | FrameShape
  | RectShape
  | EllipseShape
  | FreeDrawShape
  | ArrowShape
  | LineShape
  | TextShape
  | GeneratedUIShape;

type SelectionMap = Record<string, true>;

interface ShapesState {
  tool: Tool;
  shapes: Record<string, Shape>;
  shapeIds: string[];
  selected: SelectionMap;
  frameCounter: number;

  /** Sets the active drawing tool and clears selection when switching away from select. */
  setTool: (tool: Tool) => void;
  /** Adds a new frame (canvas container) and increments the frame counter. */
  addFrame: (p: {
    x: number;
    y: number;
    w: number;
    h: number;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds a rectangle shape, optionally assigned to a frame. */
  addRect: (p: {
    x: number;
    y: number;
    w: number;
    h: number;
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds an ellipse shape, optionally assigned to a frame. */
  addEllipse: (p: {
    x: number;
    y: number;
    w: number;
    h: number;
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds a freehand stroke from a list of points; no-ops if points array is empty. */
  addFreeDrawShape: (p: {
    points: Point[];
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds a straight arrow between two points, optionally assigned to a frame. */
  addArrow: (p: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds a straight line between two points, optionally assigned to a frame. */
  addLine: (p: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds a text shape with typography options, optionally assigned to a frame. */
  addText: (p: {
    x: number;
    y: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    fontStyle?: "normal" | "italic";
    textAlign?: "left" | "center" | "right";
    textDecoration?: "none" | "underline" | "line-through";
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    frameId?: string | null;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
  }) => void;
  /** Adds an AI-generated UI overlay shape onto the canvas (not persisted to the Shape DB table). */
  addGeneratedUI: (p: {
    x: number;
    y: number;
    w: number;
    h: number;
    uiSpecData: string | null;
    sourceFrameId: string;
    id?: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string | null;
    isWorkflowPage?: boolean;
  }) => void;
  /** Applies a partial update to any shape by id. */
  updateShape: (id: string, patch: Partial<Shape>) => void;
  /** Removes a single shape by id and decrements frameCounter if it was a frame. */
  removeShape: (id: string) => void;
  /** Removes all shapes and resets the frame counter. */
  clearAll: () => void;
  /** Adds a shape to the current selection. */
  selectShape: (id: string) => void;
  /** Removes a single shape from the current selection. */
  deselectShape: (id: string) => void;
  /** Clears all selected shapes. */
  clearSelection: () => void;
  /** Selects every shape on the canvas. */
  selectAll: () => void;
  /** Deletes all currently selected shapes. */
  deleteSelected: () => void;
  /** Replaces the entire canvas state, used when loading a saved project. */
  loadProject: (data: {
    shapes: Record<string, Shape>;
    shapeIds: string[];
    tool: Tool;
    selected: SelectionMap;
    frameCounter: number;
  }) => void;
}

const DEFAULTS = { stroke: "#ffff", strokeWidth: 2 as const };

function addOne(
  state: Pick<ShapesState, "shapes" | "shapeIds">,
  shape: Shape,
): Pick<ShapesState, "shapes" | "shapeIds"> {
  return {
    shapes: { ...state.shapes, [shape.id]: shape },
    shapeIds: [...state.shapeIds, shape.id],
  };
}

export const useShapesStore = create<ShapesState>((set) => ({
  tool: "select",
  shapes: {},
  shapeIds: [],
  selected: {},
  frameCounter: 0,

  setTool: (tool) =>
    set((s) => ({
      tool,
      selected: tool !== "select" ? {} : s.selected,
    })),

  addFrame: (p) =>
    set((s) => {
      const frameCounter = s.frameCounter + 1;
      const shape: FrameShape = {
        id: crypto.randomUUID(),
        type: "frame",
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        frameNumber: frameCounter,
        stroke: "transparent",
        strokeWidth: 0,
        fill: p.fill ?? "rgba(255, 255, 255, 0.05)",
      };
      return { frameCounter, ...addOne(s, shape) };
    }),

  addRect: (p) =>
    set((s) => {
      const shape: RectShape = {
        id: crypto.randomUUID(),
        type: "rect",
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    }),

  addEllipse: (p) =>
    set((s) => {
      const shape: EllipseShape = {
        id: crypto.randomUUID(),
        type: "ellipse",
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    }),

  addFreeDrawShape: (p) => {
    if (!p.points || p.points.length === 0) return;
    set((s) => {
      const shape: FreeDrawShape = {
        id: crypto.randomUUID(),
        type: "freedraw",
        points: p.points,
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    });
  },

  addArrow: (p) =>
    set((s) => {
      const shape: ArrowShape = {
        id: crypto.randomUUID(),
        type: "arrow",
        startX: p.startX,
        startY: p.startY,
        endX: p.endX,
        endY: p.endY,
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    }),

  addLine: (p) =>
    set((s) => {
      const shape: LineShape = {
        id: crypto.randomUUID(),
        type: "line",
        startX: p.startX,
        startY: p.startY,
        endX: p.endX,
        endY: p.endY,
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    }),

  addText: (p) =>
    set((s) => {
      const shape: TextShape = {
        id: crypto.randomUUID(),
        type: "text",
        x: p.x,
        y: p.y,
        text: p.text ?? "Type here...",
        fontSize: p.fontSize ?? 16,
        fontFamily: p.fontFamily ?? "Inter, sans-serif",
        fontWeight: p.fontWeight ?? 400,
        fontStyle: p.fontStyle ?? "normal",
        textAlign: p.textAlign ?? "left",
        textDecoration: p.textDecoration ?? "none",
        lineHeight: p.lineHeight ?? 1.2,
        letterSpacing: p.letterSpacing ?? 0,
        textTransform: p.textTransform ?? "none",
        frameId: p.frameId ?? null,
        stroke: p.stroke ?? DEFAULTS.stroke,
        strokeWidth: p.strokeWidth ?? DEFAULTS.strokeWidth,
        fill: p.fill ?? "#ffffff",
      };
      return addOne(s, shape);
    }),

  addGeneratedUI: (p) =>
    set((s) => {
      const shape: GeneratedUIShape = {
        id: p.id ?? crypto.randomUUID(),
        type: "generatedui",
        x: p.x,
        y: p.y,
        w: p.w,
        h: p.h,
        uiSpecData: p.uiSpecData,
        sourceFrameId: p.sourceFrameId,
        isWorkflowPage: p.isWorkflowPage,
        stroke: "transparent",
        strokeWidth: 0,
        fill: p.fill ?? null,
      };
      return addOne(s, shape);
    }),

  updateShape: (id, patch) =>
    set((s) => {
      if (!s.shapes[id]) return s;
      return {
        shapes: { ...s.shapes, [id]: { ...s.shapes[id], ...patch } as Shape },
      };
    }),

  removeShape: (id) =>
    set((s) => {
      const shape = s.shapes[id];
      const { [id]: _shape, ...restShapes } = s.shapes;
      const { [id]: _sel, ...restSelected } = s.selected;
      return {
        shapes: restShapes,
        shapeIds: s.shapeIds.filter((sid) => sid !== id),
        selected: restSelected,
        frameCounter:
          shape?.type === "frame"
            ? Math.max(0, s.frameCounter - 1)
            : s.frameCounter,
      };
    }),

  clearAll: () =>
    set({ shapes: {}, shapeIds: [], selected: {}, frameCounter: 0 }),

  selectShape: (id) =>
    set((s) => ({ selected: { ...s.selected, [id]: true } })),

  deselectShape: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.selected;
      return { selected: rest };
    }),

  clearSelection: () => set({ selected: {} }),

  selectAll: () =>
    set((s) => ({
      selected: Object.fromEntries(s.shapeIds.map((id) => [id, true])),
    })),

  deleteSelected: () =>
    set((s) => {
      const ids = new Set(Object.keys(s.selected));
      if (ids.size === 0) return s;
      const shapes = { ...s.shapes };
      ids.forEach((id) => delete shapes[id]);
      return {
        shapes,
        shapeIds: s.shapeIds.filter((id) => !ids.has(id)),
        selected: {},
      };
    }),

  loadProject: (data) =>
    set({
      shapes: data.shapes,
      shapeIds: data.shapeIds,
      tool: data.tool,
      selected: data.selected,
      frameCounter: data.frameCounter,
    }),
}));
