import { createCanvasRowId, createCanvasTokenId } from './canvasDnd.utils'
import { formatGroupedNumber } from './numberDisplay'
import { buildTokens, isNumberToken, isUnitToken } from './tokenLayer'
import { tokenizeEquationInput } from './mathExpressionTokens'
import { findUnitDefinition, type UnitCategory, type UnitDefinition } from './unitDefinitions'
import type { SigmaCanvasRow, SigmaItem } from '../types/sigma-row.types'

export type ParsedResultChip = {
  value: number
  displayUnit: string
  category: UnitCategory
  unitSymbol: string
}

export type SigmaDropRejection = {
  allowed: false
  message: string
}

export type SigmaDropAcceptance = {
  allowed: true
}

export type SigmaDropDecision = SigmaDropAcceptance | SigmaDropRejection

/** Each sigma row owns its own items/lock/result — never aggregate across rows. */
export function createEmptySigmaRow(): SigmaCanvasRow {
  return {
    id: createCanvasRowId(),
    variant: 'sigma',
    lockedCategory: null,
    lockedUnit: null,
    items: [],
    result: null,
    resultDisplay: null,
    resultTokenId: createCanvasTokenId(),
  }
}

/** Ensures persisted sigma rows have all required fields. */
export function normalizeSigmaRow(row: SigmaCanvasRow): SigmaCanvasRow {
  return withComputedResult({
    id: row.id,
    variant: 'sigma',
    lockedCategory: row.lockedCategory ?? null,
    lockedUnit: row.lockedUnit ?? null,
    items: Array.isArray(row.items) ? [...row.items] : [],
    result: null,
    resultDisplay: null,
    resultTokenId: row.resultTokenId ?? createCanvasTokenId(),
  })
}

/** Display for a single chip inside a sigma row (e.g. `340 €`). */
export function formatSigmaItemDisplay(item: Pick<SigmaItem, 'value' | 'displayUnit'>): string {
  return `${formatGroupedNumber(item.value)} ${item.displayUnit}`.trim()
}

/** Display for the computed sum (e.g. `1.000.340,60 €`). */
export function formatSigmaResultDisplay(sum: number, displayUnit: string): string {
  return `${formatGroupedNumber(sum)} ${displayUnit}`.trim()
}

/** Parses a ghost result chip value (e.g. `340 €`, `81,6 €`). */
export function parseResultChipValue(display: string): ParsedResultChip | null {
  const tokens = buildTokens(tokenizeEquationInput(display))
  let numericValue: number | null = null
  let unitDef: UnitDefinition | null = null

  for (const token of tokens) {
    if (isNumberToken(token)) {
      numericValue = token.value
      continue
    }
    if (isUnitToken(token)) {
      unitDef = token.definition
    }
  }

  if (numericValue === null || unitDef === null) return null

  return {
    value: numericValue,
    displayUnit: unitDef.displaySymbol,
    category: unitDef.category,
    unitSymbol: unitDef.symbol,
  }
}

/** Sums only this row's items — no cross-row state. */
export function computeSigmaResult(items: readonly SigmaItem[]): number | null {
  if (items.length === 0) return null
  const sum = items.reduce((total, item) => total + item.value, 0)
  return Number.isFinite(sum) ? sum : null
}

function withComputedResult(row: SigmaCanvasRow): SigmaCanvasRow {
  const result = computeSigmaResult(row.items)
  const displayUnit = row.items[0]?.displayUnit ?? ''
  return {
    ...row,
    result,
    resultDisplay:
      result !== null && displayUnit.length > 0
        ? formatSigmaResultDisplay(result, displayUnit)
        : null,
  }
}

export function isSigmaDropAllowed(
  row: SigmaCanvasRow,
  parsed: ParsedResultChip,
): SigmaDropDecision {
  if (row.lockedCategory === null) {
    return { allowed: true }
  }

  if (row.lockedCategory !== parsed.category || row.lockedUnit !== parsed.unitSymbol) {
    const lockedDef = findUnitDefinition(row.lockedUnit ?? '')
    const lockedLabel = lockedDef?.displaySymbol ?? row.lockedUnit ?? '?'
    return {
      allowed: false,
      message: `Nur ${lockedLabel}-Werte erlaubt. Alle Tokens entfernen um neu zu starten.`,
    }
  }

  return { allowed: true }
}

export function resetSigma(row: SigmaCanvasRow): SigmaCanvasRow {
  return {
    ...row,
    lockedCategory: null,
    lockedUnit: null,
    items: [],
    result: null,
    resultDisplay: null,
    resultTokenId: createCanvasTokenId(),
  }
}

/**
 * Adds a parsed result chip to one sigma row. Mutates only `row` (by id in the caller).
 */
export function dropOnSigmaRow(
  row: SigmaCanvasRow,
  resultDisplay: string,
  sourceTokenId: string,
): { row: SigmaCanvasRow; ok: true } | { row: SigmaCanvasRow; ok: false; message: string } {
  const parsed = parseResultChipValue(resultDisplay)
  if (!parsed) {
    return { row, ok: false, message: 'Ungültiger Ergebniswert.' }
  }

  const decision = isSigmaDropAllowed(row, parsed)
  if (!decision.allowed) {
    return { row, ok: false, message: decision.message }
  }

  const item: SigmaItem = {
    id: createCanvasTokenId(),
    value: parsed.value,
    displayUnit: parsed.displayUnit,
    sourceTokenId,
  }

  const next: SigmaCanvasRow = withComputedResult({
    ...row,
    lockedCategory: row.lockedCategory ?? parsed.category,
    lockedUnit: row.lockedUnit ?? parsed.unitSymbol,
    items: [...row.items, item],
  })

  return { row: next, ok: true }
}
