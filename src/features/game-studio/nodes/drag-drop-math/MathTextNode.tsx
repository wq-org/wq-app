import { Type } from 'lucide-react'

import { cn } from '@/lib/utils'

import { textNodeShellVariants } from './drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'

export type MathTextNodeProps = {
  value: string
  onValueChange?: (value: string) => void
  className?: string
  /** Palette strip only — Type icon beside label. */
  showPaletteIcon?: boolean
}

/** Palette text chip — inactive visual with optional Type icon. */
export function MathTextNode({ value, className, showPaletteIcon = false }: MathTextNodeProps) {
  const shellClassName = cn(textNodeShellVariants({ state: 'inactive' }), className)

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="text"
        data-state="inactive"
      >
        {showPaletteIcon ? (
          <Type
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : null}
        <span>{value}</span>
      </span>
    </MathNodeSingleLineShell>
  )
}
