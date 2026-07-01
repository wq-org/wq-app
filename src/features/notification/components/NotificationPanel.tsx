import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { SelectTabs } from '@/components/shared'

type TabId = 'all'

interface NotificationPanelProps {
  onTotalCountChange?: (count: number) => void
}

export function NotificationPanel({ onTotalCountChange }: NotificationPanelProps) {
  const { t } = useTranslation('features.notification')
  const [activeTab, setActiveTab] = useState<TabId>('all')

  useEffect(() => {
    onTotalCountChange?.(0)
  }, [onTotalCountChange])

  const tabs = useMemo(() => [{ id: 'all', icon: Bell, title: t('panel.tabs.all') }], [t])

  return (
    <div className="flex h-full flex-col bg-transparent p-4 text-popover-foreground">
      <div className="space-y-4">
        <Text
          as="h1"
          variant="h1"
          className="text-xl text-popover-foreground"
        >
          {t('panel.title')}
        </Text>
        <SelectTabs
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          variant="compact"
          className="border-b border-border"
        />
      </div>
      <Empty className="flex-1 border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Bell />
          </EmptyMedia>
          <EmptyTitle>{t('panel.emptyAll.title')}</EmptyTitle>
          <EmptyDescription>{t('panel.emptyAll.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
