import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'

import { tickContentVariants } from '@/components/ui/tick-variants'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const TICKS_PADDING_X = '0.625rem'

type TickTrackProps = ComponentProps<'div'>

function TickTrack({ className, ...props }: TickTrackProps) {
  return (
    <div
      data-slot="tick-track"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

type TickContentsProps = ComponentProps<'div'>

function TickContents({ className, ...props }: TickContentsProps) {
  return (
    <div
      data-slot="tick-contents"
      className={cn('flex w-full flex-col gap-2 pt-3', className)}
      {...props}
    />
  )
}

type TicksProps = ComponentProps<'span'>

function Ticks({ className, ...props }: TicksProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="ticks"
      className={cn(
        'text-muted-foreground flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}

type TickMarkProps = ComponentProps<'span'> & {
  minor?: boolean
}

function TickMark({ className, minor = false, ...props }: TickMarkProps) {
  return (
    <span
      data-slot="tick-mark"
      className={cn('bg-muted-foreground/70 h-1 w-px', minor && 'h-0.5', className)}
      {...props}
    />
  )
}

type TickLabelProps = ComponentProps<'span'> & {
  hidden?: boolean
}

function TickLabel({ className, hidden = false, ...props }: TickLabelProps) {
  return (
    <span
      data-slot="tick-label"
      className={cn(hidden && 'opacity-0', className)}
      {...props}
    />
  )
}

type TickSeparatorProps = ComponentProps<typeof Separator>

function TickSeparator({ className, orientation = 'vertical', ...props }: TickSeparatorProps) {
  return (
    <Separator
      data-slot="tick-separator"
      orientation={orientation}
      className={cn(
        'data-[orientation=vertical]:h-6 data-[orientation=vertical]:bg-border/80',
        className,
      )}
      {...props}
    />
  )
}

type TickProps = Omit<ComponentProps<'span'>, 'children'> & {
  children?: ComponentProps<'span'>['children']
  minor?: boolean
  hideLabel?: boolean
  markClassName?: string
  labelClassName?: string
}

function Tick({
  className,
  children,
  minor = false,
  hideLabel = false,
  markClassName,
  labelClassName,
  ...props
}: TickProps) {
  const shouldHideLabel = hideLabel || children === undefined || children === null

  return (
    <span
      data-slot="tick"
      className={cn('flex w-0 flex-col items-center justify-center gap-2', className)}
      {...props}
    >
      <TickMark
        minor={minor}
        className={markClassName}
      />
      <TickLabel
        hidden={shouldHideLabel}
        className={labelClassName}
      >
        {children}
      </TickLabel>
    </span>
  )
}

type TickContentProps = ComponentProps<'div'> &
  VariantProps<typeof tickContentVariants> & {
    start: number
    end: number
    min: number
    max: number
  }

function TickContent({
  className,
  start,
  end,
  min,
  max,
  variant,
  style,
  ...props
}: TickContentProps) {
  const totalRange = max - min
  const safeRange = totalRange > 0 ? totalRange : 1
  const clampedStart = Math.min(Math.max(start, min), max)
  const clampedEnd = Math.min(Math.max(end, min), max)
  const orderedStart = Math.min(clampedStart, clampedEnd)
  const orderedEnd = Math.max(clampedStart, clampedEnd)
  const leftRatio = (orderedStart - min) / safeRange
  const widthRatio = (orderedEnd - orderedStart) / safeRange

  return (
    <div
      data-slot="tick-content-row"
      className="relative w-full shrink-0"
    >
      <div
        data-slot="tick-content"
        className={cn(tickContentVariants({ variant }), className)}
        style={{
          marginLeft: `calc(${TICKS_PADDING_X} + (100% - ${TICKS_PADDING_X} * 2) * ${leftRatio})`,
          width: `calc((100% - ${TICKS_PADDING_X} * 2) * ${widthRatio})`,
          ...style,
        }}
        {...props}
      />
    </div>
  )
}

export { Tick, TickContent, TickContents, TickLabel, TickMark, TickSeparator, TickTrack, Ticks }
