import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { SerializedEditorState } from 'lexical'

import { SelectTabs } from '@/components/shared'
import { LexicalTextarea } from '@/components/shared/lexical-textarea'
import type { EditorExternalInsertApi } from '@/features/lexical-editor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { GameNodeDataPatch } from '../../_registry/game-node-registry.types'
import { useDnDMathExerciseTabs } from '../hooks/useDnDMathExerciseTabs'
import type { GameDragDropMathNodeData } from '../types/drag-drop-math.schema'
import { DnDMathExerciseWorkspace } from './DnDMathExerciseWorkspace'
import { DnDMathTabDeleteConfirmDialog } from './DnDMathTabDeleteConfirmDialog'

const dragDropMathEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const

export type DnDMathEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
  /** Forwarded to `LexicalTextarea` so the agent panel can append into the description. */
  onDescriptionInsertReady?: (api: EditorExternalInsertApi | null) => void
}

export function DnDMathEditor({
  nodeId,
  nodeData,
  onPatchNodeData,
  onDescriptionInsertReady,
}: DnDMathEditorProps) {
  const { t } = useTranslation('features.gameStudio')
  const pin = nodeData as GameDragDropMathNodeData
  const descriptionContent = pin.descriptionContent ?? null
  const instantColorFeedback = pin.instantColorFeedback !== false
  const defaultTabTitle = t('dragDropMathEditor.newExerciseTabLabel')

  const {
    activeTab,
    activeTabId,
    selectTabItems,
    setActiveTabId,
    addTab,
    removeTab,
    updateActiveTabTitle,
    updateActiveTabCanvasRows,
  } = useDnDMathExerciseTabs({
    nodeData: pin,
    onPatchNodeData,
    defaultTabTitle,
  })

  const [tabIdPendingDelete, setTabIdPendingDelete] = useState<string | null>(null)
  const descriptionSurfaceRef = useRef<HTMLDivElement>(null)

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

  const handleConfirmDeleteTab = useCallback(() => {
    if (!tabIdPendingDelete) return
    removeTab(tabIdPendingDelete)
    setTabIdPendingDelete(null)
  }, [removeTab, tabIdPendingDelete])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className={dragDropMathEditorEnterLift}>
        <Accordion
          type="single"
          collapsible
          defaultValue="task-description"
        >
          <AccordionItem
            value="task-description"
            className="border-b-0"
          >
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              {t('dragDropMathEditor.descriptionLabel')}
            </AccordionTrigger>
            {/*
              `forceMount` keeps the Lexical editor mounted when the accordion is
              collapsed so the imperative insert API stays registered. Without it,
              collapsing the description nulls the API ref and the agent panel's
              "Insert into Description" click silently no-ops.
            */}
            <AccordionContent
              forceMount
              className="[&_label]:sr-only data-[state=closed]:hidden"
            >
              <div
                ref={descriptionSurfaceRef}
                className="cursor-text"
                onPointerDown={handleDescriptionSurfacePointerDown}
              >
                <LexicalTextarea
                  id={`drag-drop-math-description-${nodeId}`}
                  label={t('dragDropMathEditor.descriptionLabel')}
                  placeholder={t('dragDropMathEditor.descriptionPlaceholder')}
                  hydrationKey={nodeId}
                  value={descriptionContent}
                  onValueChange={handleDescriptionChange}
                  minHeight={300}
                  onExternalInsertReady={onDescriptionInsertReady}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <SelectTabs
        variant="compact"
        className="border-b border-border"
        tabs={selectTabItems}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        showAddTab
        optionalText
        addTabText={t('dragDropMathEditor.addExerciseTabLabel')}
        addTabAriaLabel={t('dragDropMathEditor.addExerciseTabAriaLabel')}
        onAddTabClick={addTab}
        onTabClose={setTabIdPendingDelete}
        closeTabAriaLabel={t('dragDropMathEditor.closeExerciseTabAriaLabel')}
      />

      {activeTab ? (
        <DnDMathExerciseWorkspace
          key={activeTab.id}
          tabId={activeTab.id}
          nodeId={nodeId}
          title={activeTab.title}
          canvasRows={activeTab.canvasRows}
          instantColorFeedback={instantColorFeedback}
          onTitleChange={updateActiveTabTitle}
          onCanvasRowsChange={updateActiveTabCanvasRows}
        />
      ) : null}

      <DnDMathTabDeleteConfirmDialog
        open={tabIdPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setTabIdPendingDelete(null)
        }}
        onConfirm={handleConfirmDeleteTab}
      />
    </div>
  )
}
