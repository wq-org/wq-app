# Building a Yoopta-Based Editor in React TypeScript

## Yoopta’s architecture and mental model

Yoopta is designed as a **headless**, plugin-based editor: the core package (`@yoopta/editor`) owns content logic (blocks/elements/operations/history) but **renders no UI**, while UI is added via `@yoopta/ui` (toolbars, slash menu, block actions, etc.) and visual “plugin UIs” can be applied via theme packages like `@yoopta/themes-shadcn`. citeturn37view2turn37view0

A few “core truths” from the docs that should drive your implementation decisions:

- **Blocks are isolated**: each block in the editor runs its own Slate editor instance, which is a big reason Yoopta can stay performant and let plugins remain independently extensible. citeturn37view2
- **Plugins and marks are configured at editor creation time**: you create an editor instance with `createYooptaEditor({ plugins, marks, value? })`, then render `<YooptaEditor editor={editor} />`; you **do not** pass plugins/marks to the React component. citeturn8view0turn37view2turn25view0
- **Content is “block-record JSON”**: the value is a `Record<blockId, blockData>`, where each block has `id`, `type`, `meta` (order/depth/align), and `value` containing Slate nodes. You should treat this as your durable storage format (e.g., store it in Postgres `jsonb`). citeturn8view0turn9view0turn7search0
- **`onChange` gives you operations**: Yoopta’s `onChange` callback receives both the new content and an options object that includes a list of operations; this is useful for debounced persistence and “dirty state” logic without doing deep diffs. citeturn8view0turn9view0

Finally, the core API surface is intentionally layered:

- **Editor API** (instance creation, value access, history, parsers/serialization, batching). citeturn9view0
- **Blocks API** (insert/delete/update/move/toggle/split/merge and block-level navigation). citeturn7search0turn9view0
- **Elements API** (insert/update/delete/get elements inside blocks, including inline elements like links). citeturn22view0turn9view0
- **Marks API** (toggle/add/remove/query text formatting marks). citeturn24view0turn23view0

## React TypeScript setup pattern that scales

The Quickstart’s baseline constraints are straightforward (Node 18+, React 18+). citeturn31view5turn8view0

If you want a Notion-like experience with your stack (**React + Tailwind + Radix/shadcn**), the most “future-proof” approach is:

1. Define `PLUGINS` and `MARKS` in stable modules.
2. Create the editor with `useMemo` so it’s not recreated on every render. citeturn8view0
3. Render UI components as children of `<YooptaEditor>` (slash menu, floating toolbar, block actions, etc.). citeturn8view0turn34view1turn33view0
4. If you want drag & drop, wrap the editor with `BlockDndContext` and supply `renderBlock` that wraps each block in `SortableBlock` + `DragHandle`. citeturn13view0turn8view0

A representative “full editor shell” (React + TS) looks like this:

```tsx
import { useCallback, useMemo, useState } from 'react'
import YooptaEditor, { createYooptaEditor, type RenderBlockProps } from '@yoopta/editor'

import { applyTheme } from '@yoopta/themes-shadcn'

// UI
import { BlockDndContext, SortableBlock, DragHandle } from '@yoopta/ui/block-dnd'
import { SlashCommandMenu } from '@yoopta/ui/slash-command-menu'

// Your components
import { MyFloatingToolbar } from './toolbar/MyFloatingToolbar'
import { MyFloatingBlockActions } from './blocks/MyFloatingBlockActions'

// Your configs
import { PLUGINS } from './config/plugins'
import { MARKS } from './config/marks'

export function RichEditor() {
  const plugins = useMemo(() => applyTheme(PLUGINS), [])
  const editor = useMemo(() => createYooptaEditor({ plugins, marks: MARKS }), [plugins])

  const [value, setValue] = useState(editor.children)

  const renderBlock = useCallback(
    ({ children, blockId }: RenderBlockProps) => (
      <SortableBlock
        id={blockId}
        useDragHandle
      >
        <div className="flex items-start gap-2">
          <DragHandle
            blockId={blockId}
            className="opacity-0 group-hover:opacity-100"
          />
          <div className="flex-1">{children}</div>
        </div>
      </SortableBlock>
    ),
    [],
  )

  return (
    <BlockDndContext editor={editor}>
      <YooptaEditor
        editor={editor}
        value={value}
        onChange={(nextValue, options) => {
          setValue(nextValue)
          // options.operations is ideal for “save queue” logic
          console.log(options.operations)
        }}
        placeholder="Type / to open menu..."
        renderBlock={renderBlock}
        className="mx-auto max-w-[900px] px-6 py-10"
      >
        <SlashCommandMenu />
        <MyFloatingToolbar />
        <MyFloatingBlockActions />
      </YooptaEditor>
    </BlockDndContext>
  )
}
```

