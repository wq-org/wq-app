import { TabIndentationExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { LinkExtension } from '@lexical/link'
import { ListExtension } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { RichTextExtension } from '@lexical/rich-text'
import { TableCellNode, TableExtension, TableNode, TableRowNode } from '@lexical/table'
import { configExtension, defineExtension, type SerializedEditorState } from 'lexical'
import { useCallback, useEffect, useRef, useState, type JSX } from 'react'

import { cn } from '@/lib/utils'

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
  CodeHighlightKitExtension,
  mergeCodeHighlightTheme,
} from '../plugins/code-highlight-plugin'
import { MarkdownPasteExtension, markdownPasteNodes } from '../plugins/MarkdownPastePlugin'
import '../plugins/code-highlight-plugin/codeHighlightTheme.css'
import { CodeBlockActionMenuPlugin } from '../plugins/CodeBlockActionMenuPlugin'
import { CodeBlockSelectionPlugin } from '../plugins/CodeBlockSelectionPlugin'
import {
  FloatingFormatExtension,
  FloatingTextFormatToolbarPlugin,
} from '../plugins/FloatingTextFormatToolbarPlugin'
import { EmojiNode } from '../nodes/EmojiNode'
import { ImageNode } from '../nodes/ImageNode'
import { ImagePlaceholderNode } from '../nodes/ImagePlaceholderNode'
import { YouTubeNode } from '../nodes/YouTubeNode'
import { CommentMarkNode } from '../nodes/CommentMarkNode'
import { CheckListPlugin } from '../plugins/LexicalCheckListPlugin'
import { CommentPlugin } from '../plugins/CommentPlugin'
import { FloatingEmojiPickerPlugin } from '../plugins/FloatingEmojiPickerPlugin'
import { FloatingImagePickerPlugin } from '../plugins/FloatingImagePickerPlugin'
import { NodeEditorAutoLinkExtension } from '../plugins/AutoLinkExtension'
import { FloatingLinkEditorPlugin } from '../plugins/FloatingLinkEditorPlugin'
import { LessonLinkDialogPlugin } from '../plugins/LessonLinkDialogPlugin'
import {
  ExternalContentInsertPlugin,
  type EditorExternalInsertApi,
} from '../plugins/ExternalContentInsertPlugin'
import { AddYouTubeLinksDialogPlugin } from '../plugins/AddYouTubeLinksDialogPlugin'
import { AppendParagraphOnBottomClickPlugin } from '../plugins/AppendParagraphOnBottomClickPlugin'
import { BlockRangeSelectionPlugin } from '../plugins/BlockRangeSelectionPlugin'
import { InlineCodeShortcutPlugin } from '../plugins/InlineCodeShortcutPlugin'
import { MarkdownShortcutPlugin } from '../plugins/MarkdownShortcutPlugin'
import { LexicalDraggableBlockPlugin } from '../plugins/LexicalDraggableBlockPlugin'
import { PasteGuardPlugin, type PasteOverflowInfo } from '../plugins/PasteGuardPlugin'
import { SelectionHandles } from './SelectionHandles'
import { SelectedNodeDeletePlugin } from '../plugins/SelectedNodeDeletePlugin'
import { SlashMenuPlugin } from '../plugins/SlashMenuPlugin'
import TableCellResizerPlugin from '../plugins/TableCellResizer'
import { TableInteractionPlugin } from '../plugins/TableInteractionPlugin'
import { HeadingExtractorPlugin } from '../plugins/HeadingExtractorPlugin'
import { HeadingIdPlugin } from '../plugins/HeadingIdPlugin'
import { LexicalCloudImageHydrationPlugin } from '../plugins/LexicalCloudImageHydrationPlugin'
import { validateUrl } from '../utils/url'
import {
  EMBEDDED_FLOATING_TOOLBAR_FEATURES,
  resolveFloatingToolbarFeatures,
  type FloatingToolbarFeatures,
} from '../types/floatingToolbarFeatures'

