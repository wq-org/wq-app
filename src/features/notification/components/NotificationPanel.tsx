import { useEffect, useMemo, useState } from 'react'
import { Bell, User } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'

type TabId = 'all' | 'users'

interface NotificationPanelProps {
  onTotalCountChange?: (count: number) => void
}

export function NotificationPanel({ onTotalCountChange }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('all')

  useEffect(() => {
    onTotalCountChange?.(0)
  }, [onTotalCountChange])

  const tabs = useMemo(
    () => [
      { id: 'all', icon: Bell, title: 'All' },
      { id: 'users', icon: User, title: 'Users' },
    ],
    [],
  )

  return (
    <div className="h-full bg-transparent p-4 text-popover-foreground">
      <div className="space-y-4">
        <Text
          as="h1"
          variant="h1"
          className="text-xl text-popover-foreground"
        >
          Notifications
        </Text>
        <SelectTabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          variant="compact"
          className="border-b border-border"
        />
      </div>
    </div>
  )
}
