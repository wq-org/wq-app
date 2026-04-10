import { cva } from 'class-variance-authority'

export const switchVariants = cva(
  'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
  {
    variants: {
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
      color: 'default',
    },
  },
)
