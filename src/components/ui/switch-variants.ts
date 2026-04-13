import { cva } from 'class-variance-authority'

const switchTrackBase =
  'peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80'

const switchThumbBase =
  'pointer-events-none block rounded-full ring-0 transition-transform data-[state=unchecked]:translate-x-0 bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground'

export const switchVariants = cva(switchTrackBase, {
  variants: {
    size: {
      xs: 'h-3 w-6 min-h-3',
      sm: 'h-3.5 w-7 min-h-3.5',
      md: 'h-[1.15rem] w-8 min-h-[1.15rem]',
      lg: 'h-5 w-10 min-h-5',
      xl: 'h-6 w-12 min-h-6',
    },
    color: {
      default: 'data-[state=checked]:bg-primary',
      violet: 'data-[state=checked]:bg-[oklch(var(--oklch-violet))]',
      indigo: 'data-[state=checked]:bg-[oklch(var(--oklch-indigo))]',
      blue: 'data-[state=checked]:bg-[oklch(var(--oklch-blue))]',
      cyan: 'data-[state=checked]:bg-[oklch(var(--oklch-cyan))]',
      teal: 'data-[state=checked]:bg-[oklch(var(--oklch-teal))]',
      green: 'data-[state=checked]:bg-[oklch(var(--oklch-green))]',
      lime: 'data-[state=checked]:bg-[oklch(var(--oklch-lime))]',
      orange: 'data-[state=checked]:bg-[oklch(var(--oklch-orange))]',
      pink: 'data-[state=checked]:bg-[oklch(var(--oklch-pink))]',
      darkblue: 'data-[state=checked]:bg-blue-500',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
})

/** Thumb size + checked translation; must stay in sync with `switchVariants` `size` track widths. */
export const switchThumbVariants = cva(switchThumbBase, {
  variants: {
    size: {
      xs: 'size-2.5 data-[state=checked]:translate-x-3',
      sm: 'size-3 data-[state=checked]:translate-x-3.5',
      md: 'size-4 data-[state=checked]:translate-x-[calc(100%-2px)]',
      lg: 'size-[1.125rem] data-[state=checked]:translate-x-5',
      xl: 'size-5 data-[state=checked]:translate-x-[1.625rem]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
