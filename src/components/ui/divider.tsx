import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { dividerVariants } from './divider-variants'

type DividerProps = {
  thickness?: 1 | 2 | 3 | 4 | 5
  orientation?: 'horizontal' | 'vertical'
  color?: VariantProps<typeof dividerVariants>['color']
  lengthClassName?: string
  className?: string
}

export function Divider({
  thickness = 1,
  orientation = 'horizontal',
  color = 'black',
  lengthClassName,
  className,
}: DividerProps) {
  const normalizedThickness = Math.min(5, Math.max(1, thickness))
  const resolvedLengthClassName =
    lengthClassName ?? (orientation === 'horizontal' ? 'w-full' : 'h-full')

  return (
    <div
      className={cn(
        dividerVariants({
          orientation,
          color,
          thickness: String(normalizedThickness) as '1' | '2' | '3' | '4' | '5',
        }),
        resolvedLengthClassName,
        className,
      )}
      style={
        orientation === 'horizontal'
          ? { height: `${normalizedThickness}px` }
          : { width: `${normalizedThickness}px` }
      }
    />
  )
}
