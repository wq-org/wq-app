# Canvas DnD — Row-based Layout Plan

> dnd kit · React 19 · TypeScript  
> Follows: `principle_clean_code.md` · `principle_frontend.md`

---

## Goal

Drag nodes (e.g. `MathNode`, `TextNode`) onto a blank canvas.  
Nodes auto-group into **rows**. Rows are reorderable via a grip handle.  
Dropping above or below an existing row **creates a new row**.  
Ghost drop hints (dashed rectangle) provide live visual feedback.  
No visible row borders at rest — rows are invisible structural containers.

---

## Mental Model

```
Canvas
 └─ Row[]
     └─ Node[]    (MathNode | TextNode | …)
```

- A **Row** is a horizontal droppable strip.
- **Nodes** inside a row are horizontally sortable.
- The **canvas** itself is a vertical list of sortable rows.
- A **between-row drop zone** sits above/below every row for new-row creation.

---

## State Shape

```ts
// features/canvas/types/canvas.types.ts

export type CanvasNodeType = 'math' | 'text' | 'image' // extend as needed

export type CanvasNode = {
  id: string
  type: CanvasNodeType
  // node-specific payload goes here
}

export type CanvasRow = {
  id: string
  nodes: CanvasNode[]
}

export type CanvasState = {
  rows: CanvasRow[]
}
```

Minimum state — derive everything else (empty flags, index maps) from `rows`.  
Follows: _Store the minimum state; derive filtered lists and flags when cheap._ [clean_code_principles]

---

## Feature Folder Shape

```
features/canvas/
├── index.ts                     ← barrel, named exports only
├── types/
│   └── canvas.types.ts
├── hooks/
│   └── useCanvasState.ts        ← owns rows state + all mutation helpers
├── utils/
│   └── canvasDnd.utils.ts       ← pure: insertNode, moveNode, createRow
├── components/
│   ├── Canvas.tsx               ← DragDropProvider wrapper, renders RowList
│   ├── RowList.tsx              ← vertical SortableContext of rows
│   ├── CanvasRow.tsx            ← single row, horizontal SortableContext
│   ├── CanvasNode.tsx           ← draggable node, useSortable
│   ├── BetweenRowZone.tsx       ← droppable zone between rows → creates new row
│   └── RowGhostHint.tsx         ← dashed ghost rectangle shown while dragging
```

One component = one responsibility. Zero data logic inside components.  
Follows: _Component renders UI, fires events, calls one hook. Zero data logic._ [fe_principles]

---

## dnd kit Primitives Required

| Primitive                        | Where used           | Purpose                                                         |
| -------------------------------- | -------------------- | --------------------------------------------------------------- |
| `DragDropProvider`               | `Canvas.tsx`         | Root drag context, fires `onDragStart / onDragOver / onDragEnd` |
| `useSortable`                    | `CanvasNode.tsx`     | Makes each node draggable + sortable within a row               |
| `useSortable`                    | `CanvasRow.tsx`      | Makes entire rows reorderable via grip handle                   |
| `useDroppable`                   | `BetweenRowZone.tsx` | Drop target between rows to create a new row                    |
| `<SortableContext>` (vertical)   | `RowList.tsx`        | Tracks row order                                                |
| `<SortableContext>` (horizontal) | `CanvasRow.tsx`      | Tracks node order inside each row                               |
| `DragOverlay`                    | `Canvas.tsx`         | Renders the floating ghost clone while dragging                 |

---

## Interaction Rules

### 1 · Drop node onto empty canvas

- Canvas detects no rows yet → creates `Row` with that node → appends to `rows`.

### 2 · Drop node into existing row

- `onDragOver`: identify target row by `over.id`.
- Move node into that row's `nodes[]` at correct index (live preview).
- `onDragEnd`: commit final state.

### 3 · Drop above / below a row → new row

- `BetweenRowZone` components sit between every row pair and at top/bottom.
- Each zone has id `gap-before-{rowId}` / `gap-after-{rowId}`.
- `onDragOver` detects a gap zone → creates a new `CanvasRow`, inserts node into it.
- Gap zones are invisible at rest — no border.

### 4 · Reorder rows via grip handle

- `CanvasRow` is itself wrapped in `useSortable`.
- `GripVertical` icon receives `{...listeners} {...attributes}` from useSortable.
- Handle fades in on row hover via CSS `opacity: 0 → 1` transition.
- Rows animate vertically while dragging (SortableContext handles translate).

---

## Ghost Drop Hint

