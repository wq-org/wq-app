import { supabase } from '@/lib/supabase'
import type { AvatarOption } from '../types/onboarding.types'

/**
 * Fetch all available avatars from Supabase storage.
 *
 * Strategy (3 round-trips instead of N+2):
 *  1. List PNG files from `faces/`.
 *  2. Batch-sign all image URLs in ONE createSignedUrls call.
 *  3. List + download JSON metadata files and merge by base name.
 *
 * Returns [] on any storage failure so callers can show an empty state
 * rather than a misleading single hardcoded fallback avatar.
 */
export async function fetchAvatars(): Promise<AvatarOption[]> {
  // ── Step 1: list PNG image files ──────────────────────────────────────────
  const { data: imageFiles, error: listError } = await supabase.storage
    .from('avatars')
    .list('faces', { limit: 200, offset: 0, sortBy: { column: 'name', order: 'asc' } })

  if (listError) {
    console.error('[fetchAvatars] Failed to list avatars/faces:', listError)
    return []
  }

  if (!imageFiles?.length) {
    console.error('[fetchAvatars] No files found in avatars/faces/')
    return []
  }

  const pngFiles = imageFiles.filter((f) => f.name.endsWith('.png'))

  if (pngFiles.length === 0) {
    console.error('[fetchAvatars] No PNG files found in avatars/faces/')
    return []
  }

  // ── Step 2: batch-sign all image URLs (1 network call) ────────────────────
  const paths = pngFiles.map((f) => `faces/${f.name}`)
  const { data: signedData, error: signError } = await supabase.storage
    .from('avatars')
    .createSignedUrls(paths, 3600)

  if (signError || !signedData) {
    console.error('[fetchAvatars] Failed to create signed URLs:', signError)
    return []
  }

  // baseName → signedUrl lookup
  const urlMap = new Map<string, string>(
    signedData
      .filter((s) => Boolean(s.signedUrl))
      .map((s) => [s.path.replace('faces/', '').replace('.png', ''), s.signedUrl]),
  )

  // ── Step 3: list & download JSON metadata files (non-fatal if missing) ────
  const metaMap = new Map<string, { name: string; emoji: string; description: string }>()

  const { data: metaFiles } = await supabase.storage
    .from('avatars')
    .list('meta_data', { limit: 200, offset: 0, sortBy: { column: 'name', order: 'asc' } })

  if (metaFiles && metaFiles.length > 0) {
    const jsonFiles = metaFiles.filter((f) => f.name.endsWith('.json'))
    await Promise.all(
      jsonFiles.map(async (jsonFile) => {
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('avatars')
            .download(`meta_data/${jsonFile.name}`)
          if (downloadError || !fileData) return
          const metadata = JSON.parse(await fileData.text()) as Record<string, string>
          const baseName = jsonFile.name.replace('.json', '')
          metaMap.set(baseName, {
            name: metadata['name'] ?? baseName,
            emoji: metadata['emoji'] ?? '🌿',
            description: metadata['description'] ?? '',
          })
        } catch {
          // Non-fatal — image still appears with a derived name
        }
      }),
    )
  }

  // ── Step 4: assemble AvatarOption list ────────────────────────────────────
  return pngFiles
    .map((pngFile): AvatarOption | null => {
      const baseName = pngFile.name.replace('.png', '')
      const signedUrl = urlMap.get(baseName)
      // Skip any image whose signed URL could not be generated
      if (!signedUrl) return null

      const meta = metaMap.get(baseName)
      return {
        name: meta?.name ?? baseName,
        // Use the already-signed URL directly — useAvatarUrl will detect it
        // as a direct URL (starts with https://) and skip a second signing.
        src: signedUrl,
        emoji: meta?.emoji ?? '🌿',
        description: meta?.description ?? '',
      }
    })
    .filter((a): a is AvatarOption => a !== null)
}
