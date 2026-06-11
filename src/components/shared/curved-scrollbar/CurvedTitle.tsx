import { cn } from '@/lib/utils'

import type { CurvedTitleProps } from './curved-scrollbar.types'

export function CurvedTitle({ children, className }: CurvedTitleProps) {
  return (
    <h1 data-slot="curved-title" className={cn('curved-scrollbar__title', className)}>
      {children}
    </h1>
  )
}
