import { TabIndentationExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { LinkExtension } from '@lexical/link'
import { ListExtension } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { RichTextExtension } from '@lexical/rich-text'
import { TableCellNode, TableExtension, TableNode, TableRowNode } from '@lexical/table'
import { configExtension, defineExtension, type SerializedEditorState } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  LESSON_HYDRATION_TAG,
  normalizeLessonDraftState,
  useLessonAutosave,
  type LessonBlockTypeRegistryRow,
  type LessonDraftState,
  type SaveStatus,
} from '@/features/lesson'
import type { ScrollDrivenIndexItem } from '@/components/shared/scroll-driven-index'

import {
  FloatingFormatExtension,
  FloatingTextFormatToolbarPlugin,
} from '../plugins/FloatingTextFormatToolbarPlugin'
import { EmojiNode } from '../nodes/EmojiNode'
import { ImageNode } from '../nodes/ImageNode'
import { YouTubeNode } from '../nodes/YouTubeNode'
import { CheckListPlugin } from '../plugins/LexicalCheckListPlugin'
import { FloatingEmojiPickerPlugin } from '../plugins/FloatingEmojiPickerPlugin'
import { NodeEditorAutoLinkExtension } from '../plugins/AutoLinkExtension'
import { FloatingLinkEditorPlugin } from '../plugins/FloatingLinkEditorPlugin'
import { LessonLinkDialogPlugin } from '../plugins/LessonLinkDialogPlugin'
import { AddYouTubeLinksDialogPlugin } from '../plugins/AddYouTubeLinksDialogPlugin'
import { LexicalDraggableBlockPlugin } from '../plugins/LexicalDraggableBlockPlugin'
import { PasteGuardPlugin, type PasteOverflowInfo } from '../plugins/PasteGuardPlugin'
import { SlashMenuPlugin } from '../plugins/SlashMenuPlugin'
import TableCellResizerPlugin from '../plugins/TableCellResizer'
import { TableInteractionPlugin } from '../plugins/TableInteractionPlugin'
import { HeadingExtractorPlugin } from '../plugins/HeadingExtractorPlugin'
import { HeadingIdPlugin } from '../plugins/HeadingIdPlugin'
import { validateUrl } from '../utils/url'

const theme = {
  heading: {
    h1: 'mt-2 mb-1 text-[1.75rem] font-bold leading-[1.25]',
    h2: 'mt-2 mb-[0.15rem] text-[1.3rem] font-semibold leading-[1.3]',
    h3: 'mt-[0.4rem] mb-[0.1rem] text-[1.1rem] font-semibold leading-[1.35]',
  },
  list: {
    listitem: 'editor-listItem',
    listitemChecked: 'editor-listItemChecked',
    listitemUnchecked: 'editor-listItemUnchecked',
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
  },
  embedBlock: {
    base: 'my-4 max-w-full overflow-hidden rounded-xl',
    focus: 'outline outline-2 outline-blue-500/70 outline-offset-2',
  },
  paragraph: 'my-0 py-0.5 leading-[1.6]',
  quote:
    'my-[0.4rem] border-l-[3px] [border-left-style:solid] border-zinc-300 pl-3.5 italic text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
  link: 'text-blue-500 underline underline-offset-2 cursor-pointer',
  table: 'editor-table',
  tableCell: 'editor-tableCell',
  tableCellHeader: 'editor-tableCellHeader',
  tableCellSelected: 'editor-tableCellSelected',
  tableRow: 'editor-tableRow',
  tableScrollableWrapper: 'editor-tableScrollableWrapper',
  tableSelection: 'editor-tableSelection',
  text: {
    bold: 'font-bold',
    code: 'rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.3em] py-[0.1em] font-mono text-[0.875em] dark:bg-white/10',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
  },
}

const lessonEditorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TableExtension,
    TabIndentationExtension,
    FloatingFormatExtension,
    NodeEditorAutoLinkExtension,
    configExtension(LinkExtension, { validateUrl, attributes: undefined }),
  ],
  name: 'wq-health-lesson-editor',
  namespace: 'wq-health-lesson-editor',
  theme,
  nodes: [ImageNode, EmojiNode, YouTubeNode, TableCellNode, TableNode, TableRowNode],
})

export type EditorProps = {
  lessonId: string
  initialContent?: LessonDraftState | null
  blockTypeRegistry?: LessonBlockTypeRegistryRow[]
  readOnly?: boolean
  isLoading?: boolean
  onPersistSerializedContent?: (state: SerializedEditorState) => void | Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
  onPasteOverflow?: (info: PasteOverflowInfo) => void
  onHeadingsChange?: (items: ScrollDrivenIndexItem[]) => void
}

