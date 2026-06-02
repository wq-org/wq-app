import { createDOMRange } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  type BaseSelection,
  type LexicalEditor,
  type NodeKey,
} from 'lexical'

import { getDOMRangeRect } from './getDOMRangeRect'
import { setFloatingElemPosition } from './setFloatingElemPosition'

export type SavedEditorSelection = BaseSelection | null

export function readSavedEditorSelection(editor: LexicalEditor): SavedEditorSelection {
  try {
    return editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return null
      }
      return selection.clone()
    })
  } catch {
    return null
  }
}

export type DomRectSnapshot = {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export function snapshotDomRect(rect: DOMRect): DomRectSnapshot {
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

export function getNodeElementRect(editor: LexicalEditor, nodeKey: NodeKey): DOMRect | null {
  const element = editor.getElementByKey(nodeKey)
  if (!element) {
    return null
  }
  return element.getBoundingClientRect()
}

const VIEWPORT_MARGIN = 12

type PositionFloatingPickerParams = {
  anchorRect: DomRectSnapshot
  anchorElem: HTMLElement
  floatingElem: HTMLElement
  pickerWidth: number
  pickerHeight: number
  offsetPx: number
}

/** Positions below the text caret / selection (insert flow). */
export function positionFloatingPickerBelowSelection({
  anchorRect,
  anchorElem,
  floatingElem,
  pickerWidth,
  pickerHeight,
  offsetPx,
}: PositionFloatingPickerParams): void {
  const anchorElemRect = anchorElem.getBoundingClientRect()

  const overflowsBottom =
    anchorRect.bottom + offsetPx + pickerHeight > window.innerHeight - VIEWPORT_MARGIN
  const top = overflowsBottom
    ? anchorRect.top - anchorElemRect.top - pickerHeight - offsetPx
    : anchorRect.bottom - anchorElemRect.top + offsetPx

  const rightOverflow = anchorRect.left + pickerWidth - window.innerWidth + VIEWPORT_MARGIN
  const left = anchorRect.left - anchorElemRect.left - Math.max(0, rightOverflow)

  floatingElem.style.top = `${top}px`
  floatingElem.style.left = `${left}px`
  floatingElem.style.opacity = '1'
}

/** Positions below the replace button, right-aligned to the button (replace flow). */
export function positionFloatingPickerBelowReplaceButton({
  anchorRect,
  anchorElem,
  floatingElem,
  pickerWidth,
  pickerHeight,
  offsetPx,
}: PositionFloatingPickerParams): void {
  const anchorElemRect = anchorElem.getBoundingClientRect()

  const overflowsBottom =
    anchorRect.bottom + offsetPx + pickerHeight > window.innerHeight - VIEWPORT_MARGIN
  const top = overflowsBottom
    ? anchorRect.top - anchorElemRect.top - pickerHeight - offsetPx
    : anchorRect.bottom - anchorElemRect.top + offsetPx

  let left = anchorRect.right - anchorElemRect.left - pickerWidth

  const minLeft = VIEWPORT_MARGIN - anchorElemRect.left
  const maxLeft = window.innerWidth - VIEWPORT_MARGIN - anchorElemRect.left - pickerWidth
  left = Math.min(Math.max(left, minLeft), maxLeft)

  floatingElem.style.top = `${top}px`
  floatingElem.style.left = `${left}px`
  floatingElem.style.opacity = '1'
}

export function getSelectionAnchorRect(
  editor: LexicalEditor,
  selection: BaseSelection | null,
): DOMRect | null {
  const rootElement = editor.getRootElement()
  if (!rootElement || !selection || !$isRangeSelection(selection)) {
    return null
  }

  try {
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
  } catch {
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