This structure matches Yoopta’s guidance: create via `createYooptaEditor`, pass only `editor` (and optionally `value`) into the component, and mount UI as children. citeturn8view0turn33view0turn13view0

Yoopta UI components can be imported from a single entry point, but the docs explicitly recommend **subpath imports for bundle size** (and they list all supported subpaths). citeturn34view1turn34view2

## Content blocks inventory and how each maps to Yoopta

Your block list aligns closely with Yoopta’s official plugin set (and the docs categorize them similarly: media, layout, inline, code, etc.). citeturn37view0turn37view2

Below is the “implementation reality” for each requested block: what to install, what must be configured, and which commands/APIs you’ll use in your React components.

### Image block

Yoopta’s Image plugin supports uploads, URL insertion, resizing, fit, size limits, and optional deletion handling. citeturn32view0turn28view2  
Crucially, **you must configure `upload`** or you’ll see an error when trying to use the plugin. citeturn32view0

- **Required config**: `Image.extend({ options: { upload: async (file) => ({ id, src }) } })`. citeturn32view0
- **Element props you’ll see in content**: `src`, `alt`, `srcSet`, `fit`, `sizes`, `bgColor`. citeturn28view2turn35view2
- **Commands**: `ImageCommands.updateImage`, `ImageCommands.deleteImage`. citeturn35view2
- **If using an endpoint**: the upload endpoint should return `{ id, url, width?, height?, size?, format? }`. citeturn35view2turn15view0

If you plan to store images in entity["company","Cloudinary","image hosting saas"] / entity["company","Amazon Web Services","cloud provider"] S3, Yoopta explicitly supports “direct to cloud” custom upload functions. citeturn32view0turn31view10

### Video block

The Video plugin supports both file uploads and provider embedding (including entity["company","YouTube","video platform"], entity["company","Vimeo","video platform"], entity["company","Dailymotion","video platform"], entity["company","Loom","screen recording platform"], entity["company","Wistia","video hosting platform"]), along with resizing and playback settings. citeturn25view0turn31view10turn15view3  
Like Image, **`upload` is required**. citeturn10view0

- **Commands**: `VideoCommands.insertVideo`, `updateVideo`, `deleteVideo`. citeturn35view3turn28view1
- **Upload response format (endpoint)**: includes `id`, `src`, optional dimensions, poster, duration, provider object, etc. citeturn15view1
- **Key options you’ll actually use**:
  - `allowedProviders` to restrict which URLs are accepted,
  - `defaultSettings` (controls/loop/muted/autoPlay), and
  - optional `uploadPoster`. citeturn28view0
- **Provider utilities** (`parseVideoUrl`, `getEmbedUrl`, etc.) help you build “paste URL to embed” UX. citeturn28view1

### Link block

Yoopta’s Link plugin is described as supporting “inline links and link blocks.” citeturn16view0  
The docs page is intentionally lightweight, so you should plan to treat link insertion/editing as an **inline element workflow**, implemented via the **Elements API**.

Elements API highlights for links:

- `insertElement({ type: 'link', text, props, at: 'selection' | ... })` supports inline text insertion/wrapping at selection. citeturn22view0
- `updateElement({ type: 'link', props, text? })` updates link URL/metadata. citeturn22view0
- `deleteElement({ type: 'link', mode: 'unwrap' })` removes the wrapper but keeps the text, which is what UX expects. citeturn22view0

### File block and PDF viewer

The File plugin is a full attachment solution: upload + display file info and download behavior, including automatic file type detection and icons. citeturn25view1turn28view3  
It supports restricting accepted file types (extensions or MIME types), and the docs even show `.pdf` as a common accept case. citeturn10view3turn31view8turn35view4

**What I recommend for “PDF Viewer” in Yoopta** (practical, Notion-like behavior):

