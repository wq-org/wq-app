import type { GameImagePinNodeData } from '../nodes/game-image-pin/game-image-pin.schema'

const PUBLIC_PATH_MARKER = '/object/public/cloud/'

export function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const idx = url.indexOf(PUBLIC_PATH_MARKER)
  if (idx < 0) return null
  return url.slice(idx + PUBLIC_PATH_MARKER.length)
}

/** Resolves the canonical cloud storage path for an image-pin node. */
export function resolveGameImagePinStoragePath(data: GameImagePinNodeData): string | null {
  const explicit = data.filepath?.trim()
  if (explicit) return explicit
  return storagePathFromPublicUrl(data.imagePreview)
}
