import type { UnitCategory } from '../utils/unitDefinitions'

export type SigmaItem = {
  readonly id: string
  readonly value: number
  readonly displayUnit: string
  readonly sourceTokenId: string
}

export type SigmaCanvasRow = {
  readonly id: string
  readonly variant: 'sigma'
  readonly lockedCategory: UnitCategory | null
  readonly lockedUnit: string | null
  readonly items: readonly SigmaItem[]
  readonly result: number | null
  /** Formatted sum for display and result-chip drag (e.g. `541.60 €`). */
  readonly resultDisplay: string | null
  readonly resultTokenId: string
}
