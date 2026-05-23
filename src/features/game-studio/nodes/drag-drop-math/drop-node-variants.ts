import { cva } from 'class-variance-authority'

const dropNodeShellBase = [
  'inline-flex min-w-0 max-w-full items-center whitespace-nowrap',
  'text-base leading-normal outline-none transition-[color,background-color,border-color,box-shadow,opacity]',
  'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
].join(' ')

export const mathNodeShellVariants = cva(dropNodeShellBase, {
  variants: {
    state: {
      default: 'gap-2 rounded-full px-3.5 py-2 font-medium bg-secondary text-primary',
      editing:
        'gap-2 rounded-full px-3.5 py-2 font-medium bg-blue-100 text-foreground dark:bg-blue-950/80',
      inactive:
        'gap-2 rounded-full px-3.5 py-2 font-medium bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400',
      disabled:
        'gap-2 rounded-full px-3.5 py-2 font-medium bg-secondary text-primary opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

export const textNodeShellVariants = cva(dropNodeShellBase, {
  variants: {
    state: {
      default: 'gap-2 px-2.5 py-1.5 font-semibold text-muted-foreground hover:text-foreground',
      editing:
        'gap-2 rounded-md border border-border bg-background/60 px-2.5 py-1.5 font-normal text-foreground shadow-xs',
      inactive:
        'gap-2 rounded-full border border-border bg-secondary px-2.5 py-1.5 font-semibold text-muted-foreground',
      disabled:
        'gap-2 px-2.5 py-1.5 font-semibold text-muted-foreground opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

export const dropNodeEditableVariants = cva('min-w-[1ch] outline-none', {
  variants: {
    state: {
      default: '',
      editing: [
        'cursor-text font-normal caret-blue-500',
        'selection:bg-blue-200 selection:text-slate-900',
        'dark:selection:bg-blue-900 dark:selection:text-white',
      ].join(' '),
      inactive: '',
      disabled: 'pointer-events-none',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})
