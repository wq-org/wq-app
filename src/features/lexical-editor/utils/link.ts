import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import type { LexicalEditor } from 'lexical'

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

export function promptAndApplyLink(editor: LexicalEditor): boolean {
  const raw = window.prompt('Paste link URL (https://)')
  if (raw === null) {
    return false
  }

  const url = normalizeLinkUrl(raw)
  if (!url) {
    return false
  }

  applyLinkToSelection(editor, url)
  return true
}
