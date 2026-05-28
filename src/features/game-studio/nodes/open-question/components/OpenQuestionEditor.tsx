'use client'

import { useCallback, useMemo, useRef, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { SerializedEditorState } from 'lexical'

import { SelectTabs } from '@/components/shared'
import { LexicalTextarea } from '@/components/shared/lexical-textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import {
  useOpenQuestionEditorQuestions,
  type OpenQuestionEditorFieldTab,
} from '../hooks/useOpenQuestionEditorQuestions'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { normalizeAuthoredQuestions } from '../utils'

const DESCRIPTION_MIN_HEIGHT_PX = 40

const openQuestionEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const
const openQuestionEditorEnterSubtle =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export type OpenQuestionEditorProps = {
  nodeId: string
  nodeData: GameOpenQuestionNodeData
  onPatchNodeData: (patch: Partial<GameOpenQuestionNodeData>) => void
}

export function OpenQuestionEditor({ nodeId, nodeData, onPatchNodeData }: OpenQuestionEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const descriptionSurfaceRef = useRef<HTMLDivElement>(null)
  const descriptionContent = nodeData.descriptionContent ?? null

  const questions = useMemo(
    () => normalizeAuthoredQuestions(nodeData.questions),
    [nodeData.questions],
  )

  const {
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
    isAddDisabled,
    activeFieldValue,
    activeFieldPlaceholder,
  } = useOpenQuestionEditorQuestions({
    questions,
    activeExerciseIdFromNode: nodeData.activeExerciseId,
    onPatchNodeData,
    t,
  })

  const handleDescriptionChange = useCallback(
    (next: SerializedEditorState) => {
      onPatchNodeData({ descriptionContent: next })
    },
    [onPatchNodeData],
  )

  const focusDescriptionEditor = useCallback(() => {
    const editable = descriptionSurfaceRef.current?.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    )
    editable?.focus()
  }, [])

  const handleDescriptionSurfacePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.closest('[contenteditable="true"]')) return
      focusDescriptionEditor()
    },
    [focusDescriptionEditor],
  )

  const handleFieldTabChange = useCallback(
    (tabId: string) => {
      if (tabId === 'question' || tabId === 'answer') {
        setActiveFieldTab(tabId as OpenQuestionEditorFieldTab)
      }
    },
    [setActiveFieldTab],
  )

  return (
    <div
      className={cn('mx-auto flex w-full max-w-3xl flex-col gap-8', openQuestionEditorEnterLift)}
    >
      <Accordion
        type="single"
        collapsible
        defaultValue="exercise-description"
      >
        <AccordionItem
          value="exercise-description"
          className="border-b-0"
        >
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            {t('openQuestionEditor.descriptionLabel')}
          </AccordionTrigger>
          <AccordionContent className="[&_label]:sr-only">
            <div
              ref={descriptionSurfaceRef}
              className="cursor-text"
              onPointerDown={handleDescriptionSurfacePointerDown}
            >
              <LexicalTextarea
                id={`open-question-description-${nodeId}`}
                label={t('openQuestionEditor.descriptionLabel')}
                placeholder={t('openQuestionEditor.descriptionPlaceholder')}
                hydrationKey={nodeId}
                value={descriptionContent}
                onValueChange={handleDescriptionChange}
                minHeight={DESCRIPTION_MIN_HEIGHT_PX}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {questions.length > 0 ? (
        <div className={cn('flex flex-col gap-4', openQuestionEditorEnterSubtle)}>
          <Text
            as="p"
            variant="small"
            muted
          >
            {t('openQuestionEditor.exercisesTitle')}
          </Text>

          <SelectTabs
            variant="compact"
            className="border-b border-border"
            tabs={exerciseTabItems}
            activeTabId={activeQuestionId}
            onTabChange={setActiveTabId}
            showAddTab
            addTabAriaLabel={t('openQuestionEditor.addExerciseTabAriaLabel')}
            onAddTabClick={handleAddQuestion}
            addTabDisabled={isAddDisabled}
            onTabClose={handleDeleteQuestion}
            closeTabAriaLabel={t('openQuestionEditor.closeExerciseTabAriaLabel')}
          />

          {activeQuestion ? (
            <div className="flex flex-col gap-4">
              <SelectTabs
                variant="compact"
                className="border-b border-border"
                tabs={fieldTabItems}
                activeTabId={activeFieldTab}
                onTabChange={handleFieldTabChange}
              />

              <FieldTextarea
                className="min-w-0"
                placeholder={activeFieldPlaceholder}
                value={activeFieldValue}
                onValueChange={handleActiveFieldChange}
                rows={4}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
