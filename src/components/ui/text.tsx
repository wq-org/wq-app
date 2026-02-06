import * as React from 'react'

import { cn } from '../../lib/utils'
import { textVariants, type TextVariants } from './text-variants'

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small'

const variantMap: Record<TextVariant, Partial<TextVariants>> = {
  h1: { size: '4xl' },
  h2: { size: '3xl' },
  h3: { size: '2xl' },
  body: { size: 'base' },
  small: { size: 'sm' },
}

export type TextProps<T extends React.ElementType = 'p'> = {
  as?: T
  className?: string
  variant?: TextVariant
} & TextVariants &
  Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>

function Text<T extends React.ElementType = 'p'>({
  as,
  variant,
  size,
  color,
  font,
  className,
  ...props
}: TextProps<T>) {
  const Component = as || 'p'
  const mapped = variant ? variantMap[variant] : {}

  return (
    <Component
      className={cn(
        textVariants({
          size: mapped.size ?? size,
          color,
          font,
        }),
        className,
      )}
      {...props}
    />
  )
}

export { Text }