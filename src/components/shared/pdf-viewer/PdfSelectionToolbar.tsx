import { SelectionTooltip, useSelectionDimensions } from '@anaralabs/lector'
import { NotebookPen } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type PdfSelectionToolbarProps = {
  /** Visible label of the insert action, e.g. "In Notiz einfügen". */
  insertLabel: string
  /** Receives the currently selected PDF text (non-empty, trimmed). */
  onInsertText: (text: string) => void
}

/**
 * Floating toolbar that appears under the active PDF text selection.
 * Must be rendered inside the lector `<Root>`; positioning, show/hide, and
 * dismissal are handled by lector's `SelectionTooltip` (floating-ui).
 */
export function PdfSelectionToolbar({ insertLabel, onInsertText }: PdfSelectionToolbarProps) {
  const { getSelection } = useSelectionDimensions()

  const handleInsert = () => {
    const selection = getSelection()
    const text = selection?.text?.trim()
    if (!text) return

    onInsertText(text)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <SelectionTooltip>
      {/* preventDefault on mousedown keeps the text selection alive long enough
          for the click to land (default mousedown collapses the selection and
          would close this tooltip before onClick fires). */}
      <div
        className="flex items-center gap-1 rounded-lg bg-popover/70 p-1 shadow-md ring-1 ring-foreground/10 backdrop-blur-xl"
        onMouseDown={(event) => event.preventDefault()}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs"
          onClick={handleInsert}
          aria-label={insertLabel}
        >
          <NotebookPen className="size-3.5" />
          {insertLabel}
        </Button>
      </div>
    </SelectionTooltip>
  )
}