const theme = {
  heading: {
    h1: 'mt-2 mb-1 text-[1.75rem] font-bold leading-[1.25]',
    h2: 'mt-2 mb-[0.15rem] text-[1.3rem] font-semibold leading-[1.3]',
    h3: 'mt-[0.4rem] mb-[0.1rem] text-[1.1rem] font-semibold leading-[1.35]',
  },
  list: {
    checklist: 'editor-list-checklist',
    nested: {
      listitem: 'editor-nested-listitem',
    },
    listitem: 'editor-listItem',
    listitemChecked: 'editor-listItemChecked',
    listitemUnchecked: 'editor-listItemUnchecked',
    ol: 'editor-list-ol',
    // Cycles by depth (lexical applies depth % length): 1. → a. → i. → 1. …
    olDepth: ['editor-list-ol1', 'editor-list-ol2', 'editor-list-ol3'],
    ul: 'editor-list-ul',
    // Keep bullets solid at every indent level (no hollow circle / square cycling).
    ulDepth: ['editor-list-ul1', 'editor-list-ul2', 'editor-list-ul3'],
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
    code: 'rounded-md bg-[rgba(135,131,120,0.15)] px-[0.3em] py-[0.1em] font-mono text-[0.875em] text-[#c7254e] dark:bg-white/10 dark:text-[#e06c75]',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
  },
  mark: 'editor-comment-mark',
  markOverlap: 'editor-comment-mark editor-comment-mark--overlap',
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
    MarkdownPasteExtension,
    CodeHighlightKitExtension,
    configExtension(LinkExtension, { validateUrl, attributes: undefined }),
  ],
  name: 'wq-health-lesson-editor',
  namespace: 'wq-health-lesson-editor',
  theme: mergeCodeHighlightTheme(theme),
  nodes: [
    ImageNode,
    ImagePlaceholderNode,
    EmojiNode,
    YouTubeNode,
    TableCellNode,
    TableNode,
    TableRowNode,
    MarkNode,
    CommentMarkNode,
    ...markdownPasteNodes,
  ],
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
  /**
   * How to normalize `initialContent` before hydrate.
   * Default: lesson draft normalizer (applies onboarding starter when blank).
   */
  normalizeInitialContent?: (content: LessonDraftState | null | undefined) => LessonDraftState
  /** `lesson` = full lesson page; `embedded` = compact surfaces (e.g. game node description). */
  variant?: 'lesson' | 'embedded'
  surfaceClassName?: string
  /** Extra classes on embedded `ContentEditable` (e.g. padding aligned with placeholder). */
  embeddedEditableClassName?: string
  minHeightClassName?: string
  ariaLabel?: string
  /** Visual placeholder (`ContentEditable` requires `JSX.Element`, not plain strings). */
  placeholder?: EditorPlaceholder | null
  /**
   * Accessible placeholder text (required by Lexical when `placeholder` is set).
   * Defaults to `ariaLabel`, then the lesson fallback copy.
   */
  placeholderAriaLabel?: string
  /** Inline-toolbar toggles plus slash-menu table availability (merged with embedded defaults). */
  floatingToolbarFeatures?: Partial<FloatingToolbarFeatures>
  /**
   * Receives an imperative append API (text/link at document end) once the editor
   * mounts, and `null` on unmount. Lets sibling panels (e.g. the note agent PDF
   * viewer) insert content without owning a Lexical context.
   */
  onExternalInsertReady?: (api: EditorExternalInsertApi | null) => void
}

export type EditorPlaceholder = JSX.Element | ((isEditable: boolean) => JSX.Element | null)

const LESSON_PLACEHOLDER_ARIA = "Type '/' for commands"

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
  normalizeInitialContent,
  onHydrated,
}: {
  lessonId: string
  initialContent?: LessonDraftState | null
  isLoading: boolean
  normalizeInitialContent: (content: LessonDraftState | null | undefined) => LessonDraftState
  onHydrated: () => void
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
    const normalized = normalizeInitialContent(initialContent)
    const nextState = editor.parseEditorState(JSON.stringify(normalized))
    editor.setEditorState(nextState, { tag: LESSON_HYDRATION_TAG })
    onHydrated()
  }, [editor, initialContent, isLoading, lessonId, normalizeInitialContent, onHydrated])

  return null
}

