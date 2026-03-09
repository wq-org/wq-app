import { useEffect, useMemo, useState } from 'react'
import { FileText, LayoutDashboard, Settings } from 'lucide-react'
import GameNodeSettings from './GameNodeSettings'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { GameNodePointsContext } from '@/contexts/game-studio'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { SelectTabs } from '@/components/shared/tabs'
import type { TabItem } from '@/components/shared/tabs'

interface GameNodeLayoutProps {
  nodeId?: string
  gameComponent?: React.ComponentType<{
    initialData?: unknown
    onDelete?: () => void
    onRemoveImage?: (path: string) => void | Promise<void>
  }>
  overviewContent?: React.ReactNode
  editorContent?: React.ReactNode
  /** When provided, rendered in the Settings tab instead of GameNodeSettings (so the parent can control title/description state for save). */
  settingsContent?: React.ReactNode
  initialData?: unknown
  onDelete?: () => void
  onRemoveImage?: (path: string) => void | Promise<void>
  showDelete?: boolean
  points?: number
  onPointsChange?: (points: number) => void
  hideSettingsTab?: boolean
  hideOverviewTab?: boolean
}

export function GameNodeLayout({
  nodeId,
  gameComponent: GameComponent,
  overviewContent,
  editorContent,
  settingsContent,
  initialData,
  points,
  onPointsChange,
  hideSettingsTab = false,
  hideOverviewTab = false,
  onDelete,
  onRemoveImage,
}: GameNodeLayoutProps) {
  const { t } = useTranslation('features.gameStudio')
  const availableTabs = useMemo(() => {
    const tabs: Array<TabItem & { id: 'editor' | 'overview' | 'settings' }> = []

    if (editorContent) {
      tabs.push({
        id: 'editor',
        icon: FileText,
        title: t('nodeLayout.editorTab'),
      })
    }

    if (!hideOverviewTab && (overviewContent || GameComponent)) {
      tabs.push({
        id: 'overview',
        icon: LayoutDashboard,
        title: t('nodeLayout.overviewTab'),
      })
    }

    if (!hideSettingsTab && (settingsContent || onDelete)) {
      tabs.push({
        id: 'settings',
        icon: Settings,
        title: t('nodeLayout.settingsTab'),
      })
    }

    return tabs
  }, [
    editorContent,
    hideOverviewTab,
    overviewContent,
    GameComponent,
    hideSettingsTab,
    settingsContent,
    onDelete,
    t,
  ])

  const [activeTab, setActiveTab] = useState<'editor' | 'overview' | 'settings'>(
    availableTabs[0]?.id ?? 'overview',
  )

  useEffect(() => {
    const currentTabStillVisible = availableTabs.some((tab) => tab.id === activeTab)
    if (!currentTabStillVisible && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].id)
    }
  }, [activeTab, availableTabs])

  return (
    <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-4">
      {/* Tabs */}
      {availableTabs.length > 1 && (
        <div className="mb-6 border-b">
          <SelectTabs
            tabs={availableTabs}
            activeTabId={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as 'editor' | 'overview' | 'settings')}
            colorVariant="default"
            className="-mb-px"
          />
        </div>
      )}

      {/* Tab Content */}
      <div
        key={availableTabs.length > 1 ? activeTab : (availableTabs[0]?.id ?? 'content')}
        className="animate-in fade-in-0 slide-in-from-bottom-3"
      >
        {activeTab === 'editor' && (
          <div className="flex flex-col gap-6">
            {editorContent ?? (
              <div className="text-muted-foreground">{t('nodeLayout.noContent')}</div>
            )}
          </div>
        )}
        {activeTab === 'overview' && !hideOverviewTab && (
          <div className="flex flex-col gap-6">
            {overviewContent && <div>{overviewContent}</div>}
            {GameComponent && (
              <div>
                {overviewContent && <div className="border-t pt-6 mt-6" />}
                <GameNodePointsContext.Provider value={{ points, onPointsChange }}>
                  <GameComponent
                    initialData={initialData}
                    onDelete={onDelete}
                    onRemoveImage={onRemoveImage}
                  />
                </GameNodePointsContext.Provider>
              </div>
            )}
            {!overviewContent && !GameComponent && (
              <div className="text-muted-foreground">{t('nodeLayout.noContent')}</div>
            )}
          </div>
        )}
        {!hideSettingsTab && activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            {settingsContent ?? <GameNodeSettings nodeId={nodeId} />}
            {onDelete && settingsContent == null && (
              <div>
                <Text
                  as="p"
                  variant="body"
                  className="text-muted-foreground text-sm mb-3"
                >
                  {t('nodeLayout.deleteHint')}
                </Text>
                <HoldToDeleteButton
                  onDelete={onDelete}
                  holdDuration={3000}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export type { GameNodeLayoutProps }
