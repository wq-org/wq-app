import { cn } from '@/lib/utils'

import type { CurvedScrollbarContentProps } from './curved-scrollbar.types'

export function CurvedScrollbarContent({
  children,
  className,
}: CurvedScrollbarContentProps) {
  return (
    <main
      data-slot="curved-scrollbar-content"
      className={cn('curved-scrollbar__content', className)}
    >
      {children}
    </main>
  )
}
