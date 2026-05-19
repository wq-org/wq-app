import type { JSX } from 'react'
import type { LexicalEditor, RangeSelection } from 'lexical'

import { autoUpdate, flip, inline, offset, shift, useFloating } from '@floating-ui/react'
import { $isAutoLinkNode, $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
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
  COMMAND_PRIORITY_LOW,
  getDOMSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { getSelectedNode } from '../utils/getSelectedNode'
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
  anchorElem,
  linkUrl,
  onRequestLinkDialog,
}: {
  editor: LexicalEditor
  isLink: boolean
  anchorElem: HTMLElement
  linkUrl: string
  onRequestLinkDialog: () => void
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
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
    const nativeSelection = getDOMSelection(editor._window)
    const rootElement = editor.getRootElement()

    if (selection === null || rootElement === null || !editor.isEditable()) {
      return true
    }

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

    return true
  }, [editor, refs])

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
    )
  }, [editor, $updateLinkEditor])

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor()
    })
  }, [editor, $updateLinkEditor])

  return (
    <div
      ref={(el) => {
        editorRef.current = el
        refs.setFloating(el)
      }}
      className={cn(
        'z-40 flex min-w-[16rem] items-center gap-2 rounded-full border border-border bg-popover/95 px-3 py-1.5 text-popover-foreground shadow-xl backdrop-blur supports-backdrop-filter:bg-popover/90',
        !isLink && 'pointer-events-none opacity-0',
      )}
      style={floatingStyles}
    >
      <a
        href={sanitizeUrl(linkUrl)}
        target="_blank"
        rel="noopener noreferrer"
        title={linkUrl}
        className="w-40 max-w-40 shrink-0 truncate text-sm text-primary underline underline-offset-2"
      >
        {linkUrl}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onRequestLinkDialog}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
      >
        Remove
      </Button>
    </div>
  )
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  onRequestLinkDialog: () => void,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor)
  const [isLink, setIsLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const focusLinkNode = $getSelectedLinkNode(selection)
        const focusNode = getSelectedNode(selection)
        const focusAutoLinkNode = $findMatchingParent(focusNode, $isAutoLinkNode)
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false)
          setLinkUrl('')
          return
        }

        if (focusLinkNode) {
          setLinkUrl(focusLinkNode.getURL())
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
          setLinkUrl('')
          return
        }
        const node = nodes[0]
        const parent = node.getParent()
        const linkNode = $isLinkNode(node) ? node : $isLinkNode(parent) ? parent : null
        setIsLink(Boolean(linkNode))
        setLinkUrl(linkNode ? linkNode.getURL() : '')
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
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), '_blank')
              return true
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
      linkUrl={linkUrl}
      onRequestLinkDialog={onRequestLinkDialog}
    />,
    anchorElem,
  )
}

export function FloatingLinkEditorPlugin({
  anchorElem,
  onRequestLinkDialog,
}: {
  anchorElem: HTMLElement
  onRequestLinkDialog: () => void
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingLinkEditorToolbar(editor, anchorElem, onRequestLinkDialog)
}
