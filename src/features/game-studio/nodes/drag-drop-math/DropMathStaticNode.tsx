import { cn } from '@/lib/utils'

import { canvasDropNodeCompactGhostClass, mathNodeShellVariants } from './drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
import type { MathTokenShellState } from './math-token-shell.types'

export type DropMathStaticNodeProps = {
  value: string
  mathShell?: MathTokenShellState
  className?: string
  /** Narrower chip for the equals sign. */
  compact?: boolean
}

/**
 * Animation that plays on every fresh mount of `=` and result chips,
 * so authors see a swoop-in confirmation when Enter completes an equation.
 * Re-mount on value change is driven by the React key set in {@link CanvasRow}.
 */
const STATIC_MATH_CHIP_ENTRANCE_CLASS =
  'animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ease-out'

/** Non-interactive math badge (`=` or computed result). */
export function DropMathStaticNode({
  value,
  mathShell = 'default',
  className,
  compact = false,
}: DropMathStaticNodeProps) {
  const resolvedState = mathShell === 'ghost' ? 'ghost' : 'disabled'
  const shellClassName = cn(
    mathNodeShellVariants({ state: resolvedState }),
    (compact || mathShell === 'ghost') && canvasDropNodeCompactGhostClass,
    'select-none',
    STATIC_MATH_CHIP_ENTRANCE_CLASS,
    className,
  )

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="math"
        data-state={resolvedState}
        data-math-shell={mathShell}
        aria-hidden={compact}
      >
        <span className="min-w-[1ch]">{value}</span>
      </span>
    </MathNodeSingleLineShell>
  )
}
