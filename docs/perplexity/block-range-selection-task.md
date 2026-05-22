# Task: Implement Notion-style block range selection in WQ Note / Lesson Editor

## Goal

Allow teachers to select multiple note/lesson blocks by click-dragging over them, so they can delete, move, copy, or transform several blocks at once.

## Description

**Context:** This feature lives inside the WQ Note / Lesson Editor. Teachers create lesson material with blocks such as headings, paragraphs, images, PDFs, tasks, and game inserts. The screenshot shows a Notion-like blue rectangular selection overlay across multiple content blocks.

**Scope:** Implement frontend block-range selection for editor blocks. The selection should support mouse and trackpad drag. Selected blocks can be deleted as a group. Moving/copying/group-transforming can be added after the base selection works.

**Out of scope:** Real-time multiplayer cursor sync, database persistence of selection state, and text-level selection inside a paragraph.

## User Action 1

**Trigger:** User clicks on empty editor space or the left margin, holds the mouse button, and drags downward across multiple blocks.

**Outcome:** A translucent blue selection rectangle appears. Every block touched by the rectangle becomes selected with a blue highlight.

## User Action 2

**Trigger:** User releases the mouse after dragging over multiple blocks.

**Outcome:** The selection rectangle disappears, but all intersected blocks remain selected as a multi-block selection.

## User Action 3

**Trigger:** User presses `Backspace` or `Delete`.

**Outcome:** All selected blocks are deleted from the editor in one action.

## User Action 4

**Trigger:** User clicks outside the selected area.

**Outcome:** The current multi-block selection is cleared.

## Initial State

1. The editor displays multiple vertical content blocks.
2. No blocks are selected.
3. The cursor is in normal editing mode.
4. Each block has a measurable DOM bounding box.
5. The teacher has edit permission for the lesson.

## Sample Interaction

1. Teacher opens a lesson page with a heading, paragraph, table, image, and task block.
2. Teacher clicks in the left editor margin above the paragraph.
3. Teacher drags downward across the paragraph, table, and image.
4. A semi-transparent blue rectangle appears during the drag.
5. Paragraph, table, and image receive a selected blue background.
6. Teacher releases the mouse.
7. Teacher presses `Delete`.
8. Paragraph, table, and image are removed.
9. Heading and task block remain unchanged.

## Detailed Requirements

1. The editor must support rectangular drag selection across multiple block elements.
2. The selection overlay must be semi-transparent blue.
3. The selection overlay must render above editor content without blocking pointer tracking.
4. A block is selected when its bounding rectangle intersects the selection rectangle.
5. Selected blocks must show a visible blue highlight.
6. Selection must start only from editor background, block gutter, or margin.
7. Selection must not start while the user is selecting text inside an editable paragraph.
8. Selection must not start while dragging media, resizing images, or interacting with inputs.
9. Releasing the pointer must finalize the selected block list.
10. Pressing `Delete` or `Backspace` must delete all selected blocks.
11. Deleting selected blocks must be undoable with `Cmd+Z` / `Ctrl+Z`.
12. Clicking outside the selection must clear the selected block list.
13. Pressing `Escape` must clear the selected block list.
14. The feature must work with mouse and trackpad pointer events.
15. The feature must not store selected block IDs in Supabase because selection is temporary UI state.
16. The feature must respect teacher edit permissions before allowing deletion.
17. The feature must not allow a student with read-only access to delete blocks.
18. The feature must support keyboard navigation later, but MVP can focus on pointer-based selection.
19. The selection calculation should use cached block bounding boxes during drag for performance.
20. The feature must avoid expensive React state updates on every mouse move; use `requestAnimationFrame` or refs for the live rectangle.

## Technical Implementation Direction

1. Implement this inside `src/features/lexical-editor`, not in the lesson page itself.
2. Add a client-only block selection plugin or hook that listens to pointer events on the editor shell.
3. Register every rendered block row with a stable `blockId`, DOM ref, and cached `DOMRect`.
4. Use the outer block row as the measurable selection target, including the left gutter and content area.
5. Commit selected block IDs only after pointer release; keep the live drag rectangle in refs or lightweight DOM state.

