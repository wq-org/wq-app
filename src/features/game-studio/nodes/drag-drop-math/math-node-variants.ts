import { cva } from 'class-variance-authority'

export const mathNodeVariants = cva(
  [
    'inline-flex min-w-[1.5ch] items-center rounded-md whitespace-nowrap',
    'text-sm leading-snug outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-gray-400/20 px-1.5 py-0.5 text-foreground',
        ghost: 'bg-transparent px-0.5 py-0.5 text-muted-foreground/50',
      },
      editing: {
        true: [
          'cursor-text font-normal caret-blue-500',
          'selection:bg-blue-200 selection:text-slate-900',
          'dark:selection:bg-blue-900 dark:selection:text-white',
        ].join(' '),
        false: 'font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      editing: false,
    },
  },
)
