import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'

export interface TabItem {
  id: string
  icon: LucideIcon
  title: string
}

interface SelectTabsProps {
  tabs: TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

export default function SelectTabs({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  variant = 'default',
}: SelectTabsProps) {
  const isCompact = variant === 'compact'

  return (
    <div className={cn(isCompact ? 'flex gap-4' : 'flex gap-12', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTabId === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 focus:outline-none transition-all',
              isCompact ? 'pb-1.5' : 'pb-2',
              isActive
                ? 'border-black text-black font-medium'
                : 'border-transparent text-black/40 hover:text-black/60',
            )}
          >
            <Icon
              className={cn(isCompact ? 'size-4' : '', isActive ? 'text-black' : 'text-black/40')}
            />
            <Text
              as="span"
              variant="small"
              className={cn(
                isCompact ? 'text-sm' : 'text-xl',
                isActive ? 'text-black font-medium' : 'text-black/40 hover:text-black/60',
              )}
            >
              {tab.title}
            </Text>
          </button>
        )
      })}
    </div>
  )
}
