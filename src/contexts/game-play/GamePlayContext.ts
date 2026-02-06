import { createContext, useCallback, useContext, useRef, useState } from 'react'

export interface GamePlayStats {
  correctAnswers: number
  wrongAnswers: number
  score: number
}

export interface GamePlayContextValue extends GamePlayStats {
  reportResult: (nodeId: string, correct: number, wrong: number, score: number) => void
}

export const GamePlayContext = createContext<GamePlayContextValue | null>(null)

export function useGamePlay() {
  const ctx = useContext(GamePlayContext)
  return ctx
}

export function useGamePlayState() {
  const [stats, setStats] = useState<GamePlayStats>({
    correctAnswers: 0,
    wrongAnswers: 0,
    score: 0,
  })
  const reportedByNode = useRef<Map<string, { correct: number; wrong: number; score: number }>>(
    new Map(),
  )

  const reportResult = useCallback(
    (nodeId: string, correct: number, wrong: number, score: number) => {
      const prev = reportedByNode.current.get(nodeId)
      if (prev) {
        setStats((s) => ({
          correctAnswers: s.correctAnswers - prev.correct + correct,
          wrongAnswers: s.wrongAnswers - prev.wrong + wrong,
          score: s.score - prev.score + score,
        }))
      } else {
        setStats((s) => ({
          correctAnswers: s.correctAnswers + correct,
          wrongAnswers: s.wrongAnswers + wrong,
          score: s.score + score,
        }))
      }
      reportedByNode.current.set(nodeId, { correct, wrong, score })
    },
    [],
  )

  const value: GamePlayContextValue = {
    ...stats,
    reportResult,
  }

  return value
}
