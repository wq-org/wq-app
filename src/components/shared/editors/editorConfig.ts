import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ImageNode, MentionNode } from '@/features/lexical-editor'
import { editorTheme } from './editorTheme'
import { lexicalConfig } from './editorLink'

const handleDocumentEditorError = (error: Error) => {
  console.error(error)
}

export const createDocumentEditorInitialConfig = (): InitialConfigType => {
  return {
    namespace: lexicalConfig.namespace,
    theme: editorTheme,
    onError: handleDocumentEditorError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      ImageNode,
      MentionNode,
      ...lexicalConfig.nodes,
    ],
  }
}
