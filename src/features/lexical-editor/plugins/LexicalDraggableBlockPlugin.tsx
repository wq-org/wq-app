import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
} from 'lexical'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu'
const BLOCK_DRAG_DATA_FORMAT = 'application/x-lexical-drag-block'

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`)
}

function isBlockDragEvent(event: DragEvent): boolean {
  const types = event.dataTransfer?.types
  if (!types) {
    return false
  }
  for (let index = 0; index < types.length; index += 1) {
    if (types[index] === BLOCK_DRAG_DATA_FORMAT) {
      return true
    }
  }
  return false
}

// Lexical's experimental drop hit-test rejects a point whose x is outside the
// anchor element's horizontal bounds. The drag handle lives in the left gutter
// (visually outside the contenteditable), so dragging it straight down leaves
// the cursor outside that hitbox and the blue insertion line never appears.
// We re-target the event's x into the anchor so vertical-only drags resolve.
function clampDragEventToAnchorX(event: DragEvent, anchorElem: HTMLElement): boolean {
  const rect = anchorElem.getBoundingClientRect()
  if (event.clientX >= rect.left && event.clientX <= rect.right) {
    return true
  }
  const clampedX = Math.min(Math.max(event.clientX, rect.left + 1), rect.right - 1)
  try {
    Object.defineProperty(event, 'clientX', { value: clampedX, configurable: true })
    Object.defineProperty(event, 'pageX', {
      value: clampedX + window.scrollX,
      configurable: true,
    })
    Object.defineProperty(event, 'x', { value: clampedX, configurable: true })
    return true
  } catch {
    return false
  }
}

export function LexicalDraggableBlockPlugin() {
  const [editor] = useLexicalComposerContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const targetLineRef = useRef<HTMLDivElement>(null)
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null)
  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) {
      return
    }
    const parent = rootElement.parentElement
    if (!parent) {
      return
    }
    setAnchorElem(parent)
  }, [editor])

  useEffect(() => {
    if (!anchorElem) {
      return
    }
    const rootElement = editor.getRootElement()
    if (!rootElement) {
      return
    }

    const handleDragover = (event: DragEvent) => {
      if (!isBlockDragEvent(event)) {
        return
      }
      const target = event.target as Node | null
      if (target && rootElement.contains(target)) {
        return
      }
      if (!clampDragEventToAnchorX(event, anchorElem)) {
        return
      }
      event.preventDefault()
      editor.dispatchCommand(DRAGOVER_COMMAND, event)
    }

    const handleDrop = (event: DragEvent) => {
      if (!isBlockDragEvent(event)) {
        return
      }
      const target = event.target as Node | null
      if (target && rootElement.contains(target)) {
        return
      }
      if (!clampDragEventToAnchorX(event, anchorElem)) {
        return
      }
      event.preventDefault()
      editor.dispatchCommand(DROP_COMMAND, event)
    }

    document.addEventListener('dragover', handleDragover, true)
    document.addEventListener('drop', handleDrop, true)
    return () => {
      document.removeEventListener('dragover', handleDragover, true)
      document.removeEventListener('drop', handleDrop, true)
    }
  }, [editor, anchorElem])

  const openSlashMenu = () => {
    if (!draggableElement) {
      return
    }

    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(draggableElement)
      if (!node) {
        return
      }

      const paragraph = $createParagraphNode()
      const slashTrigger = $createTextNode('/')
      paragraph.append(slashTrigger)
      node.insertAfter(paragraph)
      slashTrigger.select()
    })
  }

  if (!anchorElem) {
    return null
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div
          ref={menuRef}
          data-block-gutter
          className={cn(
            DRAGGABLE_BLOCK_MENU_CLASSNAME,
            'absolute top-0 -left-19 z-60 flex items-center gap-1 rounded p-0.5 opacity-0 transition-[transform,opacity] duration-150 ease-in-out',
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="xs"
            title="Add block"
            onClick={openSlashMenu}
          >
            <Plus
              className="text-primary"
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="cursor-grab active:cursor-grabbing "
            title="Drag block"
            tabIndex={-1}
          >
            <GripVertical
              className="text-primary"
              aria-hidden
            />
          </Button>
        </div>
      }
      targetLineComponent={
        <div
          ref={targetLineRef}
          className="pointer-events-none absolute top-0 left-0 z-60 h-1 bg-sky-500 opacity-0"
        />
      }
      isOnMenu={isOnMenu}
      onElementChanged={setDraggableElement}
    />
  )
}
