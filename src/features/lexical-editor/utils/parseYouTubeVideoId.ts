const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'])

export const parseYouTubeVideoId = (input: string): string | null => {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    if (!YOUTUBE_HOSTS.has(url.hostname)) return null

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }

    if (url.pathname.startsWith('/embed/')) {
      const id = url.pathname.split('/')[2]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }

    const id = url.searchParams.get('v')
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}
