# Task: MarkdownShortcutsExtension — Block-Level Auto-Transform

**Feature area:** `src/features/lexical-editor/plugins/`
**File to create:** `MarkdownShortcutsExtension.ts`
**Scope:** New Lexical extension — no DB, no API, no Supabase
**Effort estimate:** ~3 h
**Priority:** Medium — authoring DX
**Rules:** `principle_clean_code.md`, `principle_frontend.md`

---

## Context

The wq-app Lexical editor uses `defineExtension` from `@lexical/extension` as its
standard plugin pattern. See:

- `FloatingTextFormatToolbarPlugin.tsx` — `defineExtension` + `mergeRegister` +
  `editor.registerCommand(...)` with `COMMAND_PRIORITY_LOW`
- `AutoLinkExtension.ts` — `configExtension` wrapping a library extension

The new extension follows the **same `defineExtension` + `mergeRegister` pattern** as
`FloatingTextFormatToolbarPlugin.tsx`.

---

## Goal

When an author types a Markdown-style shortcut at the **start of an empty paragraph**
followed by Space, the paragraph is automatically converted to the corresponding block
node. No toolbar click or slash menu required.

---

## Behaviour Spec

| User types     | Trigger condition                  | Result                          |
| -------------- | ---------------------------------- | ------------------------------- |
| `# ` + Space   | Cursor at start of a ParagraphNode | `HeadingNode` `tag="h1"`        |
| `## ` + Space  | same                               | `HeadingNode` `tag="h2"`        |
| `### ` + Space | same                               | `HeadingNode` `tag="h3"`        |
| `- ` + Space   | same                               | Unordered `ListItemNode` (`ul`) |
| `1.` + Space   | same                               | Ordered `ListItemNode` (`ol`)   |

**After conversion:**

- Trigger text is **removed** from the node.
- Cursor is placed at the start of the converted node, ready to type.
- `⌘Z` / `Ctrl+Z` reverts to the original paragraph via Lexical's built-in history.

**Must NOT fire when:**

- Cursor is mid-line (not at position 0 of a ParagraphNode).
- Parent is already a `HeadingNode`, `ListItemNode`, code block, or table cell.
- `editor.isReadOnly()` is `true`.
- `editor.isComposing()` is `true` (IME guard — same as `FloatingFormatExtension`).

---

## Implementation

### Step 1 — Create the extension

**File:** `src/features/lexical-editor/plugins/MarkdownShortcutsExtension.ts`

```ts
import { $createHeadingNode } from '@lexical/rich-text'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { defineExtension } from '@lexical/extension'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  KEY_SPACE_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  type LexicalEditor,
} from 'lexical'

// ── Types ────────────────────────────────────────────────────────────────────

type TriggerKind = 'h1' | 'h2' | 'h3' | 'ul' | 'ol'
type TriggerResult = { kind: TriggerKind } | null

// ── Pure helper — exported for unit tests ────────────────────────────────────

export function detectTrigger(text: string): TriggerResult {
  if (text === '#') return { kind: 'h1' }
  if (text === '##') return { kind: 'h2' }
  if (text === '###') return { kind: 'h3' }
  if (text === '-') return { kind: 'ul' }
  if (/^\d+\.$/.test(text)) return { kind: 'ol' }

  return null
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const MarkdownShortcutsExtension = defineExtension({
  name: '@wq/lexical/markdown-shortcuts',
  dependencies: [],
  build() {
    return {}
  },

  register(editor: LexicalEditor) {
    return mergeRegister(
      editor.registerCommand(
        KEY_SPACE_COMMAND,
        () => {
          if (editor.isComposing() || editor.isReadOnly()) return false

          let handled = false

          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) return

            const anchorNode = selection.anchor.getNode()
            const paragraph = $isParagraphNode(anchorNode) ? anchorNode : anchorNode.getParent()

            if (!$isParagraphNode(paragraph)) return

            const text = paragraph.getTextContent()
            const trigger = detectTrigger(text)
            if (!trigger) return

            handled = true
            paragraph.clear()

            if (trigger.kind === 'h1' || trigger.kind === 'h2' || trigger.kind === 'h3') {
              const heading = $createHeadingNode(trigger.kind)
              paragraph.replace(heading)
              heading.select()
              return
            }

            if (trigger.kind === 'ul') {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
              return
            }

            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          })

          return handled
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  },
})
```

