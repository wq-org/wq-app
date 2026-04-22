import { cva } from 'class-variance-authority'

export const dividerVariants = cva('shrink-0 rounded-full', {
  variants: {
    color: {
      black: 'bg-black',
      default: 'bg-primary',
      destructive: 'bg-destructive',
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      invert: 'bg-invert',
      secondary: 'bg-secondary',
      darkblue: 'bg-blue-500',
      violet: 'bg-[oklch(var(--oklch-violet))]',
      indigo: 'bg-[oklch(var(--oklch-indigo))]',
      blue: 'bg-[oklch(var(--oklch-blue))]',
      cyan: 'bg-[oklch(var(--oklch-cyan))]',
      teal: 'bg-[oklch(var(--oklch-teal))]',
      green: 'bg-[oklch(var(--oklch-green))]',
      lime: 'bg-[oklch(var(--oklch-lime))]',
      orange: 'bg-[oklch(var(--oklch-orange))]',
      pink: 'bg-[oklch(var(--oklch-pink))]',
    },
    orientation: {
      horizontal: 'w-full',
      vertical: 'h-full',
    },
    thickness: {
      '1': '',
      '2': '',
      '3': '',
      '4': '',
      '5': '',
    },
  },
  defaultVariants: {
    color: 'black',
    orientation: 'horizontal',
    thickness: '1',
  },
})
