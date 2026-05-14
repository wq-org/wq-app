import type { Node } from '@xyflow/react'

import {
  GAME_IMAGE_PIN_TYPE,
  type GameImagePinNodeData,
} from '../nodes/game-image-pin/game-image-pin.schema'

export type GameStudioProjectGalleryImage = {
  url: string
  title: string
  /** Supabase storage object path when the node was saved from cloud upload. */
  storagePath?: string
}

/**
 * Builds a de-duplicated list of image pin preview URLs from the canvas graph.
 * Used for quick-pick carousels in the image pin editor.
 */
export function collectImagePinGalleryImages(
  nodes: readonly Node[],
  options: { skipUrl?: string } = {},
): GameStudioProjectGalleryImage[] {
  const skip = options.skipUrl?.trim() ?? ''
  const seen = new Set<string>()
  const out: GameStudioProjectGalleryImage[] = []

  for (const node of nodes) {
    if (node.type !== GAME_IMAGE_PIN_TYPE) continue
    const data = node.data as GameImagePinNodeData
    const url = typeof data.imagePreview === 'string' ? data.imagePreview.trim() : ''
    if (!url || url === skip || seen.has(url)) continue
    seen.add(url)
    const title = String(data.title ?? '').trim() || String(data.label ?? '').trim() || ''
    const storagePath =
      typeof data.filepath === 'string' && data.filepath.trim() !== ''
        ? data.filepath.trim()
        : undefined
    out.push({ url, title, ...(storagePath ? { storagePath } : {}) })
  }

  return out
}
