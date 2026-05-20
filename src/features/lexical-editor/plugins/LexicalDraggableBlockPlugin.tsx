import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $createTextNode, $getNearestNodeFromDOMNode } from 'lexical'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu'

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`)
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
    setAnchorElem(rootElement.parentElement ?? rootElement)
  }, [editor])

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
          className={cn(
            DRAGGABLE_BLOCK_MENU_CLASSNAME,
            'absolute top-0 -left-15 z-20 flex items-center gap-1 rounded p-0.5 opacity-0 transition-[transform,opacity] duration-150 ease-in-out',
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
          className="pointer-events-none absolute top-0 left-0 h-1 bg-sky-500 opacity-0"
        />
      }
      isOnMenu={isOnMenu}
      onElementChanged={setDraggableElement}
    />
  )
}