- Keep **File** as the canonical storage + metadata block.
- Add a **PDF preview mode**:
  - If `format === 'pdf'`, render an inline `<iframe>`/`<embed>` preview (or a dialog preview) in your custom file element renderer.
  - For non-PDFs, render the normal attachment card.

This is aligned with Yoopta’s extension philosophy: override a plugin’s element rendering with `.extend({ elements: { ... } })`. citeturn14view2turn15view4turn35view4  
File plugin commands (`insertFile`, `updateFile`, `deleteFile`) make it easy to build toolbar/command actions. citeturn35view4turn28view3

### Page break

There is no built-in “PageBreak” plugin in the core list, so you should implement it as a **custom void block** plugin:

- Define a new plugin type (e.g. `PageBreak`) and a `page-break` element with `nodeType: 'void'`.
- Render a visible divider in the editor, and serialize it as something meaningful (e.g. `<div style="break-after: page"></div>`) for print/export.

Yoopta’s plugin docs explicitly show how a plugin can define `elements`, `options`, `commands`, `parsers`, and element `nodeType` (`block` | `void` | `inline`). citeturn14view3turn14view2

### Table block

Yoopta’s Table plugin is feature-rich: cell selection, merging/splitting, header rows/columns, alignment, and shortcuts like `table`, `||`, or `3x3`. citeturn25view8turn26view3turn26view4  
Its `TableCommands` API is what you’ll call from toolbars and context menus:

- `buildTableElements(editor, { rows, columns })`
- `insertRow`, `insertColumn`, `deleteRow`, `deleteColumn`
- `mergeCells`, `splitCell` citeturn35view1turn26view2turn26view5

### Code block

Yoopta’s Code plugin uses Shiki for syntax highlighting and supports theme+language configuration. citeturn15view6turn25view9  
In your setup you’ll typically set:

- `theme` (default noted as `github-dark`)
- `language` (default noted as `javascript`, but you can set `typescript`) citeturn15view6turn25view9

### Steps, tabs, accordion, embed, emoji, divider

These are all first-class Yoopta plugins and match your requested blocks almost 1:1:

- **Steps**: nested structure (heading + content per step) and commands like `buildStepsElements`, `addStep`, `deleteStep`. citeturn27view1turn35view0
- **Tabs**: nested elements with `activeTabId`, `referenceId`, and commands like `TabsCommands.addTabItem` (removal is noted “to be implemented”). citeturn27view0turn35view5turn31view12
- **Accordion**: uses native `<details>/<summary>` in default render; includes `isExpanded` props and an `insertAccordion` command to seed initial items. citeturn25view5turn35view6
- **Embed**: supports embeds across platforms (video, social, sandboxes, music, maps) with URL detection and sizing. It provides `EmbedCommands.insertEmbed` + utility functions like `parseEmbedUrl`, `detectProvider`, `calculateEmbedDimensions`, and a way to list supported providers. citeturn25view2turn27view4turn10view4turn10view5
  - This is where you’ll cover “Link block previews” if you choose to represent them as embeds rather than inline links.
- **Emoji**: triggered insertion via shortcodes (default `:`), with a dropdown search; selecting inserts **Unicode characters directly** (plain text, not special nodes). It supports configurable triggers, debounce, custom datasets, and theme dropdown UI (`EmojiDropdown`). citeturn25view6turn26view10turn31view14
- **Divider**: a horizontal divider line block. citeturn25view7

## Custom floating toolbar based on your mock

Your toolbar mock is a classic “selection toolbar” with grouped actions:

- “Ask AI”
- Text style dropdown (“Aa”)
- Marks: bold/italic/underline/strike (+ code mark)
- Link tool
- Color/highlight tool
- Alignment controls

Yoopta is already built to support exactly this UI pattern via **FloatingToolbar** (self-managed visibility on selection) using **compound components** and the “**frozen prop pattern**” to keep the toolbar stable while popovers/menus are open. citeturn34view0turn34view1turn12view0

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["floating text selection toolbar UI","notion floating toolbar selection bubble","rich text editor floating toolbar react"]}

### Core building blocks for your toolbar

**Formatting marks (B/I/U/S/Code/Highlight)**  
Yoopta’s marks workflow is:

