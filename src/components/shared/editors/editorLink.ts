import {
  AutoLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
  $isLinkNode,
  $createLinkNode,
} from '@lexical/link'
import { $createTextNode, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'

export const lexicalConfig = {
  namespace: 'WQEditor',
  nodes: [LinkNode, AutoLinkNode],
} as const

export function validateUrl(url: string): string | null {
  const normalizedUrl = url.trim()
  if (!normalizedUrl) return null

  try {
    const parsedUrl = new URL(normalizedUrl)
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.toString()
    }
  } catch {
    return null
  }

  return null
}

export function isValidUrl(url: string): boolean {
  return validateUrl(url) !== null
}

export function getSelectedLinkUrl(editor: LexicalEditor): string {
  let selectedLinkUrl = ''

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const anchorNode = selection.anchor.getNode()
    const parentNode = anchorNode.getParent()

    if (parentNode && $isLinkNode(parentNode)) {
      selectedLinkUrl = parentNode.getURL()
    }
  })

  return selectedLinkUrl
}

export type SelectedLinkAttributes = {
  title: string
  url: string
}

export function getSelectedLinkAttributes(editor: LexicalEditor): SelectedLinkAttributes {
  let selectedLinkAttributes = {
    title: '',
    url: '',
  }

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    const anchorNode = selection.anchor.getNode()
    const parentNode = anchorNode.getParent()

    if (parentNode && $isLinkNode(parentNode)) {
      selectedLinkAttributes = {
        title: parentNode.getTitle() ?? '',
        url: parentNode.getURL(),
      }
    }
  })

  return selectedLinkAttributes
}

export function applyLinkToSelection(editor: LexicalEditor, url: string, title: string) {
  const resolvedTitle = title.trim()
  let shouldInsertInlineLink = false

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    shouldInsertInlineLink = Boolean($isRangeSelection(selection) && selection.isCollapsed())
  })

  if (shouldInsertInlineLink) {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const linkNode = $createLinkNode(url, {
        title: resolvedTitle || null,
      })
      linkNode.append($createTextNode(resolvedTitle || url))
      selection.insertNodes([linkNode])
    })
    return
  }

  editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
    title: resolvedTitle || null,
    url,
  })
}
