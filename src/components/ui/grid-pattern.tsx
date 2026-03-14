import { cn } from '@/lib/utils'
import { useId } from 'react'

type GridPatternProps = {
  width?: number
  height?: number
  x?: number
  y?: number
  squares?: [number, number][]
  strokeDasharray?: string
  className?: string
  [key: string]: unknown
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  squares,
  className,
  ...props
}: GridPatternProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-current stroke-current text-border/55 dark:text-border/35',
        className,
      )}
      {...(props as React.SVGProps<SVGSVGElement>)}
    >
      <defs>
        <pattern
          height={height}
          id={id}
          patternUnits="userSpaceOnUse"
          width={width}
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect
        fill={`url(#${id})`}
        height="100%"
        strokeWidth={0}
        width="100%"
      />
      {squares && (
        <svg
          aria-label="Grid squares"
          className="overflow-visible"
          role="img"
          x={x}
          y={y}
        >
          {squares.map(([sx, sy], index) => (
            <rect
              height={height - 1}
              key={`${sx}-${sy}-${index}`}
              strokeWidth="0"
              width={width - 1}
              x={sx * width + 1}
              y={sy * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
