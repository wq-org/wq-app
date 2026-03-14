import { useState, Children, useEffect } from 'react'
import type { ReactNode } from 'react'
import { MoveLeft, MoveRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ContainerSliderProps {
  children: ReactNode
  className?: string
  /** When true, the slider grows to fill remaining height in a flex container. */
  fillHeight?: boolean
  /** Called when the current slide index changes (e.g. for animating Start/End slides). */
  onIndexChange?: (index: number) => void
  /** When true, show previous/next buttons on the left and right of the slide area (for play view). */
  showSideArrows?: boolean
}

export function ContainerSlider({
  children,
  className,
  fillHeight,
  onIndexChange,
  showSideArrows = false,
}: ContainerSliderProps) {
  const slides = Children.toArray(children)
  const [current, setCurrent] = useState(0)
  const count = slides.length
  const index = count > 0 ? Math.min(current, count - 1) : 0

  useEffect(() => {
    onIndexChange?.(index)
  }, [index, onIndexChange])

  const scrollTo = (i: number) => {
    setCurrent(Math.max(0, Math.min(i, count - 1)))
  }

  if (count === 0) return null

  const slideArea = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl flex-1 min-w-0 flex flex-col',
        fillHeight ? 'min-h-0' : 'min-h-[400px]',
      )}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-500 overflow-auto',
            fillHeight && 'flex flex-col min-h-0',
            i === index
              ? 'opacity-100 z-10 pointer-events-auto'
              : 'opacity-0 z-0 pointer-events-none',
          )}
        >
          {slide}
        </div>
      ))}
    </div>
  )

  const sideArrowClass =
    'self-center shrink-0 rounded-full border border-border bg-background/80 text-foreground shadow-md hover:bg-accent'

  return (
    <div
      className={cn(
        'w-full max-w-7xl mx-auto px-4 py-8',
        fillHeight && 'flex flex-col flex-1 min-h-0',
        className,
      )}
    >
      {showSideArrows && count > 1 ? (
        <div className={cn('flex items-stretch gap-2 w-full', fillHeight ? 'flex-1 min-h-0' : '')}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={sideArrowClass}
            onClick={() => scrollTo(index - 1)}
            disabled={index <= 0}
            aria-label="Previous slide"
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          {slideArea}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={sideArrowClass}
            onClick={() => scrollTo(index + 1)}
            disabled={index >= count - 1}
            aria-label="Next slide"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-2xl',
            fillHeight ? 'flex-1 min-h-0 flex flex-col' : 'min-h-[400px]',
          )}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 transition-opacity duration-500 overflow-auto',
                fillHeight && 'flex flex-col min-h-0',
                i === index
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none',
              )}
            >
              {slide}
            </div>
          ))}
        </div>
      )}

      {count > 1 && (
        <div className="flex items-center justify-center gap-12 mt-6 sm:mt-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => scrollTo(index - 1)}
            disabled={index <= 0}
            aria-label="Previous slide"
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center gap-2 ">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={cn(
                  'rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                  i === index
                    ? 'h-3 w-8 bg-foreground'
                    : 'h-3 w-3 bg-muted-foreground/40 hover:bg-muted-foreground/60',
                )}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? 'true' : 'false'}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => scrollTo(index + 1)}
            disabled={index >= count - 1}
            aria-label="Next slide"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
