import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import type { TabItem } from '@/components/shared/tabs'

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
