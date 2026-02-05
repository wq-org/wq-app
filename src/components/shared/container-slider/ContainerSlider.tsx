import { useState, Children } from 'react'
import { cn } from '@/lib/utils'

interface ContainerSliderProps {
  children: React.ReactNode
  className?: string
  /** When true, the slider grows to fill remaining height in a flex container. */
  fillHeight?: boolean
}

export function ContainerSlider({ children, className, fillHeight }: ContainerSliderProps) {
  const slides = Children.toArray(children)
  const [current, setCurrent] = useState(0)
  const count = slides.length
  const index = count > 0 ? Math.min(current, count - 1) : 0

  const scrollTo = (i: number) => {
    setCurrent(Math.max(0, Math.min(i, count - 1)))
  }

  if (count === 0) return null

  return (
    <div
      className={cn(
        'w-full max-w-7xl mx-auto px-4 py-8',
        fillHeight && 'flex flex-col flex-1 min-h-0',
        className,
      )}
    >
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
              i === index ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none',
            )}
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={cn(
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-full',
                i === index
                  ? 'w-8 h-3 bg-gray-800 dark:bg-gray-200'
                  : 'w-3 h-3 bg-gray-400 rounded-full hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-400',
              )}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
