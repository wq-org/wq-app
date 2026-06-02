import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type MathNodeSingleLineShellProps = {
  children: ReactNode
  className?: string
}

/**
 * Prevents a MathNode badge from wrapping mid-word or mid-character.
 * Wrap every {@link MathNode} in inline sentence layouts for readable tokens.
 */
export function MathNodeSingleLineShell({ children, className }: MathNodeSingleLineShellProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-max shrink-0 whitespace-nowrap [overflow-wrap:normal] [word-break:keep-all]',
        className,
      )}
    >
      {children}
    </span>
  )
}