`RowGhostHint` renders a dashed light-gray rectangle at the active drop target.

```tsx
// RowGhostHint.tsx
export function RowGhostHint({ isOver }: { isOver: boolean }) {
  if (!isOver) return null
  return (
    <div
      aria-hidden
      className="h-14 w-full rounded border-2 border-dashed border-gray-300 bg-gray-50/40 transition-opacity"
    />
  )
}
```

- Rendered inside `BetweenRowZone` and inside an empty row.
- Visible only when `isOver === true` from `useDroppable`.
- Invisible structural container at rest — no border shown otherwise.

---

## `useCanvasState` Hook — Public API

```ts
// hooks/useCanvasState.ts

export function useCanvasState() {
  const [rows, setRows] = useState<CanvasRow[]>([])

  // called from onDragOver (live preview)
  function moveNodeToRow(nodeId: string, targetRowId: string, atIndex: number): void
  function moveNodeToNewRow(
    nodeId: string,
    position: 'before' | 'after',
    referenceRowId: string,
  ): void

  // called from onDragEnd (commit)
  function reorderRows(oldIndex: number, newIndex: number): void

  // drop on empty canvas
  function addNodeAsFirstRow(node: CanvasNode): void

  return { rows, moveNodeToRow, moveNodeToNewRow, reorderRows, addNodeAsFirstRow }
}
```

All mutation logic lives here — components only call these.  
Follows: _Hook owns state. Component fires events. Zero data logic in components._ [fe_principles / clean_code_principles]

---

## Pure Utilities — `canvasDnd.utils.ts`

```ts
export function insertNodeIntoRow(
  rows: CanvasRow[],
  nodeId: string,
  targetRowId: string,
  atIndex: number,
): CanvasRow[]
export function removeNodeFromRow(rows: CanvasRow[], nodeId: string): CanvasRow[]
export function insertNewRowWithNode(
  rows: CanvasRow[],
  node: CanvasNode,
  position: 'before' | 'after',
  referenceRowId: string,
): CanvasRow[]
export function reorderRows(rows: CanvasRow[], oldIndex: number, newIndex: number): CanvasRow[]
export function pruneEmptyRows(rows: CanvasRow[]): CanvasRow[]
```

Pure functions — no React. Unit-testable in isolation.  
Follows: _Pure, non-React logic → utility first._ [clean_code_principles]

---

## `Canvas.tsx` — Event Handler Sketch

```tsx
export function Canvas() {
  const { rows, moveNodeToRow, moveNodeToNewRow, reorderRows } = useCanvasState()
  const [activeId, setActiveId] = useState<string | null>(null)

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    if (over.id.toString().startsWith('gap-')) {
      const [, position, rowId] = over.id.toString().split('-')
      moveNodeToNewRow(active.id as string, position as 'before' | 'after', rowId)
      return
    }

    // over is a node or row → move node there live
    moveNodeToRow(active.id as string, over.data.current?.rowId, over.data.current?.index)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    // if active is a row → reorderRows(…)
    // if active is a node → already committed in onDragOver; prune empty rows
  }

  return (
    <DragDropProvider onDragStart={…} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <RowList rows={rows} />
      <DragOverlay>{activeId ? <NodeOverlay id={activeId} /> : null}</DragOverlay>
    </DragDropProvider>
  )
}
```

---

## Barrel

```ts
// features/canvas/index.ts
export { Canvas } from './components/Canvas'
export type { CanvasNode, CanvasRow, CanvasState, CanvasNodeType } from './types/canvas.types'
```

Named exports only. Deep paths never imported from outside the feature.  
Follows: _Named exports only. Consumers import from top-level barrel._ [clean_code_principles]

---

## Out of Scope

- Persisting canvas state to Supabase (add `canvasApi.ts` following the 5-layer contract when ready)
- Node configuration panels / side drawer
- Multi-select drag
- Undo / redo

---

## Implementation Order

1. `canvas.types.ts` — define CanvasNode, CanvasRow, CanvasState
2. `canvasDnd.utils.ts` — pure helpers, write unit tests alongside
3. `useCanvasState.ts` — wire utils into React state
4. `CanvasNode.tsx` + `CanvasRow.tsx` — sortable primitives, no logic
5. `BetweenRowZone.tsx` + `RowGhostHint.tsx` — drop zones + visual hint
6. `RowList.tsx` — vertical SortableContext
7. `Canvas.tsx` — assemble, wire `onDragOver` / `onDragEnd`
8. Barrel + integrate into page
