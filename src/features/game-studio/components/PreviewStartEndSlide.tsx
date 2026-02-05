import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export interface PreviewStartEndSlideProps {
  title: string
  description: string
  /** When true, the slide is visible and the word animation runs. */
  active: boolean
  /** Optional label shown above title (e.g. "Start" or "End"). */
  label?: string
  /** When this changes to true (e.g. drawer opened), reset so animation can run again. */
  drawerOpen?: boolean
}

function splitIntoWords(text: string): string[] {
  if (!String(text).trim()) return []
  return text.trim().split(/\s+/)
}

export function PreviewStartEndSlide({
  title,
  description,
  active,
  label,
  drawerOpen,
}: PreviewStartEndSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (drawerOpen) hasAnimatedRef.current = false
  }, [drawerOpen])

  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const wordSpans = container.querySelectorAll('.word')
    if (wordSpans.length === 0) return
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    gsap.set(wordSpans, { opacity: 0, filter: 'blur(4px)' })
    gsap.to(wordSpans, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.25,
      stagger: 0.03,
      ease: 'power2.out',
    })
  }, [active])

  useEffect(() => {
    if (!active) hasAnimatedRef.current = false
  }, [active])

  const titleWords = splitIntoWords(title)
  const descWords = splitIntoWords(description)

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-4 p-6 justify-center min-h-full"
    >
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
      {titleWords.length > 0 && (
        <h2 className="text-xl font-semibold leading-tight">
          {titleWords.map((word, i) => (
            <span key={i} className="word inline">
              {word}{' '}
            </span>
          ))}
        </h2>
      )}
      {descWords.length > 0 && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          {descWords.map((word, i) => (
            <span key={i} className="word inline">
              {word}{' '}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
