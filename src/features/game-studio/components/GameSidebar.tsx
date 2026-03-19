import { useState } from 'react'
import { Search, Square, StickyNote, Image as ImageIcon, MapPin, Split } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SidebarItem } from '../types/game-studio.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export function GameSidebar() {
  const { t } = useTranslation('features.gameStudio')
  const [searchQuery, setSearchQuery] = useState('')
  const nodeItems: SidebarItem[] = [
    {
      id: 'end',
      label: t('sidebar.nodes.end'),
      icon: Square,
      category: 'node',
      nodeType: 'gameEnd',
    },
    {
      id: 'paragraph',
      label: t('sidebar.nodes.paragraph'),
      icon: StickyNote,
      category: 'node',
      nodeType: 'gameParagraph',
    },
    {
      id: 'image-terms',
      label: t('sidebar.nodes.imageTerms'),
      icon: ImageIcon,
      category: 'node',
      nodeType: 'gameImageTerms',
    },
    {
      id: 'image-pin',
      label: t('sidebar.nodes.imagePin'),
      icon: MapPin,
      category: 'node',
      nodeType: 'gameImagePin',
    },
  ]

  const logicItems: SidebarItem[] = [
    {
      id: 'if-else',
      label: t('sidebar.logic.ifElse'),
      icon: Split,
      category: 'logic',
      nodeType: 'gameIfElse',
    },
  ]

  const onDragStart = (event: React.DragEvent, item: SidebarItem) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        type: item.nodeType,
        label: item.label,
        nodeId: item.id,
      }),
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  const filteredNodeItems = nodeItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredLogicItems = logicItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="absolute left-4 top-4 z-10">
      <div className="flex w-full flex-col rounded-2xl border border-border bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900/95">
        {/* Search Bar */}
        <div className="border-b border-border p-4 dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('sidebar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 dark:border-white/10 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Nodes Section */}
          {filteredNodeItems.length > 0 && (
            <div className="space-y-2">
              <Text
                as="h3"
                variant="h3"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {t('sidebar.sectionNodes')}
              </Text>
              <div className="space-y-1">
                {filteredNodeItems.map((item) => {
                  const Icon = item.icon
                  // End node gets grey, game nodes get blue (matching canvas node colors)
                  const isEndNode = item.nodeType === 'gameEnd'
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className={cn(
                        'w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm h-auto',
                        'cursor-grab active:cursor-grabbing transition-colors hover:bg-accent dark:hover:bg-zinc-800',
                        'flex items-center',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center h-8 w-8 rounded-full border',
                          isEndNode
                            ? 'border-gray-500/20 bg-gray-500/10 text-gray-500 dark:border-gray-400/30 dark:bg-gray-400/10 dark:text-gray-300'
                            : 'border-blue-500/20 bg-blue-500/10 text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <Text
                        as="span"
                        variant="small"
                        className="text-foreground"
                      >
                        {item.label}
                      </Text>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Logic Section */}
          {filteredLogicItems.length > 0 && (
            <div className="space-y-2">
              <Text
                as="h3"
                variant="h3"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {t('sidebar.sectionLogic')}
              </Text>
              <div className="space-y-1">
                {filteredLogicItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className={cn(
                        'w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm h-auto',
                        'cursor-grab active:cursor-grabbing transition-colors hover:bg-accent dark:hover:bg-zinc-800',
                        'flex items-center',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center h-8 w-8 rounded-full border',
                          'border-orange-500/20 bg-orange-500/10 text-orange-500 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <Text
                        as="span"
                        variant="small"
                        className="text-foreground"
                      >
                        {item.label}
                      </Text>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredNodeItems.length === 0 && filteredLogicItems.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('sidebar.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
