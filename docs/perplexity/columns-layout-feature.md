# Task — Columns Layout Feature

> **Source:** `packages/lexical-playground/src/plugins/LayoutPlugin/` +
> `packages/lexical-playground/src/nodes/LayoutContainerNode.ts` +
> `packages/lexical-playground/src/nodes/LayoutItemNode.ts`
>
> **Reference UI:** Screenshots show the default Lexical playground dialog.
> We port the logic 1:1 but replace ALL playground UI with wq design tokens.
>
> **Rules:** `fe_principles.md` · `clean_code_principles.md`

---

## Goal

Enable teachers to insert multi-column layouts (2 / 3 / 4 columns, various
ratios) into the lesson editor by triggering a **polished wq-styled panel**
from the slash-menu (`/`) or toolbar.

---

## Description

The Lexical community ships `LayoutContainerNode` + `LayoutItemNode` as a
`display: grid` wrapper. The wq editor does not register these nodes yet — so
the full port covers:

1. Copy the two node classes verbatim (they are pure Lexical nodes, no UI).
2. Port `LayoutPlugin` (command handler) unchanged — it has zero UI.
3. Replace `InsertLayoutDialog` entirely with a new wq component
   `InsertColumnsPanel` that uses wq design-system primitives.
4. Wire the entry point into `ComponentPickerPlugin` (slash-menu).

---

## Affected Files

| File                                                            | Action                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| `src/features/lexical-editor/nodes/LayoutContainerNode.ts`      | **Copy** from lexical-playground verbatim                |
| `src/features/lexical-editor/nodes/LayoutItemNode.ts`           | **Copy** from lexical-playground verbatim                |
| `src/features/lexical-editor/plugins/LayoutPlugin.ts`           | **Copy** from lexical-playground verbatim                |
| `src/features/lexical-editor/components/InsertColumnsPanel.tsx` | **New** — wq-styled replacement for `InsertLayoutDialog` |
| `src/features/lexical-editor/components/Editor.tsx`             | Register nodes + mount plugin                            |
| `src/features/lexical-editor/plugins/ComponentPickerPlugin.tsx` | Add "Columns Layout" picker entry                        |

---

## Step 1 — Copy Node Files

Copy exactly from the lexical monorepo. Do **not** change any logic.

```bash
cp packages/lexical-playground/src/nodes/LayoutContainerNode.ts \
   src/features/lexical-editor/nodes/LayoutContainerNode.ts

cp packages/lexical-playground/src/nodes/LayoutItemNode.ts \
   src/features/lexical-editor/nodes/LayoutItemNode.ts
```

Fix one import path in each file — replace the relative playground path with the wq alias:

```ts
// Before (playground path)
import { addClassNamesToElement } from '@lexical/utils'

// No change needed — @lexical/utils is already a dependency.
// Only fix if any import points to '../../ui/' or '../../nodes/' — replace with
// the wq-app equivalent.
```

---

## Step 2 — Copy LayoutPlugin

```bash
cp packages/lexical-playground/src/plugins/LayoutPlugin/LayoutPlugin.tsx \
   src/features/lexical-editor/plugins/LayoutPlugin.ts
```

Fix the two node imports:

```ts
// Replace playground-relative paths:
import {
  $createLayoutContainerNode,
  $isLayoutContainerNode,
  LayoutContainerNode,
} from '../../nodes/LayoutContainerNode'

import {
  $createLayoutItemNode,
  $isLayoutItemNode,
  LayoutItemNode,
} from '../../nodes/LayoutItemNode'
```

Export the two commands so `InsertColumnsPanel` can import them:

```ts
export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand<string>()
export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{ template: string; nodeKey: NodeKey }> =
  createCommand()
```

---

## Step 3 — New Component `InsertColumnsPanel.tsx`

This **replaces** `InsertLayoutDialog` entirely. No playground UI primitives
(`DropDown`, `Button`) — use wq components only.

