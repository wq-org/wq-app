# Drag & drop math — module layout

Aligned with [docs/architecture/principle_clean_code.md](../../../../docs/architecture/principle_clean_code.md) and [principle_frontend.md](../../../../docs/architecture/principle_frontend.md) (feature internals: `components/`, `hooks/`, `types/`, constants; no Supabase API in this node).

## Folders

| Folder        | Responsibility                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `components/` | UI only — editors, palette, canvas rows, XYFlow node/dialog shells. Subfolder `canvas/` for DnD row UI. |
| `hooks/`      | React state — `useMathDropNodeEditor`, `useDropNodeEditor`, `useDragDropMathCanvasRows`.                |
| `types/`      | Schemas and DnD/canvas payload types (`drag-drop-math.schema.ts`, `canvas.types.ts`, …).                |
| `constants/`  | Static config — palette presets, CVA variants, DnD id helpers.                                          |
| `utils/`      | Pure functions — `evaluateMathExpression`, `mathEquationRow`, canvas DnD helpers.                       |

## Public API

Import from `@/features/game-studio/nodes/drag-drop-math` (root `index.ts` only). Do not deep-import into `components/` or `hooks/` from outside this folder.

## Data flow (Enter → result)

`DropMathNode` → `useMathDropNodeEditor` → `evaluateMathExpression` → `onCommit` → `useDragDropMathCanvasRows.commitMathEquation` → `applyMathEquationCommitToRow` → row tokens `equation` + `=` + `result` rendered by `CanvasRowNode` / `DropMathStaticNode`.
