import { Sigma } from 'lucide-react'

import { cn } from '@/lib/utils'

import { mathNodeShellVariants } from '../constants/drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'

export type SigmaNodeProps = {
  label: string
  className?: string
  /** Palette strip: orange static chip with Σ icon + label. */
  paletteMode?: boolean
}

export const sigmaOrangeClassName =
  'bg-orange-100! text-orange-600! dark:bg-orange-950/80! dark:text-orange-400!' as const

/** Palette Σ chip and compact sigma badge (canvas rows use {@link SigmaCanvasRow}). */
export function SigmaNode({ label, className, paletteMode = false }: SigmaNodeProps) {
  const shellState = paletteMode ? 'inactive' : 'ghost'

  return (
    <MathNodeSingleLineShell>
      <span
        className={cn(
          mathNodeShellVariants({ state: shellState }),
          paletteMode && sigmaOrangeClassName,
          paletteMode && 'pointer-events-none select-none',
          className,
        )}
        data-node="sigma"
        data-state={shellState}
      >
        <span className="inline-flex items-center gap-2 font-satoshi">
          <Sigma
            className="size-4 shrink-0"
            aria-hidden
          />
          <span className="truncate">{label}</span>
        </span>
      </span>
    </MathNodeSingleLineShell>
  )
}
