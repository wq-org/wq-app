import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { LessonHeading } from '../utils/lessonHeadings'

export type LessonHeadingsNavigationProps = {
  headings: readonly LessonHeading[]
  loading?: boolean
  emptyLabel: string
  onHeadingSelect: (heading: LessonHeading) => void
}

function getHeadingDomTarget(heading: LessonHeading): Element | null {
  return (
    (heading.elementId ? document.getElementById(heading.elementId) : null) ??
    document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
    document.getElementById(heading.blockId)
  )
}

export function LessonHeadingsNavigation({
  headings,
  loading = false,
  emptyLabel,
  onHeadingSelect,
}: LessonHeadingsNavigationProps) {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const firstHeadingKey = headings[0] ? (headings[0].elementId ?? headings[0].blockId) : null

  useEffect(() => {
    if (typeof window === 'undefined' || headings.length === 0) {
      setActiveHeadingId(null)
      return
    }

    const observedElements = headings
      .map((heading) => ({
        key: heading.elementId ?? heading.blockId,
        element: getHeadingDomTarget(heading),
      }))
      .filter((entry): entry is { key: string; element: Element } => entry.element != null)

    if (observedElements.length === 0) {
      setActiveHeadingId(null)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0]

        if (!visibleEntry) return

        const match = observedElements.find((entry) => entry.element === visibleEntry.target)
        if (match) {
          setActiveHeadingId(match.key)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.4, 0.75],
      },
    )

    observedElements.forEach((entry) => observer.observe(entry.element))

    return () => observer.disconnect()
  }, [headings])

  if (loading) {
    return (
      <div className="space-y-2 py-3">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-full rounded-2xl"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 py-3">
      {headings.length === 0 ? (
        <Text
          as="p"
          variant="small"
          className="text-muted-foreground"
        >
          {emptyLabel}
        </Text>
      ) : (
        <nav className="flex flex-col gap-1">
          {headings.map((heading) => {
            const key = heading.elementId ?? heading.blockId
            const isActive =
              activeHeadingId === key || (activeHeadingId == null && firstHeadingKey === key)

            return (
              <button
                key={`${heading.pageId}-${key}`}
                type="button"
                onClick={() => onHeadingSelect(heading)}
                className={cn(
                  'w-full rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-muted',
                  isActive && 'bg-blue-500/10 text-blue-500',
                  heading.level === 2 && 'pl-5',
                  heading.level === 3 && 'pl-7',
                )}
              >
                <Text
                  as="span"
                  variant="body"
                  className={cn(
                    'line-clamp-2 break-words font-medium text-foreground',
                    isActive && 'text-blue-500',
                  )}
                >
                  {heading.text}
                </Text>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
