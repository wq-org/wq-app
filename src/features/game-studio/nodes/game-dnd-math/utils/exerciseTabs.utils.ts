import {
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
  type GameDragDropMathNodeData,
} from '../types/drag-drop-math.schema'
import type { DragDropMathExerciseTab } from '../types/exercise-tab.types'
import { createCanvasRowId } from './canvasDnd.utils'
import { normalizeSigmaRow } from './sigmaRow'

export function createExerciseTabId(): string {
  return `exercise-tab-${crypto.randomUUID()}`
}

export function normalizeCanvasRows(rows: unknown): DragDropMathCanvasRow[] {
  if (!Array.isArray(rows)) return []
  return rows.map((row): DragDropMathCanvasRow => {
    if (!row || typeof row !== 'object') {
      return { id: createCanvasRowId(), variant: 'math', tokens: [] }
    }
    if (row.variant === 'sigma') return normalizeSigmaRow(row)
    if (isTokenCanvasRow(row)) return row
    const legacyRow = row as {
      id: string
      tokens?: DragDropMathCanvasToken[]
      variant?: string
    }
    const variant =
      legacyRow.variant === 'math' || legacyRow.variant === 'text'
        ? legacyRow.variant
        : (legacyRow.tokens?.[0]?.variant ?? 'math')
    return {
      id: legacyRow.id,
      variant,
      tokens: Array.isArray(legacyRow.tokens) ? legacyRow.tokens : [],
    }
  })
}

function normalizeExerciseTab(raw: unknown, defaultTabTitle: string): DragDropMathExerciseTab {
  if (!raw || typeof raw !== 'object') {
    return {
      id: createExerciseTabId(),
      title: defaultTabTitle,
      canvasRows: [],
    }
  }
  const row = raw as Partial<DragDropMathExerciseTab>
  return {
    id: typeof row.id === 'string' && row.id.length > 0 ? row.id : createExerciseTabId(),
    title: typeof row.title === 'string' ? row.title : defaultTabTitle,
    canvasRows: normalizeCanvasRows(row.canvasRows),
  }
}

export function createEmptyExerciseTab(defaultTabTitle: string): DragDropMathExerciseTab {
  return {
    id: createExerciseTabId(),
    title: defaultTabTitle,
    canvasRows: [],
  }
}

export function resolveExerciseTabsState(
  data: GameDragDropMathNodeData,
  defaultTabTitle: string,
): { tabs: DragDropMathExerciseTab[]; activeTabId: string } {
  const existing = data.exerciseTabs
  if (Array.isArray(existing) && existing.length > 0) {
    const tabs = existing.map((tab) => normalizeExerciseTab(tab, defaultTabTitle))
    const activeId =
      typeof data.activeExerciseTabId === 'string' &&
      tabs.some((tab) => tab.id === data.activeExerciseTabId)
        ? data.activeExerciseTabId
        : tabs[0].id
    return { tabs, activeTabId: activeId }
  }

  const migrated: DragDropMathExerciseTab = {
    id: createExerciseTabId(),
    title:
      typeof data.title === 'string' && data.title.trim().length > 0 ? data.title : defaultTabTitle,
    canvasRows: normalizeCanvasRows(data.canvasRows),
  }
  return { tabs: [migrated], activeTabId: migrated.id }
}

export function resolveExerciseTabLabel(title: string, fallback: string): string {
  const trimmed = title.trim()
  return trimmed.length > 0 ? trimmed : fallback
}
