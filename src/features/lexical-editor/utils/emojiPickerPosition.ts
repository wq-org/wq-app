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
import {
  applyAnchorRelativeFloatingStyles,
  applyPortalFloatingStyles,
  clampHorizontalViewportPosition,
  getFloatingPlacementViewport,
  resolveVerticalPlacement,
  type ViewportBounds,
} from './floatingPlacementViewport'

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

type PositionFloatingPickerParams = {
  anchorRect: DomRectSnapshot
  anchorElem: HTMLElement
  floatingElem: HTMLElement
  pickerWidth: number
  pickerHeight: number
  offsetPx: number
  /** Portal mount node (`document.body` or dialog content). */
  portalRoot?: HTMLElement
}

function positionFloatingPicker({
  anchorRect,
  anchorElem,
  floatingElem,
  pickerWidth,
  pickerHeight,
  offsetPx,
  portalRoot,
  prefer,
  resolveLeft,
}: PositionFloatingPickerParams & {
  prefer: 'above' | 'below'
  resolveLeft: (viewport: ViewportBounds) => number
}): void {
  const viewport = getFloatingPlacementViewport(anchorElem)
  const { top } = resolveVerticalPlacement({
    anchorRect,
    floatingHeight: pickerHeight,
    offsetPx,
    prefer,
    viewport,
  })
  const left = clampHorizontalViewportPosition({
    left: resolveLeft(viewport),
    floatingWidth: pickerWidth,
    viewport,
  })

  if (portalRoot) {
    applyPortalFloatingStyles(floatingElem, portalRoot, top, left)
    return
  }

  applyAnchorRelativeFloatingStyles(floatingElem, anchorElem, top, left)
}

/** Positions below the text caret / selection (insert flow), flipping above when needed. */
export function positionFloatingPickerBelowSelection({
  anchorRect,
  anchorElem,
  floatingElem,
  pickerWidth,
  pickerHeight,
  offsetPx,
  portalRoot,
}: PositionFloatingPickerParams): void {
  positionFloatingPicker({
    anchorRect,
    anchorElem,
    floatingElem,
    pickerWidth,
    pickerHeight,
    offsetPx,
    portalRoot,
    prefer: 'below',
    resolveLeft: () => anchorRect.left,
  })
}

/** Positions below the replace button, right-aligned (replace flow). */
export function positionFloatingPickerBelowReplaceButton({
  anchorRect,
  anchorElem,
  floatingElem,
  pickerWidth,
  pickerHeight,
  offsetPx,
  portalRoot,
}: PositionFloatingPickerParams): void {
  positionFloatingPicker({
    anchorRect,
    anchorElem,
    floatingElem,
    pickerWidth,
    pickerHeight,
    offsetPx,
    portalRoot,
    prefer: 'below',
    resolveLeft: () => anchorRect.right - pickerWidth,
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
  portalRoot?: HTMLElement,
): void {
  setFloatingElemPosition(targetRect, floatingElem, anchorElem, false, 10, 5, portalRoot)
}
