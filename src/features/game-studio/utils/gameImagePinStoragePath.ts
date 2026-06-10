import type { GameImagePinNodeData } from '../nodes/game-image-pin/image-pin.schema'

const CLOUD_BUCKET_PATH_MARKERS = ['/object/public/cloud/', '/object/sign/cloud/'] as const

export function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  return storagePathFromCloudUrl(url)
}

/** Extracts the `cloud` bucket object path from a Supabase public or signed URL. */
export function storagePathFromCloudUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null

  for (const marker of CLOUD_BUCKET_PATH_MARKERS) {
    const idx = url.indexOf(marker)
    if (idx < 0) continue
    const pathWithQuery = url.slice(idx + marker.length)
    const path = pathWithQuery.split('?')[0]?.trim()
    return path || null
  }

  return null
}

export function isSupabaseCloudSignedUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.includes('/object/sign/cloud/')
}

/** Resolves the canonical cloud storage path for an image-pin node. */
export function resolveGameImagePinStoragePath(data: GameImagePinNodeData): string | null {
  const explicit = data.filepath?.trim()
  if (explicit) return explicit
  return storagePathFromCloudUrl(data.imagePreview)
}
