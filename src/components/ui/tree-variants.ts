'use client'

import { cva } from 'class-variance-authority'

export const treeVariants = cva('w-full rounded-3xl border border-border bg-background', {
  variants: {
    variant: {
      default: '',
      outline: 'border-2',
      ghost: 'border-transparent bg-transparent',
    },
    size: {
      sm: 'text-sm',
      default: '',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export const treeItemVariants = cva(
  'group relative flex cursor-pointer select-none items-center rounded-[calc(var(--card-radius)-8px)] px-3 py-2 outline-none transition-colors motion-safe:duration-200',
  {
    variants: {
      variant: {
        default:
          'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        ghost: 'hover:bg-accent/50',
        subtle: 'hover:bg-muted/50',
      },
      selected: {
        true: 'bg-accent text-accent-foreground',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      selected: false,
    },
  },
)
