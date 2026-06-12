import { useEffect, useRef } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ESCAPE_COMMAND,
  type LexicalNode,
  type NodeKey,
} from 'lexical'

const DRAG_THRESHOLD_PX = 4

const SELECTED_BLOCK_CLASSES = [
  'rounded-md',
  'bg-blue-100/70',
  'ring-1',
  'ring-blue-400/60',
  'dark:bg-blue-900/35',
  'dark:ring-blue-500/50',
] as const

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[contenteditable="false"]',
  '[data-lexical-youtube]',
  '.ImageNode__image',
  '.ImageNode__frame',
].join(',')

type ViewportRect = {
  top: number
  right: number
  bottom: number
  left: number
}

type BlockEntry = {
  key: NodeKey
  element: HTMLElement
  rect: ViewportRect
}

type DragState = {
  pointerId: number
  originX: number
  originY: number
  currentX: number
  currentY: number
  hasMoved: boolean
}

export type BlockRangeSelectionPluginProps = {
  anchorElem: HTMLElement | null
  enabled?: boolean
}

function getTargetElement(target: EventTarget | null): HTMLElement | null {
  return target instanceof HTMLElement ? target : null
}

function toViewportRect(rect: DOMRect): ViewportRect {
  return {
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    top: rect.top,
  }
}

function getRectFromPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): ViewportRect {
  return {
    bottom: Math.max(startY, endY),
    left: Math.min(startX, endX),
    right: Math.max(startX, endX),
    top: Math.min(startY, endY),
  }
}

function intersects(a: ViewportRect, b: ViewportRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

function hasDraggedPastThreshold(state: DragState): boolean {
  return (
    Math.abs(state.currentX - state.originX) >= DRAG_THRESHOLD_PX ||
    Math.abs(state.currentY - state.originY) >= DRAG_THRESHOLD_PX
  )
}

function isInteractiveTarget(target: HTMLElement): boolean {
  return target.closest(INTERACTIVE_SELECTOR) != null
}

function getDirectBlockElement(rootElement: HTMLElement, target: HTMLElement): HTMLElement | null {
  if (target === rootElement) {
    return null
  }

  let current: HTMLElement | null = target
  while (current && current.parentElement !== rootElement) {
    current = current.parentElement
  }

  return current
}

function getTopLevelNodeForElement(element: HTMLElement): LexicalNode | null {
  try {
    return $getNearestNodeFromDOMNode(element)?.getTopLevelElement() ?? null
  } catch {
    return null
  }
}

function collectBlockEntries(
  rootElement: HTMLElement,
  getElementByKey: (key: NodeKey) => HTMLElement | null,
): BlockEntry[] {
  const entries: BlockEntry[] = []
  const seenKeys = new Set<NodeKey>()

  for (const child of Array.from(rootElement.children)) {
    if (!(child instanceof HTMLElement)) {
      continue
    }

    const topLevelNode = getTopLevelNodeForElement(child)
    const key = topLevelNode?.getKey()
    if (!key || seenKeys.has(key)) {
      continue
    }

    const element = getElementByKey(key)
    if (!element) {
      continue
    }

    const rect = element.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      continue
    }

    seenKeys.add(key)
    entries.push({ element, key, rect: toViewportRect(rect) })
  }

  return entries
}

function shouldStartBlockSelection(
  event: PointerEvent,
  anchorElem: HTMLElement,
  rootElement: HTMLElement,
): boolean {
  if (event.button !== 0) {
    return false
  }

  const target = getTargetElement(event.target)
  if (!target || !anchorElem.contains(target) || isInteractiveTarget(target)) {
    return false
  }

  const gutter = target.closest('[data-block-gutter]')
  if (gutter && !target.closest('button')) {
    return true
  }

  if (target === anchorElem || target === rootElement) {
    return true
  }

  const rootRect = rootElement.getBoundingClientRect()
  if (event.clientX < rootRect.left) {
    return true
  }

  const blockElement = getDirectBlockElement(rootElement, target)
  if (!blockElement) {
    return true
  }

  const blockRect = blockElement.getBoundingClientRect()
  return event.clientX < blockRect.left
}

