'use client'

import { cva } from 'class-variance-authority'

export const ratingVariants = cva('flex items-center', {
  variants: {
    size: {
      sm: 'gap-2',
      default: 'gap-2.5',
      lg: 'gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const starWrapVariants = cva('relative inline-flex items-center justify-center', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const starIconVariants = cva('', {
  variants: {
    size: {
      sm: 'w-4 h-4',
      default: 'w-5 h-5',
      lg: 'w-6 h-6',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export const valueVariants = cva('text-muted-foreground w-5 tabular-nums', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
