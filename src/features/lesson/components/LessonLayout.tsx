import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FeatureWorkspaceLayout, type WorkspaceTabId } from '@/components/shared/workspace'

export interface LessonLayoutProps {
  activeTab?: WorkspaceTabId
  onTabChange?: (tab: WorkspaceTabId) => void
  editorContent?: ReactNode
  overviewContent?: ReactNode
  settingsContent?: ReactNode
  analyticsContent?: ReactNode
  className?: string
}

export default function LessonLayout({
  activeTab,
  onTabChange,
  editorContent,
  overviewContent,
  settingsContent,
  analyticsContent,
  className,
}: LessonLayoutProps) {
  const { t } = useTranslation('features.lesson')

  return (
    <FeatureWorkspaceLayout
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
      tabTitles={{
        editor: t('layout.tabs.editor', { defaultValue: 'Editor' }),
        overview: t('layout.tabs.preview', { defaultValue: 'Overview' }),
        settings: t('layout.tabs.settings', { defaultValue: 'Settings' }),
        analytics: t('layout.tabs.analytics', { defaultValue: 'Analytics' }),
      }}
      editorContent={editorContent}
      overviewContent={overviewContent}
      settingsContent={settingsContent}
      analyticsContent={analyticsContent}
    />
  )
}
