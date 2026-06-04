import {
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type GameDragDropMathNodeData,
  resolveGameDragDropMathPoints,
} from '../types/drag-drop-math.schema'
import type { DragDropMathExerciseTab } from '../types/exercise-tab.types'
import type { PublishIssue } from '../../../types/publish-validation.types'
import { evaluateMathEquation } from './evaluateMathEquation'
import { resolveExerciseTabsState } from './exerciseTabs.utils'
import { isEditableEquationToken } from './mathEquationRow'

const DEFAULT_TAB_TITLE = 'Exercise 1'

function rowHasContent(row: DragDropMathCanvasRow): boolean {
  if (!isTokenCanvasRow(row)) return true
  return row.tokens.some((token) => String(token.value ?? '').trim().length > 0)
}

function rowIsEvaluatable(row: DragDropMathCanvasRow): boolean {
  if (!isTokenCanvasRow(row) || row.variant !== 'math') return false

  const equationToken = row.tokens.find(isEditableEquationToken)
  if (!equationToken) return false

  const raw = String(equationToken.expression ?? equationToken.value ?? '').trim()
  if (!raw) return false

  const hasResult = row.tokens.some((token) => token.mathRole === 'result')
  if (hasResult) return true

  return evaluateMathEquation(raw).ok
}

function collectDuplicateIds(ids: readonly string[]): Set<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return duplicates
}

function validateTabStructure(tabs: DragDropMathExerciseTab[]): PublishIssue[] {
  const issues: PublishIssue[] = []

  if (tabs.length === 0) {
    issues.push({ code: 'dndMath.tab.none', severity: 'error' })
    return issues
  }

  for (const tab of tabs) {
    if (!tab.title.trim()) {
      issues.push({
        code: 'dndMath.tab.missingTitle',
        severity: 'warning',
        tabId: tab.id,
      })
    }

    if (tab.canvasRows.length === 0) {
      issues.push({
        code: 'dndMath.tab.emptyCanvas',
        severity: 'error',
        tabId: tab.id,
        params: { tabTitle: tab.title.trim() || DEFAULT_TAB_TITLE },
      })
      continue
    }

    const hasContent = tab.canvasRows.some(rowHasContent)
    if (!hasContent) {
      issues.push({
        code: 'dndMath.tab.noContent',
        severity: 'error',
        tabId: tab.id,
        params: { tabTitle: tab.title.trim() || DEFAULT_TAB_TITLE },
      })
    }

    const rowIds = tab.canvasRows.map((row) => row.id)
    const duplicateRowIds = collectDuplicateIds(rowIds)
    if (duplicateRowIds.size > 0) {
      issues.push({
        code: 'dndMath.reference.orphan',
        severity: 'error',
        tabId: tab.id,
        params: { tabTitle: tab.title.trim() || DEFAULT_TAB_TITLE },
      })
    }

    let hasEvaluatableRow = false
    for (const row of tab.canvasRows) {
      if (!isTokenCanvasRow(row) || row.variant !== 'math') continue

      const equationToken = row.tokens.find(isEditableEquationToken)
      if (equationToken) {
        const raw = String(equationToken.expression ?? equationToken.value ?? '').trim()
        if (raw && !evaluateMathEquation(raw).ok) {
          issues.push({
            code: 'dndMath.equation.invalid',
            severity: 'error',
            tabId: tab.id,
            params: { tabTitle: tab.title.trim() || DEFAULT_TAB_TITLE },
          })
        }
      }

      if (rowIsEvaluatable(row)) {
        hasEvaluatableRow = true
      }
    }

    if (!hasEvaluatableRow) {
      issues.push({
        code: 'dndMath.scoring.noEvaluatableRow',
        severity: 'error',
        tabId: tab.id,
        params: { tabTitle: tab.title.trim() || DEFAULT_TAB_TITLE },
      })
    }
  }

  return issues
}

function validateScoringConfig(data: GameDragDropMathNodeData): PublishIssue[] {
  const points = resolveGameDragDropMathPoints(data.points)
  if (!Number.isFinite(points) || points <= 0) {
    return [{ code: 'dndMath.points.invalid', severity: 'error' }]
  }
  return []
}

export function validateGameDragDropMathPublish(data: unknown): PublishIssue[] {
  const d = (data ?? {}) as GameDragDropMathNodeData
  const { tabs } = resolveExerciseTabsState(d, DEFAULT_TAB_TITLE)
  return [...validateTabStructure(tabs), ...validateScoringConfig(d)]
}

/** Registry entry delegates here. */
export function validateGameDragDropMathConfig(data: unknown): PublishIssue[] {
  return validateGameDragDropMathPublish(data)
}
