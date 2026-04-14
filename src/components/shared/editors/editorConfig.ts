import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
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
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ...lexicalConfig.nodes],
  }
}