```tsx
// src/features/lexical-editor/components/InsertColumnsPanel.tsx

import type { LexicalEditor } from 'lexical'
import { useState } from 'react'
import { Columns2, Columns3, Columns4, LayoutTemplate } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { INSERT_LAYOUT_COMMAND } from '../plugins/LayoutPlugin'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type LayoutOption = {
  label: string
  value: string // CSS grid-template-columns value
  columns: 2 | 3 | 4
}

const LAYOUT_OPTIONS: readonly LayoutOption[] = [
  { label: '2 columns — equal', value: '1fr 1fr', columns: 2 },
  { label: '2 columns — 25 / 75', value: '1fr 3fr', columns: 2 },
  { label: '3 columns — equal', value: '1fr 1fr 1fr', columns: 3 },
  { label: '3 columns — 25 / 50 / 25', value: '1fr 2fr 1fr', columns: 3 },
  { label: '4 columns — equal', value: '1fr 1fr 1fr 1fr', columns: 4 },
] as const

// ---------------------------------------------------------------------------
// Sub-component: visual column preview strip
// ---------------------------------------------------------------------------

type ColumnPreviewProps = {
  option: LayoutOption
  isSelected: boolean
}

function ColumnPreview({ option, isSelected }: ColumnPreviewProps) {
  // Parse fractions from the value string for proportional preview widths
  const fractions = option.value.split(' ').map((v) => parseFloat(v.replace('fr', '')))

  const total = fractions.reduce((a, b) => a + b, 0)

  return (
    <div
      className={cn(
        'flex h-8 gap-0.5 overflow-hidden rounded',
        isSelected && 'ring-2 ring-primary ring-offset-1',
      )}
      aria-hidden
    >
      {fractions.map((fr, i) => (
        <div
          key={i}
          className="rounded-sm bg-muted"
          style={{ flexBasis: `${(fr / total) * 100}%`, flexGrow: 0, flexShrink: 0 }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export type InsertColumnsPanelProps = {
  activeEditor: LexicalEditor
  onClose: () => void
  className?: string
}

export function InsertColumnsPanel({ activeEditor, onClose, className }: InsertColumnsPanelProps) {
  const [selected, setSelected] = useState<LayoutOption>(LAYOUT_OPTIONS[0])

  function handleInsert() {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, selected.value)
    onClose()
  }

  function handleSelectChange(value: string) {
    const found = LAYOUT_OPTIONS.find((o) => o.value === value)
    if (found) setSelected(found)
  }

  return (
    <div
      className={cn(
        'w-[300px] rounded-2xl border border-border bg-popover p-4',
        'text-popover-foreground shadow-xl backdrop-blur-xl',
        'supports-backdrop-filter:bg-popover/90',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <LayoutTemplate
          size={16}
          className="text-muted-foreground"
        />
        <span className="text-sm font-medium">Insert columns</span>
      </div>

      {/* Visual preview of all options */}
      <div className="mb-3 flex flex-col gap-1.5">
        {LAYOUT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option)}
            className={cn(
              'flex flex-col gap-1 rounded-lg px-2 py-1.5 text-left transition-colors',
              'hover:bg-muted/60',
              selected.value === option.value && 'bg-muted',
            )}
          >
            <ColumnPreview
              option={option}
              isSelected={selected.value === option.value}
            />
            <span className="text-xs text-muted-foreground">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Insert button */}
      <Button
        size="sm"
        className="w-full"
        onClick={handleInsert}
      >
        Insert
      </Button>
    </div>
  )
}
```

**Rules applied:**

- `LAYOUT_OPTIONS` is a stable `as const` outside the component — no re-creation on render [file:6]
- `ColumnPreview` is a named sub-component — no anonymous JSX [file:3]
- `handleInsert` and `handleSelectChange` are named functions — no inline lambdas in JSX [file:6]
- All visual previews are proportional to the actual `fr` values — no hardcoded widths
- No playground primitives (`DropDown`, `Button` from playground) — only wq `@/components/ui/*` [file:3]

---

## Step 4 — Register Nodes + Mount Plugin in `Editor.tsx`

### 4a — Node registration

```tsx
// Editor.tsx — in the initialConfig nodes array
import { LayoutContainerNode } from '../nodes/LayoutContainerNode'
import { LayoutItemNode } from '../nodes/LayoutItemNode'

const initialConfig = {
  nodes: [
    // ... existing nodes ...
    LayoutContainerNode,
    LayoutItemNode,
  ],
}
```

### 4b — Plugin mount

```tsx
import { LayoutPlugin } from '../plugins/LayoutPlugin'

// Inside <LexicalComposer>:
;<LayoutPlugin />
```

### 4c — Panel state + render

```tsx
const [showColumnsPanel, setShowColumnsPanel] = useState(false)

// Inside the relative wrapper, alongside EmojiPickerPanel:
{
  showColumnsPanel && (
    <InsertColumnsPanel
      activeEditor={editor}
      onClose={() => setShowColumnsPanel(false)}
      className="absolute top-10 left-0 z-50"
    />
  )
}
```

