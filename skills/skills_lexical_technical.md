# Lexical Deep Technical Report for React 19, Vite, TypeScript, and Supabase

## Executive summary

Lexical is best understood as a state-first editor engine, not a DOM-first rich-text widget. Its source of truth is an immutable `EditorState` containing a tree of typed `LexicalNode` objects plus the current selection, and the DOM is a reconciled projection of that state rather than the canonical document model ([Lexical introduction](https://lexical.dev/docs/intro), [Editor State](https://lexical.dev/docs/concepts/editor-state)). For wq-health, the practical consequence is clear: persist `editor.getEditorState().toJSON()` or `JSON.stringify(editor.getEditorState())` as canonical `jsonb`, store a separate `content_schema_version`, and use HTML or Markdown only as import/export formats, not as the source of truth ([Editor State](https://lexical.dev/docs/concepts/editor-state), [Serialization](https://lexical.dev/docs/concepts/serialization)).

The Lexical playground is the best implementation reference because it shows a production-grade composition of official packages, custom nodes, React UI plugins, nested editors, markdown transformers, and extension-based registration in one app ([Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground)). The playground already targets React 19 and Vite, so its patterns transfer well to your stack, but its demo-only choices must be corrected for healthcare education: inline base64 image uploads should become Supabase Storage URLs, persisted JSON must be tenant-scoped behind RLS, published lessons should be immutable version rows, and real-time collaboration should use a CRDT provider such as Yjs rather than raw Supabase Realtime broadcasts.

## Lexical mental model

### Editor and EditorState

1. **Editor instance**: The `LexicalEditor` owns the command registry, listener registry, update pipeline, node registry, theme config, and contenteditable root binding. Framework bindings such as `@lexical/react` usually create and provide the editor for you through `LexicalComposer` or the newer extension composer ([Lexical introduction](https://lexical.dev/docs/intro), [Creating a React Plugin](https://lexical.dev/docs/react/create_plugin)).
2. **EditorState**: The editor state contains exactly two conceptual parts: the root-based node tree and the current selection, which may be `null`. During an update it is mutable, and after reconciliation it becomes a locked immutable snapshot ([Editor State](https://lexical.dev/docs/concepts/editor-state)).
3. **Double buffering**: `editor.update(() => { ... })` clones the current state into a pending mutable state, applies changes, runs transforms and commands, reconciles changed nodes to the DOM, and commits a new immutable snapshot ([Editor State](https://lexical.dev/docs/concepts/editor-state)).
4. **Read context**: `editorState.read(() => { ... })` gives read-only access to the frozen snapshot. `$` helper functions such as `$getRoot()` and `$getSelection()` are only legal inside read, update, or command listener contexts ([Editor State](https://lexical.dev/docs/concepts/editor-state)).
5. **Persistence boundary**: `editor.getEditorState().toJSON()` returns a plain JSON representation, while `editor.parseEditorState(serialized)` reconstructs an `EditorState` from a stringified state ([Editor State](https://lexical.dev/docs/concepts/editor-state)).

Performance impact: Lexical avoids full DOM diffing by tracking dirty nodes and reconciling only affected subtrees, which is important when wq-health lessons include images, tables, nested captions, and long wound-care explanations ([Lexical introduction](https://lexical.dev/docs/intro), [Node Transforms](https://lexical.dev/docs/concepts/transforms)). Security implication: never trust HTML generated from or imported into the editor as safe by default. Treat Lexical JSON as structured data, validate allowed node types server-side where possible, and sanitize any HTML export before showing it outside the editor.

### Nodes

Lexical documents are trees of node classes. The five base node categories are `RootNode`, `LineBreakNode`, `ElementNode`, `TextNode`, and `DecoratorNode`; custom content types generally extend `ElementNode`, `TextNode`, or `DecoratorNode` ([Nodes](https://lexical.dev/docs/concepts/nodes)). Every serialized node contains at least `type` and `version`, and richer nodes add fields such as `children`, `format`, `indent`, `direction`, `text`, `listType`, `url`, or custom properties ([Serialization](https://lexical.dev/docs/concepts/serialization)).

1. **ElementNode**: A parent container. Paragraphs, headings, quotes, lists, list items, tables, rows, cells, links, and custom callouts are all modeled as element-like nodes ([Nodes](https://lexical.dev/docs/concepts/nodes)).
2. **TextNode**: A leaf node that stores text plus formatting flags, mode, detail, and inline style ([Nodes](https://lexical.dev/docs/concepts/nodes)).
3. **DecoratorNode**: A node that renders arbitrary UI, commonly React components, through a portal-like decorator mechanism. Images and embedded widgets use this pattern in the playground ([Nodes](https://lexical.dev/docs/concepts/nodes), [Lexical Plugins](https://lexical.dev/docs/react/plugins)).
4. **Node properties**: Node properties must be JSON-serializable. Lexical explicitly warns against functions, symbols, maps, sets, and custom-prototype objects as node properties ([Nodes](https://lexical.dev/docs/concepts/nodes)).
5. **Node lifecycle**: Use `getWritable()` in setters and `getLatest()` in getters so you mutate the current writable clone rather than stale frozen state ([Nodes](https://lexical.dev/docs/concepts/nodes)).

Security implication: this node model is safer than arbitrary HTML because allowed document structures are constrained by registered node classes, but it does not remove the need for URL validation, Storage authorization, image MIME validation, and strict RLS. Performance impact: registering only the nodes you need keeps the editor bundle and reconciliation surface smaller, which matters for lesson pages and game scenario editors.

### Commands, listeners, and transforms

Commands are Lexical’s event bus. A command is created with `createCommand`, dispatched with `editor.dispatchCommand(command, payload)`, and handled with `editor.registerCommand(command, handler, priority)`; returning `true` stops propagation ([Commands](https://lexical.dev/docs/concepts/commands)). Built-in examples include formatting commands, list insertion commands, keyboard commands, table commands, link toggling, and custom embed insertion commands ([Commands](https://lexical.dev/docs/concepts/commands), [Lexical Plugins](https://lexical.dev/docs/react/plugins)).

1. **Commands**: Use commands for explicit user intent, such as insert image, insert table, toggle link, or convert the current block to a quote ([Commands](https://lexical.dev/docs/concepts/commands)).
2. **Listeners**: Use update listeners for save triggers and external UI sync, but avoid scheduling another `editor.update()` inside an update listener because that creates waterfall updates and extra DOM work ([Listeners](https://lexical.dev/docs/concepts/listeners)).
3. **Transforms**: Use node transforms for normalization that should happen inside the same update cycle, such as enforcing list nesting rules or maintaining a callout node’s required child shape ([Node Transforms](https://lexical.dev/docs/concepts/transforms)).
4. **Priorities**: Command priorities decide which listener receives a command first. For most application plugins, the lowest sufficient priority is recommended ([Commands](https://lexical.dev/docs/concepts/commands)).
5. **Cleanup**: React plugins should register commands and listeners in `useEffect` and return the unregister function so StrictMode remounts do not leak handlers ([Creating a React Plugin](https://lexical.dev/docs/react/create_plugin)).

Performance impact: transforms reduce save-time and render-time churn by normalizing content before reconciliation, while update-listener waterfall updates can double DOM reconciliation work. Security implication: commands that insert external content, such as image URLs or links, must validate payloads before node creation.

### Selection

Lexical supports `RangeSelection`, `NodeSelection`, `TableSelection`, and `null` selection ([Selection](https://lexical.dev/docs/concepts/selection)). `RangeSelection` stores anchor and focus points plus active text-format bit flags, `NodeSelection` stores selected node keys, and `TableSelection` stores grid-like table anchor and focus points under a table key ([Selection](https://lexical.dev/docs/concepts/selection)).

For persistence, do not treat the user’s current selection as meaningful educational content unless you are implementing collaborative cursors or editor restoration. For wq-health lesson content, persist the document JSON and optionally separate draft metadata such as last edited block, scroll position, or review status. Security implication: selections contain node keys that are runtime identifiers and should not be used as durable database identifiers. UX recommendation: when toolbar operations mutate blocks, use update tags such as selection-skip tags where appropriate to avoid stealing focus from dialogs and side panels.

## Serialization and storage format

### What Lexical saves

Lexical saves its canonical state as JSON. The official persistence pattern is `JSON.stringify(editor.getEditorState())` or `editor.getEditorState().toJSON()`, and loading uses a string passed to `initialConfig.editorState` or `editor.parseEditorState(editorStateJSONString)` followed by `editor.setEditorState(editorState)` ([Editor State](https://lexical.dev/docs/concepts/editor-state)). Each node class controls its JSON representation with `exportJSON`, deserialization with `importJSON`, and schema evolution with `updateFromJSON` ([Serialization](https://lexical.dev/docs/concepts/serialization)).

Minimal empty rich-text JSON looks like this ([Editor State](https://lexical.dev/docs/concepts/editor-state)):

```json
{
  "root": {
    "children": [
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
}
```

A text node usually includes `detail`, `format`, `mode`, `style`, `text`, `type`, and `version`, while an element node usually includes `children`, `direction`, `format`, `indent`, `type`, and `version` ([Serialization](https://lexical.dev/docs/concepts/serialization)). Node keys are runtime-only and are not part of the serialized document, so database references should point to document rows and version rows, not Lexical node keys ([Nodes](https://lexical.dev/docs/concepts/nodes)).

### JSON, HTML, and Markdown are different surfaces

1. **JSON**: The canonical editor state. Use it for database persistence, draft restore, versioning, and accurate rehydration ([Editor State](https://lexical.dev/docs/concepts/editor-state)).
2. **HTML**: An interoperability format generated with `$generateHtmlFromNodes` and consumed with `$generateNodesFromDOM`; it is useful for paste, export, email, or preview, but it can lose custom-node fidelity if import/export handlers are incomplete ([Serialization](https://lexical.dev/docs/concepts/serialization)).
3. **Markdown**: An import/export and shortcut format powered by `@lexical/markdown` transformers; built-in transformers cover lists, headings, quotes, code blocks, inline text formats, and links, with custom transformers needed for product-specific blocks ([lexical/markdown](https://lexical.dev/docs/packages/lexical-markdown)).
4. **Plain text**: Useful for search indexing, previews, and accessibility summaries, but not sufficient as a document source of truth.
5. **Derived render model**: For read-only pages, either mount a read-only Lexical editor from JSON or generate sanitized HTML from a trusted server-side render pipeline.

Security implication: HTML import is an XSS boundary. Sanitize incoming HTML before conversion, validate URLs, and never render exported HTML with `dangerouslySetInnerHTML` unless sanitized. Performance impact: storing JSONB avoids repeated HTML parsing on load; generating HTML can be cached for public read-only views after publish.

### Recommended Supabase schema

For wq-health, use immutable versions for published content and mutable drafts for active editing. This matches your existing project guideline that rich text should be stored as versioned `jsonb` with an explicit content schema version and that published artifacts should be immutable.

```sql
create table public.lesson_content_versions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id),
  lesson_id uuid not null references public.lessons(id),
  version_number integer not null,
  lifecycle_status text not null check (
    lifecycle_status in ('draft', 'published', 'archived')
  ),
  lexical_state jsonb not null,
  content_schema_version integer not null default 1,
  plain_text_search text generated always as (
    coalesce(lexical_state #>> '{root,children,0,children,0,text}', '')
  ) stored,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (institution_id, lesson_id, version_number)
);

alter table public.lesson_content_versions enable row level security;
alter table public.lesson_content_versions force row level security;

create index idx_lesson_content_versions_institution_lesson
  on public.lesson_content_versions (institution_id, lesson_id);

create index idx_lesson_content_versions_lexical_state_gin
  on public.lesson_content_versions
  using gin (lexical_state jsonb_path_ops);
```

Architectural choice: store the full Lexical state as `jsonb`, but keep relational facts outside JSON. `institution_id`, `lesson_id`, lifecycle status, author, version, and publish timestamps belong in columns because RLS, auditing, search, and indexes need them. Security implication: RLS must check `institution_id` on every read and write, and client-provided tenant IDs must not be trusted. Performance impact: JSONB makes full document load fast, while relational columns keep tenant filtering and version lookup index-friendly.

## Core rendering model

### How Lexical renders JSON to DOM

Lexical does not render JSON directly as React components the way a typical CMS renderer might. It parses JSON into node instances, stores those nodes in an `EditorState`, and then each node’s `createDOM` and `updateDOM` methods control the editor DOM reconciliation ([Nodes](https://lexical.dev/docs/concepts/nodes), [Serialization](https://lexical.dev/docs/concepts/serialization)). For React-rendered custom embeds, `DecoratorNode.decorate()` returns a framework component, while `createDOM()` returns a host element into which the decorator is mounted ([Nodes](https://lexical.dev/docs/concepts/nodes), [Lexical Plugins](https://lexical.dev/docs/react/plugins)).

### Read-only rendering choices

1. **Read-only Lexical editor**: Best fidelity. Load JSON into Lexical, set editable false, register the same nodes and theme, and render the document as the editor would render it.
2. **Generated HTML**: Good for cached public lesson pages, LMS exports, and emails, but custom nodes need complete `exportDOM` coverage and HTML must be sanitized.
3. **Custom JSON renderer**: Possible for a narrow subset such as paragraphs, lists, quotes, and links, but expensive to maintain once images, captions, tables, code, and callouts exist.
4. **Markdown export**: Useful for authoring shortcuts and external documentation, but not sufficient for full-fidelity wound-care content with images, tables, nested captions, and custom callouts.
5. **Hybrid**: Use Lexical read-only rendering in authoring and review views, and cache sanitized HTML for published student-facing content.

Security implication: the read-only Lexical editor reduces custom renderer bugs, but it still renders links and images that need URL validation. UX recommendation: use skeleton loaders while JSON loads, then hydrate the editor in read-only mode to avoid layout jumps on large lessons.

## Block-by-block implementation guide

### Bulleted list

Lexical uses `ListNode` and `ListItemNode` from `@lexical/list` for unordered lists. A bulleted list is a `ListNode` whose `listType` is `bullet`, and the React wrapper is `LexicalListPlugin` or the newer `ListExtension` ([lexical/list](https://lexical.dev/docs/packages/lexical-list), [Lexical Plugins](https://lexical.dev/docs/react/plugins)). The command path is `INSERT_UNORDERED_LIST_COMMAND`, which the playground toolbar dispatches when the user chooses a bullet list.

Example conceptual JSON:

```json
{
  "children": [
    {
      "children": [
        {
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": "Clean wound edge",
              "type": "text",
              "version": 1
            }
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "type": "listitem",
          "version": 1
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "listType": "bullet",
      "start": 1,
      "tag": "ul",
      "type": "list",
      "version": 1
    }
  ],
  "direction": null,
  "format": "",
  "indent": 0,
  "type": "root",
  "version": 1
}
```

Performance impact: list rendering is lightweight because list nodes are normal element nodes, but deep nesting increases DOM depth and keyboard-navigation complexity. Security implication: list content is still text and inline nodes, so link validation still applies inside list items. UX recommendation: add markdown shortcuts for `- ` and `* `, and show toolbar active state based on current block type.

### Numbered list

Numbered lists use the same `ListNode` and `ListItemNode` model, but `listType` is `number`, `tag` is usually `ol`, and `start` preserves the starting number when needed ([lexical/list](https://lexical.dev/docs/packages/lexical-list)). The insertion command is `INSERT_ORDERED_LIST_COMMAND`, while removal uses `REMOVE_LIST_COMMAND` ([lexical/list](https://lexical.dev/docs/packages/lexical-list)).

Architectural choice: decide whether to preserve numbering across split lists. The playground configures `shouldPreserveNumbering: false`, which is a product choice rather than a Lexical requirement. Security implication: no special security risk beyond ordinary child content, but imported HTML lists should still be normalized by Lexical import handlers. Performance impact: enabling strict indent transforms can prevent invalid nesting but adds transform work on list updates.

### To-do list

To-do lists are checklists in Lexical. They still use `ListNode` and `ListItemNode`, but the list type is `check`, and each item carries a checked state. React apps use `LexicalCheckListPlugin` or `CheckListExtension`, and the command is `INSERT_CHECK_LIST_COMMAND` ([lexical/list](https://lexical.dev/docs/packages/lexical-list), [Lexical Plugins](https://lexical.dev/docs/react/plugins)).

Checklist rendering is mostly CSS-driven: the list item receives checked or unchecked theme classes, and the playground draws the checkbox indicator through CSS rather than a stored `<input>` element. This matters for accessibility because a pseudo-element alone is not always sufficient for screen-reader semantics. UX recommendation: for health education tasks, consider adding ARIA semantics or a custom checklist item UI if the checklist is interactive for learners rather than only authoring content.

Security implication: if checklist state affects grading or completion tracking, do not rely on authoring document JSON as learner progress. Store learner task completion in separate normalized tables with RLS and audit logs. Performance impact: checklist click handlers are more complex than basic lists because they handle pointer and keyboard toggling, especially on mobile.

### Callout

Lexical has no built-in callout node in the official packages or playground. The closest playground pattern is `CollapsibleExtension`, which defines coordinated container, title, and content nodes and uses transforms to enforce valid internal structure. This pattern maps well to callouts because a callout also needs a stable container, a visual kind, and structured children ([Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground), [Node Transforms](https://lexical.dev/docs/concepts/transforms)).

Recommended wq-health model:

```typescript
export type CalloutKind = 'info' | 'warning' | 'success' | 'clinical'

export type SerializedCalloutNode = {
  children: Array<unknown>
  direction: 'ltr' | 'rtl' | null
  format: string
  indent: number
  kind?: CalloutKind
  type: 'callout'
  version: 1
}
```

Implementation steps:

1. **Node**: Create `CalloutNode extends ElementNode` with `kind` stored as a JSON-serializable string.
2. **Command**: Register `INSERT_CALLOUT_COMMAND` and insert the node with a default paragraph child.
3. **Transform**: Add a transform that ensures the callout always contains valid block children.
4. **DOM**: Export to `<aside data-callout-kind="clinical">...</aside>` for HTML interoperability.
5. **Theme**: Map kind to classes such as `border-blue`, `border-amber`, or a clinical caution style.

Security implication: callouts in a wound-care platform can carry safety-critical content, so publishing should create immutable versions and audit who changed clinical warnings. Performance impact: a simple `ElementNode` callout is cheaper than a nested `DecoratorNode`; use `DecoratorNode` only if the callout needs complex React UI.

### Quote

Quotes use `QuoteNode` from `@lexical/rich-text`, which extends `ElementNode`, renders as `<blockquote>`, serializes as a normal element node with type `quote`, and is registered by rich-text behavior ([lexical/rich-text](https://lexical.dev/docs/api/modules/lexical_rich-text)). The markdown transformer `QUOTE` maps `>` shortcuts to quote blocks when markdown shortcuts are enabled ([lexical/markdown](https://lexical.dev/docs/packages/lexical-markdown)).

Architectural choice: use `QuoteNode` for citation-like prose, not for clinical warnings or didactic hints. Those should be callouts because they need semantic kind, color, and possibly analytics. Security implication: quote contents may include links, so URL validation and safe link attributes still apply. UX recommendation: quotes should have clear visual contrast but not use warning colors that compete with clinical callouts.

### Table

Tables use `@lexical/table`, with table, row, and cell nodes plus table-specific selection behavior. The package supports creating and editing tables with customizable rows and columns, table headers, cell selection and navigation, and copy-paste support ([lexical/table](https://lexical.dev/docs/packages/lexical-table)). React apps use `TablePlugin` from `@lexical/react/LexicalTablePlugin`, and the playground adds resizers, hover actions, scroll shadows, and cell action menus for a complete editing UX ([Lexical Plugins](https://lexical.dev/docs/react/plugins), [Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground)).

Security implication: pasted tables can contain messy or malicious HTML, and nested tables are explicitly not supported by the Lexical table package by default ([lexical/table](https://lexical.dev/docs/packages/lexical-table)). Normalize or reject nested tables on import. Performance impact: tables are among the heaviest block types because selection, resizing, merged cells, and hover menus all add UI and event complexity. UX recommendation: lazy-load table tooling and show a compact insert dialog with row and column limits for mobile.

### Link

Links use `LinkNode` and `AutoLinkNode` from `@lexical/link`; React apps use `LinkPlugin`, `ClickableLinkPlugin`, and optionally `AutoLinkPlugin` ([lexical/link](https://lexical.dev/docs/packages/lexical-link), [Lexical Plugins](https://lexical.dev/docs/react/plugins)). The clickable link plugin requires `LinkNode` to be registered and can open links in a new tab when configured ([Lexical Plugins](https://lexical.dev/docs/react/plugins)).

Recommended validation:

```typescript
const SAFE_PROTOCOLS = new Set(['https:', 'mailto:'])

export const isSafeUrl = (value: string): boolean => {
  try {
    const url = new URL(value)

    return SAFE_PROTOCOLS.has(url.protocol)
  } catch {
    return false
  }
}
```

Security implication: links are a primary XSS and phishing surface. Reject `javascript:`, `data:`, and untrusted custom protocols, set `rel="noopener noreferrer"` for external links, and consider an allowlist for institutional domains. Performance impact: auto-linking runs pattern matching while editing, so keep matchers efficient and avoid large regex backtracking. UX recommendation: use a floating link editor with optimistic preview and clear invalid URL messages.

### Image

Images in the playground are custom `DecoratorNode<JSX.Element>` nodes rather than a built-in official image package. The node stores source URL, alt text, dimensions, caption visibility, and a nested caption editor, then renders a React image component from `decorate()` ([Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground), [Nodes](https://lexical.dev/docs/concepts/nodes)). The docs describe `DecoratorNode` as the wrapper for arbitrary framework-rendered views inside the editor ([Nodes](https://lexical.dev/docs/concepts/nodes)).

Production image flow for Supabase:

1. **Upload**: Validate MIME type and size in the client, then upload to Supabase Storage under an institution-scoped path.
2. **Persist**: Store only the Storage URL or signed path in the `ImageNode`, not base64 data.
3. **Authorize**: Use Storage policies aligned with the content row’s `institution_id`.
4. **Render**: Use width, height, alt text, and lazy loading to prevent layout shift.
5. **Audit**: Log image insert, replace, and delete events for clinical content.

Security implication: never store unbounded base64 images in JSONB because it bloats rows, bypasses Storage policy controls, and complicates malware scanning. Performance impact: moving image binaries to Storage keeps JSON documents small, improves Postgres cache behavior, and reduces editor load time. UX recommendation: show upload progress, optimistic placeholders, and required alt-text validation.

### Code

Code blocks use `CodeNode` and `CodeHighlightNode` from `@lexical/code-core`. `CodeNode` stores language and optional theme, while `CodeHighlightNode` represents highlighted token text with a highlight type mapped to theme classes ([lexical/code](https://lexical.dev/docs/api/modules/lexical_code)). Markdown code fences can be converted through markdown transformers, and the playground can switch between Prism and Shiki highlighting modes ([lexical/markdown](https://lexical.dev/docs/packages/lexical-markdown), [Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground)).

Architectural choice: for wq-health, enable code blocks only if teachers need technical snippets, device configuration examples, or informatics content. Otherwise, inline code may be enough. Security implication: code content should be rendered as text, never executed. Performance impact: Prism and Shiki can add substantial bundle weight, so choose one highlighter and lazy-load language grammars only on pages where code blocks exist. UX recommendation: include copy buttons and language labels only in read-only or advanced authoring views.

## React 19 and Vite integration

The standard React pattern is to place custom plugins inside `LexicalComposer`, use `useLexicalComposerContext()` to access the editor, register commands or listeners inside `useEffect`, verify required nodes with `editor.hasNodes`, and return cleanup functions ([Creating a React Plugin](https://lexical.dev/docs/react/create_plugin)). The newer playground additionally uses the extension system, but classic React plugins remain valuable for UI surfaces such as toolbars, floating link editors, table action menus, upload dialogs, and side panels ([Lexical playground repository](https://github.com/facebook/lexical/tree/main/packages/lexical-playground)).

Recommended editor config:

```typescript
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'

import { CalloutNode } from './nodes/CalloutNode'
import { ImageNode } from './nodes/ImageNode'
import { editorTheme } from './theme/editorTheme'

export const createLessonEditorConfig = (initialEditorState: string | null): InitialConfigType => ({
  namespace: 'wq-health-lesson-editor',
  editorState: initialEditorState,
  nodes: [
    AutoLinkNode,
    CalloutNode,
    HeadingNode,
    ImageNode,
    LinkNode,
    ListItemNode,
    ListNode,
    QuoteNode,
    TableCellNode,
    TableNode,
    TableRowNode,
  ],
  onError(error: Error): void {
    throw error
  },
  theme: editorTheme,
})
```

Security implication: namespace separation helps clipboard behavior between editors but is not an access-control boundary. Performance impact: registering image, table, and code tooling only when needed reduces initial bundle size. UX recommendation: wrap heavy plugins in lazy imports and show toolbar skeletons while advanced tools load.

## Save, autosave, and versioning

Lexical update listeners receive the latest `editorState`, previous state, and update tags after reconciliation, which makes them suitable for debounced autosave triggers ([Listeners](https://lexical.dev/docs/concepts/listeners)). For immediate save after a programmatic mutation, use a discrete update so the state is committed before reading it for persistence ([Editor State](https://lexical.dev/docs/concepts/editor-state)).

Example autosave plugin:

```typescript
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useMemo } from 'react'

type SaveEditorState = (payload: { lexicalState: unknown; plainText: string }) => Promise<void>

const debounce = <TArgs extends Array<unknown>>(
  callback: (...args: TArgs) => void,
  delayMs: number,
) => {
  let timeoutId: number | undefined

  return (...args: TArgs): void => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => callback(...args), delayMs)
  }
}

export const AutosavePlugin = ({ onSave }: { onSave: SaveEditorState }): null => {
  const [editor] = useLexicalComposerContext()

  const saveDebounced = useMemo(
    () =>
      debounce((lexicalState: unknown, plainText: string) => {
        void onSave({ lexicalState, plainText })
      }, 900),
    [onSave],
  )

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        const lexicalState = editorState.toJSON()

        editorState.read(() => {
          saveDebounced(lexicalState, editor.getRootElement()?.textContent ?? '')
        })
      }),
    [editor, saveDebounced],
  )

  return null
}
```

Security implication: autosave writes must go through RLS and should audit publish actions separately from ordinary draft saves. Performance impact: debounce saves and avoid serializing massive documents on every keystroke if large image captions, tables, or embedded nodes exist. UX recommendation: display `saving`, `saved`, and `offline` states, and use optimistic local state with retry queues for unstable classroom networks.

## GDPR Article 32 and wq-health security implications

1. **Access control**: Store `institution_id` as a real column on content rows, enforce `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`, and validate membership in policies. The Lexical JSON itself must not be the tenant boundary.
2. **Logging**: Audit publish, archive, restore, image replacement, role changes, and support access. Avoid logging full rich-text JSON on every draft autosave because logs can become personal data.
3. **Encryption**: Use TLS for all client-server traffic, Supabase Storage policies for images, and encrypted backups for database and Storage objects.
4. **Resilience**: Follow the DevOps checklist: Docker Compose for self-hosted services, PgBouncer for pooling, automated backups, PITR where possible, monitored restore tests, UFW, and Fail2ban on Hetzner.
5. **Data minimization**: Keep clinical examples, student answers, analytics, and audit events in separate tables. Do not bury learner progress or grading facts inside editor JSON.

Security implication: Lexical helps structure authoring content, but GDPR compliance is achieved through database design, operational controls, auditability, least privilege, and tested recovery. Performance impact: separating canonical JSON from derived text, search vectors, audit rows, and image binaries keeps query paths predictable and prevents JSONB from becoming a relational dumping ground.

## Recommended implementation sequence

1. **Core editor**: Register paragraphs, text, headings, quotes, lists, checklist, links, and history first. Persist JSONB drafts behind RLS.
2. **Media layer**: Add image node with Supabase Storage upload, alt-text validation, and Storage policies.
3. **Advanced blocks**: Add tables, callouts, and code blocks behind lazy-loaded toolbar groups.
4. **Publishing**: Implement draft to immutable published version rows with audit events and cached sanitized HTML if needed.
5. **Collaboration**: If real-time co-authoring is required, integrate Yjs through a real provider and treat Supabase Realtime as transport only if you implement CRDT update relay correctly.

## Decision matrix for the requested blocks

| Block         | Lexical representation                                             | Required package or custom node                            | Persisted JSON fidelity                               | Production recommendation                                                   |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Bulleted list | `ListNode` plus `ListItemNode`, `listType: "bullet"`               | `@lexical/list`, `ListPlugin` or `ListExtension`           | High                                                  | Enable markdown shortcut and strict indent if nested lists matter           |
| Numbered list | `ListNode` plus `ListItemNode`, `listType: "number"`, `start`      | `@lexical/list`                                            | High                                                  | Decide preserve-numbering behavior deliberately                             |
| To-do list    | `ListNode` plus `ListItemNode`, `listType: "check"`, checked state | `@lexical/list`, `CheckListPlugin` or `CheckListExtension` | High                                                  | Use only for authoring tasks unless learner completion is stored separately |
| Callout       | Custom `ElementNode` or fork of collapsible pattern                | Custom node                                                | High if `exportJSON` and `importJSON` are implemented | Build as semantic `aside` with `kind` and immutable publish auditing        |
| Quote         | `QuoteNode`                                                        | `@lexical/rich-text`                                       | High                                                  | Use for quotations, not safety warnings                                     |
| Table         | `TableNode`, `TableRowNode`, `TableCellNode`                       | `@lexical/table` plus React table UI plugins               | High                                                  | Lazy-load heavy table UI and reject nested tables                           |
| Link          | `LinkNode`, `AutoLinkNode`                                         | `@lexical/link`                                            | High                                                  | Enforce URL validation and safe external attributes                         |
| Image         | Custom `DecoratorNode`                                             | Custom node, playground reference                          | High if nested caption is serialized                  | Store binaries in Supabase Storage, not JSONB                               |
| Code          | `CodeNode`, `CodeHighlightNode`                                    | `@lexical/code-core`, optional Prism or Shiki              | High                                                  | Lazy-load one highlighter and render code as inert text                     |

## Key takeaways

Lexical’s main design advantage for wq-health is that rich educational content can be represented as a typed, versionable, JSON-serializable node tree rather than unsafe ad hoc HTML. The implementation work is not primarily about drawing toolbar buttons; it is about registering the right nodes, validating command payloads, implementing complete JSON and DOM import/export for custom nodes, and storing the resulting state under tenant-aware RLS.

The safest storage format is a `jsonb` `lexical_state` column plus relational metadata columns and a `content_schema_version`. HTML is useful for export and cached read-only rendering, but JSON is the only format that preserves custom images, captions, tables, callouts, and code blocks with full fidelity. For your wq-health platform, the high-value architecture is: Lexical JSON for canonical content, Supabase Storage for media, immutable version rows for publishing, RLS for tenant isolation, and audit events for clinically or educationally significant changes.
