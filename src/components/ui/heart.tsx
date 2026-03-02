import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { heartVariants, type HeartVariantProps } from './heart-variant'

interface HeartProps {
  size?: HeartVariantProps['size']
  variant?: HeartVariantProps['variant']
  className?: string
  interactive?: boolean
  liked?: boolean
  triggerAnimation?: string | number | boolean
}

const HEART_PATH =
  'M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.732 3.195 2 5.5 2c1.463 0 3.055.826 4.26 2.216C10.855 5.323 11.51 6 12 6s1.145-.677 2.24-1.784C15.445 2.826 17.037 2 18.5 2 20.805 2 23 3.732 23 7.191c0 4.105-5.37 8.863-11 14.402z'

export default function Heart({
  size = 'default',
  variant = 'violet',
  className,
  interactive = false,
  liked = true,
  triggerAnimation,
}: HeartProps) {
  const [isLiked, setIsLiked] = useState(liked)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousTriggerRef = useRef(triggerAnimation)

  useEffect(() => {
    if (!interactive) {
      setIsLiked(liked)
    }
  }, [interactive, liked])

  const startAnimation = useCallback(() => {
    setIsAnimating(false)

    if (typeof window === 'undefined') {
      return
    }

    window.requestAnimationFrame(() => {
      setIsAnimating(true)
    })
  }, [])

  useEffect(() => {
    if (previousTriggerRef.current === triggerAnimation) {
      return
    }

    previousTriggerRef.current = triggerAnimation
    startAnimation()
  }, [startAnimation, triggerAnimation])

  useEffect(() => {
    if (!isAnimating) {
      return
    }

    const timeout = window.setTimeout(() => {
      setIsAnimating(false)
    }, 420)

    return () => window.clearTimeout(timeout)
  }, [isAnimating])

  const resolvedLiked = interactive ? isLiked : liked
  const icon = (
    <>
      <style>{`
        @keyframes heart-beat {
          0% { transform: scale(1); }
          35% { transform: scale(1.18); }
          60% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
      `}</style>
      <svg
        viewBox="0 0 24 22"
        fill="none"
        aria-hidden="true"
        className={cn(heartVariants({ variant, size }), className)}
        style={{
          animation: isAnimating ? 'heart-beat 420ms ease-in-out 1' : undefined,
          transformOrigin: 'center',
        }}
      >
        <path
          d={HEART_PATH}
          fill={resolvedLiked ? 'currentColor' : 'none'}
          fillOpacity={resolvedLiked ? 0.22 : 0}
          stroke="currentColor"
          strokeOpacity={resolvedLiked ? 1 : 0.35}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </>
  )

  if (!interactive) {
    return icon
  }

  return (
    <button
      type="button"
      onClick={() => {
        setIsLiked((previous) => !previous)
        startAnimation()
      }}
      aria-label={resolvedLiked ? 'Unlike' : 'Like'}
      aria-pressed={resolvedLiked}
      className="inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
    </button>
  )
}
