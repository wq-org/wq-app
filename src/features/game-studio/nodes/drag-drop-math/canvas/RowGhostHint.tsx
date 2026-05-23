import { cn } from '@/lib/utils'

export type RowGhostHintProps = {
  /** A token-like drag is in progress and this gap is a valid target. */
  isVisible: boolean
  /** The pointer is currently inside this gap's drop rect. */
  isOver: boolean
}

/** Dashed blue rectangle that previews where a new row would land. */
export function RowGhostHint({ isVisible, isOver }: RowGhostHintProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'h-full w-full rounded-md border-2 border-dashed transition-all duration-150',
        !isVisible && 'border-transparent opacity-0',
        isVisible && !isOver && 'border-blue-400/40 bg-transparent opacity-100',
        isVisible && isOver && 'border-blue-500/70 bg-blue-500/10 opacity-100',
      )}
    />
  )
}
