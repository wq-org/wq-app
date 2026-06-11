import { cn } from '@/lib/utils'

import type { CurvedScrollbarFooterProps } from './curved-scrollbar.types'

export function CurvedScrollbarFooter({
  children,
  className,
}: CurvedScrollbarFooterProps) {
  return (
    <footer
      data-slot="curved-scrollbar-footer"
      className={cn('curved-scrollbar__footer', className)}
    >
      {children}
    </footer>
  )
}
