import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface HeartProps {
  size?: number
  className?: string
  interactive?: boolean
  liked?: boolean
}

const HEART_PATH =
  'M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.732 3.195 2 5.5 2c1.463 0 3.055.826 4.26 2.216C10.855 5.323 11.51 6 12 6s1.145-.677 2.24-1.784C15.445 2.826 17.037 2 18.5 2 20.805 2 23 3.732 23 7.191c0 4.105-5.37 8.863-11 14.402z'

const HEART_FILL = 'oklch(0.76 0.18 305)'
const HEART_STROKE = 'oklch(0.6 0.2 305)'

export default function Heart({
  size = 16,
  className,
  interactive = false,
  liked = true,
}: HeartProps) {
  const [isLiked, setIsLiked] = useState(liked)

  useEffect(() => {
    if (!interactive) {
      setIsLiked(liked)
    }
  }, [interactive, liked])

  const resolvedLiked = interactive ? isLiked : liked
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 22"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 transition-transform duration-200', className)}
    >
      <path
        d={HEART_PATH}
        fill={resolvedLiked ? HEART_FILL : 'none'}
        stroke={resolvedLiked ? HEART_STROKE : '#d1d5db'}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (!interactive) {
    return icon
  }

  return (
    <button
      type="button"
      onClick={() => setIsLiked((previous) => !previous)}
      aria-label={resolvedLiked ? 'Unlike' : 'Like'}
      aria-pressed={resolvedLiked}
      className="inline-flex items-center justify-center rounded-full p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
    </button>
  )
}