## Suggested DOM Model

```tsx
<div
  data-editor-block-row
  data-block-id={blockId}
  className="group relative flex w-full min-w-0 items-start"
>
  <div
    data-editor-block-gutter
    className="w-10 shrink-0"
  >
    {/* plus button + drag handle */}
  </div>

  <div
    data-editor-block-content
    className="min-w-0 flex-1"
  >
    {/* Lexical / Yoopta / custom block content */}
  </div>
</div>
```

## Rectangle Intersection Rule

A block is selected when the selection rectangle intersects the block row rectangle.

```ts
type Rect = {
  top: number
  right: number
  bottom: number
  left: number
}

const intersects = (a: Rect, b: Rect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
```

## Acceptance Criteria

1. Dragging from the left margin or editor background creates a blue rectangular selection overlay.
2. Dragging across multiple blocks selects every intersected block.
3. Selected blocks remain highlighted after pointer release.
4. Pressing `Delete` or `Backspace` deletes selected blocks in one undoable transaction.
5. Pressing `Escape` clears the selection.
6. Clicking outside the selected area clears the selection.
7. Text selection inside paragraphs still works normally.
8. Drag-and-drop block reordering still works normally.
9. Image resizing, media drag, links, inputs, and popovers are not broken.
10. Selection state is not persisted to Supabase.

## Accessibility Notes

1. Selected blocks should expose `aria-selected="true"` where appropriate.
2. Keyboard users should later be able to select block ranges using `Shift + Arrow`.
3. Delete action must have a confirmation only when deleting complex blocks such as PDF, game insert, or submitted-task-linked blocks.
4. Focus should move to the nearest remaining block after deletion.

## Security Notes

1. Selection state is client-only and does not need RLS.
2. Deletion writes must still pass lesson/note ownership checks.
3. In WQ, notes inherit institution and role access rules, so the delete operation must remain scoped to the current institution and role.
4. If deletion writes to Supabase, the database must enforce tenant isolation with RLS rather than trusting frontend filtering.
5. The frontend must not rely on hidden buttons or disabled UI as the only permission layer.

## Performance Impact

1. Use DOM refs and bounding-box caching to avoid re-rendering every block during drag.
2. Update the visual rectangle with `requestAnimationFrame`.
3. Only commit selected block IDs to React state on pointer release.
4. Expected impact: smoother dragging and fewer React renders on long lesson pages.

## UX Notes

1. The interaction should feel like Notion block selection, not browser text selection.
2. The blue overlay should be subtle enough to keep content readable.
3. Selected blocks should have a visible but not aggressive blue highlight.
4. The cursor should not jump into text-edit mode when starting selection from the gutter.
5. The feature should make bulk lesson cleanup faster for teachers importing PDFs or building long lesson pages.

## Subtask 1

**Title:** Implement editor block registry

**Acceptance Criteria:** Every editor block registers its `blockId`, DOM ref, and bounding rectangle. The registry updates when blocks are added, removed, or reordered.

## Subtask 2

**Title:** Implement drag selection overlay

**Acceptance Criteria:** Dragging from the editor margin renders a translucent blue rectangle that follows the pointer until release.

## Subtask 3

**Title:** Implement block intersection detection

**Acceptance Criteria:** Every block whose bounding rectangle intersects the selection rectangle becomes selected.

## Subtask 4

**Title:** Implement multi-block delete

**Acceptance Criteria:** Pressing `Delete` removes all selected blocks in one undoable editor transaction.

## Subtask 5

**Title:** Add permission guard

**Acceptance Criteria:** Only teachers or authorized editors can delete selected blocks. Read-only students can see content but cannot trigger deletion.

## Subtask 6

**Title:** Preserve existing editor interactions

**Acceptance Criteria:** Text selection, block drag-and-drop, media resize, popovers, and inline editing still work after the selection plugin is added.
