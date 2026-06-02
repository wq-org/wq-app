# Asset Reference Plan — Zero Migration

> **Strategy:** Use the existing `cloud_file_links` table + `cloud_file_link_purpose = 'inline_media'`.
> No new table. No schema change. `lesson` and `game_version` are already valid enum values.

---

## Current State (The Problem)

```
lessons.content JSONB            games.game_content JSONB
└── ImageNode.src = URL only     └── node.data.imagePreview = URL
                                     node.data.filepath = path

No link to cloud_files. Deletion = silent 404. No usage tracking.
```

---

## Target State (After Fix)

```
cloud_files  (already exists)
    ↑  ON DELETE CASCADE  →  link row removed, but app layer blocks UI deletion first
cloud_file_links  (already exists)
    ├── entity_type = 'lesson'       / purpose = 'inline_media'
    └── entity_type = 'game_version' / purpose = 'inline_media'

Deletion blocked in UI if links exist. Usage visible. URL always recoverable from filepath.
```

> **Why `ON DELETE CASCADE` is fine here:**  
> `cloud_file_links` is a usage index, not the source of truth. The app checks links  
> before calling `.delete()` on `cloud_files` and hard-blocks the action. Postgres cascade  
> just keeps the join table clean if a file is ever force-removed at DB level.

---

## Step 1 — Add `filepath` + `cloudFileId` to Lexical ImageNode

Lessons currently store only a URL. We need the storage key so the URL can be regenerated
if the bucket becomes private, and so we can resolve back to `cloud_files.id`.

```tsx
// src/features/lexical-editor/nodes/ImageNode.tsx

// SerializedImageNode type — add two fields
export type SerializedImageNode = Spread<
  {
    src: string
    filepath: string | null    // ← ADD: storage object name e.g. 'lessons/abc/img.webp'
    cloudFileId: string | null // ← ADD: cloud_files.id UUID
    altText: string
    maxWidth: number
    width?: number
    height?: number
    type: 'image'
    version: 1
  },
  SerializedLexicalNode
>

// exportJSON — include new fields
exportJSON(): SerializedImageNode {
  return {
    ...super.exportJSON(),
    type: 'image',
    src: this.__src,
    filepath: this.__filepath ?? null,       // ← ADD
    cloudFileId: this.__cloudFileId ?? null, // ← ADD
    altText: this.__altText,
    maxWidth: this.__maxWidth,
    width: this.__width,
    height: this.__height,
    version: 1,
  }
}

// importJSON — read new fields
static importJSON( SerializedImageNode): ImageNode {
  return $createImageNode({
    src: data.src,
    filepath: data.filepath ?? null,       // ← ADD
    cloudFileId: data.cloudFileId ?? null, // ← ADD
    altText: data.altText,
    maxWidth: data.maxWidth,
  })
}
```

---

## Step 2 — Return `cloudFileId` from Upload APIs

After every upload, resolve or create the `cloud_files` row and return its `id`.

### Lesson image upload

```tsx
// src/features/lessons/api/lessonImageApi.ts

export async function uploadLessonImage(
  file: File,
  context: UploadContext,
): Promise<{ path: string; publicUrl: string; cloudFileId: string }> {
  const result = await uploadFilesApi(file, context) // existing — returns { path, publicUrl }

  // cloud_files row is created by the storage trigger that already exists.
  // Resolve its id by storage_object_name.
  const { cloudFile } = await supabase
    .from('cloud_files')
    .select('id')
    .eq('storage_object_name', result.path)
    .single()

  if (!cloudFile) throw new Error(`cloud_files row not found for path: ${result.path}`)

  return { ...result, cloudFileId: cloudFile.id }
}
```

### Game image upload

```tsx
// src/features/game-editor/hooks/useGameImagePinImageUpload.ts

// After resolving cloudFileId, patch it onto the node
const updatedNode = {
  ...node,
   {
    ...node.data,
    imagePreview: result.publicUrl,
    filepath: result.path,
    cloudFileId: result.cloudFileId, // ← ADD to XYFlow node schema
  },
}
```

---

## Step 3 — Sync `cloud_file_links` on Save

