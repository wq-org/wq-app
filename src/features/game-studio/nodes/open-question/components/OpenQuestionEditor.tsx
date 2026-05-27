'use client'

import { useCallback, useRef, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { SerializedEditorState } from 'lexical'

import { LexicalTextarea } from '@/components/shared/lexical-textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

const DESCRIPTION_MIN_HEIGHT_PX = 40

const openQuestionEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const

export type OpenQuestionEditorProps = {
  nodeId: string
  nodeData: GameOpenQuestionNodeData
  onPatchNodeData: (patch: Partial<GameOpenQuestionNodeData>) => void
}

export function OpenQuestionEditor({ nodeId, nodeData, onPatchNodeData }: OpenQuestionEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const descriptionSurfaceRef = useRef<HTMLDivElement>(null)
  const descriptionContent = nodeData.descriptionContent ?? null

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

  return (
    <div className={`mx-auto flex w-full max-w-3xl flex-col gap-8 ${openQuestionEditorEnterLift}`}>
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
    </div>
  )
}
