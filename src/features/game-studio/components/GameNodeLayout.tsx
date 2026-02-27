import { useState } from 'react'
import { LayoutDashboard, Settings } from 'lucide-react'
import GameNodeSettings from './GameNodeSettings'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { GameNodePointsContext } from '@/contexts/game-studio'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface GameNodeLayoutProps {
  nodeId?: string
  gameComponent?: React.ComponentType<{
    initialData?: unknown
    onDelete?: () => void
    onRemoveImage?: (path: string) => void | Promise<void>
  }>
  overviewContent?: React.ReactNode
  /** When provided, rendered in the Settings tab instead of GameNodeSettings (so the parent can control title/description state for save). */
  settingsContent?: React.ReactNode
  initialData?: unknown
  onDelete?: () => void
  onRemoveImage?: (path: string) => void | Promise<void>
  showDelete?: boolean
  points?: number
  onPointsChange?: (points: number) => void
  hideSettingsTab?: boolean
}

export default function GameNodeLayout({
  nodeId,
  gameComponent: GameComponent,
  overviewContent,
  settingsContent,
  initialData,
  points,
  onPointsChange,
  hideSettingsTab = false,
  onDelete,
  onRemoveImage,
}: GameNodeLayoutProps) {
  const { t } = useTranslation('features.gameStudio')
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  return (
    <div className="mt-4 animate-in fade-in-0 slide-in-from-bottom-4">
      {/* Tabs */}
      {!hideSettingsTab && (
        <div className="flex gap-12 border-b mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            aria-label={t('nodeLayout.overviewAriaLabel')}
            className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'text-black border-black font-medium animate-in zoom-in-95'
                : 'text-black/40 hover:text-black/60 border-transparent'
            }`}
          >
            <LayoutDashboard
              className={activeTab === 'overview' ? 'text-black' : 'text-black/40'}
            />
            <Text
              as="span"
              variant="small"
            >
              {t('nodeLayout.overviewTab')}
            </Text>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            aria-label={t('nodeLayout.settingsAriaLabel')}
            className={`text-xl border-b-2 flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'text-black border-black font-medium animate-in zoom-in-95'
                : 'text-black/40 hover:text-black/60 border-transparent'
            }`}
          >
            <Settings className={activeTab === 'settings' ? 'text-black' : 'text-black/40'} />
            <Text
              as="span"
              variant="small"
            >
              {t('nodeLayout.settingsTab')}
            </Text>
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div
        key={hideSettingsTab ? 'overview' : activeTab}
        className="animate-in fade-in-0 slide-in-from-bottom-3"
      >
        {(activeTab === 'overview' || hideSettingsTab) && (
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
