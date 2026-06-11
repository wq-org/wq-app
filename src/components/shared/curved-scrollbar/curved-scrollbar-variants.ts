import { cva } from 'class-variance-authority'

export const curvedScrollbarVariants = cva('curved-scrollbar', {
  variants: {
    size: {
      sm: 'curved-scrollbar--sm',
      default: 'curved-scrollbar--default',
      lg: 'curved-scrollbar--lg',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})
