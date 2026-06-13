import { useEffect, useMemo, useState } from 'react'

import { getFileSignedUrl } from '@/features/cloud'

import type { GameComponentScore } from '../types/classroom-game.types'

function isDirectImageUrl(path: string): boolean {
  return (
    /^https?:\/\//i.test(path) ||
    /^data:/i.test(path) ||
    /^blob:/i.test(path) ||
    path.startsWith('/')
  )
}

/** Resolves an Image Pin preview for analytics — uses stored URL or re-signs from storage path. */
export function useGameComponentImageUrl(imagePreview?: string, imageFilepath?: string) {
  const preview = imagePreview?.trim() ?? ''
  const filepath = imageFilepath?.trim() ?? ''
  // When filepath is available, always re-sign — imagePreview may be an expired Supabase signed URL.
  const directUrl = preview && !filepath && isDirectImageUrl(preview) ? preview : null

  const [url, setUrl] = useState<string | null>(directUrl)
  const [loading, setLoading] = useState(Boolean(!directUrl && filepath))

  useEffect(() => {
    if (directUrl) {
      setUrl(directUrl)
      setLoading(false)
      return
    }

    if (!filepath) {
      setUrl(preview || null)
      setLoading(false)
      return
    }

    let cancelled = false

    void (async () => {
      setLoading(true)
      const signedUrl = await getFileSignedUrl(filepath, 3600)
      if (cancelled) return
      setUrl(signedUrl ?? (preview || null))
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [directUrl, filepath, preview])

  return { url, loading }
}

/**
 * Batch variant: resolves the Image Pin preview URL for many components at once,
 * keyed by `nodeId`. Re-signs from the storage path when available (stored preview
 * URLs may be expired). One hook, one effect — safe to use with a list of nodes.
 */
export function useGameComponentImageUrls(
  components: readonly GameComponentScore[],
): Map<string, string> {
  // Stable cache key so the effect only re-runs when an image source actually changes.
  const cacheKey = useMemo(
    () =>
      components
        .map(
          (component) => `${component.nodeId}|${component.imagePreview}|${component.imageFilepath}`,
        )
        .join(','),
    [components],
  )

  const [urlByNodeId, setUrlByNodeId] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const entries = await Promise.all(
        components.map(async (component): Promise<[string, string] | null> => {
          const preview = component.imagePreview?.trim() ?? ''
          const filepath = component.imageFilepath?.trim() ?? ''

          if (filepath) {
            const signedUrl = await getFileSignedUrl(filepath, 3600)
            const resolved = signedUrl ?? (preview || null)
            return resolved ? [component.nodeId, resolved] : null
          }

          if (preview && isDirectImageUrl(preview)) return [component.nodeId, preview]
          return null
        }),
      )

      if (cancelled) return
      setUrlByNodeId(new Map(entries.filter((entry): entry is [string, string] => entry !== null)))
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  return urlByNodeId
}
