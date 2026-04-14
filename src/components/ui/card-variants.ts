import { cva } from 'class-variance-authority'

export const cardVariants = cva('rounded-2xl border shadow-sm', {
  variants: {
    variant: {
      default: 'bg-card ring-1 ring-black/5',
      soft: 'bg-muted/50 ring-1 ring-black/5',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
