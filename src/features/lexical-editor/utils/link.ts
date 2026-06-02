import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'

import { getSelectedNode } from './getSelectedNode'
import { sanitizeUrl, validateUrl } from './url'

export function normalizeLinkUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  if (validateUrl(trimmed)) {
    return sanitizeUrl(trimmed)
  }

  const withHttps = `https://${trimmed}`
  if (validateUrl(withHttps)) {
    return sanitizeUrl(withHttps)
  }

  return null
}

export function applyLinkToSelection(editor: LexicalEditor, url: string): void {
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
}

export function removeLinkFromSelection(editor: LexicalEditor): void {
  editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
}

export function getSelectedLinkUrl(editor: LexicalEditor): string {
  let selectedLinkUrl = ''

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return
    }

    const node = getSelectedNode(selection)
    const parent = node.getParent()

    if ($isLinkNode(parent)) {
      selectedLinkUrl = parent.getURL()
    } else if ($isLinkNode(node)) {
      selectedLinkUrl = node.getURL()
    }
  })

  return selectedLinkUrl
}
