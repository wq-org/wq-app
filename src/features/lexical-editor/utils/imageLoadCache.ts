const imageCache = new Map<string, Promise<void> | 'loaded' | 'error'>()

export function primeImageLoadCache(src: string, status: 'loaded' | 'error' = 'loaded'): void {
  imageCache.set(src, status)
}

export function preloadImageSrc(src: string): Promise<void> {
  const cached = imageCache.get(src)
  if (cached === 'loaded') {
    return Promise.resolve()
  }
  if (cached === 'error') {
    return Promise.reject(new Error('Failed to load image'))
  }

  const pending = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, 'loaded')
      resolve()
    }
    img.onerror = () => {
      imageCache.set(src, 'error')
      reject(new Error('Failed to load image'))
    }
    img.src = src
  })

  imageCache.set(src, pending)
  return pending
}

export function suspenseImage(src: string): 'loaded' | 'error' {
  const cached = imageCache.get(src)
  if (cached === 'loaded' || cached === 'error') {
    return cached
  }
  if (!cached) {
    const promise = preloadImageSrc(src)
    throw promise
  }
  throw cached
}
