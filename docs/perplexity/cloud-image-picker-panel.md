# Task — CloudImagePickerPanel

> **Pattern:** Mirror `EmojiPickerPanel.tsx` exactly — same panel shell, same
> `Input` search, same keyboard contract. Replace the emoji grid with two tabs
> (`SelectTabs`) that split **Upload** and **Cloud** image flows.
>
> **Rules:** `fe_principles.md` · `clean_code_principles.md`

---

## Goal

Add a `CloudImagePickerPanel` component to the Lexical editor that lets a teacher
either **upload a new image** or **pick an existing image from their cloud library**
and insert it into the lesson as an `ImageNode`.

---

## Description

The panel follows the established `EmojiPickerPanel` shell pattern:

- Same `w-[280px]` popover container, `rounded-2xl border shadow-xl backdrop-blur-xl`
- Same `Input` search bar at the top (cloud tab only — no search on upload tab)
- Triggered from the same floating toolbar or slash-menu entry point
- Calls `$createImageNode` + `DISPATCH` / editor command on selection/upload

Two tabs via `SelectTabs`:

| Tab | Icon         | Label  | Behaviour                                    |
| --- | ------------ | ------ | -------------------------------------------- |
| 0   | `<Upload />` | Upload | File input → `useLessonImageUpload` → insert |
| 1   | `<Cloud />`  | Cloud  | Search + `ImageCarousel` → pick → insert     |

---

## Affected Files

| File                                                               | Action                                  |
| ------------------------------------------------------------------ | --------------------------------------- |
| `src/features/lexical-editor/components/CloudImagePickerPanel.tsx` | **New** — panel component               |
| `src/features/lexical-editor/hooks/useCloudImagePicker.ts`         | **New** — cloud tab data + filter logic |
| `src/features/lexical-editor/components/Editor.tsx`                | Mount panel, wire insert command        |

---

## Step 1 — New Hook `useCloudImagePicker.ts`

```ts
// src/features/lexical-editor/hooks/useCloudImagePicker.ts

import { useMemo, useState } from 'react'

import { useTeacherCloudFiles } from '@/features/files/hooks/useTeacherCloudFiles'
import type { ImageCarouselImage } from '@/components/shared/media/ImageCarousel'

export type UseCloudImagePickerReturn = {
  query: string
  setQuery: (q: string) => void
  images: ImageCarouselImage[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useCloudImagePicker(): UseCloudImagePickerReturn {
  const [query, setQuery] = useState('')
  const { cloudFiles, loading, error, refetch } = useTeacherCloudFiles()

  const images = useMemo<ImageCarouselImage[]>(() => {
    const imageFiles = cloudFiles.filter((f) => f.mime_type?.startsWith('image/'))
    const q = query.trim().toLowerCase()
    const filtered = q
      ? imageFiles.filter((f) => f.display_name.toLowerCase().includes(q))
      : imageFiles

    return filtered.map((f) => ({
      url: f.public_url,
      title: f.display_name,
      storagePath: f.storage_object_name,
    }))
  }, [cloudFiles, query])

  return { query, setQuery, images, isLoading: loading, error, refetch }
}
```

**Rules applied:**

- Single-responsibility: hook owns only data + filter, zero JSX [file:3]
- `useMemo` for derived `images` — no unnecessary re-renders [file:4]
- Delegates fetch entirely to the existing `useTeacherCloudFiles` [file:6]

---

## Step 2 — New Component `CloudImagePickerPanel.tsx`

