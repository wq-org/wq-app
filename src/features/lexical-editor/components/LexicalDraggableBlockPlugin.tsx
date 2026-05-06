import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $isParagraphNode,
  $isTextNode,
  type NodeKey,
} from 'lexical'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'

import invariant from '../utils/invariant'
import { getBlockOptions, ICON_URLS } from './blockOptions'

const DRAGGABLE_BLOCK_MENU_CLASSNAME = 'draggable-block-menu'

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`)
}

export function LexicalDraggableBlockPlugin() {
  const [editor] = useLexicalComposerContext()
  const menuRef = useRef<HTMLDivElement>(null)
  const targetLineRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null)
  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<{ left: number; top: number } | null>(null)
  const [targetNodeKey, setTargetNodeKey] = useState<NodeKey | null>(null)

  const options = useMemo(() => getBlockOptions(editor), [editor])

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) {
      return
    }
    setAnchorElem(rootElement.parentElement ?? rootElement)
  }, [editor])

  useEffect(() => {
    if (!isPickerOpen) {
      return
    }
    const onOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (
        (pickerRef.current && pickerRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return
      }
      setIsPickerOpen(false)
      setTargetNodeKey(null)
    }

    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [isPickerOpen])

  const openPicker = () => {
    if (!draggableElement) {
      return
    }

    let resolvedNodeKey: NodeKey | null = null
    editor.read(() => {
      const resolvedNode = $getNearestNodeFromDOMNode(draggableElement)
      if (resolvedNode) {
        resolvedNodeKey = resolvedNode.getKey()
      }
    })

    if (!resolvedNodeKey) {
      return
    }

    const rect = menuRef.current?.getBoundingClientRect()
    setPickerPosition(
      rect
        ? {
            left: rect.left + rect.width + window.scrollX + 8,
            top: rect.top + window.scrollY,
          }
        : null,
    )
    setTargetNodeKey(resolvedNodeKey)
    setIsPickerOpen(true)
  }

  const selectOption = (optionIndex: number) => {
    if (targetNodeKey == null) {
      return
    }

    const option = options[optionIndex]
    invariant(option != null, 'Expected block option for selected index')

    setIsPickerOpen(false)
    editor.update(() => {
      const node = $getNodeByKey(targetNodeKey)
      if (!node) {
        return
      }

      const placeholder = $createParagraphNode()
      const textNode = $createTextNode('')
      placeholder.append(textNode)
      node.insertAfter(placeholder)
      textNode.select()

      option.onSelect()

      const latestPlaceholder = placeholder.getLatest()
      if ($isParagraphNode(latestPlaceholder) && latestPlaceholder.getChildrenSize() === 1) {
        const onlyChild = latestPlaceholder.getFirstChild()
        if ($isTextNode(onlyChild) && onlyChild.getTextContent().length === 0) {
          latestPlaceholder.remove()
        }
      }
    })
    setTargetNodeKey(null)
  }

  if (!anchorElem) {
    return null
  }

  return (
    <>
      {isPickerOpen && pickerPosition
        ? ReactDOM.createPortal(
            <div
              ref={pickerRef}
              className="w-[220px] overflow-hidden rounded-lg border border-solid border-zinc-200 bg-white text-[#1c1e21] shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:border-zinc-700 dark:bg-[#232325] dark:text-[#e3e3e3] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              style={{
                left: pickerPosition.left,
                position: 'absolute',
                top: pickerPosition.top,
                zIndex: 30,
              }}
            >
              <ul className="m-0 max-h-[220px] list-none overflow-y-auto p-1">
                {options.map((option, index) => (
                  <li
                    key={option.key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-[#3a3a3c]"
                    onClick={() => selectOption(index)}
                  >
                    <span
                      className="inline-block h-4 w-4 shrink-0 bg-contain bg-center bg-no-repeat opacity-70 dark:invert"
                      style={{
                        backgroundImage: `url('${ICON_URLS[option.iconKey]}')`,
                      }}
                    />
                    <span>{option.title}</span>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )
        : null}
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef}
        targetLineRef={targetLineRef}
        menuComponent={
          <div
            ref={menuRef}
            className={`${DRAGGABLE_BLOCK_MENU_CLASSNAME} absolute top-0 left-0 z-20 flex items-center gap-1 rounded p-0.5 opacity-0 transition-[transform,opacity] duration-150 ease-in-out`}
          >
            <button
              type="button"
              title="Add block"
              className="h-4 w-4 cursor-pointer border-0 bg-transparent bg-contain bg-center bg-no-repeat opacity-35 hover:rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
              style={{ backgroundImage: "url('/img/plus.svg')" }}
              onClick={openPicker}
            />
            <div
              className="h-4 w-4 bg-contain bg-center bg-no-repeat opacity-35 hover:rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
              style={{ backgroundImage: "url('/img/draggable-block-menu.svg')" }}
            />
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
    </>
  )
}
