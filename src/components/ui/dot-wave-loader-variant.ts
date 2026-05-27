import { cva } from 'class-variance-authority'

/**
 * Dot fills aligned with `button-variants` / chat-bubble variant names where they overlap.
 * `default` uses semantic foreground so loaders stay visible on neutral chat bubbles (light + dark).
 */
export const dotWaveVariants = cva('h-2.5 w-2.5 animate-bounce rounded-full', {
  variants: {
    variant: {
      default: 'bg-muted-foreground',
      dark: 'bg-neutral-50',
      destructive: 'bg-destructive',
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      invert: 'bg-invert',
      outline: 'bg-foreground',
      secondary: 'bg-secondary-foreground',
      ghost: 'bg-muted-foreground',
      link: 'bg-primary',
      delete: 'bg-red-500',
      confirm: 'bg-blue-500',
      active: 'bg-emerald-600',
      darkblue: 'bg-[oklch(var(--oklch-darkblue))]',
      violet: 'bg-[oklch(var(--oklch-violet))]',
      indigo: 'bg-[oklch(var(--oklch-indigo))]',
      blue: 'bg-[oklch(var(--oklch-blue))]',
      cyan: 'bg-[oklch(var(--oklch-cyan))]',
      teal: 'bg-[oklch(var(--oklch-teal))]',
      green: 'bg-[oklch(var(--oklch-green))]',
      lime: 'bg-[oklch(var(--oklch-lime))]',
      orange: 'bg-[oklch(var(--oklch-orange))]',
      pink: 'bg-[oklch(var(--oklch-pink))]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