- You register marks when you create the editor (e.g., `Bold`, `Italic`, `Underline`, `Strike`, `CodeMark`, `Highlight`). citeturn24view0turn37view2
- You toggle and query them via `Marks.toggle` / `Marks.isActive`. citeturn23view0turn24view0turn34view0

**“Turn into” / text style dropdown (“Aa”)**  
Use `ActionMenuList` in **small** view for a compact dropdown, anchored to a toolbar button, with `open/onOpenChange` state and placement. citeturn11view2turn11view1turn34view1  
This menu is purpose-built for “Turn into” style actions (“block type selection menu”). citeturn34view1turn11view2

**Link tool**  
Use Elements API to insert/update/delete `link` inline elements. You’ll generally “insert link at selection” and “unwrap to remove.” citeturn22view0turn23view0

**Alignment**  
Alignment appears as `meta.align` at the block level (`left|center|right`) in the core block data type, so treat it as a **block update**. citeturn8view0turn7search0turn27view3  
Implementation-wise, you’ll typically:

- determine the active block(s) via `editor.path` (`current` and sometimes `selected[]`),
- then apply `Blocks.updateBlock` to set `meta.align`. citeturn9view0turn8view0turn7search0

### A concrete toolbar component blueprint

This is the “shape” you should aim for: **one state machine controlling all popovers**, and a small set of pure functions calling Yoopta APIs.

```tsx
import { useMemo, useRef, useState } from 'react'
import { Marks, Blocks, useYooptaEditor } from '@yoopta/editor'

import { FloatingToolbar } from '@yoopta/ui/floating-toolbar'
import { ActionMenuList } from '@yoopta/ui/action-menu-list'

export function MyFloatingToolbar() {
  const editor = useYooptaEditor()

  const [turnIntoOpen, setTurnIntoOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)

  const turnIntoAnchorRef = useRef<HTMLButtonElement>(null)

  const frozen = turnIntoOpen || linkOpen || colorOpen

  const toggle = (type: string) => Marks.toggle(editor, { type })
  const active = (type: string) => Marks.isActive(editor, { type })

  const setAlign = (align: 'left' | 'center' | 'right') => {
    // simplistic: apply to current block only
    const at = editor.path.current
    if (at == null) return
    const block = Blocks.getBlock(editor, { at })
    if (!block) return
    Blocks.updateBlock(editor, block.id, { meta: { ...block.meta, align } })
  }

  return (
    <FloatingToolbar frozen={frozen}>
      <FloatingToolbar.Content className="rounded-xl border bg-popover shadow-md">
        <FloatingToolbar.Group className="flex items-center gap-1">
          {/* Ask AI */}
          <FloatingToolbar.Button
            onClick={() => {
              /* open AI */
            }}
            className="px-2"
          >
            Ask AI
          </FloatingToolbar.Button>
        </FloatingToolbar.Group>

        <FloatingToolbar.Separator />

        {/* Text style dropdown (“Aa”) */}
        <FloatingToolbar.Group>
          <FloatingToolbar.Button
            ref={turnIntoAnchorRef}
            onClick={() => setTurnIntoOpen((v) => !v)}
          >
            Aa ▾
          </FloatingToolbar.Button>

          <ActionMenuList
            open={turnIntoOpen}
            onOpenChange={setTurnIntoOpen}
            anchor={turnIntoAnchorRef.current}
            view="small"
            placement="bottom-start"
          >
            <ActionMenuList.Content />
          </ActionMenuList>
        </FloatingToolbar.Group>

        <FloatingToolbar.Separator />

        {/* Marks */}
        <FloatingToolbar.Group className="flex items-center gap-1">
          {editor.formats.bold && (
            <FloatingToolbar.Button
              active={active('bold')}
              onClick={() => toggle('bold')}
            >
              B
            </FloatingToolbar.Button>
          )}
          {editor.formats.italic && (
            <FloatingToolbar.Button
              active={active('italic')}
              onClick={() => toggle('italic')}
            >
              I
            </FloatingToolbar.Button>
          )}
          {editor.formats.underline && (
            <FloatingToolbar.Button
              active={active('underline')}
              onClick={() => toggle('underline')}
            >
              U
            </FloatingToolbar.Button>
          )}
          {editor.formats.strike && (
            <FloatingToolbar.Button
              active={active('strike')}
              onClick={() => toggle('strike')}
            >
              S
            </FloatingToolbar.Button>
          )}
          {editor.formats.code && (
            <FloatingToolbar.Button
              active={active('code')}
              onClick={() => toggle('code')}
            >
              {'</>'}
            </FloatingToolbar.Button>
          )}
        </FloatingToolbar.Group>

        <FloatingToolbar.Separator />

        {/* Align */}
        <FloatingToolbar.Group className="flex items-center gap-1">
          <FloatingToolbar.Button onClick={() => setAlign('left')}>⟸</FloatingToolbar.Button>
          <FloatingToolbar.Button onClick={() => setAlign('center')}>≡</FloatingToolbar.Button>
          <FloatingToolbar.Button onClick={() => setAlign('right')}>⟹</FloatingToolbar.Button>
        </FloatingToolbar.Group>
      </FloatingToolbar.Content>
    </FloatingToolbar>
  )
}
```

