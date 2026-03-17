import { useEffect, useState } from 'react'
import { getFileSignedUrl } from '@/features/files'

function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export function useLessonFileUrl(pathOrUrl?: string | null) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function resolveUrl() {
      if (!pathOrUrl) {
        setResolvedUrl(null)
        return
      }

      if (isRemoteUrl(pathOrUrl)) {
        setResolvedUrl(pathOrUrl)
        return
      }

      setLoading(true)
      try {
        const nextUrl = await getFileSignedUrl(pathOrUrl)
        if (!cancelled) {
          setResolvedUrl(nextUrl)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void resolveUrl()

    return () => {
      cancelled = true
    }
  }, [pathOrUrl])

  return {
    resolvedUrl,
    loading,
  }
}
