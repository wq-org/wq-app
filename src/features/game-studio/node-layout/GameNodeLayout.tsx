import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { GameNodeAccent } from '../nodes/_registry/game-node-registry.types'

const accentClasses: Record<GameNodeAccent, { ring: string; bg: string; text: string }> = {
  gray: {
    ring: 'border-gray-500/20',
    bg: 'bg-gray-500/10',
    text: 'text-gray-500',
  },
  blue: {
    ring: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  orange: {
    ring: 'border-orange-500/20',
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
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
        'relative flex items-center gap-3 px-4 py-3 bg-white rounded-3xl min-w-[180px]',
        'cursor-pointer hover:shadow-md transition-shadow',
        'animate-in fade-in-0 slide-in-from-bottom-2',
        selected && 'border-2 border-gray-300 animate-in zoom-in-95',
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
          className="text-gray-900 font-medium truncate block"
          title={label}
        >
          {label}
        </Text>
        {meta}
      </div>
    </div>
  )
}
