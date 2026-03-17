import type { LessonHeading } from './lessonHeadings'

export function scrollToLessonHeading(heading: LessonHeading) {
  if (typeof document === 'undefined') return

  const element =
    (heading.elementId ? document.getElementById(heading.elementId) : null) ??
    document.querySelector(`[data-block-id="${heading.blockId}"]`) ??
    document.getElementById(heading.blockId)

  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
