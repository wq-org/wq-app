# TASK — Agent Sidebar: Smart Auto-Fill for Game Node Editor

**Domain:** `features/game-studio` × `features/agent`
**Type:** `feat`
**Priority:** High
**Status:** `todo`

---

## Context & Problem

The Agent sidebar (visible in the Game Node editor dialog) currently only lists PDF files.
Teachers cannot access their Lexical lessons from the sidebar at all, and even for PDFs there is
no way to extract text or images and push them into the game node's input fields.

**User pain:**

- Teacher opens an Open Question / Image Pin / other game node editor
- They want to reuse content from a PDF or a lesson they already wrote
- They must manually retype or re-upload everything — no content bridge exists between the
  lesson/PDF library and the game node inputs
- The Agent sidebar is a dead panel: it shows files but does nothing with them

---

## Goal

Make the Agent sidebar a **dual-mode content picker** that:

1. Lists both **PDF files** and **Lexical lessons** (teacher's own notes / course lessons)
   use lucide <FileText /> notes
   use <FileText /> pdfs
2. Lets the teacher select text (PDF) or an image (PDF / lesson) with one interaction
3. Shows a **floating toolbar** whose actions are dynamically built from the open game node's
   editable fields
4. On action click: content is inserted directly into the correct field of the node editor — no
   manual copy-paste

---

## Behaviour Specification

### Sidebar Dual Mode

```
Agent Panel is already implemented so no need to re implagednted
┌─────────────────────────────────────┐
│ 🔍  Search by filename or title…    │
├─────────────────────────────────────┤
│ [PDFs]  [Lessons]                   │  ← two tabs
├─────────────────────────────────────┤
│ 📄  Fortgeschrittene_Prog_SoSe18    │
│ 📄  Wundversorgung_Grundlagen.pdf   │
│                                     │
│ — Lessons tab —                     │
│ 📝  Verbandswechsel Lektion 1       │
│ 📝  Debriding Techniques            │
└─────────────────────────────────────┘
```

- PDF tab: renders an inline PDF viewer (existing `@anaralabs/lector` or equivalent)
- Lessons tab: renders a **read-only Lexical editor** loaded from the lesson's `lexical_state`
  JSONB — no editing, no toolbar, just clean read-only rendering
- Switching tabs does not reset the currently open game node dialog

---

### PDF Mode — Text Selection most of it alread yimplemented only teh insertation on floating toolbar needs be updated

1. Teacher selects text in the inline PDF viewer (mouse drag / shift+click)
2. On `mouseup` → `window.getSelection()` yields the selected string
3. A **FloatingToolbar** appears anchored to the selection rectangle
4. Toolbar actions are generated dynamically from the open node's registered fields
   (see "Field Registry" below)
5. Teacher clicks an action (e.g. _"Insert into Prompt"_)
6. Text is written into the corresponding input / textarea via a shared
   `useAgentInsertion` context command — no page reload, no dialog close

---

### PDF Mode — Image Click full

1. Teacher **single-clicks** a rendered image element inside the PDF viewer
2. A **FloatingToolbar** appears near the click coordinates
3. Toolbar shows only field actions that accept image content (type `'image'`)
4. On action click:
   - The image is extracted from the PDF canvas (crop from `bbox` or canvas `toBlob`)
   - It is uploaded to Supabase Storage under `game-assets/<institution_id>/<uuid>.<ext>`
   - A public URL is returned
   - The URL is injected into the target image field of the game node (e.g. Image Pin's
     `image_url` input)
5. While uploading: target field shows a spinner / disabled state
6. On error: inline error toast, field reverts

---

### Lesson Mode — Text Selection

Identical flow to PDF text selection. The read-only Lexical editor emits `mouseup` → selection
detected → FloatingToolbar appears → same field-insertion actions.

**Key difference from PDF:** Lexical's `$getSelection()` is used inside a
`editor.registerUpdateListener` + a `mouseup` handler to get the selected Lexical text.
No image extraction from Lexical at this stage (lesson images are already stored URLs).

---

### Lesson Mode — Image Click

1. Teacher clicks an image node in the read-only Lexical lesson view
2. The image's existing Supabase Storage URL is available from the `ImageNode`'s serialised JSON
3. **No re-upload needed** — the URL is inserted directly into the target image field
4. FloatingToolbar shows image-accepting fields only

---

### FloatingToolbar: Dynamic Field Registry

Every game node **registers its editable fields** in a shared registry so the toolbar can
discover them without hardcoding per-node logic.

```typescript
// types
export type FieldType = 'text' | 'image' | 'rich-text'

export interface GameNodeField {
  nodeId: string // XYFlow node id (runtime)
  fieldKey: string // e.g. 'prompt', 'answer', 'explanation', 'image_url'
  label: string // shown in toolbar: "Insert into Prompt"
  type: FieldType
  setValue: (value: string) => void // callback provided by the node's own state
}
```

The registry is held in `GameEditorContext` (already scoped to the game editor):

```typescript
// added to GameEditorContext value shape
registerNodeFields: (fields: GameNodeField[]) => void;
unregisterNodeFields: (nodeId: string) => void;
getActiveNodeFields: () => GameNodeField[];  // returns fields for the *currently open* node dialog
```

Each node dialog (`OpenQuestionNode`, `ImagePinNode`, etc.) calls `registerNodeFields` on mount
and `unregisterNodeFields` on unmount, passing its own `setValue` handlers.

---

### FloatingToolbar: Constraints

- **Only appears when a game node dialog is open.** If no dialog is active, no toolbar shown.
- **Constrained to the game dialog's bounding box.** Toolbar position is clamped so it never
  renders outside the dialog area. Use `getBoundingClientRect()` on the dialog root ref.
- **Dismisses** on: click outside toolbar, `Escape` key, dialog close.
- **Overwrite without confirmation.** If the target field already has content, it is replaced
  silently. A small undo option (Ctrl+Z / ⌘Z) can be added as a follow-up.

---

### Behaviour for Each Node Type (auto-detected)

| Node                 | Text fields                                      | Image fields                 |
| -------------------- | ------------------------------------------------ | ---------------------------- |
| `OpenQuestionNode`   | `prompt`, `reference_answer`                     | —                            |
| `ImagePinNode`       | `label`, `explanation`                           | `image_url`                  |
| `MultipleChoiceNode` | `question`, `option_a`…`option_d`, `explanation` | —                            |
| `FillInBlankNode`    | `sentence_template`, `blank_answer`              | —                            |
| _(future nodes)_     | auto-discovered via registry                     | auto-discovered via registry |

The toolbar only shows fields that match the content type (text → text fields, image → image fields).

---

## Scope

### In scope

- `AgentPanel` component: dual-mode tabs (PDFs | Lessons)
- `AgentPDFViewer`: inline PDF with text-selection + image-click detection
- `AgentLessonViewer`: read-only Lexical editor loaded from lesson JSONB
- `FloatingToolbar`: dynamic actions from field registry, position clamped to dialog
- `useAgentInsertion` hook: insertion dispatcher
- Field registry additions to `GameEditorContext`
- Supabase Storage upload helper for PDF images (`game-assets/` bucket path)
- `useAgentLessons` hook: fetches teacher's lessons (existing `lessons` table, no new migration)

### Out of scope

- Notes feature (lessons) enabling in game components — disabled for now, task states it clearly
- AI-assisted auto-fill / semantic matching (future task)
- Multi-page PDF canvas scraping beyond single image click
- Lexical image extraction (upload) — existing Storage URL is used as-is
- New Supabase migrations — **no DB changes needed, 100% frontend**

---

## Frontend Structure (5-Layer, `fe_principles.md`)

```
src/features/game-studio/
├── agent/                                  ← new sub-feature folder
│   ├── api/
│   │   ├── agentLessonsApi.ts              ← fetchTeacherLessons(), fetchLessonById()
│   │   └── agentAssetUploadApi.ts          ← uploadPdfImageToStorage()
│   ├── components/
│   │   ├── AgentPanel.tsx                  ← tab switcher + search
│   │   ├── AgentPDFViewer.tsx              ← lector PDF, mouseup + image click handlers
│   │   ├── AgentLessonViewer.tsx           ← read-only Lexical, mouseup handler
│   │   ├── AgentLessonList.tsx             ← list of lessons in the Lessons tab
│   │   └── FloatingToolbar.tsx             ← dynamic insert actions, clamped position
│   ├── hooks/
│   │   ├── useAgentLessons.ts              ← loads lesson list
│   │   ├── useAgentPDFSelection.ts         ← handles PDF text select + image click logic
│   │   ├── useAgentLexicalSelection.ts     ← handles Lexical read-only selection
│   │   └── useAgentInsertion.ts            ← dispatches value into registered field
│   ├── types/
│   │   └── agent.types.ts                  ← AgentMode, GameNodeField, FieldType, ExtractedBlock
│   └── index.ts                            ← barrel
│
├── nodes/
│   ├── OpenQuestionNode/
│   │   └── OpenQuestionNodeDialog.tsx      ← ADD: registerNodeFields on mount
│   ├── ImagePinNode/
│   │   └── ImagePinNodeDialog.tsx          ← ADD: registerNodeFields on mount
│   └── … (all other nodes)
│
└── context/
    └── GameEditorContext.ts                ← ADD: registerNodeFields, unregisterNodeFields,
                                                         getActiveNodeFields to value shape
```

---

## Type Definitions

### `agent.types.ts`

```typescript
export type AgentMode = 'pdf' | 'lesson'

export type FieldType = 'text' | 'image' | 'rich-text'

export interface GameNodeField {
  nodeId: string
  fieldKey: string
  label: string
  type: FieldType
  setValue: (value: string) => void
}

export interface AgentLesson {
  id: string
  title: string
  lexicalState: unknown // parsed from DB jsonb
  updatedAt: Date
}

// Re-use ExtractedBlock from existing pdf-extraction types
export type { ExtractedBlock } from '@/types/pdf-extraction'

export interface FloatingToolbarState {
  x: number
  y: number
  contentType: 'text' | 'image'
  payload: string // raw text OR blob URL (temp, before upload)
  blobData?: Blob // present only for PDF image clicks
}
```

---

## Key Implementation Notes

### 1. `AgentPDFViewer` — Text Selection

```typescript
// features/game-studio/agent/components/AgentPDFViewer.tsx
useEffect(() => {
  const handleMouseUp = () => {
    const sel = window.getSelection()
    const text = sel?.toString().trim() ?? ''
    if (text.length === 0) {
      setToolbar(null)
      return
    }
    const range = sel!.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setToolbar({ x: rect.right, y: rect.top, contentType: 'text', payload: text })
  }
  document.addEventListener('mouseup', handleMouseUp)
  return () => document.removeEventListener('mouseup', handleMouseUp)
}, [])
```

### 2. `AgentPDFViewer` — Image Click

```typescript
const handleImageClick = useCallback(
  async (
    canvas: HTMLCanvasElement,
    bbox: [number, number, number, number],
    e: React.MouseEvent,
  ) => {
    // Crop the canvas region described by bbox
    const [x, y, w, h] = bbox
    const offscreen = document.createElement('canvas')
    offscreen.width = w
    offscreen.height = h
    offscreen.getContext('2d')!.drawImage(canvas, x, y, w, h, 0, 0, w, h)
    offscreen.toBlob((blob) => {
      if (!blob) return
      const tempUrl = URL.createObjectURL(blob)
      setToolbar({
        x: e.clientX,
        y: e.clientY,
        contentType: 'image',
        payload: tempUrl,
        blobData: blob,
      })
    }, 'image/webp')
  },
  [],
)
```

### 3. `AgentLessonViewer` — Read-Only Lexical

```typescript
// features/game-studio/agent/components/AgentLessonViewer.tsx
// Mount a read-only LexicalComposer from lesson.lexicalState
// Register same nodes as the lesson editor (ImageNode, HeadingNode, etc.)
// editable: false in initialConfig
// On mouseup: same window.getSelection() approach as PDFViewer
// On ImageNode click: dispatch a custom event carrying the image src URL
```

### 4. `FloatingToolbar` — Clamped Position

```typescript
// clamp toolbar so it stays inside the game dialog bounding rect
const dialogRect = dialogRef.current?.getBoundingClientRect()
const clampedX = dialogRect ? Math.min(state.x, dialogRect.right - TOOLBAR_WIDTH) : state.x
const clampedY = dialogRect ? Math.max(state.y, dialogRect.top) : state.y
```

### 5. `GameEditorContext` — Field Registry

```typescript
// Added to existing context — no new context, extend the existing one
const nodeFieldsRef = useRef<Map<string, GameNodeField[]>>(new Map())

const registerNodeFields = useCallback((fields: GameNodeField[]) => {
  if (fields.length === 0) return
  nodeFieldsRef.current.set(fields[0].nodeId, fields)
}, [])

const unregisterNodeFields = useCallback((nodeId: string) => {
  nodeFieldsRef.current.delete(nodeId)
}, [])

// activeNodeId = the currently open dialog's node id (already tracked in context)
const getActiveNodeFields = useCallback((): GameNodeField[] => {
  return nodeFieldsRef.current.get(activeNodeId ?? '') ?? []
}, [activeNodeId])
```

### 6. Node Dialog — Registering Fields (example: `OpenQuestionNode`)

```typescript
// features/game-studio/nodes/OpenQuestionNode/OpenQuestionNodeDialog.tsx
const { registerNodeFields, unregisterNodeFields } = useGameEditorContext()
const [prompt, setPrompt] = useState(data.prompt ?? '')
const [referenceAnswer, setReferenceAnswer] = useState(data.reference_answer ?? '')

useEffect(() => {
  registerNodeFields([
    {
      nodeId: id,
      fieldKey: 'prompt',
      label: 'Insert into Prompt',
      type: 'text',
      setValue: setPrompt,
    },
    {
      nodeId: id,
      fieldKey: 'reference_answer',
      label: 'Insert into Answer',
      type: 'text',
      setValue: setReferenceAnswer,
    },
  ])
  return () => unregisterNodeFields(id)
}, [id]) // eslint-disable-line react-hooks/exhaustive-deps
```

### 7. `useAgentInsertion` — Dispatcher

```typescript
// features/game-studio/agent/hooks/useAgentInsertion.ts
export function useAgentInsertion() {
  const { getActiveNodeFields } = useGameEditorContext()

  const insertText = useCallback(
    (fieldKey: string, text: string) => {
      const fields = getActiveNodeFields()
      const field = fields.find((f) => f.fieldKey === fieldKey)
      field?.setValue(text)
    },
    [getActiveNodeFields],
  )

  const insertImage = useCallback(
    async (fieldKey: string, blob: Blob, institutionId: string) => {
      const fields = getActiveNodeFields()
      const field = fields.find((f) => f.fieldKey === fieldKey && f.type === 'image')
      if (!field) return
      // Upload to Storage, get public URL, call field.setValue(url)
      const url = await uploadPdfImageToStorage(blob, institutionId)
      field.setValue(url)
    },
    [getActiveNodeFields],
  )

  return { insertText, insertImage }
}
```

### 8. `agentLessonsApi.ts`

```typescript
// No new DB table. Fetches from existing lessons table.
export async function fetchTeacherLessons(teacherId: string): Promise<AgentLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, lexical_state, updated_at')
    .eq('created_by', teacherId)
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data ?? []).map(toLessonAgentModel)
}
```

### 9. `agentAssetUploadApi.ts`

```typescript
export async function uploadPdfImageToStorage(blob: Blob, institutionId: string): Promise<string> {
  const ext = blob.type === 'image/webp' ? 'webp' : 'png'
  const path = `game-assets/${institutionId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('institution-media') // use your existing bucket
    .upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('institution-media').getPublicUrl(path)
  return data.publicUrl
}
```

---

## What Is Explicitly Disabled

> **Notes feature in game components is currently disabled.**
> The `features/notes` read-only integration is intentionally excluded from this task.
> Game node inputs are structured fields (not a Lexical editor), so free-form Lexical insertion
> from Notes does not apply here. Notes integration for game components is a separate future task.

---

## Security

- Storage upload uses the authenticated user's session — RLS on `institution-media` bucket
  must allow `INSERT` for `institution_admin` and `teacher` roles scoped to their `institution_id`
  path prefix.
- No Supabase function calls, no new migrations — all read paths are scoped by existing
  `lessons` RLS (`created_by = auth.uid()` or institution membership).
- Blob URLs created via `URL.createObjectURL` must be revoked on toolbar dismiss to prevent
  memory leaks: `URL.revokeObjectURL(toolbar.payload)`.

---

## Failure Paths

| Scenario                                   | Behaviour                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Lesson `lexical_state` is null / malformed | Show "Could not load lesson content" empty state in `AgentLessonViewer`           |
| PDF image crop yields empty blob           | Toolbar does not appear; no error shown to user                                   |
| Storage upload fails                       | Inline error on the target field: "Upload failed — try again"                     |
| No game node dialog open                   | FloatingToolbar never mounts; selection still works visually but no actions shown |
| Field `setValue` not found (registry miss) | No-op; console.warn in dev only                                                   |

---

## Commit Message Template

```
feat(game-studio/agent): add dual-mode content picker with smart auto-fill

Problem
- Agent sidebar showed only static PDF list with no interaction
- Teachers had no way to reuse lesson or PDF content in game node inputs
- Image and text reuse required manual copy-paste or re-upload

Decision
- Dual-mode sidebar: PDF tab (inline viewer) + Lessons tab (read-only Lexical)
- FloatingToolbar with dynamic actions built from open node's registered fields
- Field registry in GameEditorContext decouples toolbar from individual node shapes
- PDF image click → canvas crop → Storage upload → URL injected into image field
- Lesson images use existing Storage URL directly (no re-upload)
- 100% frontend — no DB migrations, no Edge Functions

Changes
- src/features/game-studio/agent/components/AgentPanel.tsx
- src/features/game-studio/agent/components/AgentPDFViewer.tsx
- src/features/game-studio/agent/components/AgentLessonViewer.tsx
- src/features/game-studio/agent/components/AgentLessonList.tsx
- src/features/game-studio/agent/components/FloatingToolbar.tsx
- src/features/game-studio/agent/hooks/useAgentLessons.ts
- src/features/game-studio/agent/hooks/useAgentPDFSelection.ts
- src/features/game-studio/agent/hooks/useAgentLexicalSelection.ts
- src/features/game-studio/agent/hooks/useAgentInsertion.ts
- src/features/game-studio/agent/api/agentLessonsApi.ts
- src/features/game-studio/agent/api/agentAssetUploadApi.ts
- src/features/game-studio/agent/types/agent.types.ts
- src/features/game-studio/context/GameEditorContext.ts (field registry)
- src/features/game-studio/nodes/*/NodeDialog.tsx (registerNodeFields on mount)

Impact
- Teachers can select PDF text and insert it into any open game node field in one click
- Teachers can click a PDF image and auto-upload + insert into image fields
- Teachers can select lesson text and insert it into game node fields
- Toolbar actions are always correct for the currently open node — no hardcoding

BehaviorChange
- BEFORE: Agent panel showed a file list with no interaction
- AFTER: Agent panel is an active content-insertion tool for the game editor

Tradeoffs
- Lexical read-only editor in the sidebar adds bundle weight (shared with lesson editor)
- PDF image extraction is canvas-crop only — complex multi-column PDFs may crop incorrectly
- Notes integration for game components is explicitly disabled (separate task)

Verified
- Open ImagePinNode dialog → click PDF image → toolbar shows image-only fields → upload → URL in field
- Open OpenQuestionNode dialog → select PDF text → toolbar shows Prompt + Answer → click → text inserted
- Open OpenQuestionNode dialog → switch to Lessons tab → select text → same toolbar appears
- Close dialog → FloatingToolbar disappears
- Select text with no dialog open → no toolbar appears
- Upload fails → error shown inline on target field

DB
- none

Security
- Storage upload scoped to institution_id path prefix via RLS
- Blob URLs revoked on toolbar dismiss to prevent memory leaks
- No client-trusted tenant IDs — institutionId read from authenticated session profile
```

---

## Open Questions / Follow-ups

1. **Lesson fetch scope**: Should the Lessons tab show lessons from the teacher's _own_ authored
   lessons only (`created_by = auth.uid()`), or all lessons in their institution? The current spec
   uses `created_by` — confirm.
2. **Storage bucket**: Confirm `institution-media` is the correct bucket for game assets, or
   should a dedicated `game-assets` bucket be created?
3. **PDF image detection**: The current spec uses `bbox` from `ExtractedBlock` metadata for
   canvas cropping. If the PDF viewer does not expose `bbox`, a fallback click-coordinate crop
   region will be needed — confirm which PDF viewer is used (`@anaralabs/lector` or custom).
4. **Overwrite confirmation**: Should replacing an existing image field value show a confirmation
   dialog? Currently spec says silent overwrite — confirm this is acceptable.
