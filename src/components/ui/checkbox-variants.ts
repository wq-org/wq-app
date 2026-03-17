import { cva } from 'class-variance-authority'

export const checkboxVariants = cva(
  'peer size-4 shrink-0 rounded-lg border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary',
        darkblue:
          'border-input dark:bg-input/30 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:border-blue-500 hover:border-blue-400 data-[state=checked]:hover:bg-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
