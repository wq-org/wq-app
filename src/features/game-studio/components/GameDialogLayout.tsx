import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit, Gamepad2, Settings } from 'lucide-react'
import { GripVerticalIcon } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'

import { AgentPanel } from '../agent'

export type GameLayoutMode = 'default' | 'dual'

type TabType = 'editor' | 'preview' | 'settings'

const AGENT_DEFAULT_PCT = 38
const AGENT_MIN_PCT = 30
const AGENT_MAX_PCT = 56

interface GameLayoutProps {
  children?: ReactNode
  editorContent?: ReactNode
  previewContent?: ReactNode
  settingsContent?: ReactNode
  previewOnly?: boolean
  /** When true, show only preview content (no tabs). */
  playMode?: boolean
  /**
   * When true, the tab strip is rendered but locked to the Editor tab.
   * Used by beta/read-only nodes (e.g. Start/End).
   */
  tabsDisabled?: boolean
  /** Individual tabs that cannot be selected. */
  disabledTabIds?: TabType[]
  /** Tabs omitted from the tab strip entirely. */
  hiddenTabIds?: TabType[]
  /** Initial selected tab when the dialog opens. */
  initialTab?: TabType
  /**
   * `dual` shows the node editor left and agent panel right; `default` is a
   * single column. Defaults to `dual` so the agent sidebar is always present.
   */
  layoutMode?: GameLayoutMode
  /** Right column in dual mode; defaults to {@link AgentPanel}. */
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
  const [rightPct, setRightPct] = useState(AGENT_DEFAULT_PCT)
  const isDraggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const rightPx = rect.right - e.clientX
      const pct = (rightPx / rect.width) * 100
      setRightPct(Math.min(AGENT_MAX_PCT, Math.max(AGENT_MIN_PCT, pct)))
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

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

  // Agent column is only useful while authoring (Editor tab). Switching to
  // Preview or Settings hides it so the canvas / settings form get the full width.
  const isAgentVisible = resolvedTab === 'editor'

  const handleTabChange = (tabId: string) => {
    if (tabsDisabled || disabledTabSet.has(tabId as TabType)) return
    setActiveTab(tabId as TabType)
  }

  const nodePanel = (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <SelectTabs
        tabs={tabs}
        activeTabId={resolvedTab}
        onTabChange={handleTabChange}
      />
      <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {resolvedTab === 'editor' && <>{editorContent || children}</>}
        {resolvedTab === 'preview' && <>{previewContent}</>}
        {resolvedTab === 'settings' && <>{settingsContent}</>}
      </div>
    </div>
  )

  if (resolvedLayoutMode === 'dual') {
    return (
      <div
        ref={containerRef}
        className="flex h-full min-h-0 w-full overflow-hidden"
        style={{ userSelect: isDraggingRef.current ? 'none' : undefined }}
      >
        {/* Left: node editor — fills remaining width */}
        <div className="min-w-0 flex-1 overflow-hidden pr-3">{nodePanel}</div>

        {isAgentVisible ? (
          <>
            {/* Drag handle */}
            <button
              type="button"
              aria-label="Resize panels"
              className="relative flex w-1.5 shrink-0 cursor-col-resize items-center justify-center rounded-full bg-border/50 transition-colors hover:bg-border active:bg-border/80"
              onMouseDown={handleDragStart}
            >
              <div className="z-10 flex h-6 w-3 items-center justify-center rounded-xs border border-border bg-background shadow-sm">
                <GripVerticalIcon className="size-2.5 text-muted-foreground" />
              </div>
            </button>

            {/* Right: agent panel — controlled width */}
            <div
              className="shrink-0 overflow-hidden border-l border-border/60 bg-background"
              style={{ width: `${rightPct}%` }}
            >
              {agentPanel ?? <AgentPanel className="h-full" />}
            </div>
          </>
        ) : null}
      </div>
    )
  }

  return nodePanel
}
