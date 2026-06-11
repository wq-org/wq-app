import { cn } from '@/lib/utils'

import type { CurvedTextProps } from './curved-scrollbar.types'

export function CurvedText({
  children,
  variant = 'body',
  className,
}: CurvedTextProps) {
  return (
    <p
      data-slot="curved-text"
      data-variant={variant}
      className={cn(
        'curved-scrollbar__text',
        `curved-scrollbar__text--${variant}`,
        className,
      )}
    >
      {children}
    </p>
  )
}
