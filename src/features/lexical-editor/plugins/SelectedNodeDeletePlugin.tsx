import { $isCodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getRoot,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_DOWN_COMMAND,
  type LexicalNode,
} from 'lexical'
import { useEffect } from 'react'

import { $isImageNode } from '../nodes/ImageNode'

type SelectedNodeDeletePluginProps = {
  enabled?: boolean
}

function isKeyboardDeleteShortcut(event: KeyboardEvent): boolean {
  if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) {
    return false
  }

  return event.key.toLowerCase() === 'x'
}

function isDeletableSelectedNode(node: LexicalNode): boolean {
  return $isImageNode(node) || $isCodeNode(node)
}

function findFocusCandidate(nodes: LexicalNode[]): LexicalNode | null {
  const selectedKeys = new Set(nodes.map((node) => node.getKey()))
  const firstNode = nodes[0]
  if (!firstNode) {
    return null
  }

  let candidate = firstNode.getPreviousSibling()
  while (candidate && selectedKeys.has(candidate.getKey())) {
    candidate = candidate.getPreviousSibling()
  }
  if (candidate) {
    return candidate
  }

  candidate = firstNode.getNextSibling()
  while (candidate && selectedKeys.has(candidate.getKey())) {
    candidate = candidate.getNextSibling()
  }

  return candidate
}

function deleteSelectedNodes(event: KeyboardEvent): boolean {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return false
  }

  const nodes = selection.getNodes().filter(isDeletableSelectedNode)
  if (nodes.length === 0) {
    return false
  }

  event.preventDefault()

  const focusCandidate = findFocusCandidate(nodes)
  for (const node of nodes) {
    if (node.isAttached()) {
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

export function SelectedNodeDeletePlugin({ enabled = true }: SelectedNodeDeletePluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) {
      return
    }

    return mergeRegister(
      editor.registerCommand(KEY_BACKSPACE_COMMAND, deleteSelectedNodes, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_DELETE_COMMAND, deleteSelectedNodes, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (!isKeyboardDeleteShortcut(event)) {
            return false
          }

          return deleteSelectedNodes(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor, enabled])

  return null
}
