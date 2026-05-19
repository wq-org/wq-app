import { createDOMRange } from '@lexical/selection'
import { $getSelection, $isRangeSelection, type BaseSelection, type LexicalEditor } from 'lexical'

import { getDOMRangeRect } from './getDOMRangeRect'
import { setFloatingElemPosition } from './setFloatingElemPosition'

export type SavedEditorSelection = BaseSelection | null

export function readSavedEditorSelection(editor: LexicalEditor): SavedEditorSelection {
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return null
    }
    return selection.clone()
  })
}

export function getSelectionAnchorRect(
  editor: LexicalEditor,
  selection: BaseSelection | null,
): DOMRect | null {
  const rootElement = editor.getRootElement()
  if (!rootElement || !selection || !$isRangeSelection(selection)) {
    return null
  }

  const domRange = createDOMRange(
    editor,
    selection.anchor.getNode(),
    selection.anchor.offset,
    selection.focus.getNode(),
    selection.focus.offset,
  )

  if (domRange) {
    return domRange.getBoundingClientRect()
  }

  const nativeSelection = window.getSelection()
  if (
    nativeSelection !== null &&
    nativeSelection.rangeCount > 0 &&
    rootElement.contains(nativeSelection.anchorNode)
  ) {
    return getDOMRangeRect(nativeSelection, rootElement)
  }

  return null
}

export function positionFloatingElementAtRect(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
): void {
  setFloatingElemPosition(targetRect, floatingElem, anchorElem)
}
