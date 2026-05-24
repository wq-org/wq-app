# Task: Enable Per-Item Drag Reordering for Bullet Lists and Numbered Lists in Lexical Editor

## Status

🔴 Missing feature — list items are treated as a single monolithic block

## Context

The editor is located at:

```
src/features/lexical-editor
```

The drag handle plugin is:

```
src/features/lexical-editor/plugins/LexicalDraggableBlockPlugin.tsx
```

It currently wraps `DraggableBlockPlugin_EXPERIMENTAL` from `@lexical/react/LexicalDraggableBlockPlugin`.

Lexical node types involved:

- `ListNode` — the outer `<ul>` or `<ol>` container
- `ListItemNode` — each individual `<li>` bullet point or numbered item

---

## Problem

When a teacher creates a bullet list or numbered list, the entire list (`<ul>` or `<ol>`) is treated as **one single draggable block**.

The drag handle appears once for the whole list. Individual list items (`<li>`) cannot be grabbed independently and moved to a different position in the document.

This means:

- A teacher cannot move a single bullet point above a heading.
- A teacher cannot extract one list item out of a list and place it between two paragraphs.
- A teacher cannot reorder bullet points relative to other non-list blocks.
- The drag UX is misleading — the handle implies block-level control, but list items have no individual handles.

---

## Expected Behavior

Each list item (`ListItemNode`) must be independently draggable:

1. Every `<li>` row shows its own drag handle on hover.
2. A teacher can grab a single bullet point and drag it to any position in the document.
3. A teacher can drag a bullet point out of a list and place it as a standalone paragraph.
4. A teacher can drag a paragraph into a list position (converting it to a list item).
5. When all items are dragged out of a list, the empty `ListNode` is removed automatically.
6. The behavior matches the existing drag UX for paragraphs, headings, and other block-level nodes.

---

## Root Cause

`DraggableBlockPlugin_EXPERIMENTAL` uses Lexical's built-in block detection, which resolves draggable targets to **top-level nodes** only.

`ListNode` is a top-level node. `ListItemNode` is a child of `ListNode`.

When the plugin performs its block hit-test on hover, it walks up the DOM tree and resolves to the nearest top-level block — which is the `ListNode` container, not the individual `ListItemNode`.

As a result:

- The drag handle attaches to the `<ul>` / `<ol>` element.
- `getBoundingClientRect()` measures the full list height.
- Drop positioning is calculated for the entire list, not for individual items.

---

## Technical Approach

### Option A — Preferred: Treat `ListItemNode` as the drag target

Override the block resolution logic so that when the pointer hovers over a `ListItemNode`, the drag handle attaches to that specific `<li>` element, not to the parent `<ul>` / `<ol>`.

The relevant Lexical APIs:

```ts
import { $isListNode, $isListItemNode } from '@lexical/list'
import { ListNode, ListItemNode } from '@lexical/list'
```

Custom resolution logic inside `LexicalDraggableBlockPlugin.tsx`:

```ts
import { $getNearestNodeFromDOMNode } from 'lexical'
import { $isListItemNode, $isListNode } from '@lexical/list'

// When resolving what DOM element the drag handle should attach to:
function resolveBlockElement(targetNode: LexicalNode): LexicalNode {
  // If target is a ListItemNode, use it directly
  if ($isListItemNode(targetNode)) {
    return targetNode
  }
  // If target is inside a ListItemNode, walk up to the ListItemNode
  const parent = targetNode.getParent()
  if (parent && $isListItemNode(parent)) {
    return parent
  }
  // Otherwise fall back to normal top-level resolution
  return targetNode.getTopLevelElementOrThrow()
}
```

The drag handle must then be positioned relative to the `<li>` DOM element, not the `<ul>` / `<ol>`.

### Option B — Fallback: Unwrap list items before drag, rewrap after drop

If overriding `DraggableBlockPlugin_EXPERIMENTAL` resolution is not feasible:

1. On drag start of a `ListItemNode`: remove it from the `ListNode` and convert it to a temporary `ParagraphNode`.
2. Let the existing block drag logic handle it as a paragraph.
3. On drop: if the drop target is inside or adjacent to a `ListNode`, convert the paragraph back to a `ListItemNode` and insert it at the correct position.

This approach is less clean but does not require patching the core drag plugin.

---

## DOM Structure Target

Each list item must render with a structure that allows an independent drag handle:

```tsx
// Conceptual DOM for each <li>
<li
  data-block-row
  className="group relative flex w-full min-w-0 items-start"
>
  <div
    data-block-gutter
    className="flex w-10 shrink-0 items-start justify-center"
  >
    {/* drag handle for this specific list item */}
  </div>
  <div
    data-block-content
    className="min-w-0 flex-1"
  >
    {/* list item text content */}
  </div>
</li>
```

The drag handle must be part of the `<li>` hitbox, not the `<ul>` hitbox.

---

## Drop Behavior for List Items

### Dropping inside the same list

The item is reinserted at the new index within the same `ListNode`. Lexical node order is updated accordingly.

### Dropping outside the list (between paragraphs or headings)

The `ListItemNode` is removed from its parent `ListNode`. If the `ListNode` becomes empty, it is removed too. The dragged item is converted to a `ParagraphNode` (or kept as a standalone `ListItemNode` inside a new single-item `ListNode`) and inserted at the drop position.

### Dropping a paragraph into a list gap

Optional — if the drop lands between two `ListItemNode`s, the paragraph may be converted to a `ListItemNode` and inserted. This is a stretch goal and may be deferred.

---

## Files to Modify

| File                                                      | Change                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `plugins/LexicalDraggableBlockPlugin.tsx`                 | Override block resolution to target `ListItemNode`                         |
| `plugins/blockOptions.tsx`                                | Verify slash-menu block options work on single list items                  |
| Lexical node config (`Editor.tsx` or plugin registration) | Ensure `ListNode` and `ListItemNode` are registered and exported correctly |

---

## Acceptance Criteria

1. Hovering over a bullet point shows a drag handle for **that specific item only**.
2. Hovering over a numbered list item shows a drag handle for **that specific item only**.
3. Dragging a bullet point straight vertically shows the blue drop indicator (consistent with the existing vertical-drag-handle fix).
4. Dropping a bullet point between two paragraphs places it there as a standalone block.
5. Dropping a bullet point between two other list items reorders it within the list.
6. After dragging the last item out of a list, the now-empty `<ul>` / `<ol>` is removed from the document.
7. Nested list items (indented sub-items) are treated as individual drag targets.
8. Text editing, cursor placement, and text selection inside list items still work correctly after drag operations.
9. Undo (`Ctrl+Z`) correctly reverses a drag-and-drop reorder of list items.
10. Students and read-only users cannot persist reordered content — existing RLS and lesson edit permissions apply.

---

## Performance Note

List hit-test resolution must not call `getBoundingClientRect()` on every `pointermove` event.

Cache the per-item bounding boxes at drag-start and use `requestAnimationFrame` for indicator updates — consistent with the approach described in `vertical-drag-handle-drop-indicator-task.md`.

---

## Security Note

No Supabase write occurs during the drag interaction itself. A write only happens when the reordered lesson content is committed (autosave or manual save). RLS policies for lesson editing must remain in effect.

---

## Related Tasks

- `vertical-drag-handle-drop-indicator-task.md` — fixes the vertical-only drag detection for all blocks; this task builds on top of that fix and must be implemented after it.
