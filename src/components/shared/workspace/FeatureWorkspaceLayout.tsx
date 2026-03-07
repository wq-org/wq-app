import { useState, type ReactNode } from 'react'
import { BarChart2, Eye, FilePenLine, Settings } from 'lucide-react'
import SelectTabs, { type TabItem } from '@/components/shared/tabs/SelectTabs'
import { cn } from '@/lib/utils'

export type WorkspaceTabId = 'editor' | 'preview' | 'settings' | 'analytics'

export interface FeatureWorkspaceLayoutProps {
  tabTitles?: Partial<Record<WorkspaceTabId, string>>
  defaultTab?: WorkspaceTabId
  activeTab?: WorkspaceTabId
  onTabChange?: (tab: WorkspaceTabId) => void
  editorContent?: ReactNode
  previewContent?: ReactNode
  settingsContent?: ReactNode
  analyticsContent?: ReactNode
  className?: string
  tabsClassName?: string
  contentClassName?: string
}

const TAB_ORDER: WorkspaceTabId[] = ['editor', 'preview', 'settings', 'analytics']

const TAB_ICON_MAP: Record<WorkspaceTabId, TabItem['icon']> = {
  editor: FilePenLine,
  preview: Eye,
  settings: Settings,
  analytics: BarChart2,
}

const DEFAULT_TAB_TITLES: Record<WorkspaceTabId, string> = {
  editor: 'Editor',
  preview: 'Preview',
  settings: 'Settings',
  analytics: 'Analytics',
}

export default function FeatureWorkspaceLayout({
  tabTitles,
  defaultTab = 'editor',
  activeTab,
  onTabChange,
  editorContent,
  previewContent,
  settingsContent,
  analyticsContent,
  className,
  tabsClassName,
  contentClassName,
}: FeatureWorkspaceLayoutProps) {
  const isControlled = activeTab != null && onTabChange != null
  const [internalActiveTab, setInternalActiveTab] = useState<WorkspaceTabId>(defaultTab)
  const resolvedActiveTab = isControlled ? activeTab : internalActiveTab

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as WorkspaceTabId
    if (isControlled) {
      onTabChange(nextTab)
      return
    }

    setInternalActiveTab(nextTab)
  }

  const tabs: TabItem[] = TAB_ORDER.map((tabId) => ({
    id: tabId,
    icon: TAB_ICON_MAP[tabId],
    title: tabTitles?.[tabId] ?? DEFAULT_TAB_TITLES[tabId],
  }))

  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <SelectTabs
        tabs={tabs}
        activeTabId={resolvedActiveTab}
        onTabChange={handleTabChange}
        className={cn('border-b', tabsClassName)}
      />

      <div className={cn('mt-6', contentClassName)}>
        {resolvedActiveTab === 'editor' && editorContent}
        {resolvedActiveTab === 'preview' && previewContent}
        {resolvedActiveTab === 'settings' && settingsContent}
        {resolvedActiveTab === 'analytics' && analyticsContent}
      </div>
    </div>
  )
}
