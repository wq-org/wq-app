import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useGameEditorContext } from '@/contexts/game-studio'
import type { GameNodeField } from '@/contexts/game-studio'
import type { EditorExternalInsertApi } from '@/features/lexical-editor'

import { GameNodeDialogShell } from '../../../components/GameNodeDialogShell'
import { GameLayout } from '../../../components/GameDialogLayout'
import type { GameNodeDialogProps } from '../../_registry/game-node-registry.types'
import type { GameDragDropMathNodeData } from '../types/drag-drop-math.schema'
import type { DragDropMathExerciseTab } from '../types/exercise-tab.types'
import { DnDMathEditor } from './DnDMathEditor'
import { DnDMathPreview } from './DnDMathPreview'
import { DnDMathSettings } from './DnDMathSettings'

export function DnDMathDialog(props: GameNodeDialogProps) {
  const {
    nodeId,
    nodeData,
    onPatchNodeData,
    onClose,
    onDelete,
    onNavigateToNode,
    flowNodes = [],
    flowEdges = [],
  } = props

  const { t } = useTranslation('features.gameStudio')
  const editorContext = useGameEditorContext()
  const registerNodeFields = editorContext?.registerNodeFields
  const unregisterNodeFields = editorContext?.unregisterNodeFields
  const dragDropMathNodeData = nodeData as GameDragDropMathNodeData

  const descriptionInsertApiRef = useRef<EditorExternalInsertApi | null>(null)
  const nodeDataRef = useRef(dragDropMathNodeData)

  useEffect(() => {
    nodeDataRef.current = dragDropMathNodeData
  }, [dragDropMathNodeData])

  const handleDescriptionInsertReady = useCallback((api: EditorExternalInsertApi | null) => {
    descriptionInsertApiRef.current = api
  }, [])

  const setDescriptionText = useCallback((text: string) => {
    descriptionInsertApiRef.current?.appendText(text)
  }, [])
  const insertDescriptionImage = useCallback((url: string) => {
    descriptionInsertApiRef.current?.appendImage(url)
  }, [])

  const exerciseTabs = useMemo<DragDropMathExerciseTab[]>(
    () =>
      Array.isArray(dragDropMathNodeData.exerciseTabs) ? dragDropMathNodeData.exerciseTabs : [],
    [dragDropMathNodeData.exerciseTabs],
  )

  // Append text to an exercise's title and switch the editor to that tab.
  // Append is computed inside the functional patch so concurrent inserts
  // never race against a stale `previous` snapshot.
  const insertIntoExerciseTitle = useCallback(
    (exerciseId: string, text: string) => {
      onPatchNodeData((current) => {
        const currentTabs = Array.isArray(current.exerciseTabs)
          ? (current.exerciseTabs as DragDropMathExerciseTab[])
          : []
        return {
          exerciseTabs: currentTabs.map((tab) => {
            if (tab.id !== exerciseId) return tab
            const previous = tab.title ?? ''
            return { ...tab, title: previous ? `${previous}\n${text}` : text }
          }),
          activeExerciseTabId: exerciseId,
        }
      })
    },
    [onPatchNodeData],
  )

  useEffect(() => {
    if (!registerNodeFields || !unregisterNodeFields) return

    const titleFields: GameNodeField[] = exerciseTabs.map((tab, index) => ({
      nodeId,
      fieldKey: `exercise-title:${tab.id}`,
      label: t('agent.insertIntoExerciseTitle', { index: index + 1 }),
      type: 'text',
      setValue: (text: string) => insertIntoExerciseTitle(tab.id, text),
      getValue: () =>
        (nodeDataRef.current.exerciseTabs as DragDropMathExerciseTab[] | undefined)?.find(
          (entry) => entry.id === tab.id,
        )?.title ?? '',
    }))

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
      ...titleFields,
    ])
    return () => unregisterNodeFields(nodeId)
  }, [
    nodeId,
    registerNodeFields,
    unregisterNodeFields,
    setDescriptionText,
    insertDescriptionImage,
    insertIntoExerciseTitle,
    exerciseTabs,
    t,
  ])

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
      title="Drag & drop math"
    >
      <GameLayout
        editorContent={
          <DnDMathEditor
            nodeId={nodeId}
            nodeData={nodeData}
            onPatchNodeData={onPatchNodeData}
            onDescriptionInsertReady={handleDescriptionInsertReady}
          />
        }
        previewContent={
          <DnDMathPreview
            nodeId={nodeId}
            nodeData={dragDropMathNodeData}
          />
        }
        settingsContent={
          <DnDMathSettings
            nodeId={nodeId}
            onDelete={onDelete}
            onClose={onClose}
            onNavigateToNode={onNavigateToNode}
            onPatchNodeData={onPatchNodeData}
            nodeData={dragDropMathNodeData}
            prevNode={prevNode}
            nextNode={nextNode}
          />
        }
      />
    </GameNodeDialogShell>
  )
}
