import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { badgeDashedBorderVariants, badgeVariants } from './badge-variants'

function Badge({
  className,
  variant,
  size,
  hasDashedBorder = false,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    hasDashedBorder?: boolean
  }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        hasDashedBorder && badgeDashedBorderVariants({ variant }),
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
export type { VariantProps }