function clearDomSelection(): void {
  window.getSelection()?.removeAllRanges()
}

function setOverlayRect(overlay: HTMLElement, anchorElem: HTMLElement, rect: ViewportRect): void {
  const anchorRect = anchorElem.getBoundingClientRect()
  overlay.hidden = false
  overlay.style.left = `${rect.left - anchorRect.left + anchorElem.scrollLeft}px`
  overlay.style.top = `${rect.top - anchorRect.top + anchorElem.scrollTop}px`
  overlay.style.width = `${rect.right - rect.left}px`
  overlay.style.height = `${rect.bottom - rect.top}px`
}

function hideOverlay(overlay: HTMLElement | null): void {
  if (!overlay) {
    return
  }
  overlay.hidden = true
  overlay.style.width = '0px'
  overlay.style.height = '0px'
}

function markElementSelected(element: HTMLElement): void {
  element.classList.add(...SELECTED_BLOCK_CLASSES)
  element.dataset.blockRangeSelected = 'true'
  element.setAttribute('aria-selected', 'true')
}

function unmarkElementSelected(element: HTMLElement): void {
  element.classList.remove(...SELECTED_BLOCK_CLASSES)
  if (element.dataset.blockRangeSelected === 'true') {
    delete element.dataset.blockRangeSelected
    element.removeAttribute('aria-selected')
  }
}

