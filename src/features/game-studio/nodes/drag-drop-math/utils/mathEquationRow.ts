import {
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
} from '../types/drag-drop-math.schema'
import type { MathTokenRole } from '../types/math-token-role.types'
import type { MathTokenShellState } from '../types/math-token-shell.types'
import { createCanvasTokenId } from './canvasDnd.utils'

export const MATH_EQUALS_DISPLAY = '=' as const

export type MathEquationCommitPayload =
  | { kind: 'empty' }
  | { kind: 'error'; raw: string }
  | {
      kind: 'success'
      /** Literal input from the editor (re-shown when editing again). */
      raw: string
      /** Formatted equation for the committed chip display (e.g. `40 × 8.50 €`). */
      expression: string
      display: string
      /** Equation chip shell after commit when instant color feedback is on. */
      equationShell?: MathTokenShellState
    }

function createMathSuffixToken(
  role: Extract<MathTokenRole, 'equals' | 'result'>,
  value: string,
): DragDropMathCanvasToken {
  return {
    id: createCanvasTokenId(),
    variant: 'math',
    mathRole: role,
    value,
    disabled: true,
    mathShell: 'ghost',
  }
}

export function createMathEqualsToken(): DragDropMathCanvasToken {
  return createMathSuffixToken('equals', MATH_EQUALS_DISPLAY)
}

export function createMathResultToken(display: string): DragDropMathCanvasToken {
  return createMathSuffixToken('result', display)
}

/**
 * Spawns a fresh editable equation chip from a result display value.
 * Used when an author drags a ghost result onto a new row to keep calculating
 * with that number — the new chip is independent of the source row.
 */
export function createMathEquationFromResult(value: string): DragDropMathCanvasToken {
  return {
    id: createCanvasTokenId(),
    variant: 'math',
    mathRole: 'equation',
    value,
    expression: value,
    mathShell: 'default',
    disabled: false,
  }
}

/** Editable math pill (legacy rows without `mathRole` count as equation). */
export function isEditableEquationToken(token: DragDropMathCanvasToken): boolean {
  return token.variant === 'math' && token.mathRole !== 'equals' && token.mathRole !== 'result'
}

export function isFixedMathSuffixToken(token: DragDropMathCanvasToken): boolean {
  return token.mathRole === 'equals' || token.mathRole === 'result'
}

export function rowHasEquationToken(row: DragDropMathCanvasRow): boolean {
  if (!isTokenCanvasRow(row)) return false
  return row.tokens.some(isEditableEquationToken)
}

/** Equation id plus any `=` / result badges that follow it in the row. */
export function collectEquationGroupTokenIds(
  row: DragDropMathCanvasRow,
  equationTokenId: string,
): string[] {
  if (!isTokenCanvasRow(row)) return []
  const startIndex = row.tokens.findIndex((token) => token.id === equationTokenId)
  if (startIndex < 0) return []

  const ids = [equationTokenId]
  for (let index = startIndex + 1; index < row.tokens.length; index += 1) {
    const role = row.tokens[index].mathRole
    if (role === 'equals' || role === 'result') {
      ids.push(row.tokens[index].id)
    } else {
      break
    }
  }
  return ids
}

export function removeTokensById(
  row: DragDropMathCanvasRow,
  tokenIds: ReadonlySet<string>,
): DragDropMathCanvasToken[] {
  if (!isTokenCanvasRow(row)) return []
  return row.tokens.filter((token) => !tokenIds.has(token.id))
}

function buildEvaluatedEquationTokens(
  equationToken: DragDropMathCanvasToken,
  displayValue: string,
  editValue: string,
  resultDisplay: string,
  equationShell: MathTokenShellState = 'default',
  existing?: { equals?: DragDropMathCanvasToken; result?: DragDropMathCanvasToken },
): DragDropMathCanvasToken[] {
  const equation: DragDropMathCanvasToken = {
    ...equationToken,
    mathRole: 'equation',
    value: displayValue,
    expression: editValue,
    mathShell: equationShell,
    disabled: false,
  }

  const equals = existing?.equals ?? createMathEqualsToken()

  const result: DragDropMathCanvasToken = {
    ...(existing?.result ?? createMathResultToken(resultDisplay)),
    mathRole: 'result',
    value: resultDisplay,
    expression: undefined,
    mathShell: 'ghost',
    disabled: true,
  }

  return [
    equation,
    { ...equals, value: MATH_EQUALS_DISPLAY, mathShell: 'ghost', disabled: true },
    result,
  ]
}

export function applyMathEquationCommitToRow(
  row: DragDropMathCanvasRow,
  equationTokenId: string,
  payload: MathEquationCommitPayload,
): DragDropMathCanvasRow {
  if (!isTokenCanvasRow(row)) return row
  const groupIds = new Set(collectEquationGroupTokenIds(row, equationTokenId))
  const equationToken = row.tokens.find((token) => token.id === equationTokenId)
  if (!equationToken) return row

  const withoutGroup = removeTokensById(row, groupIds)
  const existingEquals = row.tokens.find(
    (token) => token.mathRole === 'equals' && groupIds.has(token.id),
  )
  const existingResult = row.tokens.find(
    (token) => token.mathRole === 'result' && groupIds.has(token.id),
  )

  if (payload.kind === 'empty') {
    return { ...row, tokens: withoutGroup }
  }

  if (payload.kind === 'error') {
    const errored: DragDropMathCanvasToken = {
      ...equationToken,
      mathRole: 'equation',
      value: payload.raw,
      expression: payload.raw,
      mathShell: 'error' satisfies MathTokenShellState,
      disabled: false,
    }
    return { ...row, tokens: [...withoutGroup, errored] }
  }

  const evaluated = buildEvaluatedEquationTokens(
    equationToken,
    payload.expression,
    payload.raw,
    payload.display,
    payload.equationShell ?? 'default',
    {
      equals: existingEquals,
      result: existingResult,
    },
  )

  return { ...row, tokens: [...withoutGroup, ...evaluated] }
}

export function applyMathEquationCommitToRows(
  rows: readonly DragDropMathCanvasRow[],
  equationTokenId: string,
  payload: MathEquationCommitPayload,
): DragDropMathCanvasRow[] {
  return rows.map((row) => {
    if (!isTokenCanvasRow(row)) return row
    if (!row.tokens.some((token) => token.id === equationTokenId)) return row
    return applyMathEquationCommitToRow(row, equationTokenId, payload)
  })
}

export function extractEquationGroupTokens(
  rows: readonly DragDropMathCanvasRow[],
  equationTokenId: string,
): DragDropMathCanvasToken[] {
  for (const row of rows) {
    if (!isTokenCanvasRow(row)) continue
    const ids = collectEquationGroupTokenIds(row, equationTokenId)
    if (ids.length === 0) continue
    return ids
      .map((id) => row.tokens.find((token) => token.id === id))
      .filter((token): token is DragDropMathCanvasToken => token != null)
  }
  return []
}
