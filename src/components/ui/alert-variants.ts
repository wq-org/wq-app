import { cva } from 'class-variance-authority'

export const alertVariants = cva('cn-alert group/alert relative w-full', {
  variants: {
    variant: {
      default: 'cn-alert-variant-default',
      destructive: 'cn-alert-variant-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
