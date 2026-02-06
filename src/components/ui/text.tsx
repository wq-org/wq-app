import * as React from 'react'

import { cn } from '../../lib/utils'
import { textVariants, type TextVariants } from './text-variants'

export type TextProps<T extends React.ElementType = 'p'> = {
  as?: T
  className?: string
} & TextVariants &
  Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>

function Text<T extends React.ElementType = 'p'>({
  as,
  size,
  color,
  font,
  className,
  ...props
}: TextProps<T>) {
  const Component = as || 'p'

  return (
    <Component
      className={cn(textVariants({ size, color, font }), className)}
      {...props}
    />
  )
}

export { Text }