---

## Step 5 — Slash-Menu Entry (`ComponentPickerPlugin.tsx`)

Add a new `ComponentPickerOption` for columns.

```tsx
// ComponentPickerPlugin.tsx
import { Columns2 } from 'lucide-react'
import { InsertColumnsPanel } from '../components/InsertColumnsPanel'
import { INSERT_LAYOUT_COMMAND } from '../plugins/LayoutPlugin'

// Inside the options array / builder:
new ComponentPickerOption('Columns Layout', {
  icon: <Columns2 size={16} />,
  keywords: ['columns', 'layout', 'grid', 'split'],
  onSelect: () => setShowColumnsPanel(true),
})
```

Alternatively — for inline insertion without a panel (direct 2-column default):

```tsx
new ComponentPickerOption('2 Columns', {
  icon: <Columns2 size={16} />,
  keywords: ['columns', '2col', 'split'],
  onSelect: () => editor.dispatchCommand(INSERT_LAYOUT_COMMAND, '1fr 1fr'),
})
```

Prefer the **panel approach** (first option) — it lets the teacher see all
layout options before committing. [file:3]

---

## Sample Interaction

### Initial State

1. Teacher is editing a lesson. Cursor is in an empty paragraph.

### User Action 1 — Open via slash-menu

1. Teacher types `/`.
2. `ComponentPickerPlugin` shows the picker overlay.
3. Teacher types `col` — "Columns Layout" option appears.
4. Teacher presses `Enter` or clicks it.
5. `InsertColumnsPanel` opens — visual preview of all 5 options rendered.
6. Default selection is "2 columns — equal" (first option, highlighted).

### User Action 2 — Pick a layout and insert

1. Teacher clicks "3 columns — 25 / 50 / 25".
2. Preview strip for that row shows a narrow | wide | narrow preview.
3. Teacher clicks **Insert**.
4. `INSERT_LAYOUT_COMMAND` is dispatched with value `'1fr 2fr 1fr'`.
5. A `LayoutContainerNode` with 3 `LayoutItemNode` children is inserted at cursor.
6. Panel closes. Cursor lands in the first column.

### User Action 3 — Type in columns

1. Teacher types in column 1 → content appears.
2. Teacher presses `Tab` or `→` to move to column 2 → cursor moves.
3. Each column is independently editable with the full editor feature set.

---

## Detailed Requirements

1. `LayoutContainerNode` and `LayoutItemNode` are copied verbatim from
   `packages/lexical-playground` — no logic changes, only import path fixes.
2. `LayoutPlugin` is registered in `Editor.tsx` alongside all other plugins.
3. Both node classes are added to `initialConfig.nodes` before mounting.
4. `InsertColumnsPanel` uses only `@/components/ui/*` — no playground UI primitives.
5. All 5 layout options from the original playground are present.
6. Visual previews use proportional `flexBasis` widths derived from the `fr` fractions.
7. Selected option is highlighted with `ring-2 ring-primary`.
8. Clicking any option row immediately updates selection (no confirm step).
9. Clicking **Insert** dispatches `INSERT_LAYOUT_COMMAND` and closes the panel.
10. Panel closes on successful insert.
11. `LAYOUT_OPTIONS` is a module-level `as const` constant — not defined inside the component.
12. No inline arrow functions in JSX event handlers — all handlers are named functions.
13. Slash-menu entry uses keyword `['columns', 'layout', 'grid', 'split']` for discoverability.
14. Tailwind only — no new CSS files.
15. `ColumnPreview` is a named sub-component, not an inline function.

---

## Acceptance Criteria

- [ ] `LayoutContainerNode` and `LayoutItemNode` registered in `initialConfig.nodes`
- [ ] `LayoutPlugin` mounted in `<LexicalComposer>` body
- [ ] Typing `/col` in the editor shows "Columns Layout" in the slash-menu
- [ ] `InsertColumnsPanel` opens on picker selection
- [ ] All 5 layout options visible with proportional column previews
- [ ] Clicking a row selects it (highlighted ring)
- [ ] Clicking Insert inserts the correct `grid-template-columns` layout
- [ ] Editor renders inserted columns side-by-side
- [ ] Each column is independently editable
- [ ] Panel closes after insert
- [ ] No playground UI primitives (`DropDown`, playground `Button`) in wq codebase
- [ ] `LAYOUT_OPTIONS` defined outside component (no re-creation)
- [ ] Named handler functions — no inline lambdas in JSX
