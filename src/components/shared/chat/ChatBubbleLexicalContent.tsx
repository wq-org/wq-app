'use client'

import { useCallback, useMemo } from 'react'
import type { SerializedEditorState } from 'lexical'

import { normalizeLexicalEditorState } from '@/components/shared/lexical-textarea'
import { Editor } from '@/features/lexical-editor'
import type { LessonDraftState } from '@/features/lesson'
import { cn } from '@/lib/utils'

import type { FloatingToolbarFeatures } from '@/features/lexical-editor/types/floatingToolbarFeatures'

const READONLY_CHAT_LEXICAL_TOOLBAR: Partial<FloatingToolbarFeatures> = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  link: false,
  comment: false,
  highlight: false,
}

export type ChatBubbleLexicalContentProps = {
  content: SerializedEditorState | null | undefined
  /** Stable id for Lexical hydration (e.g. message or field id). */
  hydrationKey: string
  className?: string
}

export function ChatBubbleLexicalContent({
  content,
  hydrationKey,
  className,
}: ChatBubbleLexicalContentProps) {
  const initialContent = useMemo(() => normalizeLexicalEditorState(content), [content])

  const normalizeInitialContent = useCallback(
    (value: LessonDraftState | null | undefined) =>
      normalizeLexicalEditorState(value) as LessonDraftState,
    [],
  )

  return (
    <div className={cn('chat-bubble-lexical min-w-0 text-inherit', className)}>
      <Editor
        lessonId={hydrationKey}
        initialContent={initialContent}
        readOnly
        variant="embedded"
        minHeightClassName="min-h-0"
        surfaceClassName="relative w-full"
        embeddedEditableClassName="px-0! py-0!"
        ariaLabel="Message content"
        normalizeInitialContent={normalizeInitialContent}
        floatingToolbarFeatures={READONLY_CHAT_LEXICAL_TOOLBAR}
      />
    </div>
  )
}