function LessonEditablePlugin({ readOnly }: { readOnly: boolean }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  return null
}

function LessonHydrationPlugin({
  lessonId,
  initialContent,
  isLoading,
}: {
  lessonId: string
  initialContent?: LessonDraftState | null
  isLoading: boolean
}) {
  const [editor] = useLexicalComposerContext()
  const hydratedLessonIdRef = useRef<string | null>(null)

  useEffect(() => {
    hydratedLessonIdRef.current = null
  }, [lessonId])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (hydratedLessonIdRef.current === lessonId) {
      return
    }

    hydratedLessonIdRef.current = lessonId
    const normalized = normalizeLessonDraftState(initialContent)
    const nextState = editor.parseEditorState(JSON.stringify(normalized))
    editor.setEditorState(nextState, { tag: LESSON_HYDRATION_TAG })
  }, [editor, initialContent, isLoading, lessonId])

  return null
}

function LessonAutosaveBridge({
  lessonId,
  readOnly,
  onPersistSerializedContent,
  onSaveStatusChange,
}: {
  lessonId: string
  readOnly: boolean
  onPersistSerializedContent?: (state: SerializedEditorState) => void | Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
}) {
  const [editor] = useLexicalComposerContext()

  const save = useCallback(
    async (serialized: SerializedEditorState) => {
      if (!onPersistSerializedContent) return
      await Promise.resolve(onPersistSerializedContent(serialized))
    },
    [onPersistSerializedContent],
  )

  useLessonAutosave({
    editor,
    isReadOnly: readOnly,
    lessonId,
    onStatusChange: onSaveStatusChange,
    save,
  })

  return null
}

export function Editor({
  lessonId,
  initialContent,
  blockTypeRegistry,
  readOnly = false,
  isLoading = false,
  onPersistSerializedContent,
  onSaveStatusChange,
  onPasteOverflow,
  onHeadingsChange,
}: EditorProps) {
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)
  const requestLinkDialogRef = useRef<() => void>(() => {})

  const registerRequestLinkDialog = useCallback((requestLinkDialog: () => void) => {
    requestLinkDialogRef.current = requestLinkDialog
  }, [])

  const handleRequestLinkDialog = useCallback(() => {
    requestLinkDialogRef.current()
  }, [])

  const handlePasteOverflow = useCallback(
    (info: PasteOverflowInfo) => {
      onPasteOverflow?.(info)
    },
    [onPasteOverflow],
  )

  return (
    <LexicalExtensionComposer
      extension={lessonEditorExtension}
      contentEditable={null}
    >
      <LessonEditablePlugin readOnly={readOnly} />
      <CheckListPlugin />
      <LessonHydrationPlugin
        initialContent={initialContent}
        isLoading={isLoading}
        lessonId={lessonId}
      />
      <HeadingIdPlugin />
      {onHeadingsChange ? <HeadingExtractorPlugin onHeadingsChange={onHeadingsChange} /> : null}
      <TableCellResizerPlugin />
      {!readOnly && onPasteOverflow ? <PasteGuardPlugin onOverflow={handlePasteOverflow} /> : null}
      {!readOnly && !isLoading ? (
        <LessonAutosaveBridge
          lessonId={lessonId}
          onPersistSerializedContent={onPersistSerializedContent}
          onSaveStatusChange={onSaveStatusChange}
          readOnly={readOnly}
        />
      ) : null}
      <div
        ref={setAnchorElem}
        className="relative w-full"
      >
        <ContentEditable
          className="editor-contentEditable outline-none dark:text-zinc-200"
          aria-label="Rich text editor"
          aria-placeholder="Type '/' for commands..."
          placeholder={<div className="editor-placeholder">Type &apos;/&apos; for commands...</div>}
        />
        <LexicalDraggableBlockPlugin />
        <SlashMenuPlugin registry={blockTypeRegistry} />
        <LessonLinkDialogPlugin onReady={registerRequestLinkDialog} />
        <AddYouTubeLinksDialogPlugin />
        {anchorElem ? (
          <>
            <FloatingTextFormatToolbarPlugin
              anchorElem={anchorElem}
              onRequestLinkDialog={handleRequestLinkDialog}
            />
            <FloatingLinkEditorPlugin
              anchorElem={anchorElem}
              onRequestLinkDialog={handleRequestLinkDialog}
            />
            <FloatingEmojiPickerPlugin anchorElem={anchorElem} />
            <TableInteractionPlugin anchorElem={anchorElem} />
          </>
        ) : null}
      </div>
    </LexicalExtensionComposer>
  )
}