export function BlockRangeSelectionPlugin({
  anchorElem,
  enabled = true,
}: BlockRangeSelectionPluginProps) {
  const [editor] = useLexicalComposerContext()
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const frameRef = useRef<number | null>(null)
  const blockEntriesRef = useRef<BlockEntry[]>([])
  const highlightedElementsRef = useRef<Set<HTMLElement>>(new Set())
  const selectedKeysRef = useRef<Set<NodeKey>>(new Set())

  useEffect(() => {
    if (!enabled || !anchorElem) {
      hideOverlay(overlayRef.current)
      return
    }

    const rootElement = editor.getRootElement()
    if (!rootElement) {
      return
    }

    const clearPendingFrame = () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }

    const clearHighlightedElements = () => {
      for (const element of highlightedElementsRef.current) {
        unmarkElementSelected(element)
      }
      highlightedElementsRef.current.clear()
    }

    const applyHighlightedKeys = (keys: Set<NodeKey>, entries = blockEntriesRef.current) => {
      clearHighlightedElements()
      for (const entry of entries) {
        if (!keys.has(entry.key) || !entry.element.isConnected) {
          continue
        }
        markElementSelected(entry.element)
        highlightedElementsRef.current.add(entry.element)
      }
    }

    const clearSelection = () => {
      selectedKeysRef.current = new Set()
      blockEntriesRef.current = []
      clearHighlightedElements()
      hideOverlay(overlayRef.current)
    }

    const updateDragSelection = (): boolean => {
      const dragState = dragStateRef.current
      const overlay = overlayRef.current
      if (!dragState || !overlay) {
        return false
      }

      if (!dragState.hasMoved && !hasDraggedPastThreshold(dragState)) {
        return false
      }

      dragState.hasMoved = true
      const dragRect = getRectFromPoints(
        dragState.originX,
        dragState.originY,
        dragState.currentX,
        dragState.currentY,
      )
      const nextKeys = new Set<NodeKey>()
      for (const entry of blockEntriesRef.current) {
        if (intersects(dragRect, entry.rect)) {
          nextKeys.add(entry.key)
        }
      }

      selectedKeysRef.current = nextKeys
      setOverlayRect(overlay, anchorElem, dragRect)
      applyHighlightedKeys(nextKeys)
      return true
    }

    const scheduleDragUpdate = () => {
      if (frameRef.current != null) {
        return
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        updateDragSelection()
      })
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!shouldStartBlockSelection(event, anchorElem, rootElement)) {
        if (selectedKeysRef.current.size > 0) {
          clearSelection()
        }
        return
      }

      const entries = editor
        .getEditorState()
        .read(() =>
          collectBlockEntries(
            rootElement,
            (key) => editor.getElementByKey(key) as HTMLElement | null,
          ),
        )
      if (entries.length === 0) {
        return
      }

      event.preventDefault()
      clearDomSelection()
      clearSelection()
      blockEntriesRef.current = entries
      dragStateRef.current = {
        currentX: event.clientX,
        currentY: event.clientY,
        hasMoved: false,
        originX: event.clientX,
        originY: event.clientY,
        pointerId: event.pointerId,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return
      }
      event.preventDefault()
      clearDomSelection()
      dragState.currentX = event.clientX
      dragState.currentY = event.clientY
      scheduleDragUpdate()
    }

    const handlePointerUp = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return
      }

      clearPendingFrame()
      updateDragSelection()
      dragStateRef.current = null
      hideOverlay(overlayRef.current)

      if (!dragState.hasMoved) {
        clearSelection()
        return
      }

      applyHighlightedKeys(selectedKeysRef.current)
      clearDomSelection()
    }

    const handlePointerCancel = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return
      }
      dragStateRef.current = null
      clearPendingFrame()
      clearSelection()
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = getTargetElement(event.target)
      if (target && anchorElem.contains(target)) {
        return
      }
      if (selectedKeysRef.current.size > 0) {
        clearSelection()
      }
    }

    const deleteSelectedBlocks = (event: KeyboardEvent): boolean => {
      if (selectedKeysRef.current.size === 0) {
        return false
      }

      event.preventDefault()
      const keys = Array.from(selectedKeysRef.current)
      selectedKeysRef.current = new Set()
      clearHighlightedElements()

      const firstNode = $getNodeByKey(keys[0])
      const focusCandidate = firstNode?.getPreviousSibling() ?? firstNode?.getNextSibling() ?? null
      for (const key of keys) {
        const node = $getNodeByKey(key)
        if (node?.isAttached()) {
          node.remove()
        }
      }

      if (focusCandidate?.isAttached()) {
        focusCandidate.selectStart()
      } else {
        $getRoot().selectEnd()
      }

      return true
    }

    const clearSelectedBlocksFromKeyboard = (event: KeyboardEvent): boolean => {
      if (selectedKeysRef.current.size === 0) {
        return false
      }
      event.preventDefault()
      clearSelection()
      return true
    }

    const reapplySelectionAfterEditorUpdate = () => {
      if (selectedKeysRef.current.size === 0) {
        return
      }
      requestAnimationFrame(() => {
        const keys = selectedKeysRef.current
        if (keys.size === 0) {
          return
        }
        const entries = Array.from(keys).flatMap((key) => {
          const element = editor.getElementByKey(key)
          return element instanceof HTMLElement
            ? [{ element, key, rect: toViewportRect(element.getBoundingClientRect()) }]
            : []
        })
        blockEntriesRef.current = entries
        applyHighlightedKeys(keys, entries)
      })
    }

    anchorElem.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerCancel)
    document.addEventListener('pointerdown', handleOutsidePointerDown, true)

    return mergeRegister(
      editor.registerCommand(KEY_BACKSPACE_COMMAND, deleteSelectedBlocks, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_DELETE_COMMAND, deleteSelectedBlocks, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        clearSelectedBlocksFromKeyboard,
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerUpdateListener(reapplySelectionAfterEditorUpdate),
      () => {
        anchorElem.removeEventListener('pointerdown', handlePointerDown)
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
        document.removeEventListener('pointercancel', handlePointerCancel)
        document.removeEventListener('pointerdown', handleOutsidePointerDown, true)
        clearPendingFrame()
        clearSelection()
      },
    )
  }, [anchorElem, editor, enabled])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      hidden
      className="pointer-events-none absolute z-50 rounded-md border border-blue-500/30 bg-blue-500/10 shadow-[0_8px_24px_rgba(59,130,246,0.16)]"
    />
  )
}
