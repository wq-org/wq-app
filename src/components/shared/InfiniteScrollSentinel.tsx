import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export type InfiniteScrollSentinelProps = {
  /** Called when the sentinel intersects the root viewport and more data is available. */
  onLoadMore: () => void
  /** When `false`, the observer is detached. */
  hasMore: boolean
  /** Suppresses repeated triggers while the next page is in flight. */
  isLoading?: boolean
  /** IntersectionObserver root. `null` (default) observes the window viewport. */
  root?: Element | null
  /** Pre-fetch margin around the root. */
  rootMargin?: string
  /** Visibility threshold; default `0` (intersects on any pixel overlap). */
  threshold?: number
  className?: string
}

/**
 * Tiny invisible div that fires `onLoadMore` when it enters the root viewport.
 * Place at the end of an infinite-scroll list. When using a scrollable container
 * (not the window), pass that container as `root` so the IntersectionObserver
 * tracks the right scroll context.
 */
export function InfiniteScrollSentinel({
  onLoadMore,
  hasMore,
  isLoading = false,
  root = null,
  rootMargin = '400px',
  threshold = 0,
  className,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!hasMore) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !isLoading) {
          onLoadMoreRef.current()
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoading, root, rootMargin, threshold])

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('h-px w-full', className)}
    />
  )
}
