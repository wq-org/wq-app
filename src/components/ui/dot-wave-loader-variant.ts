import { cva } from 'class-variance-authority'

/**
 * Dot fills aligned with `button-variants` variant names.
 * `default` and `dark` both use `primary` so the loader follows light/dark theme (no literal white/black dots).
 */
export const dotWaveVariants = cva('h-2.5 w-2.5 animate-bounce rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary',
      dark: 'bg-primary',
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
