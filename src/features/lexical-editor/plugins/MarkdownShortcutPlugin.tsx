import {
  CHECK_LIST,
  HEADING,
  UNORDERED_LIST,
  registerMarkdownShortcuts,
  type Transformer,
} from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

const HEADING_SHORTCUT_REGEX = /^(#{1,3})\s/

/** Headings h1–h3 via `# `, `## `, `### ` + space. */
const HEADING_SHORTCUT: Transformer = {
  ...HEADING,
  regExp: HEADING_SHORTCUT_REGEX,
}

/** Block-level markdown patterns converted when the user types a trailing space. */
const MARKDOWN_SHORTCUT_TRANSFORMERS: Transformer[] = [HEADING_SHORTCUT, UNORDERED_LIST, CHECK_LIST]

type MarkdownShortcutPluginProps = {
  enabled?: boolean
  transformers?: Transformer[]
}

/**
 * Auto-converts markdown block prefixes while typing:
 * `# ` → h1, `## ` → h2, `### ` → h3, `- ` → bullet, `[] ` → checklist.
 */
export function MarkdownShortcutPlugin({
  enabled = true,
  transformers = MARKDOWN_SHORTCUT_TRANSFORMERS,
}: MarkdownShortcutPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!enabled) return
    return registerMarkdownShortcuts(editor, transformers)
  }, [editor, enabled, transformers])

  return null
}
