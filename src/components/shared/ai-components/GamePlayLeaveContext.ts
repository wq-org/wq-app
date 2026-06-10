import { createContext, useContext } from 'react'

export type GamePlayLeaveLabels = {
  badgeLabel: string
  dialogTitle: string
  dialogDescription: string
  cancelLabel: string
  confirmLabel: string
}

export type GamePlayLeaveContextValue = {
  labels: GamePlayLeaveLabels | null
  dialogOpen: boolean
  requestLeave: () => void
  confirmLeave: () => void
  cancelLeave: () => void
}

export const GamePlayLeaveContext = createContext<GamePlayLeaveContextValue | null>(null)

export function useGamePlayLeave(): GamePlayLeaveContextValue | null {
  return useContext(GamePlayLeaveContext)
}
