import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { OPEN_QUESTION_NEXT_DELAY_MS } from '../constants/open-question.constants'
import type { OpenQuestionAuthoredQuestion } from '../types/open-question.schema'
import { calcPointsPerOpenQuestion, collectGradableOpenQuestions } from '../utils'

export type UseOpenQuestionPreviewLoopArgs = {
  questions: readonly OpenQuestionAuthoredQuestion[] | undefined
  maxScore: number
}

export type UseOpenQuestionPreviewLoopResult = {
  /** Filled questions in the order they appear in `nodeData.questions`. */
  filledQuestions: readonly OpenQuestionAuthoredQuestion[]
  currentIndex: number
  currentQuestion: OpenQuestionAuthoredQuestion | undefined
  /** Per-question award (max / filled, 1 decimal). */
  pointsPerQuestion: number
  earnedTotal: number
  /** True once every filled question has been graded. */
  isFinished: boolean
  /** True while we are waiting `OPEN_QUESTION_NEXT_DELAY_MS` before advancing. */
  isAdvancing: boolean
  /** Record the awarded marks for the current question and schedule advancement. */
  recordAwardAndAdvance: (marks: number) => void
  /** Hard reset (e.g. when authored questions change). */
  reset: () => void
}

export function useOpenQuestionPreviewLoop({
  questions,
  maxScore,
}: UseOpenQuestionPreviewLoopArgs): UseOpenQuestionPreviewLoopResult {
  const filledQuestions = useMemo(() => collectGradableOpenQuestions(questions), [questions])
  const pointsPerQuestion = useMemo(
    () => calcPointsPerOpenQuestion(maxScore, filledQuestions.length),
    [filledQuestions.length, maxScore],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [gradedCount, setGradedCount] = useState(0)
  const [earnedTotal, setEarnedTotal] = useState(0)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAdvanceTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => () => clearAdvanceTimer(), [clearAdvanceTimer])

  const reset = useCallback(() => {
    clearAdvanceTimer()
    setCurrentIndex(0)
    setGradedCount(0)
    setEarnedTotal(0)
    setIsAdvancing(false)
  }, [clearAdvanceTimer])

  const recordAwardAndAdvance = useCallback(
    (marks: number) => {
      const safeMarks = Number.isFinite(marks) ? Math.max(0, marks) : 0
      setEarnedTotal((prev) => Math.round((prev + safeMarks) * 10) / 10)
      setGradedCount((prev) => prev + 1)

      if (currentIndex >= filledQuestions.length - 1) {
        setIsAdvancing(false)
        return
      }

      setIsAdvancing(true)
      clearAdvanceTimer()
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAdvancing(false)
        timerRef.current = null
      }, OPEN_QUESTION_NEXT_DELAY_MS)
    },
    [clearAdvanceTimer, currentIndex, filledQuestions.length],
  )

  const isFinished =
    filledQuestions.length > 0 && gradedCount >= filledQuestions.length && !isAdvancing

  return {
    filledQuestions,
    currentIndex,
    currentQuestion: filledQuestions[currentIndex],
    pointsPerQuestion,
    earnedTotal,
    isFinished,
    isAdvancing,
    recordAwardAndAdvance,
    reset,
  }
}
