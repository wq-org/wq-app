import type { Node } from '@xyflow/react'

import { supabase } from '@/lib/supabase'

import {
  GAME_IMAGE_PIN_TYPE,
  type GameImagePinNodeData,
} from '../nodes/game-image-pin/game-image-pin.schema'

export function extractCloudFileIdsFromImagePinNodes(nodes: readonly Node[]): string[] {
  const found = new Set<string>()

  for (const node of nodes) {
    if (node.type !== GAME_IMAGE_PIN_TYPE) continue
    const cloudFileId = (node.data as GameImagePinNodeData).cloudFileId
    if (typeof cloudFileId === 'string' && cloudFileId.trim()) {
      found.add(cloudFileId.trim())
    }
  }

  return Array.from(found)
}

export async function syncGameImageLinks(params: {
  gameVersionId: string
  institutionId: string
  nodes: readonly Node[]
}): Promise<void> {
  const { gameVersionId, institutionId, nodes } = params
  if (!gameVersionId || !institutionId) return

  const cloudFileIds = extractCloudFileIdsFromImagePinNodes(nodes)

  const { error: deleteError } = await supabase.from('cloud_file_links').delete().match({
    link_entity_type: 'game_version',
    entity_id: gameVersionId,
    link_purpose: 'inline_media',
  })

  if (deleteError) {
    console.error('[syncGameImageLinks] delete failed', deleteError)
    return
  }

  if (cloudFileIds.length === 0) return

  const rows = cloudFileIds.map((id) => ({
    institution_id: institutionId,
    cloud_file_id: id,
    link_entity_type: 'game_version' as const,
    entity_id: gameVersionId,
    link_purpose: 'inline_media' as const,
  }))

  const { error: insertError } = await supabase.from('cloud_file_links').upsert(rows, {
    onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose',
  })

  if (insertError) {
    console.error('[syncGameImageLinks] upsert failed', insertError)
  }
}
