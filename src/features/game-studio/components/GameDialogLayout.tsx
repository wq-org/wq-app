import { useState } from 'react'
import type { ReactNode } from 'react'
import { Edit, Eye, Settings } from 'lucide-react'
import { Container, SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

interface GameLayoutProps {
  children?: ReactNode
  editorContent?: ReactNode
  previewContent?: ReactNode
  settingsContent?: ReactNode
  previewOnly?: boolean
  /** When true, show only preview content (no Editor/Preview/Settings tabs). Used in game-play. */
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
  const [activeTab, setActiveTab] = useState<TabType>('editor')

  if (previewOnly || playMode) {
    return <Container className="flex flex-col gap-6 w-full">{previewContent}</Container>
  }

  const tabs: TabItem[] = [
    { id: 'editor', icon: Edit, title: 'Editor' },
    { id: 'preview', icon: Eye, title: 'Preview' },
    { id: 'settings', icon: Settings, title: 'Settings' },
  ]

  return (
    <Container className="flex flex-col gap-6 w-full">
      {/* Tabs */}
      <SelectTabs
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'editor' && <>{editorContent || children}</>}
        {activeTab === 'preview' && <>{previewContent}</>}
        {activeTab === 'settings' && <>{settingsContent}</>}
      </div>
    </Container>
  )
}
