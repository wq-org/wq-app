import { cva } from 'class-variance-authority'

export const sparkleButtonVariants = cva('sparkle-button', {
  variants: {
    hue: {
      violet: 'sparkle-button--violet',
      indigo: 'sparkle-button--indigo',
      blue: 'sparkle-button--blue',
      cyan: 'sparkle-button--cyan',
      teal: 'sparkle-button--teal',
      green: 'sparkle-button--green',
      pink: 'sparkle-button--pink',
      orange: 'sparkle-button--orange',
    },
    size: {
      sm: 'sparkle-button--sm',
      default: 'sparkle-button--default',
      lg: 'sparkle-button--lg',
    },
  },
  defaultVariants: {
    hue: 'violet',
    size: 'default',
  },
})
