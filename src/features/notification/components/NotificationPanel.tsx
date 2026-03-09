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
    <div className="w-90 rounded-4xl border bg-card/70 p-4 shadow-md backdrop-blur">
      <div className="space-y-4">
        <Text
          as="h1"
          variant="h1"
          className="text-xl"
        >
          Notifications
        </Text>
        <SelectTabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          variant="compact"
        />
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          Notifications coming soon.
        </Text>
      </div>
    </div>
  )
}
