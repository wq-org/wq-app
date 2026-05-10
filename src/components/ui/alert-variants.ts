import { cva } from 'class-variance-authority'

export const alertVariants = cva('cn-alert group/alert relative w-full', {
  variants: {
    variant: {
      default: 'cn-alert-variant-default',
      destructive: 'cn-alert-variant-destructive',
      blue: 'cn-alert-variant-blue',
      orange: 'cn-alert-variant-orange',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
