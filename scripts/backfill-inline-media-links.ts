/**
 * One-time backfill: walks existing lessons and game_versions to build
 * `cloud_file_links` (link_purpose='inline_media') from already-rendered images.
 *
 * Run:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/backfill-inline-media-links.ts
 *
 * Idempotent — re-running is safe (uses ON CONFLICT on the natural key).
 */

import { createClient } from '@supabase/supabase-js'
import type { SerializedEditorState } from 'lexical'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const PUBLIC_PATH_MARKER = '/object/public/cloud/'

function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const idx = url.indexOf(PUBLIC_PATH_MARKER)
  if (idx < 0) return null
  return url.slice(idx + PUBLIC_PATH_MARKER.length)
}

function extractImageStoragePaths(content: SerializedEditorState | null | undefined): string[] {
  if (!content?.root) return []
  const paths = new Set<string>()

  function walk(node: unknown): void {
    if (
      typeof node === 'object' &&
      node !== null &&
      (node as { type?: unknown }).type === 'image'
    ) {
      const img = node as { src?: unknown; filepath?: unknown }
      if (typeof img.filepath === 'string' && img.filepath) {
        paths.add(img.filepath)
      } else if (typeof img.src === 'string') {
        const path = storagePathFromPublicUrl(img.src)
        if (path) paths.add(path)
      }
    }
    const children = (node as { children?: unknown }).children
    if (Array.isArray(children)) {
      for (const child of children) walk(child)
    }
  }

  walk(content.root)
  return Array.from(paths)
}

async function upsertLink(params: {
  institutionId: string
  cloudFileId: string
  entityType: 'lesson' | 'game_version'
  entityId: string
}): Promise<void> {
  const { error } = await supabase.from('cloud_file_links').upsert(
    {
      institution_id: params.institutionId,
      cloud_file_id: params.cloudFileId,
      link_entity_type: params.entityType,
      entity_id: params.entityId,
      link_purpose: 'inline_media',
    },
    { onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose' },
  )
  if (error) {
    console.error(
      `[backfill] upsert failed (${params.entityType}=${params.entityId}, file=${params.cloudFileId})`,
      error,
    )
  }
}

async function resolveCloudFileId(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('cloud_files')
    .select('id')
    .eq('storage_object_name', storagePath)
    .maybeSingle()
  if (error) {
    console.error(`[backfill] cloud_files lookup failed for ${storagePath}`, error)
    return null
  }
  return (data?.id as string | undefined) ?? null
}

async function backfillLessons(): Promise<void> {
  const { data, error } = await supabase.from('lessons').select('id, institution_id, content')
  if (error) throw error

  for (const lesson of data ?? []) {
    const lessonId = lesson.id as string
    const institutionId = lesson.institution_id as string | null
    if (!institutionId) continue
    const paths = extractImageStoragePaths(lesson.content as SerializedEditorState | null)
    let linked = 0
    for (const path of paths) {
      const cloudFileId = await resolveCloudFileId(path)
      if (!cloudFileId) continue
      await upsertLink({
        institutionId,
        cloudFileId,
        entityType: 'lesson',
        entityId: lessonId,
      })
      linked += 1
    }
    console.log(`lesson ${lessonId}: ${linked}/${paths.length} image(s) linked`)
  }
}

async function backfillGameVersions(): Promise<void> {
  const { data, error } = await supabase
    .from('game_versions')
    .select('id, institution_id, game_content')
  if (error) throw error

  for (const version of data ?? []) {
    const versionId = version.id as string
    const institutionId = version.institution_id as string | null
    if (!institutionId) continue

    const flow = version.game_content as { nodes?: Array<{ type?: string; data?: unknown }> } | null
    const nodes = flow?.nodes ?? []
    const imagePins = nodes.filter((n) => n.type === 'gameImagePin')

    let linked = 0
    for (const pin of imagePins) {
      const data = pin.data as { filepath?: unknown; imagePreview?: unknown } | undefined
      const explicit = typeof data?.filepath === 'string' ? data.filepath : null
      const derived =
        typeof data?.imagePreview === 'string' ? storagePathFromPublicUrl(data.imagePreview) : null
      const storagePath = explicit ?? derived
      if (!storagePath) continue
      const cloudFileId = await resolveCloudFileId(storagePath)
      if (!cloudFileId) continue
      await upsertLink({
        institutionId,
        cloudFileId,
        entityType: 'game_version',
        entityId: versionId,
      })
      linked += 1
    }
    console.log(`game_version ${versionId}: ${linked}/${imagePins.length} pin(s) linked`)
  }
}

void (async () => {
  console.log('Backfilling lessons...')
  await backfillLessons()
  console.log('Backfilling game_versions...')
  await backfillGameVersions()
  console.log('Done.')
})()