This is consistent with Yoopta UI’s patterns: compound components, a `frozen` prop gate, and checking `editor.formats.*` before rendering a mark button. citeturn34view0turn34view5turn23view0turn9view0

### “List functions / configs / variables” for your toolbar

To build your toolbar cleanly, treat it like a small product:

**Functions (events you implement as pure actions)**

- `toggleMark(type)` → `Marks.toggle(editor, { type })`. citeturn23view0turn24view0
- `setMarkValue(type, value)` → `Marks.add(editor, { type, value })` (used for highlight color / text color workflows). citeturn24view0turn23view0
- `openTurnInto(anchorEl)` → sets `turnIntoOpen` and freezes toolbar. citeturn11view2turn34view0
- `insertOrUpdateLink(url)` → `editor.insertElement` / `editor.updateElement` with `type: 'link'`. citeturn22view0
- `removeLink()` → `editor.deleteElement({ type: 'link', mode: 'unwrap' })`. citeturn22view0
- `setBlockAlign(align)` → `Blocks.updateBlock(... meta.align ...)`. citeturn7search0turn8view0
- `askAI(selectionText)` → your own handler; Yoopta’s design makes it straightforward to add external actions inside the toolbar. citeturn37view2

**State variables (minimal set)**

- `turnIntoOpen`, `linkOpen`, `colorOpen` (booleans)
- `frozen = anyPopoverOpen`
- `turnIntoAnchorRef`, `linkAnchorRef`, etc.

**Config objects**

- `MARKS` array (registered marks for the editor). citeturn24view0turn37view2
- `TURN_INTO_ITEMS` (optional; if you don’t pass items, Yoopta can derive them from plugins). citeturn33view2turn31view3
- `HIGHLIGHT_COLORS` palette (UI-only, mapped to `Marks.add`). citeturn24view0turn23view0

To complement the floating toolbar, you’ll almost certainly want the “block hover” UI: **FloatingBlockActions** with a “plus” (insert block) and drag/options handle. Yoopta provides this as a self-contained component and documents integration with BlockOptions (context menu). citeturn12view0turn34view1

## Supabase persistence and uploads

Your persistence layer splits into:

1. **JSON document storage** (note content), and
2. **binary asset storage** (images/videos/files).

### Storing editor content in Postgres

Yoopta content is already a JSON structure (`YooptaContentValue` record of blocks), which maps cleanly to a `jsonb` column. citeturn8view0turn9view0turn7search0

On the entity["company","Supabase","backend platform"] side, their database guidance is explicit:

- Postgres supports `json` and `jsonb`, and **they recommend `jsonb` for almost all cases**. citeturn30view3
- Use `jsonb` when you have variable/unstructured schemas, but avoid overusing it when relational modeling is better. citeturn30view3

A practical schema for a multi-tenant notes app:

- `documents`
  - `id uuid primary key`
  - `owner_id uuid not null`
  - `title text`
  - `content jsonb not null` ← Yoopta value
  - `created_at timestamptz`
  - `updated_at timestamptz`

### RLS essentials for documents

Supabase emphasizes that RLS should be enabled for tables in exposed schemas (like `public`), and that policies act like an implicit `WHERE` clause on every query. citeturn30view2  
They provide canonical examples using `(select auth.uid()) = user_id`. citeturn30view2

So your documents policies usually become:

