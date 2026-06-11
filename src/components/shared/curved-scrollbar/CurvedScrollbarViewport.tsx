import { cn } from '@/lib/utils'

import { useCurvedScrollbarContext } from './curved-scrollbar-context'
import type { CurvedScrollbarViewportProps } from './curved-scrollbar.types'

export function CurvedScrollbarViewport({
  children,
  className,
}: CurvedScrollbarViewportProps) {
  const { viewportRef } = useCurvedScrollbarContext()

  return (
    <div
      ref={viewportRef}
      data-slot="curved-scrollbar-viewport"
      className={cn('curved-scrollbar__viewport', className)}
    >
      {children}
    </div>
  )
}
