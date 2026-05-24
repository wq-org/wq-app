# Task — Blue Caret + Mobile-Style Selection Handles

## Goal

When a user highlights text inside the Lexical editor (`Editor.tsx`) or the document editor
(`DocumentEditor.tsx`), the experience should match mobile native text-selection:

- The text **caret** (blinking cursor) is **blue** (`#3b82f6` / `blue-500`).
- The **text selection background** is a soft blue (`#dbeafe` / `blue-100`) with near-black
  text (`#0f172a` / `slate-900`).
- Two **circular blue drag handles** appear: one above-left at the selection start, one
  below-right at the selection end — exactly as seen on iOS/Android native selectors.

---

## Reference Image

See attached `/Users/godfredamoahsefa/destkop/HHwOqTiWAAEbuhg.jpeg`:

- Selection highlight is a soft blue rectangle.
- **Start handle** = filled blue circle sitting above the first selected character,
  stem drops down to meet the selection boundary.
- **End handle** = filled blue circle sitting below the last selected character,
  stem rises up from the selection boundary.
- Each handle has a medium drop-shadow.
- The text caret line between handle stems is the same blue.

---

## Description

The browser provides no native API to style the drag handles — the default platform handles
(white squares on desktop, teardrop shapes on mobile) cannot be restyled with CSS alone.
The solution is a **React component (`SelectionHandles`)** that:

1. Listens to the Lexical `SELECTION_CHANGE_COMMAND` (or `editor.registerUpdateListener`).
2. Uses `window.getSelection()` + `Range.getClientRects()` to find the pixel positions
   of the start and end of the selection.
3. Renders two absolutely-positioned `<div>` circles overlaid on the editor container.
4. Hides on collapsed selection (plain caret, no range).

The browser's **native selection colour and caret colour** are handled with Tailwind
utility classes on the `ContentEditable` element — no custom CSS file needed.

---

## Affected Files

| File                                                          | Change                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/features/lexical-editor/components/Editor.tsx`           | Add classes to `ContentEditable`; mount `<SelectionHandles>` |
| `src/components/shared/editors/DocumentEditor.tsx`            | Same two changes                                             |
| `src/features/lexical-editor/components/SelectionHandles.tsx` | **New file** — the handle renderer                           |

---

## Detailed Requirements

### Requirement 1 — Caret & Selection Colour (CSS)

Add Tailwind classes to **both** `ContentEditable` elements:

```tsx
// Editor.tsx — line ~260
<ContentEditable
  className="editor-contentEditable px-0! outline-none dark:text-zinc-200
             caret-blue-500 selection:bg-blue-100 selection:text-slate-900"
  aria-label="Rich text editor"
  ...
/>

// DocumentEditor.tsx — line ~39
<ContentEditable
  className="editor-contentEditable
             caret-blue-500 selection:bg-blue-100 selection:text-slate-900"
  ...
/>
```

- `caret-blue-500` → `caret-color: #3b82f6` — blue blinking cursor.
- `selection:bg-blue-100` → `::selection { background: #dbeafe }` — soft blue highlight.
- `selection:text-slate-900` → `::selection { color: #0f172a }` — keeps text readable.

> **Dark mode:** add `dark:selection:bg-blue-900 dark:selection:text-white` if the editor
> supports dark mode (Editor.tsx already has `dark:text-zinc-200`).

---

### Requirement 2 — `SelectionHandles` Component (New File)

Create `src/features/lexical-editor/components/SelectionHandles.tsx`:

```tsx
// src/features/lexical-editor/components/SelectionHandles.tsx

import { useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical'

interface HandlePos {
  top: number
  left: number
}

interface SelectionHandlesProps {
  /** The scrollable container that wraps ContentEditable — used for offset calc */
  containerRef: React.RefObject<HTMLElement>
}

export function SelectionHandles({ containerRef }: SelectionHandlesProps) {
  const [editor] = useLexicalComposerContext()
  const [startPos, setStartPos] = useState<HandlePos | null>(null)
  const [endPos, setEndPos] = useState<HandlePos | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    function update() {
      const domSelection = window.getSelection()
      const container = containerRef.current

      if (
        !domSelection ||
        domSelection.isCollapsed ||
        domSelection.rangeCount === 0 ||
        !container
      ) {
        setStartPos(null)
        setEndPos(null)
        return
      }

      const range = domSelection.getRangeAt(0)
      const containerRect = container.getBoundingClientRect()

      // --- Start handle: position above first rect ---
      const startRange = range.cloneRange()
      startRange.collapse(true) // collapse to start
      const startRects = startRange.getClientRects()
      const firstRect = startRects[0] ?? range.getClientRects()[0]

      // --- End handle: position below last rect ---
      const endRange = range.cloneRange()
      endRange.collapse(false) // collapse to end
      const endRects = endRange.getClientRects()
      const lastRect = endRects[0] ?? range.getClientRects()[range.getClientRects().length - 1]

      if (!firstRect || !lastRect) {
        setStartPos(null)
        setEndPos(null)
        return
      }

      const scrollTop = container.scrollTop
      const scrollLeft = container.scrollLeft

      setStartPos({
        // above the start: top of firstRect, shifted up by handle diameter (16px)
        top: firstRect.top - containerRect.top + scrollTop - 16,
        left: firstRect.left - containerRect.left + scrollLeft,
      })

      setEndPos({
        // below the end: bottom of lastRect
        top: lastRect.bottom - containerRect.top + scrollTop,
        left: lastRect.right - containerRect.left + scrollLeft,
      })
    }

    // Register on every Lexical state change
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
        frameRef.current = requestAnimationFrame(update)
        return false // do not stop propagation
      },
      COMMAND_PRIORITY_LOW,
    )

    // Also clear handles on mousedown (new selection starting)
    function onMouseDown() {
      setStartPos(null)
      setEndPos(null)
    }
    document.addEventListener('mousedown', onMouseDown)

    return () => {
      unregister()
      document.removeEventListener('mousedown', onMouseDown)
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [editor, containerRef])

  if (!startPos && !endPos) return null

  return (
    <>
      {startPos && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-50 size-4 rounded-full bg-blue-500
                     shadow-[0_2px_8px_rgba(59,130,246,0.55)]"
          style={{ top: startPos.top, left: startPos.left, transform: 'translate(-50%, 0)' }}
        />
      )}
      {endPos && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-50 size-4 rounded-full bg-blue-500
                     shadow-[0_2px_8px_rgba(59,130,246,0.55)]"
          style={{ top: endPos.top, left: endPos.left, transform: 'translate(-50%, 0)' }}
        />
      )}
    </>
  )
}
```

