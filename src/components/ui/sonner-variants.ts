import { cva, type VariantProps } from 'class-variance-authority'

export const toastVariants = cva(
  'rounded-lg border shadow-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-black text-white',
        secondary: 'border-border bg-white text-black',
        danger: 'border-transparent bg-orange-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const cancelButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      canDismiss: {
        true: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        false: 'hidden',
      },
    },
    defaultVariants: {
      canDismiss: false,
    },
  },
)

export type ToastVariants = VariantProps<typeof toastVariants>
export type CancelButtonVariants = VariantProps<typeof cancelButtonVariants>
