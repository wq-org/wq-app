import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { EditorToolbarPlugin } from './EditorToolbarPlugin'
import { DocumentSlashMenuPlugin } from './DocumentSlashMenuPlugin'
import { createDocumentEditorInitialConfig } from './editorConfig'
import { isValidUrl } from './editorLink'

export type DocumentEditorProps = {
  placeholder?: string
}

export const DocumentEditor = ({ placeholder = 'Enter some text...' }: DocumentEditorProps) => {
  return (
    <LexicalComposer initialConfig={createDocumentEditorInitialConfig()}>
      <div className="editor-shell">
        <EditorToolbarPlugin />
        <DocumentSlashMenuPlugin />

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
