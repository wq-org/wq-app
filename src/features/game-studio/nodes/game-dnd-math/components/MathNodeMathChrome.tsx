import { Cuboid } from 'lucide-react'

import { cn } from '@/lib/utils'

export type MathNodeMathChromeProps = {
  label: string
  className?: string
}

/** Static palette chip: cuboid icon + label; UI chrome uses Satoshi, not equation font. */
export function MathNodeMathChrome({ label, className }: MathNodeMathChromeProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-satoshi', className)}>
      <Cuboid
        className="size-4 shrink-0"
        aria-hidden
      />
      <span>{label}</span>
    </span>
  )
}
