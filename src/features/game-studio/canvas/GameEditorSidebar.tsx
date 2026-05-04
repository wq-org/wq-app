import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { getSidebarEntries } from '../nodes/_registry/GameNodeRegistry'
import type {
  GameNodeAccent,
  GameNodeCategory,
  GameNodeRegistryEntry,
} from '../nodes/_registry/game-node-registry.types'

const accentTileClasses: Record<GameNodeAccent, string> = {
  gray: 'border-gray-500/20 bg-gray-500/10 text-gray-500 dark:border-gray-400/30 dark:bg-gray-400/10 dark:text-gray-300',
  blue: 'border-blue-500/20 bg-blue-500/10 text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300',
  orange:
    'border-orange-500/20 bg-orange-500/10 text-orange-500 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300',
}

const sectionTitles: Record<GameNodeCategory, string> = {
  nodes: 'Nodes',
  logic: 'Logic',
}

function onDragStart(event: React.DragEvent, entry: GameNodeRegistryEntry) {
  event.dataTransfer.setData(
    'application/reactflow',
    JSON.stringify({ type: entry.type, label: entry.label, nodeId: entry.type }),
  )
  event.dataTransfer.effectAllowed = 'move'
}

function SidebarSection({
  title,
  entries,
}: {
  title: string
  entries: readonly GameNodeRegistryEntry[]
}) {
  if (entries.length === 0) return null
  return (
    <div className="space-y-2">
      <Text
        as="h3"
        variant="h3"
        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        {title}
      </Text>
      <div className="space-y-1">
        {entries.map((entry) => {
          const Icon = entry.Icon
          return (
            <div
              key={entry.type}
              draggable
              onDragStart={(e) => onDragStart(e, entry)}
              className={cn(
                'w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm h-auto',
                'cursor-grab active:cursor-grabbing transition-colors hover:bg-accent dark:hover:bg-zinc-800',
                'flex items-center',
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full border',
                  accentTileClasses[entry.accent],
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
              </div>
              <Text
                as="span"
                variant="small"
                className="text-foreground"
              >
                {entry.label}
              </Text>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GameEditorSidebar() {
  const [query, setQuery] = useState('')
  const all = getSidebarEntries()
  const matches = all.filter((entry) => entry.label.toLowerCase().includes(query.toLowerCase()))
  const nodeEntries = matches.filter((entry) => entry.category === 'nodes')
  const logicEntries = matches.filter((entry) => entry.category === 'logic')

  return (
    <div className="absolute left-4 top-4 z-10">
      <div className="flex w-full flex-col rounded-4xl border border-border bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900/95">
        <div className="border-b border-border p-4 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search nodes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-9 dark:border-white/10 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-400"
            />
          </div>
        </div>

        <div className="p-4 space-y-6">
          <SidebarSection
            title={sectionTitles.nodes}
            entries={nodeEntries}
          />
          <SidebarSection
            title={sectionTitles.logic}
            entries={logicEntries}
          />
          {nodeEntries.length === 0 && logicEntries.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">No matches</div>
          )}
        </div>
      </div>
    </div>
  )
}