```tsx
// src/features/lexical-editor/components/CloudImagePickerPanel.tsx

import type { ChangeEvent } from 'react'
import { useRef } from 'react'
import { Cloud, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ImageCarousel } from '@/components/shared/media/ImageCarousel'
import type { ImageCarouselImage } from '@/components/shared/media/ImageCarousel'
import { Input } from '@/components/ui/input'
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import { cn } from '@/lib/utils'

import { useLessonImageUpload } from '../hooks/useLessonImageUpload'
import { useCloudImagePicker } from '../hooks/useCloudImagePicker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CloudImagePickerPanelProps = {
  /** Called with the resolved ImagePayload fields when user picks or uploads. */
  onSelect: (payload: { src: string; altText: string; filepath?: string }) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Tab definitions (stable reference, outside component)
// ---------------------------------------------------------------------------

const TABS = [
  { label: 'Upload', icon: <Upload size={14} /> },
  { label: 'Cloud', icon: <Cloud size={14} /> },
] as const

// ---------------------------------------------------------------------------
// Upload tab
// ---------------------------------------------------------------------------

type UploadTabProps = {
  onUploaded: (src: string, filepath: string) => void
}

function UploadTab({ onUploaded }: UploadTabProps) {
  const { t } = useTranslation('features.lesson')
  const { isUploading, uploadLessonImageFile } = useLessonImageUpload()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadLessonImageFile(file)
    if (result) {
      onUploaded(result.publicUrl, result.path)
    }
    // reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <label
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2',
          'border-dashed border-border px-4 py-6 text-sm text-muted-foreground',
          'transition-colors hover:border-primary hover:text-primary',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <Upload size={20} />
        <span>
          {isUploading
            ? t('editor.image.uploading')
            : t('editor.image.chooseImageUpload', { defaultValue: 'Choose image to upload' })}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cloud tab
// ---------------------------------------------------------------------------

type CloudTabProps = {
  onSelect: (image: ImageCarouselImage) => void
}

function CloudTab({ onSelect }: CloudTabProps) {
  const { t } = useTranslation('features.lesson')
  const { query, setQuery, images, isLoading } = useCloudImagePicker()

  return (
    <div className="flex flex-col gap-2 pt-2">
      <Input
        type="text"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        placeholder={t('editor.image.searchCloud', { defaultValue: 'Search images…' })}
        autoComplete="off"
        spellCheck={false}
        className="mb-1 cursor-text bg-background text-foreground caret-foreground placeholder:text-muted-foreground"
        aria-label={t('editor.image.searchCloudAria', { defaultValue: 'Search cloud images' })}
      />
      <ImageCarousel
        images={images}
        onSelect={onSelect}
        isLoading={isLoading}
        className="max-h-48"
      />
      {!isLoading && images.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {query
            ? t('editor.image.noResults', { defaultValue: 'No images match your search.' })
            : t('editor.image.noCloudImages', { defaultValue: 'No images in your cloud yet.' })}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export function CloudImagePickerPanel({ onSelect, className }: CloudImagePickerPanelProps) {
  function handleUploaded(src: string, filepath: string) {
    onSelect({ src, altText: '', filepath })
  }

  function handleCloudSelect(image: ImageCarouselImage) {
    onSelect({
      src: image.url,
      altText: image.title ?? '',
      filepath: image.storagePath,
    })
  }

  return (
    <div
      className={cn(
        'w-[280px] rounded-2xl border border-border bg-popover p-3',
        'text-popover-foreground shadow-xl backdrop-blur-xl',
        'supports-backdrop-filter:bg-popover/90',
        className,
      )}
    >
      <SelectTabs
        tabs={TABS}
        defaultIndex={0}
      >
        {(activeIndex) => (
          <>
            {activeIndex === 0 && <UploadTab onUploaded={handleUploaded} />}
            {activeIndex === 1 && <CloudTab onSelect={handleCloudSelect} />}
          </>
        )}
      </SelectTabs>
    </div>
  )
}
```

**Rules applied:**

- Three sub-components (`UploadTab`, `CloudTab`, panel shell) — each has one job [file:6]
- No inline logic in JSX — handlers are named functions [file:3]
- `TABS` is a stable constant outside the component — no re-creation on render [file:4]
- `sr-only` on the file `<input>` for accessibility [file:3]

---

## Step 3 — Wire Into `Editor.tsx`

### 3a — Add the insert helper

```tsx
// src/features/lexical-editor/components/Editor.tsx

import { $createImageNode } from '../nodes/ImageNode'
import { CloudImagePickerPanel } from './CloudImagePickerPanel'

// Inside the Editor component:
const [showImagePicker, setShowImagePicker] = useState(false)

function handleImagePickerSelect(payload: { src: string; altText: string; filepath?: string }) {
  editor.update(() => {
    const imageNode = $createImageNode({
      src: payload.src,
      altText: payload.altText,
      filepath: payload.filepath ?? null,
      cloudFileId: null, // backfill via sync step per asset-reference-plan.md
      maxWidth: 720,
    })
    $insertNodes([imageNode])
  })
  setShowImagePicker(false)
}
```

