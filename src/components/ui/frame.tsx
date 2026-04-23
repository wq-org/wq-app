import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * CSS variable architecture for FramePanel theming:
 *
 * The Frame parent sets --frame-panel-bg and --frame-panel-border-color.
 * FramePanel consumes them directly via bg-(--frame-panel-bg) and
 * border-(--frame-panel-border-color). This means:
 *
 *   - variant="inverse" overrides those vars on Frame → all panels pick it up
 *   - <FramePanel className="bg-blue-50"> adds a direct utility on the element
 *     which wins over bg-(--frame-panel-bg) by Tailwind source order — no
 *     :not() or !important needed
 */
import { frameVariants } from './frame-variants'

function Frame({
  className,
  variant,
  spacing,
  stacked,
  dense,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof frameVariants>) {
  return (
    <div
      className={cn(frameVariants({ variant, spacing, stacked, dense }), className)}
      data-slot="frame"
      data-spacing={spacing}
      {...props}
    />
  )
}

function FramePanel({ className, fit, ...props }: React.ComponentProps<'div'> & { fit?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-(--frame-radius) border border-(--frame-panel-border-color) bg-(--frame-panel-bg) bg-clip-padding shadow-xs',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--frame-radius)-1px)] before:shadow-black/5',
        'dark:bg-clip-border dark:before:shadow-white/5',
        'p-(--frame-panel-p)',
        fit ? 'grow basis-0' : 'grow',
        className,
      )}
      data-slot="frame-panel"
      data-fit={fit ? 'true' : undefined}
      {...props}
    />
  )
}

function FrameHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      className={cn(
        'flex flex-col px-(--frame-panel-header-px) py-(--frame-panel-header-py)',
        className,
      )}
      data-slot="frame-panel-header"
      {...props}
    />
  )
}

function FrameTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-sm font-semibold', className)}
      data-slot="frame-panel-title"
      {...props}
    />
  )
}

function FrameDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="frame-panel-description"
      {...props}
    />
  )
}

function FrameFooter({ className, ...props }: React.ComponentProps<'footer'>) {
  return (
    <footer
      className={cn(
        'flex flex-col gap-1 px-(--frame-panel-footer-px) py-(--frame-panel-footer-py)',
        className,
      )}
      data-slot="frame-panel-footer"
      {...props}
    />
  )
}

export { Frame, FramePanel, FrameHeader, FrameTitle, FrameDescription, FrameFooter }
