import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useGameEditorContext } from '@/contexts/game-studio'
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
  const insertDescriptionImage = useCallback((url: string) => {
    descriptionInsertApiRef.current?.appendImage(url)
  }, [])

  // Plain text fields — getValue lets the panel append rather than overwrite
  const setQuestionText = useCallback(
    (text: string) => {
      const qs = questionsRef.current
      if (qs.length === 0) return
      const [first, ...rest] = qs
      onPatchNodeData({ questions: [{ ...first, question: text }, ...rest] })
    },
    [onPatchNodeData],
  )
  const getQuestionText = useCallback(() => questionsRef.current[0]?.question ?? '', [])

  const setAnswerText = useCallback(
    (text: string) => {
      const qs = questionsRef.current
      if (qs.length === 0) return
      const [first, ...rest] = qs
      onPatchNodeData({ questions: [{ ...first, answer: text }, ...rest] })
    },
    [onPatchNodeData],
  )
  const getAnswerText = useCallback(() => questionsRef.current[0]?.answer ?? '', [])

  useEffect(() => {
    editorContext?.registerNodeFields([
      {
        nodeId,
        fieldKey: 'description',
        label: t('agent.insertIntoDescription'),
        type: 'rich-text',
        setValue: setDescriptionText,
        insertImageUrl: insertDescriptionImage,
        imageInsertLabel: t('agent.insertIntoDescription'),
      },
      {
        nodeId,
        fieldKey: 'question',
        label: t('agent.insertIntoQuestion'),
        type: 'text',
        setValue: setQuestionText,
        getValue: getQuestionText,
      },
      {
        nodeId,
        fieldKey: 'answer',
        label: t('agent.insertIntoAnswer'),
        type: 'text',
        setValue: setAnswerText,
        getValue: getAnswerText,
      },
    ])
    return () => editorContext?.unregisterNodeFields(nodeId)
  }, [
    nodeId,
    editorContext,
    setDescriptionText,
    insertDescriptionImage,
    setQuestionText,
    getQuestionText,
    setAnswerText,
    getAnswerText,
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
