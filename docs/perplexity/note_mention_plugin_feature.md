# Feature: `@mention` Plugin for Lesson Editor

## Goal

Allow users to type `@` inside the lesson rich-text editor to open a floating typeahead panel that filters institution members by username, display name, or email. Selecting a result inserts a styled `MentionNode` inline.

## Description

The wq-app Lexical editor (`src/features/lexical-editor`) already ships `MentionNode` (node registered, exported from `index.ts`) but has no plugin that triggers or resolves mentions.

The feature wires three existing pieces together and adds one new plugin:

1. **`MentionNode`** — already in `src/features/lexical-editor/nodes/MentionNode.ts`. Stores `mentionName` (the user id or username used as canonical key) and renders the display text with a subtle blue highlight.
2. **`useSearchItems`** — `src/features/command-palette/hooks/useSearchItems.ts` — fetches all profiles from the user's institution. Returns `{ id, title, email, username, avatar_url }[]`.
3. **`useAvatarUrl`** — `src/hooks/useAvatarUrl.ts` — resolves a Supabase storage path or direct URL to a signed URL.
4. **`MentionPlugin`** ← NEW — triggers on `@`, filters `useSearchItems` results, renders a floating popover, and inserts a `MentionNode` on selection.

---

## Detailed Requirements

1. Trigger character is `@` with no minimum query length (show full list immediately on `@`).
2. While the user types after `@`, filter `useSearchItems` results matching any of: `username`, `title` (display name), or `email` — case-insensitive substring match.
3. The floating panel renders using `src/components/ui/popover.tsx` (or a portal-based equivalent) anchored at the cursor position — follow the same pattern as `FloatingTextFormatToolbarPlugin`.
4. Each result row shows:
   - Avatar — resolved via `useAvatarUrl(item.avatar_url)`, fallback to initials using `Avatar`/`AvatarFallback` from the existing Radix Avatar component.
   - Display name (`item.title`) in `--text-sm` weight medium.
   - Email (`item.email`) in `--text-xs text-muted-foreground`.
5. Keyboard navigation: `ArrowUp` / `ArrowDown` moves selection, `Enter` or `Tab` confirms, `Escape` closes without inserting.
6. On selection, remove the trigger text node (the `@query` text) and insert a `$createMentionNode(item.id, '@' + item.title)` — storing the user `id` as `mentionName` and the display label as rendered text.
7. `MentionNode` must be added to `lessonEditorExtension.nodes` in `Editor.tsx` so Lexical can deserialize persisted content.
8. The plugin only mounts when `readOnly === false`.
9. Maximum 8 results shown in the panel; if zero results match, show an "No members found" empty state row.
10. The plugin must not break existing slash-menu behaviour — both `SlashMenuPlugin` and `MentionPlugin` can coexist because they use different trigger characters.

---

## File Map

```
src/features/lexical-editor/
  nodes/
    MentionNode.ts              ← EXISTS — no changes needed to node logic
  plugins/
    MentionPlugin/
      index.tsx                 ← NEW — plugin entry, LexicalTypeaheadMenuPlugin wrapper
      MentionMenuItem.tsx       ← NEW — single result row (Avatar + name + email)
      useMentionSearch.ts       ← NEW — thin adapter: wraps useSearchItems + filters by query
  components/
    Editor.tsx                  ← EDIT — add MentionNode to nodes[], add <MentionPlugin />
```

---

## User Action 1 — Trigger the mention panel

**Precondition:** User is editing a lesson in a non-readOnly editor, cursor is in any paragraph or heading block.

**Steps:**

1. User types `@` at any cursor position.
2. Editor fires the typeahead trigger match for `@`.
3. `MentionPlugin` calls `useSearchItems` (already loaded) and renders the floating panel showing all institution members (max 8).
4. The panel is positioned just below the current cursor using the anchor element coordinate system.

**Expected outcome:** Floating panel appears within ~16ms of typing `@`, showing up to 8 member rows, first row pre-selected.

---

## User Action 2 — Filter while typing

**Precondition:** Mention panel is open.

**Steps:**

1. User continues typing, e.g. `@mar`.
2. `useMentionSearch` filters `useSearchItems` results: any item whose `username`, `title`, or `email` includes `"mar"` (case-insensitive).
3. Panel re-renders filtered list, max 8 items.
4. If no match: panel shows single disabled row "No members found".

**Expected outcome:** List narrows in real time on every keystroke with no noticeable lag.

---

## User Action 3 — Select a member

**Precondition:** Panel is open with ≥1 result.

**Steps:**

1. User presses `Enter` (or clicks a row).
2. Plugin removes the `@query` text node.
3. Plugin inserts `$createMentionNode(item.id, '@' + item.title)` at the same position.
4. Panel closes.
5. Editor cursor moves to after the inserted mention node.

**Expected outcome:** Mention appears inline as `@Marcus Sefa` with the blue highlight from `MentionNode.createDOM`. The mention is atomic (cannot be partially deleted) and non-editable as text.

---

## Sample Interaction

### Initial state

- Editor contains: `"Great work on the lesson"`, cursor at end.
- `useSearchItems` has loaded: Marcus Sefa (marcus@wq.de), Anna Koch (anna@wq.de), Lena Braun (lena@wq.de).

### Step-by-step

