import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import {
  selectTabButtonVariants,
  selectTabIconVariants,
  selectTabsContainerVariants,
  selectTabTextVariants,
  type SelectTabsColorVariant,
  type SelectTabsLayoutVariant,
} from '@/components/shared/tabs/select-tabs-variants'

export interface TabItem {
  id: string
  icon: LucideIcon
  title: string
}

export interface SelectTabsProps {
  tabs: TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
  variant?: SelectTabsLayoutVariant
  colorVariant?: SelectTabsColorVariant
}

export function SelectTabs({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  variant = 'default',
  colorVariant = 'default',
}: SelectTabsProps) {
  return (
    <div className={cn(selectTabsContainerVariants({ layout: variant }), className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTabId === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={selectTabButtonVariants({
              layout: variant,
              tone: colorVariant,
              active: isActive,
            })}
          >
            <Icon
              className={selectTabIconVariants({
                layout: variant,
                tone: colorVariant,
                active: isActive,
              })}
            />
            <Text
              as="span"
              variant="small"
              className={selectTabTextVariants({
                layout: variant,
                tone: colorVariant,
                active: isActive,
              })}
            >
              {tab.title}
            </Text>
          </button>
        )
      })}
    </div>
  )
}
