import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

type DashboardTabsProps = {
  tabs: TabItem[]
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
