import { supabase } from '@/lib/supabase'

import type {
  LessonBlock,
  LessonBlockEventType,
  LessonBlockRow,
  LessonBlockTypeRegistryRow,
} from '../types/lesson.types'
import { serializedNodeToBlockType } from '../utils/lexicalBlocksBridge'
import type { SerializedLexicalNode } from 'lexical'

export const LESSON_BLOCK_COLUMNS =
  'id, lesson_id, institution_id, block_type, value, meta_order, meta_depth, content_schema_version, created_at, updated_at'

const REGISTRY_COLUMNS = 'block_type, category, is_lexical_core, plugin_key, created_at'

const PAGE_CHUNK = 100
const PREFETCH_PAGE_SIZE = 10

/**
 * Module-level cache for the registry. Block types change rarely (only when a
 * teacher adds a custom Lexical plugin), so a session-scoped cache is safe and
 * avoids one extra round trip on every lesson editor mount.
 */
let registryPromise: Promise<LessonBlockTypeRegistryRow[]> | null = null

/** In-flight prefetch dedupe so hovering several cards doesn't fan out duplicate calls. */
const inFlightPrefetches = new Map<string, Promise<unknown>>()

export function toLessonBlock(row: LessonBlockRow): LessonBlock {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    type: row.block_type as LessonBlock['type'],
    value: row.value,
    order: row.meta_order,
    depth: row.meta_depth,
    contentSchemaVersion: row.content_schema_version,
  }
}

export async function fetchLessonBlocksPage(
  lessonId: string,
  rangeFrom: number,
  rangeToInclusive: number,
): Promise<LessonBlock[]> {
  const { data, error } = await supabase
    .from('lesson_blocks')
    .select(LESSON_BLOCK_COLUMNS)
    .eq('lesson_id', lessonId)
    .order('meta_order', { ascending: true })
    .range(rangeFrom, rangeToInclusive)

  if (error) {
    console.error('fetchLessonBlocksPage:', error)
    throw error
  }

  return (data as LessonBlockRow[]).map(toLessonBlock)
}

export async function fetchAllLessonBlocks(lessonId: string): Promise<LessonBlock[]> {
  const out: LessonBlock[] = []
  let offset = 0

  while (true) {
    const chunk = await fetchLessonBlocksPage(lessonId, offset, offset + PAGE_CHUNK - 1)
    if (chunk.length === 0) break
    out.push(...chunk)
    offset += chunk.length
    if (chunk.length < PAGE_CHUNK) break
  }

  return out
}

export async function fetchLessonBlockTypeRegistry(): Promise<LessonBlockTypeRegistryRow[]> {
  if (registryPromise) {
    return registryPromise
  }

  registryPromise = (async () => {
    const { data, error } = await supabase
      .from('lesson_block_type_registry')
      .select(REGISTRY_COLUMNS)

    if (error) {
      registryPromise = null
      console.error('fetchLessonBlockTypeRegistry:', error)
      throw error
    }

    return data as LessonBlockTypeRegistryRow[]
  })()

  return registryPromise
}

/** Drop the cached registry — call after a teacher installs/removes a custom plugin. */
export function invalidateLessonBlockTypeRegistry(): void {
  registryPromise = null
}

/**
 * Fire-and-forget head-page prefetch used on lesson card hover / focus.
 * Dedupes concurrent calls per `lessonId` and silently swallows errors —
 * the real fetch on navigation will surface them.
 */
export function prefetchLessonBlocksHead(lessonId: string): void {
  if (!lessonId) return
  if (inFlightPrefetches.has(lessonId)) return

  const promise = fetchLessonBlocksPage(lessonId, 0, PREFETCH_PAGE_SIZE - 1)
    .catch(() => undefined)
    .finally(() => {
      inFlightPrefetches.delete(lessonId)
    })

  inFlightPrefetches.set(lessonId, promise)
}

export async function syncLessonBlocksForLesson(
  lessonId: string,
  existing: LessonBlock[],
  serializedNodes: SerializedLexicalNode[],
  options?: {
    allowDeleteTrailing?: boolean
  },
): Promise<LessonBlock[]> {
  const sortedExisting = [...existing].sort((a, b) => a.order - b.order)
  const allowDeleteTrailing = options?.allowDeleteTrailing ?? true

  const payload = serializedNodes.map((node, index) => {
    const prev = sortedExisting[index]
    return {
      ...(prev ? { id: prev.id } : {}),
      block_type: serializedNodeToBlockType(node),
      value: node as unknown as Record<string, unknown>,
      meta_depth: 0,
      content_schema_version: 1,
    }
  })

  const { data, error } = await supabase.rpc('upsert_lesson_blocks', {
    p_lesson_id: lessonId,
    p_blocks: payload,
    p_allow_delete_trailing: allowDeleteTrailing,
  })

  if (error) {
    console.error('upsert_lesson_blocks failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }

  return (data as LessonBlockRow[]).map(toLessonBlock)
}

export async function deleteLessonBlock(blockId: string): Promise<void> {
  const { error } = await supabase.from('lesson_blocks').delete().eq('id', blockId)

  if (error) {
    console.error('deleteLessonBlock:', error)
    throw error
  }
}

export async function recordLessonBlockEvent(
  blockId: string,
  payload: {
    eventType: LessonBlockEventType
    durationMs?: number
    metadata?: Record<string, unknown>
    courseDeliveryId?: string | null
  },
): Promise<void> {
  const { data: block, error: blockError } = await supabase
    .from('lesson_blocks')
    .select('lesson_id, institution_id')
    .eq('id', blockId)
    .single()

  if (blockError || !block) {
    console.error('recordLessonBlockEvent — block lookup:', blockError)
    throw blockError ?? new Error('lesson block not found')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('recordLessonBlockEvent — auth:', userError)
    throw userError ?? new Error('not authenticated')
  }

  const { error } = await supabase.from('lesson_block_events').insert({
    institution_id: block.institution_id,
    lesson_id: block.lesson_id,
    block_id: blockId,
    course_delivery_id: payload.courseDeliveryId ?? null,
    user_id: user.id,
    event_type: payload.eventType,
    duration_ms: payload.durationMs ?? null,
    metadata: payload.metadata ?? null,
  })

  if (error) {
    console.error('recordLessonBlockEvent:', error)
    throw error
  }
}

export async function reorderLessonBlocks(lessonId: string, orderedIds: string[]): Promise<LessonBlock[]> {
  const existing = await fetchAllLessonBlocks(lessonId)
  const byId = new Map(existing.map((b) => [b.id, b]))
  const serialized = orderedIds.map((id) => {
    const block = byId.get(id)
    if (!block) {
      throw new Error(`reorderLessonBlocks: unknown block id ${id}`)
    }
    return block.value as SerializedLexicalNode
  })

  return syncLessonBlocksForLesson(lessonId, existing, serialized)
}
