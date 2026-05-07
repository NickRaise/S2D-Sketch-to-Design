# Store ↔ Schema Alignment Changelog

This document catalogs every change made to align the frontend Zustand stores with the Prisma DB schema. Use it as a reference when adding new features or debugging sync issues.

---

## Session: Autosave Foundation (2026-05-06)

### Goal
Align `shapesStore`, `projectStore`, and `viewportStore` with the Prisma schema so the autosave feature has the data it needs to persist canvas state incrementally (one shape = one row, not a full JSON blob).

---

### 1. `packages/db/prisma/schema.prisma` — Shape model

**Change:** Added `points Json?` field to `Shape`.

**Why:**
`FreeDrawShape` in the store stores an array of `Point[]`. The DB `Shape` model only had `x, y, width, height` — no column for path data. Without `points`, freedraw strokes cannot be persisted.

**How to apply:**
- On autosave, write `points` for shapes of `type = "freedraw"`.
- For all other types, `points` is `null`.
- The `x, y, width, height` columns for a freedraw shape should be computed from the bounding box of `points` (min/max of the point array) at save time — do not store them in the store, compute on flush.

---

### 2. `apps/web/stores/shapesStore.ts` — `frameId` on non-frame shapes

**Change:** Added `frameId: string | null` to `RectShape`, `EllipseShape`, `FreeDrawShape`, `ArrowShape`, `LineShape`, `TextShape`.

**Why:**
The DB `Shape` table has `frameId String` (non-nullable). Every shape row must belong to a `Frame`. Without `frameId` in the store, autosave has no way to know which frame a shape belongs to when writing to the DB.

`FrameShape` itself does NOT get a `frameId` — frames are top-level containers (they map to the `Frame` table, not the `Shape` table).

**How to apply:**
- All `add*` actions now accept an optional `frameId?: string | null` parameter.
- Default is `null` (shape drawn outside any frame — will not be persisted to DB until assigned).
- Autosave logic should skip shapes where `frameId === null` or compute containment geometrically before flushing.

---

### 3. `apps/web/stores/shapesStore.ts` — `GeneratedUIShape` note

**No code change made — documented here for future.**

`GeneratedUIShape` (fields: `uiSpecData`, `sourceFrameId`, `isWorkflowPage`) is an AI **result**, not a sketch shape. It should eventually be removed from `shapesStore` and sourced from the `GeneratedResult` DB model instead.

For now it stays in the store for canvas rendering purposes, but it must **never** be written to the `Shape` table on autosave. Autosave logic must filter `type === "generatedui"` shapes out before writing.

---

### 4. `apps/web/stores/projectStore.ts` — Active project state + TypeScript fix

**Change 1 (bug fix):** Added all action method signatures to `ProjectState` interface. Previously they were defined in the `create()` call but omitted from the interface, making them effectively untyped.

**Change 2:** Added `ProjectDetail` interface (extends `ProjectSummary` with `viewportData`).

**Why:** `Project.viewportData: Json?` in the schema is used to restore the canvas viewport (zoom + pan) when re-opening a project. `ProjectSummary` (used for the project list) doesn't carry this field — `ProjectDetail` does.

**Change 3:** Added active project state fields: `activeProjectId`, `activeProject`, `isLoadingProject`, `projectError`.

**Why:** The project list page and the canvas editing page are different contexts. The canvas needs to know *which project is open* and have access to its `viewportData` to restore the viewport. The old store had no concept of "current project".

**Actions added:**
- `loadActiveProjectStart(id)` — sets loading state before API fetch
- `loadActiveProjectSuccess(project)` — stores the loaded `ProjectDetail`
- `loadActiveProjectFailure(error)` — stores the error
- `updateActiveProjectViewport(viewportData)` — called on autosave to keep store in sync after viewport is saved to DB
- `clearActiveProject()` — called on project close / navigation away

---

### 5. `apps/web/stores/viewportStore.ts` — No changes

The viewport store is correctly designed. It is pure UI state with no backend coupling. The `restoreViewport({ scale, translate })` action is the hook point for loading `viewportData` from a project on open.

**Usage pattern (for future autosave implementation):**
```ts
// On project open:
const { scale, translate } = project.viewportData ?? { scale: 1, translate: { x: 0, y: 0 } };
useViewportStore.getState().restoreViewport({ scale, translate });

// On autosave flush:
const { scale, translate } = useViewportStore.getState();
useProjectStore.getState().updateActiveProjectViewport({ scale, translate });
// then PATCH /api/projects/:id with { viewportData: { scale, translate } }
```

---

## Autosave Architecture Notes

### What gets persisted where

| Canvas entity | DB table | Key mapping |
|---|---|---|
| `FrameShape` | `Frame` | `id → id`, `x,y,w,h → x,y,width,height`, `frameNumber → name` |
| `RectShape` / `EllipseShape` / `ArrowShape` / `LineShape` / `TextShape` | `Shape` | `frameId` required; `style` JSON bundles stroke/fill/font |
| `FreeDrawShape` | `Shape` | `points` stored as JSON; bounding box computed on flush |
| `GeneratedUIShape` | NOT persisted in `Shape` | Maps to `GeneratedResult.htmlOutput` eventually |
| Viewport (scale, translate) | `Project.viewportData` | Saved as `{ scale, translate }` JSON |

### Autosave diff strategy (for when you implement it)
- Keep a `lastSavedShapes` snapshot in the store or a ref in the autosave hook.
- On flush: diff current `shapes` vs snapshot → `created`, `updated`, `deleted` sets.
- Send a single PATCH `/api/projects/:projectId/shapes` with `{ upsert: [...], delete: [...] }`.
- This avoids re-writing every shape on every keystroke.
