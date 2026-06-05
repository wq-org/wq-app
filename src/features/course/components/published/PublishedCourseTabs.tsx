import { Info, ChartNoAxesGantt } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

export type PublishedCourseTabId = 'overview' | 'details'

type PublishedCourseTabsProps = {
  activeTabId: PublishedCourseTabId
  onTabChange: (tabId: PublishedCourseTabId) => void
  className?: string
}

export function PublishedCourseTabs({
  activeTabId,
  onTabChange,
  className,
}: PublishedCourseTabsProps) {
  const { t } = useTranslation('features.course')

  const tabs = useMemo<readonly TabItem[]>(
    () => [
      {
        id: 'overview',
        title: t('published.tabs.overview', { defaultValue: 'Overview' }),
        icon: ChartNoAxesGantt,
      },
      {
        id: 'details',
        title: t('published.tabs.details', { defaultValue: 'Details' }),
        icon: Info,
      },
    ],
    [t],
  )

  return (
    <SelectTabs
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={(tabId) => onTabChange(tabId as PublishedCourseTabId)}
      className={className}
      centered
    />
  )
}