Use `link_purpose = 'inline_media'` — already a valid enum value. No enum change needed.

### Lesson autosave

```tsx
// src/features/lessons/components/lesson.tsx  (or useLessonAutosave hook)

async function syncLessonImageLinks(
  lessonId: string,
  institutionId: string,
  lexicalJson: SerializedEditorState,
): Promise<void> {
  const imageNodes = extractImageNodes(lexicalJson) // walk root.children recursively
  const cloudFileIds = imageNodes
    .map((n) => n.cloudFileId)
    .filter((id): id is string => Boolean(id))

  // 1. Remove stale links for this lesson
  await supabase
    .from('cloud_file_links')
    .delete()
    .match({ link_entity_type: 'lesson', entity_id: lessonId, link_purpose: 'inline_media' })

  // 2. Insert current links
  if (cloudFileIds.length > 0) {
    await supabase.from('cloud_file_links').upsert(
      cloudFileIds.map((id) => ({
        institution_id: institutionId,
        cloud_file_id: id,
        link_entity_type: 'lesson' as const,
        entity_id: lessonId,
        link_purpose: 'inline_media' as const,
      })),
      { onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose' },
    )
  }
}
```

### Game save

```tsx
// src/features/game-editor/hooks/useGamePersistence.ts

async function syncGameImageLinks(
  gameVersionId: string,
  institutionId: string,
  flowConfig: FlowGameConfig,
): Promise<void> {
  const imagePinNodes = flowConfig.nodes.filter((n) => n.type === 'gameImagePin')
  const cloudFileIds = imagePinNodes
    .map((n) => n.data.cloudFileId as string | undefined)
    .filter((id): id is string => Boolean(id))

  await supabase.from('cloud_file_links').delete().match({
    link_entity_type: 'game_version',
    entity_id: gameVersionId,
    link_purpose: 'inline_media',
  })

  if (cloudFileIds.length > 0) {
    await supabase.from('cloud_file_links').upsert(
      cloudFileIds.map((id) => ({
        institution_id: institutionId,
        cloud_file_id: id,
        link_entity_type: 'game_version' as const,
        entity_id: gameVersionId,
        link_purpose: 'inline_media' as const,
      })),
      { onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose' },
    )
  }
}
```

---

## Step 4 — Block Deletion in Cloud UI

Because `cloud_file_links` uses `ON DELETE CASCADE` (not RESTRICT), the guard must live
in the application layer. This is intentional — it gives a user-friendly error before
Postgres is ever involved.

```tsx
// src/features/cloud/api/cloudFileApi.ts

export async function deleteCloudFile(fileId: string, storagePath: string): Promise<void> {
  // 1. Check for any inline_media usage
  const { links } = await supabase
    .from('cloud_file_links')
    .select('link_entity_type, entity_id')
    .eq('cloud_file_id', fileId)
    .eq('link_purpose', 'inline_media')

  if (links && links.length > 0) {
    const summary = links
      .map((l) => l.link_entity_type)
      .reduce<Record<string, number>>((acc, t) => ({ ...acc, [t]: (acc[t] ?? 0) + 1 }), {})
    const label = Object.entries(summary)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ')
    // → Toast: "Used in 2 lessons, 1 game_version. Remove it from content first."
    throw new Error(`Used in ${label}. Remove it from content first.`)
  }

  // 2. Safe to delete
  await supabase.from('cloud_files').delete().eq('id', fileId)
  await supabase.storage.from('cloud').remove([storagePath])
}
```

---

## Step 5 — Backfill Existing Data (One-time Script)

Run once in dev/staging, then prod, after deploying Steps 1–4.
Matches existing image URLs back to `cloud_files` via `storage_object_name`.