1. User types ` @` → panel opens with all 3 members listed, first row highlighted.
2. User types `ma` → panel filters to 1 result: **Marcus Sefa** / marcus@wq.de.
3. User presses `Enter`.
4. Editor state: `"Great work on the lesson @Marcus Sefa"` — `@Marcus Sefa` is a single `MentionNode` with `mentionName = "<uuid-of-marcus>"`.
5. Serialized JSON includes `type: "mention"`, `mentionName: "<uuid>"`, `text: "@Marcus Sefa"`.

---

## Subtask 1 — `useMentionSearch.ts`

Create `src/features/lexical-editor/plugins/MentionPlugin/useMentionSearch.ts`.

```ts
// Wraps useSearchItems and returns filtered results for a given query string.
// Returns SearchItem[] filtered by username | title | email (case-insensitive substring).
// Returns at most MAX_MENTION_RESULTS = 8 items.
// When query is empty string, returns first 8 items unfiltered.
```

**Signature:**

```ts
export function useMentionSearch(query: string): {
  results: SearchItem[]
  loading: boolean
}
```

**Notes:**

- Call `useSearchItems()` at the top level (not inside a callback — hooks rules apply).
- Filtering is pure JS on the already-fetched list, no network call per keystroke.

---

## Subtask 2 — `MentionMenuItem.tsx`

Create `src/features/lexical-editor/plugins/MentionPlugin/MentionMenuItem.tsx`.

Props:

```ts
interface MentionMenuItemProps {
  item: SearchItem
  isSelected: boolean
  onClick: () => void
}
```

Render:

- Outer `<div role="option" aria-selected={isSelected}>` with `cursor-pointer`, `flex items-center gap-2`, `px-3 py-2`, `rounded-md`, highlighted background when `isSelected` using `bg-muted`.
- `<Avatar className="size-7">` with `<AvatarImage src={avatarUrl ?? undefined} />` and `<AvatarFallback>` showing first two letters of `item.title`.
- `avatarUrl` resolved with `useAvatarUrl(item.avatar_url)`.
- Right column: `<p className="text-sm font-medium">{item.title}</p>` and `<p className="text-xs text-muted-foreground">{item.email}</p>`.

---

## Subtask 3 — `MentionPlugin/index.tsx`

Use `LexicalTypeaheadMenuPlugin` + `useBasicTypeaheadTriggerMatch` with trigger `'@'`, `minLength: 0`, `allowWhitespace: false`.

Pattern mirrors `SlashMenuPlugin.tsx` exactly — same import shape, same `onSelectOption` + `queryString` state pattern.

Key differences from slash menu:

- Trigger is `'@'` not `'/'`.
- `onSelectOption` inserts `$createMentionNode(item.id, '@' + item.title)` instead of calling `selectedOption.onSelect()`.
- Menu renders via `ReactDOM.createPortal` into `document.body` (same as slash menu).
- Menu container: `<div className="z-[70] w-72 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-md">` using design tokens.

---

## Subtask 4 — Register `MentionNode` + mount plugin in `Editor.tsx`

### 4a — Add `MentionNode` to `lessonEditorExtension.nodes`

In `src/features/lexical-editor/components/Editor.tsx`, line ~104:

```ts
nodes: [
  ImageNode,
  EmojiNode,
  YouTubeNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  MarkNode,
  CommentMarkNode,
  MentionNode,   // ← ADD
],
```

Import from `'../nodes/MentionNode'`.

### 4b — Mount plugin inside the `<div ref={setAnchorElem}>` block

```tsx
{
  !readOnly && !isLoading ? <MentionPlugin /> : null
}
```

Place after `<SlashMenuPlugin />` and before the `{anchorElem ? (...)` floating plugins block.

---

## Question 1 — Stored identifier

Should `mentionName` store the user's **UUID** (`item.id`) or their **username** (`item.username`)?

**Recommendation:** Store UUID. Usernames can change; UUID is stable. The display label (`@Marcus Sefa`) stored in `__text` is what users see. Resolving UUID → profile for notification delivery or rendering mention chips elsewhere always works with UUID.

---

## Question 2 — Read-only rendering

When `readOnly === true`, `MentionNode.createDOM` still applies the blue background. Is that the desired visual for published lesson views, or should read-only mentions render as plain text with a different style (e.g., a subtle badge)?

**Recommendation:** Keep the highlight in read-only view — it signals to readers that a mention exists. If a badge style is preferred, add a `data-readonly` attribute in a future pass.

---

## Validation Checklist

- [ ] `MentionNode` appears in `lessonEditorExtension.nodes` — confirm by loading a serialized lesson with a mention and checking no "Unknown node" console errors.
- [ ] Typing `@` opens the panel with results from the current user's institution only (not global profiles).
- [ ] Typing `@xyz` (no match) shows "No members found" and does not crash.
- [ ] `Enter` inserts `MentionNode`, panel closes, cursor is after the mention.
- [ ] `Escape` closes panel, leaves `@query` text editable as plain text.
- [ ] `Backspace` after a mention deletes the entire node in one keypress (Lexical `segmented` mode handles this).
- [ ] Serialized `EditorState` contains `type: "mention"` nodes with correct `mentionName` UUID.
- [ ] Re-hydrating a saved lesson renders mentions correctly (no broken nodes).
- [ ] `SlashMenuPlugin` still works — both plugins active simultaneously.
- [ ] No TypeScript errors (`npm run type-check`).
