import { cn } from '@/lib/utils'

const positionClasses = {
  'top-left': '-top-px -left-px',
  'top-right': '-top-px -right-px',
  'bottom-left': '-bottom-px -left-px',
  'bottom-right': '-bottom-px -right-px',
} as const

type DecorIconPosition = keyof typeof positionClasses

type DecorIconProps = {
  position: DecorIconPosition
  className?: string
}

export function DecorIcon({ position, className }: DecorIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute size-4 text-border',
        positionClasses[position],
        className,
      )}
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
    </span>
  )
}
