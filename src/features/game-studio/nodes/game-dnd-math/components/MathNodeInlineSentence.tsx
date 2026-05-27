import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type MathNodeInlineSentenceProps = {
  children: ReactNode
  className?: string
}

/** Flowing sentence row for static copy plus inline {@link MathNode} tokens. */
export function MathNodeInlineSentence({ children, className }: MathNodeInlineSentenceProps) {
  return (
    <p className={cn('text-base leading-relaxed text-muted-foreground', className)}>{children}</p>
  )
}

export type MathNodeSentenceTextProps = {
  children: ReactNode
}

/** Static phrase segment between math nodes; wraps at word boundaries only. */
export function MathNodeSentenceText({ children }: MathNodeSentenceTextProps) {
  return <span className="inline">{children}</span>
}
