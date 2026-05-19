import { useMemo } from 'react'

import { TabIndentationExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { LinkExtension } from '@lexical/link'
import { ListExtension } from '@lexical/list'
import { RichTextExtension } from '@lexical/rich-text'
import { configExtension, defineExtension } from 'lexical'

import { ImageNode } from '../nodes/ImageNode'
import { MentionNode } from '../nodes/MentionNode'
import { NodeEditorAutoLinkExtension } from '../plugins/AutoLinkExtension'
import { validateUrl } from '../utils/url'

const nodeEditorTheme = {
  link: 'text-primary underline underline-offset-2 cursor-pointer',
  paragraph: 'my-0 py-0.5 leading-[1.6]',
}

const lexicalNodeEditorExtension = defineExtension({
  name: 'lexical-node-editor',
  namespace: 'lexical-node-editor',
  nodes: [ImageNode, MentionNode],
  theme: nodeEditorTheme,
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TabIndentationExtension,
    NodeEditorAutoLinkExtension,
    configExtension(LinkExtension, { validateUrl, attributes: undefined }),
  ],
})

export function useLexicalNodeEditor() {
  return useMemo(() => lexicalNodeEditorExtension, [])
}
