import { BarChart2, Eye, FilePenLine, Settings } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

export type LessonTabId = 'editor' | 'preview' | 'settings' | 'analytics'

export type LessonTabItem = {
  id: LessonTabId
  title: string
  icon: TabItem['icon']
  disabled?: boolean
}

type LessonTabsProps = {
  activeTabId: LessonTabId
  onTabChange: (tabId: LessonTabId) => void
  tabs?: readonly LessonTabItem[]
  className?: string
}

export function LessonTabs({ activeTabId, onTabChange, tabs, className }: LessonTabsProps) {
  const { t } = useTranslation('features.lesson')

  const defaultTabs = useMemo<readonly LessonTabItem[]>(
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
      onTabChange={(tabId) => onTabChange(tabId as LessonTabId)}
      className={className}
    />
  )
}
