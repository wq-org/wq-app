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
  /**
   * When true, the tab strip is rendered but locked to the Editor tab (no switching).
   * Used by beta/read-only nodes (e.g. Start/End) that only show a static notice.
   */
  tabsDisabled?: boolean
  /** Individual tabs that cannot be selected (e.g. If/Else locks Editor + Preview). */
  disabledTabIds?: TabType[]
  /** Tabs omitted from the tab strip entirely (e.g. If/Else has no editor surface). */
  hiddenTabIds?: TabType[]
  /** Initial selected tab when the dialog opens. */
  initialTab?: TabType
}
type TabType = 'editor' | 'preview' | 'settings'

export function GameLayout({
  children,
  editorContent,
  previewContent,
  settingsContent,
  previewOnly = false,
  playMode = false,
  tabsDisabled = false,
  disabledTabIds = [],
  hiddenTabIds = [],
  initialTab = 'editor',
}: GameLayoutProps) {
  const { t } = useTranslation('features.gameStudio')
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  if (previewOnly || playMode) {
    return <div className="flex w-full flex-col gap-6">{previewContent}</div>
  }

  const disabledTabSet = new Set<TabType>(
    tabsDisabled ? ['editor', 'preview', 'settings'] : disabledTabIds,
  )
  const hiddenTabSet = new Set<TabType>(hiddenTabIds)

  const tabs: TabItem[] = [
    {
      id: 'editor',
      icon: Edit,
      title: t('nodeLayout.editorTab'),
      disabled: disabledTabSet.has('editor'),
    },
    {
      id: 'preview',
      icon: Gamepad2,
      title: t('nodeLayout.previewTab'),
      disabled: disabledTabSet.has('preview'),
    },
    {
      id: 'settings',
      icon: Settings,
      title: t('nodeLayout.settingsTab'),
      disabled: disabledTabSet.has('settings'),
    },
  ].filter((tab) => !hiddenTabSet.has(tab.id as TabType))

  const isTabAvailable = (tab: TabType) => !disabledTabSet.has(tab) && !hiddenTabSet.has(tab)

  const resolvedTab: TabType =
    tabsDisabled || !isTabAvailable(activeTab)
      ? ((['settings', 'preview', 'editor'] as const).find(isTabAvailable) ?? 'settings')
      : activeTab

  return (
    <div className="flex w-full flex-col h-full">
      {/* Tabs */}
      <SelectTabs
        tabs={tabs}
        activeTabId={resolvedTab}
        onTabChange={(tabId) => {
          if (tabsDisabled || disabledTabSet.has(tabId as TabType)) return
          setActiveTab(tabId as TabType)
        }}
      />

      {/* Tab Content */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {resolvedTab === 'editor' && <>{editorContent || children}</>}
        {resolvedTab === 'preview' && <>{previewContent}</>}
        {resolvedTab === 'settings' && <>{settingsContent}</>}
      </div>
    </div>
  )
}
