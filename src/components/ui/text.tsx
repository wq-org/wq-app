import * as React from 'react'

import { cn } from '../../lib/utils'
import { textVariants, type TextVariants } from './text-variants'

type TextSemanticVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small'
type TextColorVariant =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'darkblue'

type TextVariant = TextSemanticVariant | TextColorVariant

const semanticVariantMap: Record<TextSemanticVariant, Partial<TextVariants>> = {
  h1: { size: '4xl' },
  h2: { size: '3xl' },
  h3: { size: '2xl' },
  body: { size: 'base' },
  small: { size: 'sm' },
}

const colorVariantMap: Record<TextColorVariant, NonNullable<TextVariants['color']>> = {
  violet: 'violet',
  indigo: 'indigo',
  blue: 'blue',
  cyan: 'cyan',
  teal: 'teal',
  green: 'green',
  lime: 'lime',
  orange: 'orange',
  pink: 'pink',
  darkblue: 'darkblue',
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
  const semanticVariant =
    variant && variant in semanticVariantMap
      ? semanticVariantMap[variant as TextSemanticVariant]
      : {}
  const mappedColor =
    variant && variant in colorVariantMap ? colorVariantMap[variant as TextColorVariant] : undefined

  return (
    <Component
      className={cn(
        textVariants({
          size: semanticVariant.size ?? size,
          color: mappedColor ?? color,
          font,
        }),
        className,
      )}
      {...props}
    />
  )
}

export { Text }