### 3b — Render the panel

```tsx
{
  /* Inside the relative wrapper div, alongside EmojiPickerPanel */
}
{
  showImagePicker && (
    <CloudImagePickerPanel
      onSelect={handleImagePickerSelect}
      className="absolute top-10 left-0 z-50"
    />
  )
}
```

### 3c — Trigger button (toolbar or slash-menu)

Add an image button to the floating toolbar or slash-menu using the same pattern
as the emoji trigger:

```tsx
<button
  type="button"
  aria-label="Insert image"
  onClick={() => setShowImagePicker((prev) => !prev)}
>
  <ImageIcon size={16} />
</button>
```

---

## Sample Interaction

### Initial State

1. Panel is closed. Editor is focused.

### User Action 1 — Open panel

1. User clicks the image icon in the floating toolbar.
2. `CloudImagePickerPanel` opens — **Upload tab** is active by default.
3. A dashed upload zone reads "Choose image to upload".

### User Action 2 — Upload tab: pick a file

1. User clicks the upload zone and selects `wound-photo.jpg` from their filesystem.
2. `useLessonImageUpload` runs; a toast "Image uploaded" appears.
3. An `ImageNode` is inserted at the cursor. Panel closes.

### User Action 3 — Switch to Cloud tab

1. User clicks the **Cloud** tab.
2. `useTeacherCloudFiles` loads; `ImageCarousel` renders their images in a horizontal scroll.
3. User types "dressing" in the search input — carousel filters to matching images.
4. User clicks a thumbnail — `ImageNode` inserted. Panel closes.

### User Action 4 — No results

1. User types "xyz123" in the Cloud tab search.
2. Carousel disappears; "No images match your search." text appears.

---

## Detailed Requirements

1. Panel shell matches `EmojiPickerPanel` dimensions and visual style (`w-[280px] rounded-2xl border shadow-xl backdrop-blur-xl`).
2. `SelectTabs` renders two tabs: index 0 = Upload (`<Upload />` icon), index 1 = Cloud (`<Cloud />` icon).
3. Upload tab shows a dashed-border file-drop label; clicking opens native file picker (`accept="image/*"`).
4. Upload tab uses `useLessonImageUpload` — no new upload logic.
5. Cloud tab search uses `Input` from `@/components/ui/input`.
6. Cloud tab images use `ImageCarousel` — pass `isLoading` from `useTeacherCloudFiles`.
7. Cloud tab filters by `display_name` only (case-insensitive substring match via `useCloudImagePicker`).
8. Selecting from either tab calls `$createImageNode` + `$insertNodes` in an `editor.update()`.
9. `ImagePayload.filepath` is populated on upload (from `LessonImageUploadResult.path`) and on cloud pick (from `CloudFileItem.storage_object_name`).
10. Panel closes after any successful insert.
11. Empty-state message shown when cloud images list is empty or search yields no results.
12. File input is `sr-only`; upload label is keyboard-focusable (`<label>`).
13. No new CSS file — Tailwind only.
14. `useCloudImagePicker` is the only hook that touches `useTeacherCloudFiles`; panel components do not call it directly.

---

## Acceptance Criteria

- [ ] `CloudImagePickerPanel` renders with Upload tab active by default
- [ ] Upload tab: selecting a file triggers upload and inserts `ImageNode`
- [ ] Cloud tab: existing cloud images render in `ImageCarousel`
- [ ] Cloud tab: search input filters the carousel in real time
- [ ] Cloud tab: selecting a thumbnail inserts `ImageNode` with correct `src` + `filepath`
- [ ] Panel closes on successful insert in both tabs
- [ ] `isLoading` spinner shown while `useTeacherCloudFiles` fetches
- [ ] Empty state shown when no cloud images or no search match
- [ ] `filepath` set on `ImageNode` in both upload and cloud paths
- [ ] No inline logic in JSX — all handlers are named functions
- [ ] Panel shell CSS matches `EmojiPickerPanel` (same `w-[280px]` popover token set)
- [ ] `useCloudImagePicker` has unit-testable filter logic (pure `useMemo`)
