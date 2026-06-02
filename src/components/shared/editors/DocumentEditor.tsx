import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useState } from 'react'

import {
  CheckListPlugin,
  FloatingEmojiPickerPlugin,
  SelectionHandles,
} from '@/features/lexical-editor'

import { DocumentCodeHighlightPlugin } from './DocumentCodeHighlightPlugin'
import { EditorToolbarPlugin } from './EditorToolbarPlugin'
import { DocumentSlashMenuPlugin } from './DocumentSlashMenuPlugin'
import { createDocumentEditorInitialConfig } from './editorConfig'
import { isValidUrl } from './editorLink'

export type DocumentEditorProps = {
  placeholder?: string
}

export const DocumentEditor = ({ placeholder = 'Enter some text...' }: DocumentEditorProps) => {
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)

  return (
    <LexicalComposer initialConfig={createDocumentEditorInitialConfig()}>
      <div className="editor-shell">
        <EditorToolbarPlugin />
        <DocumentSlashMenuPlugin />

        <div
          ref={setAnchorElem}
          className="editor-surface relative"
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-contentEditable caret-blue-500 selection:bg-blue-100 selection:text-slate-900 dark:selection:bg-blue-900 dark:selection:text-white"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            placeholder={<div className="editor-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <SelectionHandles container={anchorElem} />
          {anchorElem ? <FloatingEmojiPickerPlugin anchorElem={anchorElem} /> : null}
        </div>

        <HistoryPlugin />
        <AutoFocusPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <DocumentCodeHighlightPlugin />
        <LinkPlugin validateUrl={isValidUrl} />
      </div>
    </LexicalComposer>
  )
}
