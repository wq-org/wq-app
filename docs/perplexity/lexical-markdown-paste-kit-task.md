# Lexical AI Markdown Paste Formatter — Implementation Task

> Structured specification for implementing an isolated Lexical kit that auto-formats AI-generated markdown when the user pastes into the editor.
>
> **Implementation file:** `lexical-markdown-paste-kit/MarkdownPasteKit.tsx` (single copy-paste file)

---

## Goal

When a user pastes AI-generated markdown (headings, bullet lists, bold, code blocks, links) into a Lexical rich-text editor, the editor must automatically convert that markdown into formatted Lexical nodes instead of inserting raw plain text.

## Description

**Context:** Developers building Lexical-based editors (notes, docs, AI chat sidebars, assignment submissions) often receive markdown from ChatGPT, Claude, or similar tools. Lexical does not parse markdown on paste by default — plain text is inserted as paragraphs with literal `#`, `-`, and `**` characters.

**Scope:**

- **In scope:** Clipboard paste interception, markdown detection heuristic, headless parse via `@lexical/markdown`, insert formatted nodes at cursor, optional drop-in React editor, theme CSS, extension + legacy registration APIs.
- **Out of scope:** Markdown typing shortcuts (`# ` → heading while typing), export to markdown, server-side parsing, persistence, collaboration, `@lexical/mark` highlight nodes, custom AI API integration.
- **Dependencies:** `@lexical/markdown`, `@lexical/rich-text`, `@lexical/list`, `@lexical/code`, `@lexical/link`, `@lexical/clipboard`, `@lexical/headless`, `@lexical/react`, `@lexical/history`, `@lexical/extension`, `@lexical/utils`, `lexical`, `react`.
- **Deliverable:** One self-contained file — `MarkdownPasteKit.tsx` — copyable into any project without a build step.

## User Action 1

**Trigger:** User copies AI output containing markdown (e.g. `# Summary\n\n- Point one\n- Point two`) and presses Cmd+V / Ctrl+V inside a Lexical editor with the kit enabled.

**Outcome:** The pasted content appears as a level-1 heading "Summary" followed by a bullet list with two items. No literal `#` or `-` characters remain visible.

## User Action 2

**Trigger:** User selects existing text in the editor, then pastes markdown over the selection.

**Outcome:** The selected text is replaced by the parsed markdown nodes. Selection moves to after the inserted content.

## User Action 3

**Trigger:** User pastes plain text that is not markdown (e.g. `Hello world` with no syntax).

**Outcome:** Default Lexical paste behavior runs unchanged. The kit returns `false` from its paste handler and does not intercept.

## User Action 4

**Trigger:** User pastes rich HTML from a web page (clipboard contains `text/html` with `<p>` tags).

**Outcome:** Default HTML paste runs. The kit does not intercept when HTML is present and plain text does not look like markdown-only content.

## User Action 5

**Trigger:** Developer calls `pasteMarkdownIntoEditor(editor, '# Title')` from a custom "Insert AI response" button.

**Outcome:** Same formatted result as paste — heading node inserted at the current cursor position.

## Initial State

1. Lexical editor is mounted with `RichTextPlugin` (or `RichTextExtension`) and `markdownPasteNodes` registered in the editor config.
2. `MarkdownPastePlugin` is rendered (or `MarkdownPasteKitExtension` is in the extension dependency list).
3. Editor body is empty or contains existing formatted content; cursor is a collapsed range selection inside the editable area.
4. Clipboard is empty until the user copies content.
5. Kit CSS is injected via `injectMarkdownPasteStyles()` or by using `LexicalMarkdownPasteEditor` (which injects styles on mount).

## Sample Interaction

1. Developer copies this clipboard plain text:

   ```
   # Project Plan

   ## Tasks

   - Set up editor
   - **Enable** markdown paste
   - [ ] Ship to production

   > Remember to test paste from ChatGPT.
   ```

2. User focuses the Lexical editor and presses Cmd+V.
3. Kit paste handler runs at `COMMAND_PRIORITY_HIGH` before default rich-text paste.
4. `shouldPasteAsMarkdown` returns true (block patterns `#`, `-`, `>`, checklist, inline `**`).
5. Handler calls `event.preventDefault()` and runs `editor.update()` with tag `paste`.
6. Headless parser calls `$convertFromMarkdownString` with `MARKDOWN_PASTE_TRANSFORMERS`.
7. Serialized nodes are cloned into the live editor via `$insertGeneratedNodes`.
8. User sees: H1 "Project Plan", H2 "Tasks", bullet list (second item bold), checklist item unchecked, blockquote — not raw markdown syntax.

