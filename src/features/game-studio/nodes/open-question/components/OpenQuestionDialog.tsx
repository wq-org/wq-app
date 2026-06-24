import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useGameEditorContext } from '@/contexts/game-studio'
import type { GameNodeField } from '@/contexts/game-studio'
import type { EditorExternalInsertApi } from '@/features/lexical-editor'
import { GameNodeDialogShell } from '../../../components/GameNodeDialogShell'
import { GameLayout } from '../../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../../_registry/game-node-registry.types'
import type {
  GameOpenQuestionNodeData,
  OpenQuestionAuthoredQuestion,
} from '../types/open-question.schema'
import { getMissingOpenQuestionDefaults } from '../utils'
import { OpenQuestionEditor } from './OpenQuestionEditor'
import { OpenQuestionPreview } from './OpenQuestionPreview'
import { OpenQuestionSettings } from './OpenQuestionSettings'

export function OpenQuestionDialog({
  nodeId,
  onClose,
  onDelete,
  onNavigateToNode,
  nodeData,
  onPatchNodeData,
  flowNodes = [],
  flowEdges = [],
}: GameNodeDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const editorContext = useGameEditorContext()
  const registerNodeFields = editorContext?.registerNodeFields
  const unregisterNodeFields = editorContext?.unregisterNodeFields
  const openQuestionNodeData = nodeData as GameOpenQuestionNodeData

  const questionsRef = useRef<OpenQuestionAuthoredQuestion[]>(
    Array.isArray(openQuestionNodeData.questions) ? openQuestionNodeData.questions : [],
  )
  const descriptionInsertApiRef = useRef<EditorExternalInsertApi | null>(null)

  useEffect(() => {
    questionsRef.current = Array.isArray(openQuestionNodeData.questions)
      ? openQuestionNodeData.questions
      : []
  }, [openQuestionNodeData.questions])

  const handleDescriptionInsertReady = useCallback((api: EditorExternalInsertApi | null) => {
    descriptionInsertApiRef.current = api
  }, [])

  // Rich-text: use the live Lexical append API so the mounted editor reflects the insert
  const setDescriptionText = useCallback((text: string) => {
    descriptionInsertApiRef.current?.appendText(text)
  }, [])
  const insertDescriptionImage = useCallback(
    (url: string) => descriptionInsertApiRef.current?.appendImage(url) ?? false,
    [],
  )

  // List every exercise as an agent target so the teacher can pick a slot
  // without first switching tabs in the editor. The `setValue` below switches
  // the tab as a side effect so the insertion is visible without extra clicks.
  const questions = useMemo(
    () => (Array.isArray(openQuestionNodeData.questions) ? openQuestionNodeData.questions : []),
    [openQuestionNodeData.questions],
  )

  // Append + switch tab atomically. Append uses the live `questions` from the
  // patch's `current` snapshot — not an outer ref — so two clicks in quick
  // succession can't both read the same "previous" value.
  const patchExerciseField = useCallback(
    (exerciseId: string, field: 'question' | 'answer', text: string) => {
      onPatchNodeData((current) => {
        const currentQuestions = Array.isArray(current.questions)
          ? (current.questions as OpenQuestionAuthoredQuestion[])
          : []
        const targetIndex = currentQuestions.findIndex((q) => q.id === exerciseId)
        if (targetIndex === -1) {
          return { activeExerciseId: exerciseId, activeFieldTab: field }
        }
        const target = currentQuestions[targetIndex]
        const previous = field === 'question' ? target.question : target.answer
        const next = previous ? `${previous}\n${text}` : text
        return {
          questions: currentQuestions.map((q, idx) =>
            idx === targetIndex ? { ...q, [field]: next } : q,
          ),
          activeExerciseId: exerciseId,
          activeFieldTab: field,
        }
      })
    },
    [onPatchNodeData],
  )

  useEffect(() => {
    if (!registerNodeFields || !unregisterNodeFields) return

    const exerciseFields: GameNodeField[] = questions.flatMap((question, index) => {
      const labelIndex = index + 1
      return [
        {
          nodeId,
          fieldKey: `question:${question.id}`,
          label: t('agent.insertIntoExerciseQuestion', { index: labelIndex }),
          type: 'text',
          setValue: (text: string) => patchExerciseField(question.id, 'question', text),
          getValue: () => questionsRef.current.find((q) => q.id === question.id)?.question ?? '',
        },
        {
          nodeId,
          fieldKey: `answer:${question.id}`,
          label: t('agent.insertIntoExerciseAnswer', { index: labelIndex }),
          type: 'text',
          setValue: (text: string) => patchExerciseField(question.id, 'answer', text),
          getValue: () => questionsRef.current.find((q) => q.id === question.id)?.answer ?? '',
        },
      ]
    })

    registerNodeFields([
      {
        nodeId,
        fieldKey: 'description',
        label: t('agent.insertIntoDescription'),
        type: 'rich-text',
        setValue: setDescriptionText,
        insertImageUrl: insertDescriptionImage,
        imageInsertLabel: t('agent.insertIntoDescription'),
      },
      ...exerciseFields,
    ])
    return () => unregisterNodeFields(nodeId)
  }, [
    nodeId,
    registerNodeFields,
    unregisterNodeFields,
    questions,
    patchExerciseField,
    setDescriptionText,
    insertDescriptionImage,
    t,
  ])

  const defaultsAppliedRef = useRef(false)

  useEffect(() => {
    if (defaultsAppliedRef.current) return
    const defaultPatch = getMissingOpenQuestionDefaults(openQuestionNodeData)
    if (Object.keys(defaultPatch).length === 0) return
    defaultsAppliedRef.current = true
    queueMicrotask(() => onPatchNodeData(defaultPatch))
  }, [onPatchNodeData, openQuestionNodeData])

  const prevEdge = flowEdges.find((edge) => edge.target === nodeId)
  const nextEdge = flowEdges.find((edge) => edge.source === nodeId)
  const prevNode = prevEdge
    ? { id: prevEdge.source, nodeType: flowNodes.find((node) => node.id === prevEdge.source)?.type }
    : undefined
  const nextNode = nextEdge
    ? { id: nextEdge.target, nodeType: flowNodes.find((node) => node.id === nextEdge.target)?.type }
    : undefined

  return (
    <GameNodeDialogShell
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={t('openQuestionDialog.title')}
      description={t('openQuestionDialog.description')}
    >
      <GameLayout
        editorContent={
          <OpenQuestionEditor
            nodeId={nodeId}
            nodeData={openQuestionNodeData}
            onPatchNodeData={onPatchNodeData}
            onDescriptionInsertReady={handleDescriptionInsertReady}
          />
        }
        previewContent={
          <OpenQuestionPreview
            nodeId={nodeId}
            nodeData={openQuestionNodeData}
          />
        }
        settingsContent={
          <OpenQuestionSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={openQuestionNodeData}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