```ts
// scripts/backfill-inline-media-links.ts
// Run: npx tsx scripts/backfill-inline-media-links.ts

import { createClient } from '@supabase/supabase-js'
import type { SerializedEditorState } from 'lexical'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

function extractImageNodes(content: SerializedEditorState): Array<{ src: string }> {
  const results: Array<{ src: string }> = []
  function walk(node: Record<string, unknown>): void {
    if (node.type === 'image' && typeof node.src === 'string') results.push({ src: node.src })
    if (Array.isArray(node.children))
      node.children.forEach((c) => walk(c as Record<string, unknown>))
  }
  if (content?.root) walk(content.root as Record<string, unknown>)
  return results
}

async function backfillLessons(): Promise<void> {
  const { lessons } = await supabase.from('lessons').select('id, institution_id, content')
  for (const lesson of lessons ?? []) {
    const nodes = extractImageNodes(lesson.content)
    for (const node of nodes) {
      // Derive storage_object_name from public URL (bucket path after /object/public/cloud/)
      const storagePath = node.src.split('/object/public/cloud/')[1]
      if (!storagePath) continue
      const { cf } = await supabase
        .from('cloud_files')
        .select('id')
        .eq('storage_object_name', storagePath)
        .single()
      if (!cf) continue
      await supabase.from('cloud_file_links').upsert(
        {
          institution_id: lesson.institution_id,
          cloud_file_id: cf.id,
          link_entity_type: 'lesson',
          entity_id: lesson.id,
          link_purpose: 'inline_media',
        },
        { onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose' },
      )
    }
    console.log(`lesson ${lesson.id}: ${nodes.length} image(s) processed`)
  }
}

async function backfillGames(): Promise<void> {
  const { versions } = await supabase
    .from('game_versions')
    .select('id, institution_id, game_content')
  for (const gv of versions ?? []) {
    const imagePins = (gv.game_content?.nodes ?? []).filter(
      (n: { type: string }) => n.type === 'gameImagePin',
    )
    for (const pin of imagePins) {
      const storagePath =
        pin.data?.filepath ?? pin.data?.imagePreview?.split('/object/public/cloud/')[1]
      if (!storagePath) continue
      const { cf } = await supabase
        .from('cloud_files')
        .select('id')
        .eq('storage_object_name', storagePath)
        .single()
      if (!cf) continue
      await supabase.from('cloud_file_links').upsert(
        {
          institution_id: gv.institution_id,
          cloud_file_id: cf.id,
          link_entity_type: 'game_version',
          entity_id: gv.id,
          link_purpose: 'inline_media',
        },
        { onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose' },
      )
    }
    console.log(`game_version ${gv.id}: ${imagePins.length} pin(s) processed`)
  }
}

void (async () => {
  console.log('Backfilling lessons...')
  await backfillLessons()
  console.log('Backfilling game_versions...')
  await backfillGames()
  console.log('Done.')
})()
```

---

## What Is Fixed After This

| Problem                     | Before                         | After                                                         |
| --------------------------- | ------------------------------ | ------------------------------------------------------------- |
| Lesson stores only URL      | ❌ Can't recover if URL breaks | ✅ `filepath` + `cloudFileId` in ImageNode JSONB              |
| Delete breaks lessons/games | ❌ Silent 404                  | ✅ App layer blocks deletion if `cloud_file_links` rows exist |
| "Where is this image used?" | ❌ Impossible                  | ✅ Query `cloud_file_links` by `cloud_file_id` instantly      |
| Orphaned files taking space | ❌ No way to detect            | ✅ `cloud_files` with no `inline_media` links = safe to clean |
| URL expired (signed bucket) | ❌ Broken lesson               | ✅ Regenerate signed URL from `filepath`                      |
| Usage count in cloud UI     | ❌ Not possible                | ✅ "Used in 3 lessons, 1 game"                                |
| New DB migration required   | ❌ Schema churn                | ✅ Zero — reuses `cloud_file_links` + `inline_media`          |

---

## Key Differences vs. Original Plan

|                      | Original Plan                   | This Plan                                       |
| -------------------- | ------------------------------- | ----------------------------------------------- |
| New table            | `asset_references` (new)        | `cloud_file_links` (existing)                   |
| `entity_type` values | `'lesson'`, `'game'`            | `'lesson'`, `'game_version'` (existing enum)    |
| `field_hint`         | free-text column                | `link_purpose = 'inline_media'` (existing enum) |
| Deletion block       | `ON DELETE RESTRICT` (Postgres) | App-layer guard before `.delete()` call         |
| Migration required   | ✅ Yes                          | ❌ None                                         |
