import { getRegistryEntry } from '@/features/game-studio/nodes/_registry/GameNodeRegistry'
import type { GameNodeAccent } from '@/features/game-studio/nodes/_registry/game-node-registry.types'
import { cn } from '@/lib/utils'

const accentTileClasses: Record<GameNodeAccent, string> = {
  gray: 'border-gray-500/20 bg-gray-500/10 text-gray-500 dark:border-gray-400/30 dark:bg-gray-400/10 dark:text-gray-300',
  darkblue:
    'border-[oklch(var(--oklch-darkblue)/0.2)] bg-[oklch(var(--oklch-darkblue)/0.1)] text-[oklch(var(--oklch-darkblue))] dark:border-[oklch(var(--oklch-darkblue)/0.3)] dark:bg-[oklch(var(--oklch-darkblue)/0.12)] dark:text-[oklch(var(--oklch-darkblue))]',
  violet:
    'border-[oklch(var(--oklch-violet)/0.2)] bg-[oklch(var(--oklch-violet)/0.1)] text-[oklch(var(--oklch-violet))] dark:border-[oklch(var(--oklch-violet)/0.3)] dark:bg-[oklch(var(--oklch-violet)/0.12)] dark:text-[oklch(var(--oklch-violet))]',
  indigo:
    'border-[oklch(var(--oklch-indigo)/0.2)] bg-[oklch(var(--oklch-indigo)/0.1)] text-[oklch(var(--oklch-indigo))] dark:border-[oklch(var(--oklch-indigo)/0.3)] dark:bg-[oklch(var(--oklch-indigo)/0.12)] dark:text-[oklch(var(--oklch-indigo))]',
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300',
  cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-500 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300',
  teal: 'border-teal-500/20 bg-teal-500/10 text-teal-500 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300',
  green:
    'border-green-500/20 bg-green-500/10 text-green-500 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-300',
  lime: 'border-lime-500/20 bg-lime-500/10 text-lime-500 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300',
  orange:
    'border-orange-500/20 bg-orange-500/10 text-orange-500 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300',
  red: 'border-red-500/20 bg-red-500/10 text-red-500 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300',
  pink: 'border-pink-500/20 bg-pink-500/10 text-pink-500 dark:border-pink-400/30 dark:bg-pink-400/10 dark:text-pink-300',
}

type GameNodeRegistryIconProps = {
  nodeType: string
  className?: string
}

/** Circular registry icon tile — matches Game Studio sidebar styling. */
export function GameNodeRegistryIcon({ nodeType, className }: GameNodeRegistryIconProps) {
  const entry = getRegistryEntry(nodeType)
  const Icon = entry?.Icon
  const accent = entry?.accent ?? 'blue'

  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border',
        accentTileClasses[accent],
        className,
      )}
      aria-hidden
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
    </div>
  )
}