function CloudImageHydrationBridge({
  enabled,
  hydrationGeneration,
  onPersistSerializedContent,
}: {
  enabled: boolean
  hydrationGeneration: number
  onPersistSerializedContent?: (state: SerializedEditorState) => void | Promise<void>
}) {
  const [editor] = useLexicalComposerContext()
  const persistRef = useRef(onPersistSerializedContent)
  persistRef.current = onPersistSerializedContent

  const handleAfterRefresh = useCallback(() => {
    const persist = persistRef.current
    if (!persist) return
    const serialized = editor.getEditorState().toJSON()
    void Promise.resolve(persist(serialized))
  }, [editor])

  return (
    <LexicalCloudImageHydrationPlugin
      enabled={enabled}
      hydrationGeneration={hydrationGeneration}
      onAfterRefresh={onPersistSerializedContent ? handleAfterRefresh : undefined}
    />
  )
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
  normalizeInitialContent = normalizeLessonDraftState,
  variant = 'lesson',
  surfaceClassName,
  embeddedEditableClassName,
  minHeightClassName = 'min-h-80',
  ariaLabel = 'Rich text editor',
  placeholder,
  placeholderAriaLabel,
  floatingToolbarFeatures: floatingToolbarFeaturesPartial,
  onExternalInsertReady,
}: EditorProps) {
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)
  const [imageHydrationGeneration, setImageHydrationGeneration] = useState(0)
  const requestLinkDialogRef = useRef<() => void>(() => {})
  const handleEditorHydrated = useCallback(() => {
    setImageHydrationGeneration((n) => n + 1)
  }, [])
  const isEmbedded = variant === 'embedded'
  const floatingToolbarFeatures = resolveFloatingToolbarFeatures(
    isEmbedded
      ? { ...EMBEDDED_FLOATING_TOOLBAR_FEATURES, ...floatingToolbarFeaturesPartial }
      : floatingToolbarFeaturesPartial,
  )

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

  const resolvedPlaceholder =
    placeholder ??
    (isEmbedded ? null : (
      <div className="editor-placeholder">Type &apos;/&apos; for commands...</div>
    ))

  const contentEditablePlaceholderProps =
    resolvedPlaceholder != null
      ? {
          placeholder: resolvedPlaceholder,
          'aria-placeholder': placeholderAriaLabel ?? ariaLabel ?? LESSON_PLACEHOLDER_ARIA,
        }
      : {}

  return (
    <LexicalExtensionComposer
      key={lessonId}
      extension={lessonEditorExtension}
      contentEditable={null}
    >
      <LessonEditablePlugin readOnly={readOnly} />
      {!readOnly && floatingToolbarFeatures.code ? <InlineCodeShortcutPlugin /> : null}
      {!readOnly ? <SelectedNodeDeletePlugin /> : null}
      <CheckListPlugin />
      {!readOnly ? <MarkdownShortcutPlugin /> : null}
      <LessonHydrationPlugin
        initialContent={initialContent}
        isLoading={isLoading}
        lessonId={lessonId}
        normalizeInitialContent={normalizeInitialContent}
        onHydrated={handleEditorHydrated}
      />
      <CloudImageHydrationBridge
        enabled={!isLoading}
        hydrationGeneration={imageHydrationGeneration}
        onPersistSerializedContent={onPersistSerializedContent}
      />
      {!isEmbedded ? <HeadingIdPlugin /> : null}
      {!isEmbedded && onHeadingsChange ? (
        <HeadingExtractorPlugin onHeadingsChange={onHeadingsChange} />
      ) : null}
      <TableCellResizerPlugin />
      {!readOnly && onExternalInsertReady ? (
        <ExternalContentInsertPlugin onReady={onExternalInsertReady} />
      ) : null}
      {!readOnly && onPasteOverflow ? <PasteGuardPlugin onOverflow={handlePasteOverflow} /> : null}
      {!readOnly && !isLoading ? (
        <LessonAutosaveBridge
          lessonId={lessonId}
          onPersistSerializedContent={onPersistSerializedContent}
          onSaveStatusChange={onSaveStatusChange}
          readOnly={readOnly}
        />
      ) : null}
      <div className={cn('relative w-full', minHeightClassName)}>
        <div
          ref={setAnchorElem}
          className={cn('editor-surface relative w-full', surfaceClassName)}
        >
          <ContentEditable
            className={cn(
              'editor-contentEditable outline-none caret-blue-500 selection:bg-blue-100 selection:text-slate-900 dark:text-zinc-200 dark:selection:bg-blue-900 dark:selection:text-white focus:outline-none focus-visible:outline-none focus-visible:ring-0',
              isEmbedded
                ? cn('min-h-0! text-base leading-relaxed md:text-sm', embeddedEditableClassName)
                : 'px-0!',
            )}
            aria-label={ariaLabel}
            {...contentEditablePlaceholderProps}
          />
          {!readOnly ? <AppendParagraphOnBottomClickPlugin /> : null}
          {!isEmbedded ? <SelectionHandles container={anchorElem} /> : null}
          {!isEmbedded ? (
            <BlockRangeSelectionPlugin
              anchorElem={anchorElem}
              enabled={!readOnly}
            />
          ) : null}
          {!isEmbedded ? <LexicalDraggableBlockPlugin /> : null}
          <SlashMenuPlugin
            registry={blockTypeRegistry}
            features={floatingToolbarFeatures}
            portalMenuToDocumentBody={isEmbedded}
          />
          <LessonLinkDialogPlugin onReady={registerRequestLinkDialog} />
          <AddYouTubeLinksDialogPlugin />
          {!isEmbedded ? <CommentPlugin /> : null}
          {anchorElem ? (
            <>
              <FloatingTextFormatToolbarPlugin
                anchorElem={anchorElem}
                onRequestLinkDialog={handleRequestLinkDialog}
                features={floatingToolbarFeatures}
                portalToDocumentBody={isEmbedded}
              />
              <FloatingLinkEditorPlugin
                anchorElem={anchorElem}
                onRequestLinkDialog={handleRequestLinkDialog}
                enabled={floatingToolbarFeatures.link}
              />
              <FloatingEmojiPickerPlugin
                anchorElem={anchorElem}
                portalToDocumentBody={isEmbedded}
              />
              <FloatingImagePickerPlugin
                anchorElem={anchorElem}
                portalToDocumentBody={isEmbedded}
              />
              <CodeBlockActionMenuPlugin anchorElem={anchorElem} />
              {!readOnly ? <CodeBlockSelectionPlugin /> : null}
              <TableInteractionPlugin anchorElem={anchorElem} />
            </>
          ) : null}
        </div>
      </div>
    </LexicalExtensionComposer>
  )
}
