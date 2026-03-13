import type { ComponentType } from 'react'
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'

type DashboardTabItem = {
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
}

type DashboardTabsProps = {
  tabs: DashboardTabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
}

export function DashboardTabs({ tabs, activeTabId, onTabChange }: DashboardTabsProps) {
  return (
    <SelectTabs
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
    />
  )
}
