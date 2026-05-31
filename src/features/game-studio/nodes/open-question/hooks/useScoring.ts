import { useCallback, useState } from 'react'

import { scoreOpenQuestionAnswer } from '../api/scoringApi'
import type { ScoringRequest, ScoringResponse } from '../types/scoring.types'

export type UseScoringResult = {
  marksAwarded: number
  isScoring: boolean
  scoringError: string | null
  lastResult: ScoringResponse | null
  scoreAnswer: (request: ScoringRequest) => Promise<ScoringResponse | null>
  resetScoring: () => void
}

export function useScoring(): UseScoringResult {
  const [marksAwarded, setMarksAwarded] = useState(0)
  const [isScoring, setIsScoring] = useState(false)
  const [scoringError, setScoringError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<ScoringResponse | null>(null)

  const resetScoring = useCallback(() => {
    setMarksAwarded(0)
    setIsScoring(false)
    setScoringError(null)
    setLastResult(null)
  }, [])

  const scoreAnswer = useCallback(async (request: ScoringRequest) => {
    setIsScoring(true)
    setScoringError(null)

    try {
      const result = await scoreOpenQuestionAnswer(request)
      setMarksAwarded(result.marksAwarded)
      setLastResult(result)
      return result
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[useScoring] scoreOpenQuestionAnswer failed', error)
      }
      setScoringError('scoring_failed')
      setMarksAwarded(0)
      setLastResult(null)
      return null
    } finally {
      setIsScoring(false)
    }
  }, [])

  return {
    marksAwarded,
    isScoring,
    scoringError,
    lastResult,
    scoreAnswer,
    resetScoring,
  }
}
