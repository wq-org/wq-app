import React from 'react'
import { cn } from '@/lib/utils'

type TypingIndicatorSize = 'xs' | 'sm' | 'md'

type TypingIndicatorProps = {
  className?: string
  bubbleClassName?: string
  dotClassName?: string
  size?: TypingIndicatorSize
}

const DOT_INDEXES = [0, 1, 2] as const
const DOT_ANIMATION_NAME = 'typing-indication-wave'
const DOT_ANIMATION_DURATION_MS = 1750
const DOT_JUMP_CSS_VAR = '--typing-indication-dot-jump' as const
const DOT_JUMP_PARTIAL_CSS_VAR = '--typing-indication-dot-jump-partial' as const

const SIZE_CONFIG: Record<
  TypingIndicatorSize,
  {
    dotSize: number
    dotGap: number
    jumpHeight: number
    rowHeight: number
    bubblePaddingX: number
    bubblePaddingY: number
  }
> = {
  xs: {
    dotSize: 6,
    dotGap: 3,
    jumpHeight: 4,
    rowHeight: 14,
    bubblePaddingX: 8,
    bubblePaddingY: 5,
  },
  sm: {
    dotSize: 7,
    dotGap: 4,
    jumpHeight: 5,
    rowHeight: 16,
    bubblePaddingX: 10,
    bubblePaddingY: 6,
  },
  md: {
    dotSize: 8,
    dotGap: 4,
    jumpHeight: 6,
    rowHeight: 17,
    bubblePaddingX: 12,
    bubblePaddingY: 8,
  },
}

const bubbleBaseStyle: React.CSSProperties = {
  backgroundColor: '#e5e7eb',
  borderRadius: '20px',
  borderBottomLeftRadius: '2px',
  display: 'inline-block',
}

const rowBaseStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
}

const dotBaseStyle: React.CSSProperties = {
  backgroundColor: '#d1d5db',
  borderRadius: '9999px',
  display: 'inline-block',
  verticalAlign: 'middle',
}

function TypingIndicator({
  className,
  bubbleClassName,
  dotClassName,
  size = 'md',
}: TypingIndicatorProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updateMotionPreference()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMotionPreference)
      return () => mediaQuery.removeEventListener('change', updateMotionPreference)
    }

    mediaQuery.addListener(updateMotionPreference)
    return () => mediaQuery.removeListener(updateMotionPreference)
  }, [])

  const selectedSize = SIZE_CONFIG[size]

  const bubbleStyle: React.CSSProperties = {
    ...bubbleBaseStyle,
    padding: `${selectedSize.bubblePaddingY}px ${selectedSize.bubblePaddingX}px`,
  }

  const rowStyle: React.CSSProperties = {
    ...rowBaseStyle,
    height: `${selectedSize.rowHeight}px`,
    gap: `${selectedSize.dotGap}px`,
  }

  const getDotStyle = (index: number): React.CSSProperties => {
    const partialJumpHeight = `${(selectedSize.jumpHeight * 0.4).toFixed(2)}px`

    const dotStyle: React.CSSProperties &
      Record<typeof DOT_JUMP_CSS_VAR | typeof DOT_JUMP_PARTIAL_CSS_VAR, string> = {
      ...dotBaseStyle,
      height: `${selectedSize.dotSize}px`,
      width: `${selectedSize.dotSize}px`,
      animation: prefersReducedMotion
        ? 'none'
        : `${DOT_ANIMATION_NAME} ${DOT_ANIMATION_DURATION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) infinite`,
      animationDelay: `${index * 180}ms`,
      [DOT_JUMP_CSS_VAR]: `${selectedSize.jumpHeight}px`,
      [DOT_JUMP_PARTIAL_CSS_VAR]: partialJumpHeight,
      willChange: 'transform',
      ...(prefersReducedMotion ? { backgroundColor: '#9ca3af' } : {}),
    }

    return dotStyle
  }

  return (
    <>
      <div
        className={cn(className)}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <div
          className={cn(bubbleClassName)}
          style={bubbleStyle}
          role="status"
          aria-label="Typing indication"
        >
          <div style={rowStyle}>
            {DOT_INDEXES.map((index) => (
              <span
                key={`dot-${index}`}
                className={cn(dotClassName)}
                style={getDotStyle(index)}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ${DOT_ANIMATION_NAME} {
          0%, 18%, 72%, 100% {
            transform: translateY(0) scale(1);
            background-color: #d1d5db;
          }
          36% {
            transform: translateY(calc(var(--typing-indication-dot-jump, 5px) * -1)) scale(1.04);
            background-color: #6b7280;
          }
          52% {
            transform: translateY(calc(var(--typing-indication-dot-jump-partial, 2px) * -1)) scale(0.98);
            background-color: #9ca3af;
          }
        }
      `}</style>
    </>
  )
}

export default TypingIndicator
