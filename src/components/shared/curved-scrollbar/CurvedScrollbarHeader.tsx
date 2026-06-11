import { cn } from '@/lib/utils'

import type { CurvedScrollbarHeaderProps } from './curved-scrollbar.types'

export function CurvedScrollbarHeader({
  children,
  className,
}: CurvedScrollbarHeaderProps) {
  return (
    <header
      data-slot="curved-scrollbar-header"
      className={cn('curved-scrollbar__header', className)}
    >
      {children}
    </header>
  )
}
