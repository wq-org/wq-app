import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit, Gamepad2, Settings } from 'lucide-react'
import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

interface GameLayoutProps {
  children?: ReactNode
  editorContent?: ReactNode
  previewContent?: ReactNode
  settingsContent?: ReactNode
  previewOnly?: boolean
  /** When true, show only preview content (no Editor/Preview/Settings tabs). */
  playMode?: boolean
}
type TabType = 'editor' | 'preview' | 'settings'

export function GameLayout({
  children,
  editorContent,
  previewContent,
  settingsContent,
  previewOnly = false,
  playMode = false,
}: GameLayoutProps) {
  const { t } = useTranslation('features.gameStudio')
  const [activeTab, setActiveTab] = useState<TabType>('editor')

  if (previewOnly || playMode) {
    return <div className="flex w-full flex-col gap-6">{previewContent}</div>
  }

  const tabs: TabItem[] = [
    { id: 'editor', icon: Edit, title: t('nodeLayout.editorTab') },
    { id: 'preview', icon: Gamepad2, title: t('nodeLayout.previewTab') },
    { id: 'settings', icon: Settings, title: t('nodeLayout.settingsTab') },
  ]

  return (
    <div className="flex w-full flex-col h-full">
      {/* Tabs */}
      <SelectTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Tab Content */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {activeTab === 'editor' && <>{editorContent || children}</>}
        {activeTab === 'preview' && <>{previewContent}</>}
        {activeTab === 'settings' && <>{settingsContent}</>}
      </div>
    </div>
  )
}
