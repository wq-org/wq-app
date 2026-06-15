import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const imagePinVariants = cva('rounded-full border-2 border-white animate-pulse relative', {
  variants: {
    variant: {
      // Neutral by default: visible in light and dark mode, no off-palette blue.
      default: 'bg-neutral-600 dark:bg-neutral-300',
      secondary: 'bg-secondary',
      correct: 'bg-blue-400',
      wrong: 'bg-red-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const pingVariants = cva(
  'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
  {
    variants: {
      variant: {
        default: 'bg-neutral-600 dark:bg-neutral-300',
        secondary: 'bg-neutral-600 dark:bg-neutral-300',
        correct: 'bg-blue-400',
        wrong: 'bg-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type ImagePinProps = React.ComponentPropsWithRef<'div'> &
  VariantProps<typeof imagePinVariants> & {
    size?: number
  }

export function ImagePin({ className, variant, size = 24, style, ref, ...props }: ImagePinProps) {
  return (
    <div
      ref={ref}
      data-pin
      className={cn(imagePinVariants({ variant }), className)}
      style={{
        ...style,
        width: `${size}px`,
        height: `${size}px`,
      }}
      {...props}
    >
      <Text
        as="span"
        variant="small"
        className={cn(pingVariants({ variant }))}
      />
    </div>
  )
}
