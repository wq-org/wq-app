import { useCallback, useState } from 'react'
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

import type { GameNodeDataPatch } from '../../_registry/game-node-registry.types'
import { useDragDropMathExerciseTabs } from '../hooks/useDragDropMathExerciseTabs'
import type { GameDragDropMathNodeData } from '../types/drag-drop-math.schema'
import { DragDropMathExerciseWorkspace } from './DragDropMathExerciseWorkspace'
import { DragDropMathTabDeleteConfirmDialog } from './DragDropMathTabDeleteConfirmDialog'

const dragDropMathEditorEnterLift =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const

export type DragDropMathEditorProps = {
  nodeId: string
  nodeData: Record<string, unknown>
  onPatchNodeData: (patch: GameNodeDataPatch) => void
}

export function DragDropMathEditor({ nodeId, nodeData, onPatchNodeData }: DragDropMathEditorProps) {
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
  } = useDragDropMathExerciseTabs({
    nodeData: pin,
    onPatchNodeData,
    defaultTabTitle,
  })

  const [tabIdPendingDelete, setTabIdPendingDelete] = useState<string | null>(null)

  const handleDescriptionChange = useCallback(
    (next: SerializedEditorState) => {
      onPatchNodeData({ descriptionContent: next })
    },
    [onPatchNodeData],
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
            <AccordionContent className="[&_label]:sr-only">
              <LexicalTextarea
                id={`drag-drop-math-description-${nodeId}`}
                label={t('dragDropMathEditor.descriptionLabel')}
                placeholder={t('dragDropMathEditor.descriptionPlaceholder')}
                hydrationKey={nodeId}
                value={descriptionContent}
                onValueChange={handleDescriptionChange}
                minHeight={300}
              />
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
        addTabAriaLabel={t('dragDropMathEditor.addExerciseTabAriaLabel')}
        onAddTabClick={addTab}
        onTabClose={setTabIdPendingDelete}
        closeTabAriaLabel={t('dragDropMathEditor.closeExerciseTabAriaLabel')}
      />

      {activeTab ? (
        <DragDropMathExerciseWorkspace
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

      <DragDropMathTabDeleteConfirmDialog
        open={tabIdPendingDelete != null}
        onOpenChange={(open) => {
          if (!open) setTabIdPendingDelete(null)
        }}
        onConfirm={handleConfirmDeleteTab}
      />
    </div>
  )
}
