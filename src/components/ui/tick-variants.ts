import { cva } from 'class-variance-authority'

export const tickContentVariants = cva(
  'box-border rounded-md border border-dashed bg-muted/40 px-2 py-1 text-xs text-foreground',
  {
    variants: {
      variant: {
        default: '',
        teal: 'border-[oklch(var(--oklch-teal)/0.35)] bg-[oklch(var(--oklch-teal)/0.12)] text-[oklch(var(--oklch-teal))]',
        indigo:
          'border-[oklch(var(--oklch-indigo)/0.35)] bg-[oklch(var(--oklch-indigo)/0.12)] text-[oklch(var(--oklch-indigo))]',
        blue: 'border-[oklch(var(--oklch-blue)/0.35)] bg-[oklch(var(--oklch-blue)/0.12)] text-[oklch(var(--oklch-blue))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
