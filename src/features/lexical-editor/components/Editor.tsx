import { TabIndentationExtension } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { ListExtension } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer'
import { RichTextExtension } from '@lexical/rich-text'
import {
  $getRoot,
  $parseSerializedNode,
  defineExtension,
  type SerializedLexicalNode,
} from 'lexical'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  blocksToSerializedEditorStateJson,
  LESSON_HYDRATION_TAG,
  useLessonAutosave,
  type LessonBlock,
  type LessonBlockTypeRegistryRow,
  type SaveStatus,
} from '@/features/lesson'

import {
  FloatingFormatExtension,
  FloatingTextFormatToolbarPlugin,
} from '../FloatingTextFormatToolbarPlugin'
import { ImageNode } from './ImageNode'
import { LexicalDraggableBlockPlugin } from './LexicalDraggableBlockPlugin'
import { PasteGuardPlugin, type PasteOverflowInfo } from './PasteGuardPlugin'
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

const lessonEditorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TabIndentationExtension,
    FloatingFormatExtension,
  ],
  name: 'wq-health-lesson-editor',
  namespace: 'wq-health-lesson-editor',
  theme,
  nodes: [ImageNode],
})

export type EditorProps = {
  lessonId: string
  headBlocks: LessonBlock[]
  tailBlocks: LessonBlock[]
  blockTypeRegistry?: LessonBlockTypeRegistryRow[]
  readOnly?: boolean
  isHeadLoading?: boolean
  isFullyHydrated?: boolean
  onPersistSerializedBlocks?: (nodes: SerializedLexicalNode[]) => void | Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
  onPasteOverflow?: (info: PasteOverflowInfo) => void
}

function LessonEditablePlugin({ readOnly }: { readOnly: boolean }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  return null
}

function LessonHeadHydrationPlugin({
  lessonId,
  headBlocks,
  isHeadLoading,
}: {
  lessonId: string
  headBlocks: LessonBlock[]
  isHeadLoading: boolean
}) {
  const [editor] = useLexicalComposerContext()
  const hydratedLessonIdRef = useRef<string | null>(null)

  useEffect(() => {
    hydratedLessonIdRef.current = null
  }, [lessonId])

  useEffect(() => {
    if (isHeadLoading) {
      return
    }

    if (hydratedLessonIdRef.current === lessonId) {
      return
    }

    hydratedLessonIdRef.current = lessonId
    const json = blocksToSerializedEditorStateJson(headBlocks)
    const nextState = editor.parseEditorState(json)
    editor.setEditorState(nextState, { tag: LESSON_HYDRATION_TAG })
  }, [editor, headBlocks, isHeadLoading, lessonId])

  return null
}

function LessonTailHydrationPlugin({
  lessonId,
  tailBlocks,
}: {
  lessonId: string
  tailBlocks: LessonBlock[]
}) {
  const [editor] = useLexicalComposerContext()
  const appendedIdsRef = useRef<Set<string>>(new Set())
  const lessonIdRef = useRef(lessonId)

  useEffect(() => {
    if (lessonIdRef.current !== lessonId) {
      lessonIdRef.current = lessonId
      appendedIdsRef.current = new Set()
    }
  }, [lessonId])

  useEffect(() => {
    if (tailBlocks.length === 0) {
      return
    }

    editor.update(() => {
      const root = $getRoot()
      for (const block of tailBlocks) {
        if (appendedIdsRef.current.has(block.id)) {
          continue
        }
        appendedIdsRef.current.add(block.id)
        try {
          const node = $parseSerializedNode(block.value as SerializedLexicalNode)
          root.append(node)
        } catch (err) {
          console.error('LessonTailHydrationPlugin: failed to append block', err)
        }
      }
    }, { tag: LESSON_HYDRATION_TAG })
  }, [editor, lessonId, tailBlocks])

  return null
}

function LessonAutosaveBridge({
  lessonId,
  readOnly,
  onPersistSerializedBlocks,
  onSaveStatusChange,
}: {
  lessonId: string
  readOnly: boolean
  onPersistSerializedBlocks?: (nodes: SerializedLexicalNode[]) => void | Promise<void>
  onSaveStatusChange?: (status: SaveStatus) => void
}) {
  const [editor] = useLexicalComposerContext()

  const save = useCallback(
    async (serialized: SerializedLexicalNode[]) => {
      if (!onPersistSerializedBlocks) return
      await Promise.resolve(onPersistSerializedBlocks(serialized))
    },
    [onPersistSerializedBlocks],
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
  headBlocks,
  tailBlocks,
  blockTypeRegistry,
  readOnly = false,
  isHeadLoading = false,
  isFullyHydrated = true,
  onPersistSerializedBlocks,
  onSaveStatusChange,
  onPasteOverflow,
}: EditorProps) {
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null)

  const editorPlaceholder = useMemo(
    () => (
      <div className="pointer-events-none absolute top-2 left-10 text-[0.95rem] text-zinc-400 select-none">
        Type &apos;/&apos; for commands...
      </div>
    ),
    [],
  )

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
      <LessonHeadHydrationPlugin
        headBlocks={headBlocks}
        isHeadLoading={isHeadLoading}
        lessonId={lessonId}
      />
      <LessonTailHydrationPlugin
        lessonId={lessonId}
        tailBlocks={tailBlocks}
      />
      {!readOnly && onPasteOverflow ? (
        <PasteGuardPlugin onOverflow={handlePasteOverflow} />
      ) : null}
      {!readOnly && isFullyHydrated ? (
        <LessonAutosaveBridge
          lessonId={lessonId}
          onPersistSerializedBlocks={onPersistSerializedBlocks}
          onSaveStatusChange={onSaveStatusChange}
          readOnly={readOnly}
        />
      ) : null}
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
        <SlashMenuPlugin registry={blockTypeRegistry} />
        {anchorElem ? <FloatingTextFormatToolbarPlugin anchorElem={anchorElem} /> : null}
      </div>
    </LexicalExtensionComposer>
  )
}
