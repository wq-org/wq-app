import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { GameNodeAccent } from '../nodes/_registry/game-node-registry.types'

const accentClasses: Record<GameNodeAccent, { ring: string; bg: string; text: string }> = {
  gray: {
    ring: 'border-gray-500/20 dark:border-gray-400/30',
    bg: 'bg-gray-500/10 dark:bg-gray-400/10',
    text: 'text-gray-500 dark:text-gray-300',
  },
  darkblue: {
    ring: 'border-[oklch(var(--oklch-darkblue)/0.2)] dark:border-[oklch(var(--oklch-darkblue)/0.3)]',
    bg: 'bg-[oklch(var(--oklch-darkblue)/0.1)] dark:bg-[oklch(var(--oklch-darkblue)/0.12)]',
    text: 'text-[oklch(var(--oklch-darkblue))]',
  },
  violet: {
    ring: 'border-[oklch(var(--oklch-violet)/0.2)] dark:border-[oklch(var(--oklch-violet)/0.3)]',
    bg: 'bg-[oklch(var(--oklch-violet)/0.1)] dark:bg-[oklch(var(--oklch-violet)/0.12)]',
    text: 'text-[oklch(var(--oklch-violet))]',
  },
  indigo: {
    ring: 'border-[oklch(var(--oklch-indigo)/0.2)] dark:border-[oklch(var(--oklch-indigo)/0.3)]',
    bg: 'bg-[oklch(var(--oklch-indigo)/0.1)] dark:bg-[oklch(var(--oklch-indigo)/0.12)]',
    text: 'text-[oklch(var(--oklch-indigo))]',
  },
  blue: {
    ring: 'border-blue-500/20 dark:border-blue-400/30',
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    text: 'text-blue-500 dark:text-blue-300',
  },
  cyan: {
    ring: 'border-cyan-500/20 dark:border-cyan-400/30',
    bg: 'bg-cyan-500/10 dark:bg-cyan-400/10',
    text: 'text-cyan-500 dark:text-cyan-300',
  },
  teal: {
    ring: 'border-teal-500/20 dark:border-teal-400/30',
    bg: 'bg-teal-500/10 dark:bg-teal-400/10',
    text: 'text-teal-500 dark:text-teal-300',
  },
  green: {
    ring: 'border-green-500/20 dark:border-green-400/30',
    bg: 'bg-green-500/10 dark:bg-green-400/10',
    text: 'text-green-500 dark:text-green-300',
  },
  lime: {
    ring: 'border-lime-500/20 dark:border-lime-400/30',
    bg: 'bg-lime-500/10 dark:bg-lime-400/10',
    text: 'text-lime-500 dark:text-lime-300',
  },
  orange: {
    ring: 'border-orange-500/20 dark:border-orange-400/30',
    bg: 'bg-orange-500/10 dark:bg-orange-400/10',
    text: 'text-orange-500 dark:text-orange-300',
  },
  red: {
    ring: 'border-red-500/20 dark:border-red-400/30',
    bg: 'bg-red-500/10 dark:bg-red-400/10',
    text: 'text-red-500 dark:text-red-300',
  },
  pink: {
    ring: 'border-pink-500/20 dark:border-pink-400/30',
    bg: 'bg-pink-500/10 dark:bg-pink-400/10',
    text: 'text-pink-500 dark:text-pink-300',
  },
}

export type GameNodeLayoutProps = {
  Icon: LucideIcon
  accent: GameNodeAccent
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
  /** Slot for XYFlow Handles (rendered absolutely, sibling to the visible body). */
  handles?: ReactNode
  /** Optional extra row beneath the label (e.g. branch hint). */
  meta?: ReactNode
}

/**
 * Visual wrapper shared by every canvas node. Keeps the chip shape, accent
 * tile, and click affordance consistent across all node types in the registry.
 */
export function GameNodeLayout({
  Icon,
  accent,
  label,
  selected,
  onClick,
  className,
  handles,
  meta,
}: GameNodeLayoutProps) {
  const accentStyle = accentClasses[accent]

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 rounded-3xl min-w-[180px]',
        'cursor-pointer hover:shadow-md transition-shadow',
        'animate-in fade-in-0 slide-in-from-bottom-2',
        selected && 'border-2 border-gray-300 dark:border-zinc-500 animate-in zoom-in-95',
        className,
      )}
    >
      {handles}
      <div
        className={cn(
          'p-2 rounded-lg border flex items-center justify-center shrink-0',
          accentStyle.ring,
          accentStyle.bg,
        )}
      >
        <Icon className={cn('w-4 h-4', accentStyle.text)} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <Text
          as="span"
          variant="small"
          className="text-gray-900 dark:text-zinc-100 font-medium truncate block"
          title={label}
        >
          {label}
        </Text>
        {meta}
      </div>
    </div>
  )
}
