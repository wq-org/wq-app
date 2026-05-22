# Task: Fix Vertical Drag Handle Drop Indicator in WQ Lexical Lesson Editor

## Context

The issue appears in the WQ Lesson page:

```txt
src/features/lesson/pages/Lesson.tsx
```

The page renders the editor through:

```ts
import { Editor } from '@/features/lexical-editor'
```

Therefore, the fix should most likely be implemented inside:

```txt
src/features/lexical-editor
```

Relevant files/components to inspect first:

```txt
src/features/lexical-editor/index.ts
src/features/lexical-editor/Editor.tsx
src/features/lexical-editor/plugins/*
src/features/lexical-editor/components/*
```

Search terms:

```txt
Draggable
DraggableBlockPlugin
BlockDraggable
DragHandle
BlockHandle
DropIndicator
InsertionLine
Floating
Popover
anchorElem
rootElement
contenteditable
getBoundingClientRect
pointer-events
```

## Problem

Block drag-and-drop works, but the vertical drag UX is slightly broken.

When the teacher grabs the left block drag handle and drags straight vertically up or down, the blue insertion/drop indicator does not reliably appear.

The indicator only appears when the cursor is moved slightly to the right into the editable block content area.

This means the drag handle visually suggests vertical block reordering, but the active drop target seems to be attached only to the inner contenteditable/text area instead of the full block row.

## Expected Behavior

When the teacher grabs the left block drag handle and moves vertically:

1. The blue insertion line appears immediately between blocks.
2. The drop target covers the full visual block row.
3. The left gutter and drag handle area are part of the droppable hitbox.
4. The user does not need to drag horizontally into the text/content area.
5. The interaction feels like Notion-style block dragging.

## Likely Cause

The drop detection or insertion-line calculation probably uses the wrong DOM element as reference.

Possible current behavior:

```ts
anchorElem = rootElement.parentElement
```

or:

```ts
contentEditableElement.getBoundingClientRect()
```

This can cause coordinate mismatch because the drag handle/gutter is visually outside the measured contenteditable area.

Likely technical causes:

1. Droppable hitbox is only attached to the inner editor/contenteditable element.
2. The outer block row wrapper does not span the full available width.
3. Tailwind classes like `ml-*`, `pl-*`, `gap-*`, `max-w-*`, `relative`, or `absolute` create a visual gutter outside the drop calculation.
4. `pointer-events` on the drag handle, gutter, or wrapper prevents correct pointer tracking.
5. The drop indicator is positioned relative to the wrong parent element.
6. `getBoundingClientRect()` is called on the content node instead of the outer block row.

## Required Fix

Make the entire outer block row the droppable measurement target, not only the inner contenteditable block.

The draggable block DOM should behave conceptually like this:

```tsx
<div
  data-block-row
  className="group relative flex w-full min-w-0 items-start"
>
  <div
    data-block-gutter
    className="flex w-10 shrink-0 items-start justify-center"
  >
    {/* plus button + drag handle */}
  </div>

  <div
    data-block-content
    className="min-w-0 flex-1"
  >
    {/* Lexical block content */}
  </div>
</div>
```

The drop indicator / insertion-line calculation should use the outer block row:

```ts
const blockRect = blockRowElement.getBoundingClientRect()
```

Avoid using only the inner editable/content element:

```ts
const blockRect = contentEditableElement.getBoundingClientRect()
```

## Implementation Steps

1. Locate the block drag plugin inside `src/features/lexical-editor`.
2. Identify which DOM element is used for drop detection and insertion-line positioning.
3. Ensure each draggable block has an outer row wrapper that includes both the gutter/handle and the content area.
4. Use the outer block row for `getBoundingClientRect()` and drop-target hit detection.
5. Verify Tailwind spacing does not place the handle outside the measured row.

## Tailwind Direction

Outer row:

```tsx
className = 'group relative flex w-full min-w-0 items-start'
```

Gutter / handle area:

```tsx
className = 'flex w-10 shrink-0 items-start justify-center'
```

Content area:

```tsx
className = 'min-w-0 flex-1'
```

Avoid making only the content area droppable. The full row must be the active hitbox.

## Acceptance Criteria

1. Dragging from the left drag handle straight down shows the blue insertion line.
2. Dragging from the left drag handle straight up shows the blue insertion line.
3. No horizontal movement into the content area is required.
4. The insertion line appears above or below the correct target block.
5. The drag handle remains clickable and draggable.
6. Text editing inside the editor still works normally.
7. Text selection inside contenteditable blocks still works normally.
8. The floating block menu does not disappear because of coordinate mismatch.
9. The fix works inside the current `Lesson.tsx` layout with `max-w-[calc(32rem+16rem+2rem)]`.
10. The fix does not require changes to autosave, lesson loading, or Supabase persistence.

## UX Requirement

The drag handle must feel like the actual interaction origin.

If the user starts dragging from the handle, the editor should treat the entire vertical block lane as reorderable.

The user should not need to “aim” into the text area just to make the blue insertion line appear.

## Security Implication

This is primarily client-only UI state.

No Supabase write should happen while the user is only dragging. A database write should only happen when the reordered block order is committed.

When saving the new order, existing lesson edit permissions and Supabase RLS must still apply. Students or read-only users must not be able to persist reordered lesson content.

## Performance Impact

Use cached outer block-row bounding boxes during drag start.

Avoid calling layout-heavy `getBoundingClientRect()` repeatedly on every pointer move if possible. Use `requestAnimationFrame` for pointer-driven indicator updates.

Expected impact: smoother drag behavior on long lesson pages and fewer layout recalculations.

## Minimal Fix Goal

Do not rewrite the editor.

Only fix the drag/drop hitbox and coordinate reference so vertical dragging from the handle works naturally.
