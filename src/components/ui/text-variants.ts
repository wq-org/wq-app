import { cva, type VariantProps } from 'class-variance-authority'

export const textVariants = cva('font-sans', {
  variants: {
    size: {
      xxs: 'text-[10px] leading-3.5',
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    color: {
      default: 'text-semantic-text',
      muted: 'text-semantic-muted',
      primary: 'text-semantic-primary',
      danger: 'text-semantic-danger',
      violet: 'text-[oklch(var(--oklch-violet))]',
      indigo: 'text-[oklch(var(--oklch-indigo))]',
      blue: 'text-[oklch(var(--oklch-blue))]',
      cyan: 'text-[oklch(var(--oklch-cyan))]',
      teal: 'text-[oklch(var(--oklch-teal))]',
      green: 'text-[oklch(var(--oklch-green))]',
      lime: 'text-[oklch(var(--oklch-lime))]',
      orange: 'text-[oklch(var(--oklch-orange))]',
      pink: 'text-[oklch(var(--oklch-pink))]',
      darkblue: 'text-[oklch(var(--oklch-darkblue))]',
    },
    font: {
      default: 'font-sans',
      satoshi: 'font-satoshi',
      inter: 'font-inter',
      mono: 'font-mono',
    },
  },
  defaultVariants: {
    size: 'base',
    color: 'default',
    font: 'default',
  },
})

export type TextVariants = VariantProps<typeof textVariants>
