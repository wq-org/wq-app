import { supabase } from '@/lib/supabase'

export type PublishGameResult = {
  gameVersionId: string
  versionNo: number
  deliveryIds: string[]
}

function normalizePublishGameResult(raw: unknown): PublishGameResult {
  const row = (raw ?? {}) as Record<string, unknown>
  const deliveryIds = Array.isArray(row.delivery_ids)
    ? row.delivery_ids.filter((id): id is string => typeof id === 'string')
    : []

  if (typeof row.game_version_id !== 'string' || typeof row.version_no !== 'number') {
    throw new Error('Invalid publish_game response')
  }

  return {
    gameVersionId: row.game_version_id,
    versionNo: row.version_no,
    deliveryIds,
  }
}

/** Snapshot draft content/metadata and optionally deliver to linked course classrooms. */
export async function publishGameDraft(
  gameId: string,
  courseId?: string | null,
): Promise<PublishGameResult> {
  const { data, error } = await supabase.rpc('publish_game', {
    p_game_id: gameId,
    p_course_id: courseId ?? null,
  })

  if (error) {
    console.error('Error publishing game:', error)
    throw error
  }

  return normalizePublishGameResult(data)
}
