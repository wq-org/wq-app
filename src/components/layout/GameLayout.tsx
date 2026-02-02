import { useState } from 'react'
import { Edit, Eye, Settings } from 'lucide-react'
import { Container, SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

interface GameLayoutProps {
  children?: React.ReactNode
  editorContent?: React.ReactNode
  previewContent?: React.ReactNode
  settingsContent?: React.ReactNode
}
type TabType = 'editor' | 'preview' | 'settings'

export default function GameLayout({
  children,
  editorContent,
  previewContent,
  settingsContent,
}: GameLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('editor')

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
