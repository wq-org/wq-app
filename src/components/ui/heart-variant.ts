import { cva, type VariantProps } from 'class-variance-authority'

export const heartVariants = cva(
  'shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
  {
    variants: {
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary-foreground',
        violet: 'text-[oklch(var(--oklch-violet))]',
        indigo: 'text-[oklch(var(--oklch-indigo))]',
        blue: 'text-[oklch(var(--oklch-blue))]',
        darkblue: 'text-[oklch(var(--oklch-darkblue))]',
        cyan: 'text-[oklch(var(--oklch-cyan))]',
        teal: 'text-[oklch(var(--oklch-teal))]',
        green: 'text-[oklch(var(--oklch-green))]',
        lime: 'text-[oklch(var(--oklch-lime))]',
        orange: 'text-[oklch(var(--oklch-orange))]',
        pink: 'text-[oklch(var(--oklch-pink))]',
        destructive: 'text-destructive',
        outline: 'text-foreground',
      },
      size: {
        default: 'size-4',
        lg: 'size-5',
        xl: 'size-6',
        '2xl': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'violet',
      size: 'default',
    },
  },
)

export type HeartVariantProps = VariantProps<typeof heartVariants>
