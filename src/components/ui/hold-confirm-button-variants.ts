import { cva } from 'class-variance-authority'

export const holdConfirmButtonVariants = cva('', {
  variants: {
    variant: {
      darkblue:
        'text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 hover:duration-200 active:animate-in active:zoom-in-95',
      orange:
        'text-[oklch(var(--oklch-orange))] border-0 hover:opacity-80 hover:bg-[oklch(var(--oklch-orange)/0.12)] hover:text-[oklch(var(--oklch-orange))] hover:duration-200 active:animate-in active:zoom-in-95',
      default:
        'text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 hover:duration-200 active:animate-in active:zoom-in-95',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const holdConfirmProgressVariants = cva('', {
  variants: {
    variant: {
      darkblue: 'bg-blue-200',
      orange: 'bg-[oklch(var(--oklch-orange)/0.24)]',
      default: 'bg-blue-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const holdConfirmContentVariants = cva('', {
  variants: {
    variant: {
      darkblue: 'text-blue-600',
      orange: 'text-[oklch(var(--oklch-orange))]',
      default: 'text-blue-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
