import type { BaseSelection, LexicalEditor, RangeSelection } from 'lexical'
import type { Dispatch, JSX } from 'react'

import { autoUpdate, flip, inline, offset, shift, useFloating } from '@floating-ui/react'
import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isDecoratorNode,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { getSelectedNode } from '../utils/getSelectedNode'
import { normalizeLinkUrl } from '../utils/link'
import { sanitizeUrl } from '../utils/url'

function $getSelectedLinkNode(selection: RangeSelection): LinkNode | null {
  const node = getSelectedNode(selection)
  if ($isLinkNode(node)) {
    return node
  }
  const linkParent = $findMatchingParent(node, $isLinkNode)
  if ($isLinkNode(linkParent)) {
    return linkParent
  }
  if (selection.isCollapsed()) {
    const anchor = selection.anchor
    if (anchor.type === 'text') {
      const anchorNode = anchor.getNode()
      if (anchor.offset === anchorNode.getTextContentSize()) {
        const nextSibling = anchorNode.getNextSibling()
        if ($isLinkNode(nextSibling)) {
          return nextSibling
        }
      }
    }
  }
  return null
}

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor
  isLink: boolean
  setIsLink: Dispatch<boolean>
  anchorElem: HTMLElement
  isLinkEditMode: boolean
  setIsLinkEditMode: Dispatch<boolean>
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [editedLinkUrl, setEditedLinkUrl] = useState('')
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null)

  const scrollerElem = anchorElem.parentElement

  const { refs, floatingStyles } = useFloating({
    middleware: [
      inline(),
      offset(10),
      flip({
        boundary: scrollerElem || undefined,
        padding: 10,
      }),
      shift({
        boundary: scrollerElem || undefined,
        crossAxis: true,
        mainAxis: true,
        padding: 10,
      }),
    ],
    placement: 'bottom-start',
    strategy: 'absolute',
    whileElementsMounted: (...args) => autoUpdate(...args, { ancestorScroll: false }),
  })

  const $updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const linkNode = $getSelectedLinkNode(selection)
      setLinkUrl(linkNode ? linkNode.getURL() : '')
      if (isLinkEditMode && linkNode) {
        setEditedLinkUrl(linkNode.getURL())
      }
    } else if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()
      if (nodes.length > 0) {
        const node = nodes[0]
        const parent = node.getParent()
        if ($isLinkNode(parent)) {
          setLinkUrl(parent.getURL())
        } else if ($isLinkNode(node)) {
          setLinkUrl(node.getURL())
        } else {
          setLinkUrl('')
        }
      }
    }

    const nativeSelection = getDOMSelection(editor._window)
    const activeElement = document.activeElement
    const rootElement = editor.getRootElement()

    if (selection !== null && rootElement !== null && editor.isEditable()) {
      let referenceElement: Element | null = null

      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        if (nodes.length > 0) {
          referenceElement = editor.getElementByKey(nodes[0].getKey())
        }
      } else if (
        $isRangeSelection(selection) &&
        nativeSelection !== null &&
        nativeSelection.rangeCount > 0 &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        const linkNode = $getSelectedLinkNode(selection)
        if (linkNode) {
          const onlyChild = linkNode.getChildrenSize() === 1 ? linkNode.getFirstChild() : null
          referenceElement =
            onlyChild && $isDecoratorNode(onlyChild)
              ? editor.getElementByKey(onlyChild.getKey())
              : editor.getElementByKey(linkNode.getKey())
        }
      }

      if (referenceElement) {
        const refEl = referenceElement
        refs.setPositionReference({
          getBoundingClientRect: () => refEl.getBoundingClientRect(),
          getClientRects: () => refEl.getClientRects(),
        })
      } else if (
        nativeSelection !== null &&
        nativeSelection.rangeCount > 0 &&
        rootElement.contains(nativeSelection.anchorNode)
      ) {
        refs.setPositionReference(nativeSelection.getRangeAt(0))
      }
      setLastSelection(selection)
    } else if (!activeElement || activeElement.dataset.linkInput !== 'true') {
      setLastSelection(null)
      setIsLinkEditMode(false)
      setLinkUrl('')
    }

    return true
  }, [editor, isLinkEditMode, refs, setIsLinkEditMode])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false)
            setIsLinkEditMode(false)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, $updateLinkEditor, isLink, setIsLink, setIsLinkEditMode])

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor()
    })
  }, [editor, $updateLinkEditor])

  useEffect(() => {
    if (isLinkEditMode && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isLinkEditMode, isLink])

  useEffect(() => {
    const editorElement = editorRef.current
    if (editorElement === null) return
    const handleBlur = (event: FocusEvent) => {
      if (!editorElement.contains(event.relatedTarget as Element) && isLink) {
        setIsLink(false)
        setIsLinkEditMode(false)
      }
    }
    editorElement.addEventListener('focusout', handleBlur)
    return () => {
      editorElement.removeEventListener('focusout', handleBlur)
    }
  }, [isLink, setIsLink, setIsLinkEditMode])

  const handleLinkSubmission = () => {
    const url = normalizeLinkUrl(editedLinkUrl)
    if (lastSelection === null) {
      setIsLinkEditMode(false)
      return
    }

    if (!url) {
      // Invalid URL - show feedback
      setEditedLinkUrl('')
      setIsLinkEditMode(false)
      return
    }

    editor.update(() => {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const parent = getSelectedNode(selection).getParent()
        if ($isAutoLinkNode(parent)) {
          const linkNode = $createLinkNode(parent.getURL(), {
            rel: parent.__rel,
            target: parent.__target,
            title: parent.__title,
          })
          parent.replace(linkNode, true)
        }
      }
    })
    setEditedLinkUrl('')
    setIsLinkEditMode(false)
  }

  return (
    <div
      ref={(el) => {
        editorRef.current = el
        refs.setFloating(el)
      }}
      className={cn(
        'z-40 flex min-w-[16rem] items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:border-zinc-700 dark:bg-zinc-800',
        !isLink && 'pointer-events-none opacity-0',
      )}
      style={floatingStyles}
    >
      {!isLink ? null : isLinkEditMode ? (
        <>
          <input
            ref={inputRef}
            type="url"
            data-link-input="true"
            placeholder="https://example.com"
            className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:border-zinc-600 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleLinkSubmission()
              } else if (event.key === 'Escape') {
                event.preventDefault()
                setIsLinkEditMode(false)
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsLinkEditMode(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleLinkSubmission}
          >
            Save
          </Button>
        </>
      ) : (
        <>
          <a
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-primary underline underline-offset-2"
          >
            {linkUrl}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setEditedLinkUrl(linkUrl)
              setIsLinkEditMode(true)
            }}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
          >
            Remove
          </Button>
        </>
      )}
    </div>
  )
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLink, setIsLink] = useState(false)

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const focusLinkNode = $getSelectedLinkNode(selection)
        const focusNode = getSelectedNode(selection)
        const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode)
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false)
          return
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode)
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode)
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) || autoLinkNode.getIsUnlinked()))
            )
          })
        setIsLink(!badNode)
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        if (nodes.length === 0) {
          setIsLink(false)
          return
        }
        const node = nodes[0]
        const parent = node.getParent()
        setIsLink($isLinkNode(parent) || $isLinkNode(node))
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar()
          setActiveEditor(newEditor)
          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection)
            const linkNode = $findMatchingParent(node, $isLinkNode)
            if ($isLinkNode(linkNode)) {
              if (payload.metaKey || payload.ctrlKey) {
                window.open(linkNode.getURL(), '_blank')
                return true
              }
              // Regular click: position the floating editor
              return false
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  )
}

export function FloatingLinkEditorPlugin({
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLElement
  isLinkEditMode: boolean
  setIsLinkEditMode: Dispatch<boolean>
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingLinkEditorToolbar(editor, anchorElem, isLinkEditMode, setIsLinkEditMode)
}
