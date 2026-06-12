import { IS_APPLE } from '@lexical/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  isExactShortcutMatch,
  KEY_DOWN_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

type InlineCodeShortcutPluginProps = {
  enabled?: boolean
}

const CONTROL_OR_META = {
  ctrlKey: !IS_APPLE,
  metaKey: IS_APPLE,
} as const

function isInlineCodeShortcut(event: KeyboardEvent): boolean {
  return isExactShortcutMatch(event, 'e', CONTROL_OR_META)
}

/** Toggle inline code on ⌘E (macOS) / Ctrl+E (Windows). */
export function InlineCodeShortcutPlugin({ enabled = true }: InlineCodeShortcutPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) return

    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (!isInlineCodeShortcut(event)) return false
        event.preventDefault()
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor, enabled])

  return null
}
