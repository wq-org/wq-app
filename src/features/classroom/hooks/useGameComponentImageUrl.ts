import { useEffect, useState } from 'react'

import { getFileSignedUrl } from '@/features/cloud'

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
