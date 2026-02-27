import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function isDirectAvatarUrl(path: string): boolean {
  if (!path) return false
  return (
    /^https?:\/\//i.test(path) ||
    /^data:/i.test(path) ||
    /^blob:/i.test(path) ||
    path.startsWith('/')
  )
}

export function useAvatarUrl(path?: string | null, expiresIn = 3600) {
  const initialPath = path?.trim() ?? ''
  const initialDirectUrl = isDirectAvatarUrl(initialPath) ? initialPath : null
  const [url, setUrl] = useState<string | null>(initialDirectUrl)
  const [loading, setLoading] = useState(Boolean(initialPath && !initialDirectUrl))

  useEffect(() => {
    async function sign() {
      const normalizedPath = path?.trim() ?? ''

      if (!normalizedPath) {
        setUrl(null)
        setLoading(false)
        return
      }

      if (isDirectAvatarUrl(normalizedPath)) {
        setUrl(normalizedPath)
        setLoading(false)
        return
      }

      setUrl(null)
      setLoading(true)
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(normalizedPath, expiresIn)

      if (error) {
        console.error('Error signing avatar url:', error)
        setUrl(null)
      } else {
        setUrl(data?.signedUrl || null)
      }
      setLoading(false)
    }
    void sign()
  }, [path, expiresIn])

  return { url, loading }
}
