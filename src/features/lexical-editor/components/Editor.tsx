import { TabIndentationExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { ListExtension } from '@lexical/list'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { RichTextExtension } from '@lexical/rich-text'
import { defineExtension } from 'lexical'
import { useMemo, useState } from 'react'

import {
  FloatingFormatExtension,
  FloatingTextFormatToolbarPlugin,
} from '../FloatingTextFormatToolbarPlugin'
import { LexicalDraggableBlockPlugin } from './LexicalDraggableBlockPlugin'
import { SlashMenuPlugin } from './SlashMenuPlugin'

const theme = {
  heading: {
    h1: 'mt-2 mb-1 text-[1.75rem] font-bold leading-[1.25]',
    h2: 'mt-2 mb-[0.15rem] text-[1.3rem] font-semibold leading-[1.3]',
    h3: 'mt-[0.4rem] mb-[0.1rem] text-[1.1rem] font-semibold leading-[1.35]',
  },
  list: {
    listitem: 'my-[0.1rem] leading-[1.6]',
    ol: 'my-[0.2rem] pl-5 list-decimal',
    ul: 'my-[0.2rem] pl-5 list-disc',
  },
  paragraph: 'my-0 py-0.5 leading-[1.6]',
  quote:
    'my-[0.4rem] border-l-[3px] [border-left-style:solid] border-zinc-300 pl-3.5 italic text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
  text: {
    bold: 'font-bold',
    code: 'rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.3em] py-[0.1em] font-mono text-[0.875em] dark:bg-white/10',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
  },
}

const editorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TabIndentationExtension,
    FloatingFormatExtension,
  ],
  name: '@lexical/website/notion-like-editor',
  namespace: '@lexical/website/notion-like-editor',
  theme,
})

export function Editor() {
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)

  const editorPlaceholder = useMemo(
    () => (
      <div className="pointer-events-none absolute top-2 left-10 text-[0.95rem] text-zinc-400 select-none">
        Type &apos;/&apos; for commands...
      </div>
    ),
    [],
  )

  return (
    <LexicalExtensionComposer
      extension={editorExtension}
      contentEditable={null}
    >
      <div
        ref={setAnchorElem}
        className="relative w-full"
      >
        <ContentEditable
          className="min-h-[200px] py-2 pl-10 outline-none dark:text-zinc-200"
          aria-label="Rich text editor"
          aria-placeholder="Type '/' for commands..."
          placeholder={editorPlaceholder}
        />
        <LexicalDraggableBlockPlugin />
        <SlashMenuPlugin />
        {anchorElem ? <FloatingTextFormatToolbarPlugin anchorElem={anchorElem} /> : null}
      </div>
    </LexicalExtensionComposer>
  )
}
