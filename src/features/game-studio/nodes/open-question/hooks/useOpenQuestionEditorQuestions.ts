import { useCallback, useMemo } from 'react'
import type { TFunction } from 'i18next'
import { CircleQuestionMark, SpellCheck } from 'lucide-react'

import type { TabItem } from '@/components/shared'

import { OPEN_QUESTION_MAX_QUESTIONS } from '../constants/open-question.constants'
import type {
  GameOpenQuestionNodeData,
  OpenQuestionAuthoredQuestion,
} from '../types/open-question.schema'
import { buildPersistOpenQuestionExercisesPatch, normalizeAuthoredQuestions } from '../utils'

export type OpenQuestionEditorFieldTab = 'question' | 'answer'

function createBlankQuestion(): OpenQuestionAuthoredQuestion {
  return {
    id: `oq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: '',
    answer: '',
  }
}

export type UseOpenQuestionEditorQuestionsArgs = {
  questions: readonly OpenQuestionAuthoredQuestion[]
  activeExerciseIdFromNode?: string
  activeFieldTabFromNode?: OpenQuestionEditorFieldTab
  onPatchNodeData: (patch: Partial<GameOpenQuestionNodeData>) => void
  t: TFunction<'features.gameStudio'>
}

export type UseOpenQuestionEditorQuestionsResult = {
  questions: readonly OpenQuestionAuthoredQuestion[]
  activeQuestion: OpenQuestionAuthoredQuestion | undefined
  activeQuestionId: string
  exerciseTabItems: TabItem[]
  fieldTabItems: TabItem[]
  activeFieldTab: OpenQuestionEditorFieldTab
  setActiveTabId: (tabId: string) => void
  setActiveFieldTab: (tab: OpenQuestionEditorFieldTab) => void
  handleAddQuestion: () => void
  handleDeleteQuestion: (questionId: string) => void
  handleActiveFieldChange: (value: string) => void
  isAddDisabled: boolean
  activeFieldValue: string
  activeFieldPlaceholder: string
}

/**
 * Owns exercise tabs (Aufgabe 1–4) and per-exercise field tabs (question / reference answer).
 * Every mutation calls `onPatchNodeData` so React Flow node.data + autosave stay in sync.
 */
export function useOpenQuestionEditorQuestions({
  questions: rawQuestions,
  activeExerciseIdFromNode,
  activeFieldTabFromNode,
  onPatchNodeData,
  t,
}: UseOpenQuestionEditorQuestionsArgs): UseOpenQuestionEditorQuestionsResult {
  const questions = useMemo(() => normalizeAuthoredQuestions(rawQuestions), [rawQuestions])
  const activeFieldTab: OpenQuestionEditorFieldTab = activeFieldTabFromNode ?? 'question'
  const setActiveFieldTab = useCallback(
    (tab: OpenQuestionEditorFieldTab) => {
      onPatchNodeData({ activeFieldTab: tab })
    },
    [onPatchNodeData],
  )

  const activeQuestionId = useMemo(() => {
    if (
      activeExerciseIdFromNode &&
      questions.some((question) => question.id === activeExerciseIdFromNode)
    ) {
      return activeExerciseIdFromNode
    }
    return questions[0]?.id ?? ''
  }, [activeExerciseIdFromNode, questions])

  const activeQuestion = useMemo(
    () => questions.find((question) => question.id === activeQuestionId),
    [activeQuestionId, questions],
  )

  const persistExercises = useCallback(
    (nextQuestions: readonly OpenQuestionAuthoredQuestion[], nextActiveId: string) => {
      onPatchNodeData(buildPersistOpenQuestionExercisesPatch(nextQuestions, nextActiveId))
    },
    [onPatchNodeData],
  )

  const exerciseTabItems = useMemo<TabItem[]>(
    () =>
      questions.map((question, index) => ({
        id: question.id,
        title: t('openQuestionEditor.exerciseLabel', { index: index + 1 }),
        closable: questions.length > 1,
      })),
    [questions, t],
  )

  const fieldTabItems = useMemo<TabItem[]>(
    () => [
      {
        id: 'question',
        title: t('openQuestionEditor.fieldTabQuestion'),
        icon: CircleQuestionMark,
      },
      {
        id: 'answer',
        title: t('openQuestionEditor.fieldTabAnswer'),
        icon: SpellCheck,
      },
    ],
    [t],
  )

  const setActiveTabId = useCallback(
    (tabId: string) => {
      if (!questions.some((question) => question.id === tabId)) return
      persistExercises(questions, tabId)
    },
    [persistExercises, questions],
  )

  const handleAddQuestion = useCallback(() => {
    if (questions.length >= OPEN_QUESTION_MAX_QUESTIONS) return
    const next = createBlankQuestion()
    const nextQuestions = [...questions, next]
    setActiveFieldTab('question')
    persistExercises(nextQuestions, next.id)
  }, [persistExercises, questions, setActiveFieldTab])

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      if (questions.length <= 1) return
      const removedIndex = questions.findIndex((question) => question.id === questionId)
      if (removedIndex === -1) return
      const remaining = questions.filter((question) => question.id !== questionId)
      const fallbackIndex = Math.min(removedIndex, remaining.length - 1)
      const fallbackId = remaining[fallbackIndex]?.id ?? remaining[0]?.id ?? ''
      persistExercises(remaining, fallbackId)
    },
    [persistExercises, questions],
  )

  const handleActiveFieldChange = useCallback(
    (value: string) => {
      if (!activeQuestion) return
      const next = questions.map((question) => {
        if (question.id !== activeQuestion.id) return question
        if (activeFieldTab === 'question') {
          return { ...question, question: value }
        }
        return { ...question, answer: value }
      })
      persistExercises(next, activeQuestionId)
    },
    [activeFieldTab, activeQuestion, activeQuestionId, persistExercises, questions],
  )

  const activeFieldValue =
    activeFieldTab === 'question'
      ? (activeQuestion?.question ?? '')
      : (activeQuestion?.answer ?? '')

  const activeFieldPlaceholder =
    activeFieldTab === 'question'
      ? t('openQuestionEditor.questionPlaceholder')
      : t('openQuestionEditor.answerPlaceholder')

  return {
    questions,
    activeQuestion,
    activeQuestionId,
    exerciseTabItems,
    fieldTabItems,
    activeFieldTab,
    setActiveTabId,
    setActiveFieldTab,
    handleAddQuestion,
    handleDeleteQuestion,
    handleActiveFieldChange,
    isAddDisabled: questions.length >= OPEN_QUESTION_MAX_QUESTIONS,
    activeFieldValue,
    activeFieldPlaceholder,
  }
}
