import { useCallback, useMemo } from 'react'

import { resolveSelectTabDisplayTitle, type TabItem } from '@/components/shared'

import type { GameNodeDataPatch } from '../../_registry/game-node-registry.types'
import type {
  DragDropMathCanvasRow,
  GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'
import type { DragDropMathExerciseTab } from '../types/exercise-tab.types'
import {
  createEmptyExerciseTab,
  resolveExerciseTabLabel,
  resolveExerciseTabsState,
} from '../utils/exerciseTabs.utils'

export type UseDnDMathExerciseTabsArgs = {
  nodeData: GameDragDropMathNodeData
  onPatchNodeData: (patch: GameNodeDataPatch) => void
  /** Translated fallback when a tab title is empty (e.g. “New Tab”). */
  defaultTabTitle: string
}

export function useDnDMathExerciseTabs({
  nodeData,
  onPatchNodeData,
  defaultTabTitle,
}: UseDnDMathExerciseTabsArgs) {
  const { tabs, activeTabId } = useMemo(
    () => resolveExerciseTabsState(nodeData, defaultTabTitle),
    [nodeData, defaultTabTitle],
  )

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]

  const persistTabs = useCallback(
    (nextTabs: DragDropMathExerciseTab[], nextActiveId: string) => {
      onPatchNodeData({
        exerciseTabs: nextTabs,
        activeExerciseTabId: nextActiveId,
      })
    },
    [onPatchNodeData],
  )

  const setActiveTabId = useCallback(
    (tabId: string) => {
      if (!tabs.some((tab) => tab.id === tabId)) return
      persistTabs(tabs, tabId)
    },
    [persistTabs, tabs],
  )

  const addTab = useCallback(() => {
    const nextTab = createEmptyExerciseTab(defaultTabTitle)
    const nextTabs = [...tabs, nextTab]
    persistTabs(nextTabs, nextTab.id)
  }, [defaultTabTitle, persistTabs, tabs])

  const removeTab = useCallback(
    (tabId: string) => {
      if (tabs.length <= 1) return
      const nextTabs = tabs.filter((tab) => tab.id !== tabId)
      const nextActiveId = activeTabId === tabId ? (nextTabs[0]?.id ?? '') : activeTabId
      persistTabs(nextTabs, nextActiveId)
    },
    [activeTabId, persistTabs, tabs],
  )

  const updateTabById = useCallback(
    (tabId: string, patch: Partial<Pick<DragDropMathExerciseTab, 'title' | 'canvasRows'>>) => {
      const nextTabs = tabs.map((tab) => (tab.id === tabId ? { ...tab, ...patch } : tab))
      persistTabs(nextTabs, activeTabId)
    },
    [activeTabId, persistTabs, tabs],
  )

  const updateActiveTabTitle = useCallback(
    (title: string) => {
      if (!activeTab) return
      updateTabById(activeTab.id, { title })
    },
    [activeTab, updateTabById],
  )

  const updateActiveTabCanvasRows = useCallback(
    (canvasRows: DragDropMathCanvasRow[]) => {
      if (!activeTab) return
      updateTabById(activeTab.id, { canvasRows })
    },
    [activeTab, updateTabById],
  )

  const selectTabItems: TabItem[] = useMemo(
    () =>
      tabs.map((tab) => ({
        id: tab.id,
        title: resolveSelectTabDisplayTitle(tab.title, defaultTabTitle),
        closable: tabs.length > 1,
      })),
    [defaultTabTitle, tabs],
  )

  const activeTabDisplayTitle = activeTab
    ? resolveExerciseTabLabel(activeTab.title, defaultTabTitle)
    : defaultTabTitle

  return {
    tabs,
    activeTab,
    activeTabId: activeTab?.id ?? activeTabId,
    activeTabDisplayTitle,
    selectTabItems,
    setActiveTabId,
    addTab,
    removeTab,
    updateActiveTabTitle,
    updateActiveTabCanvasRows,
  }
}