## Detailed Requirements

1. The kit must ship as a **single file**: `lexical-markdown-paste-kit/MarkdownPasteKit.tsx`.
2. The kit must export `markdownPasteNodes` — an array of Lexical node classes required by the default transformers (`HeadingNode`, `QuoteNode`, `ListNode`, `ListItemNode`, `CodeNode`, `LinkNode`, `AutoLinkNode`).
3. The kit must export `MARKDOWN_PASTE_TRANSFORMERS` covering: headings, checklists, bullet lists, numbered lists, blockquotes, fenced code blocks, inline code, bold, italic, bold-italic, strikethrough, and links.
4. `CHECK_LIST` must appear before `UNORDERED_LIST` in the transformer array so `- [ ]` matches checklist, not bullet.
5. The kit must register a `PASTE_COMMAND` handler at `COMMAND_PRIORITY_HIGH` so it runs before `@lexical/rich-text` default paste.
6. When `config.disabled === true`, the paste handler must return `false` and not intercept any paste.
7. `shouldPasteAsMarkdown` must return `false` for empty or whitespace-only clipboard plain text.
8. `shouldPasteAsMarkdown` must return `false` when plain text does not match markdown block or inline patterns and no custom `shouldTransform` override is provided.
9. `shouldPasteAsMarkdown` must return `false` when clipboard contains rich HTML (`<` and `>`) unless plain text alone is sufficient (plain-only or HTML equals plain).
10. When markdown paste is handled, `event.preventDefault()` must be called before inserting nodes.
11. Markdown must be parsed in a **headless Lexical editor** sandbox to avoid clearing the user's document (`$convertFromMarkdownString` clears its target node).
12. Parsed nodes must be inserted at the current range selection using `$insertGeneratedNodes` from `@lexical/clipboard`.
13. If the selection is not collapsed, selected content must be removed before inserting parsed nodes.
14. If the selection is not a range selection, insertion must no-op and return `false`.
15. Default parse options must set `shouldPreserveNewlines: true` (AI output often uses blank lines as paragraph breaks).
16. Default parse options must set `mergeAdjacentNewlines: false`.
17. The kit must export `MarkdownPastePlugin` — a React component that registers the paste handler on mount and cleans up on unmount.
18. The kit must export `MarkdownPasteKitExtension` for the Lexical extensions API with dependencies: `RichTextExtension`, `ListExtension`, `CheckListExtension`.
19. The kit must export `registerMarkdownPasteKit` for legacy `LexicalComposer` setups; it must throw if `markdownPasteNodes` are not registered on the editor.
20. The kit must export `pasteMarkdownIntoEditor` and `$insertMarkdownAtSelection` for programmatic insert (e.g. "Insert AI response" button).
21. The kit must export `LexicalMarkdownPasteEditor` — an optional drop-in editor with history, paste extension, theme, and placeholder.
22. Theme classes must use the `LMP__` CSS prefix to avoid clashing with host app styles.
23. CSS must be embeddable via `injectMarkdownPasteStyles()` — safe to call multiple times (injects once).
24. The kit must export `mergeMarkdownPasteTheme()` to merge theme classes into an existing Lexical theme object.
25. Pasting `Hello world` (no markdown syntax) must fall through to default Lexical paste unchanged.
26. Pasting `**bold** text` inline must produce bold formatted text, not literal asterisks.
27. Pasting a fenced code block (` ```js\nconsole.log(1)\n``` `) must produce a `CodeNode`, not a plain paragraph.
28. The kit must not depend on `lexical-playground` or any monorepo-internal paths — only public `@lexical/*` packages.

## Error States

1. If `registerMarkdownPasteKit` is called without `markdownPasteNodes` on the editor, throw a descriptive `Error` naming the fix (`...markdownPasteNodes` in nodes array).
2. If headless parser throws during `$convertFromMarkdownString`, propagate the error — do not silently fall back to raw paste after `preventDefault()`.
3. If parse produces zero nodes, `$insertMarkdownAtSelection` returns `false` without modifying the document.

## Edge Cases

