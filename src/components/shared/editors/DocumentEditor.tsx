import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { EditorToolbarPlugin } from './EditorToolbarPlugin'
import { editorTheme } from './editorTheme'
import { isValidUrl, lexicalConfig } from './editorLink'

export type DocumentEditorProps = {
  placeholder?: string
}

function handleDocumentEditorError(error: Error) {
  console.error(error)
}

export function DocumentEditor({ placeholder = 'Enter some text...' }: DocumentEditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: lexicalConfig.namespace,
    theme: editorTheme,
    onError: handleDocumentEditorError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, ...lexicalConfig.nodes],
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-shell">
        <EditorToolbarPlugin />

        <div className="editor-surface">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-contentEditable"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            placeholder={<div className="editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <LinkPlugin validateUrl={isValidUrl} />
      </div>
    </LexicalComposer>
  )
}
