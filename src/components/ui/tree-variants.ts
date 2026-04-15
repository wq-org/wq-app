'use client'

import { cva, type VariantProps } from 'class-variance-authority'

/** Icon text colors aligned with `button-variants` semantic ghost-style tokens (violet, indigo, …). */
const treeSemanticIconColorClasses = {
  default: 'text-muted-foreground',
  darkblue: 'text-blue-500',
  violet: 'text-[oklch(var(--oklch-violet))]',
  indigo: 'text-[oklch(var(--oklch-indigo))]',
  blue: 'text-[oklch(var(--oklch-blue))]',
  cyan: 'text-[oklch(var(--oklch-cyan))]',
  teal: 'text-[oklch(var(--oklch-teal))]',
  green: 'text-[oklch(var(--oklch-green))]',
  lime: 'text-[oklch(var(--oklch-lime))]',
  orange: 'text-[oklch(var(--oklch-orange))]',
  pink: 'text-[oklch(var(--oklch-pink))]',
} as const

export const treeFolderIconColorVariants = cva('', {
  variants: {
    folderColor: treeSemanticIconColorClasses,
  },
  defaultVariants: {
    folderColor: 'default',
  },
})

export const treeFileIconColorVariants = cva('', {
  variants: {
    fileColor: treeSemanticIconColorClasses,
  },
  defaultVariants: {
    fileColor: 'default',
  },
})

export type TreeFolderIconColor = NonNullable<
  VariantProps<typeof treeFolderIconColorVariants>['folderColor']
>
export type TreeFileIconColor = NonNullable<
  VariantProps<typeof treeFileIconColorVariants>['fileColor']
>

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