- allow `SELECT/UPDATE/DELETE` where `(select auth.uid()) = owner_id`
- allow `INSERT` only if `owner_id = auth.uid()`

This matches Supabase’s recommended mental model: browser access is safe **if** RLS is correct, and policies are always evaluated. citeturn30view2

### Uploading assets to Supabase Storage for Yoopta plugins

Yoopta’s Image/Video/File plugins all support two approaches: endpoint-based or custom upload functions. citeturn32view0turn10view3turn10view3  
For a Vite SPA, the simplest path is a **custom upload function** that:

1. uploads a `File` to Supabase Storage,
2. returns `{ id, src, ... }` in the shape the plugin expects.

Supabase’s JS storage docs define `upload(path, fileBody, fileOptions?)`, including the requirement that the bucket already exists and (depending on upsert) which RLS permissions apply to `storage.objects`. citeturn38view1turn30view2

For stable URLs in editor content, you typically want a **public bucket** and then generate a URL with `getPublicUrl(...)`. Supabase notes that `getPublicUrl` is a convenience function for public buckets, does not verify bucket visibility, and you must make the bucket public for downloads to work. citeturn30view1

If you need a private bucket, you can adopt signed uploads and signed reads; Supabase’s signed upload URLs are valid for 2 hours (per doc) and require `insert` permission on storage objects. citeturn30view4turn30view2  
**Important design implication**: if you store **signed URLs** inside Yoopta content, they will expire; for private buckets you usually store the **storage path** and generate signed URLs at render time.

### Saving strategy that won’t fight the editor

Combine Yoopta’s operation stream with debounced persistence:

- Update local React state on every `onChange`.
- Use `options.operations` to decide when to enqueue a save (e.g., ignore selection/path operations if they exist; save only on content operations). citeturn8view0turn9view0
- Persist `value` as jsonb.
- Optionally, generate derived formats on demand (`editor.getMarkdown`, `getHTML`, `getPlainText`, etc.) if you need previews or search indexing. citeturn9view0

## Styling and theming with Tailwind, shadcn, and OKLCH

### Theme your block elements

Yoopta’s official stance is:

- use plugins headless and render everything yourself, **or**
- apply theme UI to a single plugin via `Plugin.extend({ elements: PluginUI })`, **or**
- apply theme UI to all supported plugins via `applyTheme([...plugins])`. citeturn14view4turn14view5turn37view2

`@yoopta/themes-shadcn` is described as production-ready and provides styled elements for the plugins you care about (paragraph/headings/lists/code/image/video/embed/file/table/tabs/steps/accordion/divider/link/etc.). citeturn14view5turn37view2  
The theme reads standard shadcn CSS variables (`--background`, `--foreground`, `--border`, etc.) and works out of the box if your app already uses shadcn variables; otherwise you can import the theme’s default `variables.css`. citeturn14view6turn14view5  
It also supports dark mode based on `.dark`, `[data-theme="dark"]`, or `[data-yoopta-theme="dark"]`. citeturn14view6

### Theme Yoopta UI components

Yoopta’s toolbar/menus/drag handles are part of `@yoopta/ui`, and the UI docs explain how styling is applied:

- Each component ships its own CSS and inlines shared design token variables at build time. citeturn34view5turn34view4
- You can theme globally by overriding `--yoopta-ui-*` CSS variables (background, foreground, border, accent, radius, etc.). citeturn34view5turn11view2
- They explicitly note values are “HSL without the wrapper” and are consumed as `hsl(var(--yoopta-ui-background))`. citeturn34view5

### OKLCH compatibility note

Your shadcn theme variables may already be in OKLCH (shadcn’s theming docs show OKLCH tokens like `--background: oklch(...)` and `--primary: oklch(...)`). citeturn30view5  
But Yoopta UI’s tokens are HSL-component tokens. citeturn34view5

The practical solution is to maintain **two layers of tokens**:

- shadcn variables in OKLCH for your app + Yoopta _plugin theme_ (`@yoopta/themes-shadcn`)
- Yoopta UI variables in HSL components (either leave defaults, or provide approximations that match your OKLCH palette)

This keeps your block rendering fully aligned with shadcn while letting you precisely tune the floating toolbar/menu visuals through `--yoopta-ui-*` variables. citeturn14view6turn34view5turn30view5
