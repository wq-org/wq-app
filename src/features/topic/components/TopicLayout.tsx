import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FeatureWorkspaceLayout, type WorkspaceTabId } from '@/components/shared/workspace'

export interface TopicLayoutProps {
  activeTab?: WorkspaceTabId
  onTabChange?: (tab: WorkspaceTabId) => void
  editorContent?: ReactNode
  previewContent?: ReactNode
  settingsContent?: ReactNode
  analyticsContent?: ReactNode
  className?: string
}

export default function TopicLayout({
  activeTab,
  onTabChange,
  editorContent,
  previewContent,
  settingsContent,
  analyticsContent,
  className,
}: TopicLayoutProps) {
  const { t } = useTranslation('features.course')

  return (
    <FeatureWorkspaceLayout
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
      tabTitles={{
        editor: t('layout.tabs.editor', { defaultValue: 'Editor' }),
        preview: t('layout.tabs.preview', { defaultValue: 'Preview' }),
        settings: t('layout.tabs.settings', { defaultValue: 'Settings' }),
        analytics: t('layout.tabs.analytics', { defaultValue: 'Analytics' }),
      }}
      editorContent={editorContent}
      previewContent={previewContent}
      settingsContent={settingsContent}
      analyticsContent={analyticsContent}
    />
  )
}
