import { useId } from 'react'

type ScrollDrivenIndexIconProps = {
  className?: string
  progress?: number
}

export function ScrollDrivenIndexIcon({ className, progress }: ScrollDrivenIndexIconProps) {
  const uid = useId().replace(/:/g, '')
  const maskBaseId = `scroll-driven-index-mask-base-${uid}`
  const maskLinesId = `scroll-driven-index-mask-lines-${uid}`
  const clampedProgress = Math.min(Math.max(progress ?? 0, 0), 100)
  const pathLength = 1.025
  const strokeDashoffset = pathLength - (pathLength * clampedProgress) / 100

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <mask
        id={maskBaseId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="2"
        width="24"
        height="20"
      >
        <path
          d="M3 6.75L19.0541 6.75L21.027 6.75H23.0135L23 3.5L1 3.5L1 12L23 12L23.0135 21L1 21L1 17.25L13 17.25"
          strokeWidth="2.5"
          stroke="gray"
        />
      </mask>
      <g mask={`url(#${maskBaseId})`}>
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          fill="gray"
        />
      </g>
      <mask
        id={maskLinesId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="2"
        width="24"
        height="20"
      >
        <path
          d="M3 6.75L19.0541 6.75L21.027 6.75H23.0135L23 3.5L1 3.5L1 12L23 12L23.0135 21L1 21L1 17.25L13 17.25"
          stroke="white"
          strokeWidth="2.5"
          pathLength={pathLength}
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
        />
      </mask>
      <g mask={`url(#${maskLinesId})`}>
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          fill="white"
        />
      </g>
    </svg>
  )
}
