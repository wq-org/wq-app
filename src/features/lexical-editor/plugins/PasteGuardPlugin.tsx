import { useEffect } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_CRITICAL, PASTE_COMMAND } from 'lexical'

export type PasteOverflowInfo = {
  actualChars: number
  actualBytes: number
  limitChars: number
  limitBytes: number
}

export type PasteGuardPluginProps = {
  maxBytes?: number
  maxChars?: number
  onOverflow: (info: PasteOverflowInfo) => void
}

export const DEFAULT_PASTE_MAX_BYTES = 50_000
export const DEFAULT_PASTE_MAX_CHARS = 10_000

/**
 * Intercepts PASTE_COMMAND at high priority and rejects pastes whose plain-text
 * payload exceeds either byte- or character-budget. Plugin signals overflow via
 * `onOverflow`; rendering UI is the parent's responsibility (toast / dialog).
 *
 * Pairs with useLessonAutosave (whole-document size guard) and the DB-side
 * lessons.content JSONB size / validation constraints as the final safety net.
 */
export function PasteGuardPlugin({
  maxBytes = DEFAULT_PASTE_MAX_BYTES,
  maxChars = DEFAULT_PASTE_MAX_CHARS,
  onOverflow,
}: PasteGuardPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        if (!(event instanceof ClipboardEvent)) {
          return false
        }

        const text = event.clipboardData?.getData('text/plain') ?? ''
        if (text.length === 0) {
          return false
        }

        const actualBytes = new Blob([text]).size
        if (actualBytes > maxBytes || text.length > maxChars) {
          event.preventDefault()
          onOverflow({
            actualBytes,
            actualChars: text.length,
            limitBytes: maxBytes,
            limitChars: maxChars,
          })
          return true
        }

        return false
      },
      COMMAND_PRIORITY_CRITICAL,
    )
  }, [editor, maxBytes, maxChars, onOverflow])

  return null
}
