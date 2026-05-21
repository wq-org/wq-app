import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

import { supabase } from '@/lib/supabase'

type ChildBearing = { children?: unknown } & SerializedLexicalNode
type ImageLikeNode = { type: string; cloudFileId?: string | null }

function isImageLikeNode(value: unknown): value is ImageLikeNode {
  return (
    typeof value === 'object' && value !== null && (value as { type?: unknown }).type === 'image'
  )
}

export function extractCloudFileIdsFromLexicalState(
  state: SerializedEditorState | null | undefined,
): string[] {
  if (!state?.root) return []

  const found = new Set<string>()

  function walk(node: unknown): void {
    if (isImageLikeNode(node) && typeof node.cloudFileId === 'string' && node.cloudFileId) {
      found.add(node.cloudFileId)
    }
    const children = (node as ChildBearing).children
    if (Array.isArray(children)) {
      for (const child of children) walk(child)
    }
  }

  walk(state.root)
  return Array.from(found)
}

export async function syncLessonImageLinks(params: {
  lessonId: string
  institutionId: string
  state: SerializedEditorState
}): Promise<void> {
  const { lessonId, institutionId, state } = params
  if (!lessonId || !institutionId) return

  const cloudFileIds = extractCloudFileIdsFromLexicalState(state)

  const { error: deleteError } = await supabase.from('cloud_file_links').delete().match({
    link_entity_type: 'lesson',
    entity_id: lessonId,
    link_purpose: 'inline_media',
  })

  if (deleteError) {
    console.error('[syncLessonImageLinks] delete failed', deleteError)
    return
  }

  if (cloudFileIds.length === 0) return

  const rows = cloudFileIds.map((id) => ({
    institution_id: institutionId,
    cloud_file_id: id,
    link_entity_type: 'lesson' as const,
    entity_id: lessonId,
    link_purpose: 'inline_media' as const,
  }))

  const { error: insertError } = await supabase.from('cloud_file_links').upsert(rows, {
    onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose',
  })

  if (insertError) {
    console.error('[syncLessonImageLinks] upsert failed', insertError)
  }
}
