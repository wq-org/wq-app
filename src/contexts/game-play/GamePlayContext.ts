import { createContext, useCallback, useContext, useRef, useState } from 'react'

export interface GamePlayStats {
  correctAnswers: number
  wrongAnswers: number
  score: number
}

export interface GamePlayNodeResult {
  correct: number
  wrong: number
  score: number
  outcome: 'correct' | 'wrong'
}

export interface GamePlayContextValue extends GamePlayStats {
  resultsByNode: Record<string, GamePlayNodeResult>
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
  const [resultsByNode, setResultsByNode] = useState<Record<string, GamePlayNodeResult>>({})
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

      setResultsByNode((current) => {
        if (wrong > 0) {
          return {
            ...current,
            [nodeId]: {
              correct,
              wrong,
              score,
              outcome: 'wrong',
            },
          }
        }

        if (correct > 0) {
          return {
            ...current,
            [nodeId]: {
              correct,
              wrong,
              score,
              outcome: 'correct',
            },
          }
        }

        if (!(nodeId in current)) return current

        const next = { ...current }
        delete next[nodeId]
        return next
      })
    },
    [],
  )

  const value: GamePlayContextValue = {
    ...stats,
    resultsByNode,
    reportResult,
  }

  return value
}