**Handle visual spec:**

- `size-4` = 16×16 px circle (`w-4 h-4`)
- `rounded-full` = perfect circle
- `bg-blue-500` = `#3b82f6`
- `shadow-[0_2px_8px_rgba(59,130,246,0.55)]` = medium blue-tinted drop shadow
- `pointer-events-none` = handles are decorative only, do not interfere with mouse events
- `aria-hidden="true"` = invisible to screen readers

---

### Requirement 3 — Mount `SelectionHandles` in `Editor.tsx`

```tsx
// Editor.tsx

import { SelectionHandles } from './SelectionHandles'

// Inside the component, the existing ref setup:
// const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)
// Already has: ref={setAnchorElem} on the wrapper div

// Create a ref for the container (or reuse anchorElem via useRef):
const editorContainerRef = useRef<HTMLDivElement>(null)

// In JSX — the wrapper div already has ref={setAnchorElem};
// add the new ref alongside (or use a callback ref that sets both):
<div
  ref={(el) => {
    setAnchorElem(el)          // existing
    editorContainerRef.current = el  // new
  }}
  className="relative w-full"
>
  <ContentEditable
    className="editor-contentEditable px-0! outline-none dark:text-zinc-200
               caret-blue-500 selection:bg-blue-100 selection:text-slate-900
               dark:selection:bg-blue-900 dark:selection:text-white"
    aria-label="Rich text editor"
    aria-placeholder="Type '/' for commands..."
    placeholder={<div className="editor-placeholder">Type &apos;/&apos; for commands...</div>}
  />

  {/* Selection handles overlay */}
  <SelectionHandles containerRef={editorContainerRef} />

  {/* ...rest of plugins unchanged */}
</div>
```

---

### Requirement 4 — Mount in `DocumentEditor.tsx`

```tsx
// DocumentEditor.tsx
import { SelectionHandles } from '@/features/lexical-editor/components/SelectionHandles'

// Add ref to the existing wrapper div
const editorContainerRef = useRef<HTMLDivElement>(null)

<div className="editor-surface relative" ref={editorContainerRef}>
  ...
  <ContentEditable
    className="editor-contentEditable
               caret-blue-500 selection:bg-blue-100 selection:text-slate-900"
    ...
  />
  <SelectionHandles containerRef={editorContainerRef} />
</div>
```

---

## Sample Interaction

### Initial State

1. Editor is focused. Cursor blinks in **blue** at the insertion point.
2. No selection handles visible.

### User Action 1 — Click + drag to select text

1. User clicks and drags across "severance packages that lead the industry".
2. Selection background turns **soft blue** (`blue-100`).
3. **Start handle** (blue circle, 16px, with shadow) appears **above** the `s` in "severance".
4. **End handle** (blue circle, 16px, with shadow) appears **below** the `y` in "industry".

### User Action 2 — Click elsewhere (deselect)

1. Selection collapses.
2. Both handles disappear immediately.
3. Caret returns to blinking blue.

### User Action 3 — Keyboard selection (Shift + Arrow)

1. User uses `Shift+Right` to extend selection.
2. Handles reposition on every keyup to track the updated selection boundaries.

---

## Edge Cases

| Case                           | Behaviour                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------- |
| Multi-line selection           | Start handle above line 1 start; end handle below last line end                 |
| Collapsed caret (no selection) | Handles hidden; only blue caret visible                                         |
| Selection inside table cell    | Handles position relative to the `ContentEditable` container                    |
| `prefers-reduced-motion`       | Handles appear instantly, no transition needed (no animation used)              |
| Dark mode                      | Add `dark:selection:bg-blue-900 dark:selection:text-white` on `ContentEditable` |
| Read-only editor               | `caret-color` irrelevant; selection classes still apply for read UX             |

---

## Acceptance Criteria

- [ ] Blinking caret is `#3b82f6` (blue-500) in both editors
- [ ] Selected text background is `#dbeafe` (blue-100), text remains `#0f172a` (slate-900)
- [ ] Start handle (16px blue circle, medium shadow) appears above selection start
- [ ] End handle (16px blue circle, medium shadow) appears below selection end
- [ ] Handles disappear when selection is collapsed or cleared
- [ ] Handles are `pointer-events-none` and `aria-hidden`
- [ ] Works in both `Editor.tsx` and `DocumentEditor.tsx`
- [ ] No new CSS file required — Tailwind only
- [ ] `SelectionHandles` is a standalone component importable by any future editor
