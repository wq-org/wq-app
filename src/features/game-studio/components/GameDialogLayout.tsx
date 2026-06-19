import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit, Gamepad2, Settings } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import { TwoColumnDialogColumns } from '@/components/shared/TwoColumnDialog'
import type { TabItem } from '@/components/shared'

import { GameAgentPage } from '../pages/GameAgentPage'

export type GameLayoutMode = 'default' | 'dual'

type TabType = 'editor' | 'preview' | 'settings'

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
  /**
   * `dual` shows the node editor left and agent PDF panel right; `default` is a
   * single column. Defaults to `dual` so the agent sidebar is always present.
   */
  layoutMode?: GameLayoutMode
  /** Right column in dual mode; defaults to {@link GameAgentPage}. */
  agentPanel?: ReactNode
}

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
  layoutMode,
  agentPanel,
}: GameLayoutProps) {
  const { t } = useTranslation('features.gameStudio')
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  // Default to the two-column agent layout; callers can still force `default`.
  const resolvedLayoutMode: GameLayoutMode = layoutMode ?? 'dual'

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

  const nodePanel = (
    <div className="flex h-full min-h-0 w-full flex-col">
      <SelectTabs
        tabs={tabs}
        activeTabId={resolvedTab}
        onTabChange={(tabId) => {
          if (tabsDisabled || disabledTabSet.has(tabId as TabType)) return
          setActiveTab(tabId as TabType)
        }}
      />
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        {resolvedTab === 'editor' && <>{editorContent || children}</>}
        {resolvedTab === 'preview' && <>{previewContent}</>}
        {resolvedTab === 'settings' && <>{settingsContent}</>}
      </div>
    </div>
  )

  if (resolvedLayoutMode === 'dual') {
    return (
      <TwoColumnDialogColumns
        className="max-h-none md:max-h-[calc(90vh-8rem)]"
        leftClassName="p-0 md:pr-4"
        rightClassName="border-t bg-background p-0 md:border-t-0 md:border-l md:pl-0"
        leftChildren={nodePanel}
        rightChildren={agentPanel ?? <GameAgentPage className="h-full" />}
      />
    )
  }

  return nodePanel
}
