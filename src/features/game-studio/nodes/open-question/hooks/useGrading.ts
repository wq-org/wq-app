import { useCallback, useState } from 'react'

import { gradeOpenQuestionAnswer } from '../api/gradingApi'
import type { GradingRequest, GradingResponse } from '../types/grading.types'

export type UseGradingResult = {
  marksAwarded: number
  isGrading: boolean
  gradingError: string | null
  lastResult: GradingResponse | null
  gradeAnswer: (request: GradingRequest) => Promise<GradingResponse | null>
  resetGrading: () => void
}

export function useGrading(): UseGradingResult {
  const [marksAwarded, setMarksAwarded] = useState(0)
  const [isGrading, setIsGrading] = useState(false)
  const [gradingError, setGradingError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<GradingResponse | null>(null)

  const resetGrading = useCallback(() => {
    setMarksAwarded(0)
    setIsGrading(false)
    setGradingError(null)
    setLastResult(null)
  }, [])

  const gradeAnswer = useCallback(async (request: GradingRequest) => {
    setIsGrading(true)
    setGradingError(null)

    try {
      const result = await gradeOpenQuestionAnswer(request)
      setMarksAwarded(result.marksAwarded)
      setLastResult(result)
      return result
    } catch {
      setGradingError('grading_failed')
      setMarksAwarded(0)
      setLastResult(null)
      return null
    } finally {
      setIsGrading(false)
    }
  }, [])

  return {
    marksAwarded,
    isGrading,
    gradingError,
    lastResult,
    gradeAnswer,
    resetGrading,
  }
}
