import type { HistoryState } from '../types/game-studio.types'

export default function useGamePersistence(): {
  save: () => Promise<void>
  load: () => Promise<HistoryState[]>
} {
  return {
    save: async () => {},
    load: async () => [],
  }
}