1. AI tools sometimes put both `text/plain` (markdown) and `text/html` on the clipboard — kit should still intercept when plain looks like markdown and HTML is absent or equals plain text.
2. Partial markdown (only `**bold**` on one line) must still be detected and transformed.
3. Very short clipboard text (< 3 non-whitespace chars) must not trigger markdown paste unless `minLength` is overridden.
4. Pasting into a non-editable or null selection must no-op.

## Subtask 1

**Title:** Create single-file kit skeleton and public exports

**Acceptance Criteria:**

1. `lexical-markdown-paste-kit/MarkdownPasteKit.tsx` exists as the only implementation file.
2. File exports: `markdownPasteNodes`, `MARKDOWN_PASTE_TRANSFORMERS`, `injectMarkdownPasteStyles`, `mergeMarkdownPasteTheme`.
3. File header documents peer dependencies and quick-start usage.

## Subtask 2

**Title:** Implement markdown detection and headless parse pipeline

**Acceptance Criteria:**

1. `looksLikeMarkdown` and `shouldPasteAsMarkdown` match block patterns (`#`, `-`, `1.`, `>`, ` ``` `, `- [ ]`) and inline patterns (`**`, `*`, `` ` ``, links, `~~`).
2. `parseMarkdownToSerializedNodes` uses a cached headless editor with `markdownPasteNodes`.
3. `$insertMarkdownAtSelection` clones serialized nodes into the live editor via `$insertGeneratedNodes`.
4. `$replaceEditorWithMarkdown` replaces the full document when called inside `editor.update()`.

## Subtask 3

**Title:** Implement paste command handler and registration APIs

**Acceptance Criteria:**

1. `registerMarkdownPasteHandler` registers at `COMMAND_PRIORITY_HIGH` on `PASTE_COMMAND`.
2. Handler calls `preventDefault()` only when markdown paste is accepted.
3. Handler returns `false` when not handling, allowing default paste.
4. `registerMarkdownPasteKit` validates nodes and delegates to handler.
5. `MarkdownPasteKitExtension` registers handler in its `register` hook.

## Subtask 4

**Title:** Implement React integration and drop-in editor

**Acceptance Criteria:**

1. `MarkdownPastePlugin` registers/cleans up handler via `useEffect`.
2. `pasteMarkdownIntoEditor` wraps `$insertMarkdownAtSelection` in `editor.update()`.
3. `LexicalMarkdownPasteEditor` composes `HistoryExtension` + `MarkdownPasteKitExtension` + `ContentEditable`.
4. Drop-in editor calls `injectMarkdownPasteStyles()` on mount.

## Subtask 5

**Title:** Manual verification checklist

**Acceptance Criteria:**

1. Paste `# Hello` → renders as H1, not literal `# Hello`.
2. Paste `- a\n- b` → bullet list with two items.
3. Paste `1. x\n2. y` → numbered list.
4. Paste `- [ ] todo` → checklist item.
5. Paste `**bold**` → bold text.
6. Paste `` `code` `` → inline code format.
7. Paste ` ```js\ncode\n``` ` → code block node.
8. Paste `Hello` → default plain paste (no transformation).
9. Select text + paste markdown → selection replaced by formatted nodes.

## Implementation Reference

Copy and use:

```tsx
import {
  LexicalMarkdownPasteEditor,
  MarkdownPastePlugin,
  injectMarkdownPasteStyles,
  markdownPasteNodes,
  mergeMarkdownPasteTheme,
} from './lexical-markdown-paste-kit/MarkdownPasteKit'

// Option A — drop-in editor
injectMarkdownPasteStyles()
;<LexicalMarkdownPasteEditor placeholder="Paste AI markdown…" />

// Option B — existing LexicalComposer
const config = {
  nodes: [...markdownPasteNodes],
  theme: mergeMarkdownPasteTheme({}),
}
// <MarkdownPastePlugin />
```

**Install peer dependencies:**

```bash
pnpm add lexical @lexical/react @lexical/rich-text @lexical/list @lexical/markdown @lexical/clipboard @lexical/headless @lexical/link @lexical/code @lexical/history @lexical/extension @lexical/utils
```

---

_Spec follows `architecture/task_template.md` — 7 core keywords: Goal, Description, User Actions, Initial State, Sample Interaction, Detailed Requirements, Subtasks._
