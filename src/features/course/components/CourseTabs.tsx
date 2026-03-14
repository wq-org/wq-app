import { BarChart2, Eye, FilePenLine, Settings } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectTabs } from '@/components/shared/tabs'
import type { TabItem } from '@/components/shared/tabs'

export type CourseTabId = 'editor' | 'preview' | 'settings' | 'analytics'

export type CourseTabItem = {
  id: CourseTabId
  title: string
  icon: TabItem['icon']
  disabled?: boolean
}

type CourseTabsProps = {
  activeTabId: CourseTabId
  onTabChange: (tabId: CourseTabId) => void
  tabs?: readonly CourseTabItem[]
  className?: string
}

export function CourseTabs({ activeTabId, onTabChange, tabs, className }: CourseTabsProps) {
  const { t } = useTranslation('features.course')

  const defaultTabs = useMemo<readonly CourseTabItem[]>(
    () => [
      {
        id: 'editor',
        title: t('layout.tabs.editor', { defaultValue: 'Editor' }),
        icon: FilePenLine,
      },
      {
        id: 'preview',
        title: t('layout.tabs.preview', { defaultValue: 'Preview' }),
        icon: Eye,
      },
      {
        id: 'settings',
        title: t('layout.tabs.settings', { defaultValue: 'Settings' }),
        icon: Settings,
      },
      {
        id: 'analytics',
        title: t('layout.tabs.analytics', { defaultValue: 'Analytics' }),
        icon: BarChart2,
      },
    ],
    [t],
  )

  const resolvedTabs = tabs ?? defaultTabs

  return (
    <SelectTabs
      tabs={resolvedTabs}
      activeTabId={activeTabId}
      onTabChange={(tabId) => onTabChange(tabId as CourseTabId)}
      className={className}
    />
  )
}
