import { useEffect, useState } from 'react'

export function useScrollProgress(scrollContainerSelector?: string): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollContainerSelector
      ? ((document.querySelector(scrollContainerSelector) as HTMLElement | null) ??
        document.documentElement)
      : document.documentElement

    const compute = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const max = scrollHeight - clientHeight
      if (max <= 0) {
        setProgress(0)
        return
      }
      const ratio = scrollTop / max
      setProgress(Math.min(100, Math.max(0, Math.round(ratio * 100))))
    }

    compute()
    el.addEventListener('scroll', compute, { passive: true })
    return () => el.removeEventListener('scroll', compute)
  }, [scrollContainerSelector])

  return progress
}
