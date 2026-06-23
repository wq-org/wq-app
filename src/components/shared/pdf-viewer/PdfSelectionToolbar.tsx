import { SelectionTooltip, useSelectionDimensions } from '@anaralabs/lector'
import { NotebookPen } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type PdfFieldInsertAction = {
  label: string
  onInsert: (text: string) => void
}

export type PdfSelectionToolbarProps = {
  insertLabel: string
  onInsertText: (text: string) => void
  /** When provided, renders one button per action instead of the single insertLabel button. */
  fieldActions?: PdfFieldInsertAction[]
}

/**
 * Floating toolbar that appears under the active PDF text selection.
 * Must be rendered inside the lector `<Root>`; positioning, show/hide, and
 * dismissal are handled by lector's `SelectionTooltip` (floating-ui).
 */
export function PdfSelectionToolbar({
  insertLabel,
  onInsertText,
  fieldActions,
}: PdfSelectionToolbarProps) {
  const { getSelection } = useSelectionDimensions()

  const getSelectedText = (): string => {
    const selection = getSelection()
    return selection?.text?.trim() ?? ''
  }

  const handleInsert = () => {
    const text = getSelectedText()
    if (!text) return
    onInsertText(text)
    window.getSelection()?.removeAllRanges()
  }

  const handleFieldInsert = (action: PdfFieldInsertAction) => {
    const text = getSelectedText()
    if (!text) return
    action.onInsert(text)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <SelectionTooltip>
      {/* preventDefault on mousedown keeps the text selection alive long enough
          for the click to land (default mousedown collapses the selection and
          would close this tooltip before onClick fires). */}
      <div
        className="flex min-w-[160px] flex-col gap-0.5 rounded-lg bg-popover/70 p-1 shadow-md ring-1 ring-foreground/10 backdrop-blur-xl"
        onMouseDown={(event) => event.preventDefault()}
      >
        {fieldActions && fieldActions.length > 0 ? (
          fieldActions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start gap-1.5 px-2.5 text-xs"
              onClick={() => handleFieldInsert(action)}
              aria-label={action.label}
            >
              <NotebookPen className="size-3.5 shrink-0" />
              {action.label}
            </Button>
          ))
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-1.5 px-2.5 text-xs"
            onClick={handleInsert}
            aria-label={insertLabel}
          >
            <NotebookPen className="size-3.5 shrink-0" />
            {insertLabel}
          </Button>
        )}
      </div>
    </SelectionTooltip>
  )
}