> **`COMMAND_PRIORITY_EDITOR`** is the highest priority in Lexical — ensures the space
> intercept fires before lower-priority listeners (e.g. `COMMAND_PRIORITY_LOW` used by
> `FloatingFormatExtension`).

---

### Step 2 — Register in the editor shell

Find where `FloatingFormatExtension` and `NodeEditorAutoLinkExtension` are added to
the `extensions` array (likely `components/Editor.tsx` or
`hooks/useLexicalNodeEditor.ts`) and add:

```ts
import { MarkdownShortcutsExtension } from '../plugins/MarkdownShortcutsExtension'

// inside the extensions array:
MarkdownShortcutsExtension,
```

No `configExtension` wrapper needed — `build()` returns an empty object, no config.

---

### Step 3 — Verify prerequisites

```bash
# Confirm packages are already installed:
grep -E '"@lexical/(rich-text|list)"' package.json
```

If missing: `pnpm add @lexical/rich-text @lexical/list`

Also confirm `HeadingNode`, `ListNode`, and `ListItemNode` are in the editor's `nodes`
array in `Editor.tsx` — they must be registered for Lexical to serialise them.

---

## Unit Tests

**File:** `src/features/lexical-editor/plugins/__tests__/MarkdownShortcutsExtension.test.ts`

```ts
import { detectTrigger } from '../MarkdownShortcutsExtension'

describe('detectTrigger', () => {
  it('returns h1 for #', () => expect(detectTrigger('#')).toEqual({ kind: 'h1' }))
  it('returns h2 for ##', () => expect(detectTrigger('##')).toEqual({ kind: 'h2' }))
  it('returns h3 for ###', () => expect(detectTrigger('###')).toEqual({ kind: 'h3' }))
  it('returns ul for -', () => expect(detectTrigger('-')).toEqual({ kind: 'ul' }))
  it('returns ol for 1.', () => expect(detectTrigger('1.')).toEqual({ kind: 'ol' }))
  it('returns ol for 2.', () => expect(detectTrigger('2.')).toEqual({ kind: 'ol' }))
  it('returns null for ####', () => expect(detectTrigger('####')).toBeNull())
  it('returns null for empty', () => expect(detectTrigger('')).toBeNull())
  it('returns null for mid-text', () => expect(detectTrigger('hello #')).toBeNull())
})
```

`detectTrigger` is a pure function — no Lexical mocking required. Run with:

```bash
pnpm test MarkdownShortcutsExtension
```

---

## Edge Cases

| Scenario                                    | Expected behaviour                                         |
| ------------------------------------------- | ---------------------------------------------------------- |
| `#### ` (4 hashes)                          | No transform — unsupported heading level                   |
| `# text` already typed, then Space mid-word | No transform — text content no longer matches trigger      |
| Paragraph inside a table cell               | No transform — `$isParagraphNode(paragraph)` may be false  |
| Paragraph inside an existing list item      | No transform — same guard                                  |
| Read-only editor (preview/learner mode)     | No transform — `editor.isReadOnly()` guard                 |
| IME composition (Korean, Japanese)          | No transform — `editor.isComposing()` guard                |
| `⌘Z` immediately after conversion           | Lexical history restores original paragraph + trigger text |

---

## Files Changed

```
src/features/lexical-editor/plugins/
  MarkdownShortcutsExtension.ts              ← new
  __tests__/
    MarkdownShortcutsExtension.test.ts       ← new

components/Editor.tsx (or useLexicalNodeEditor.ts)
                                             ← add extension to array
```

No changes to: `types/`, `commands/`, `api/`, `index.ts`, Supabase schema, RLS.

---

## Definition of Done

- [ ] `# ` → `h1` at start of paragraph
- [ ] `## ` → `h2` at start of paragraph
- [ ] `### ` → `h3` at start of paragraph
- [ ] `- ` → unordered list item
- [ ] `1. ` → ordered list item
- [ ] Trigger text removed after conversion
- [ ] No transform fires mid-line or in unsupported node contexts
- [ ] No transform in read-only mode
- [ ] No transform during IME composition
- [ ] `detectTrigger` unit tests pass (`pnpm test MarkdownShortcutsExtension`)
- [ ] `pnpm tsc --noEmit` — zero errors
- [ ] `pnpm lint` — zero errors
