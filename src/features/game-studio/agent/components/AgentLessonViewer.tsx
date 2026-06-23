import { useCallback, useEffect, useRef, useState } from 'react'
import { X, NotebookPen } from 'lucide-react'
import type { SerializedEditorState } from 'lexical'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Editor } from '@/features/lexical-editor'
import { useGameEditorContext } from '@/contexts/game-studio'
import type { AgentLesson } from '../types/agent.types'

type ToolbarState = {
  x: number
  y: number
  text: string
}

type AgentLessonViewerProps = {
  lesson: AgentLesson
  closeLabel: string
  onClose: () => void
}

export function AgentLessonViewer({ lesson, closeLabel, onClose }: AgentLessonViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const context = useGameEditorContext()

  const activeTextFields = (context?.getActiveNodeFields() ?? []).filter(
    (f) => f.type === 'text' || f.type === 'rich-text',
  )
  const hasActiveFields = activeTextFields.length > 0

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    const text = sel?.toString().trim() ?? ''

    if (!text || !containerRef.current || !hasActiveFields) {
      setToolbar(null)
      return
    }

    const range = sel?.getRangeAt(0)
    if (!range || !containerRef.current.contains(range.commonAncestorContainer)) {
      setToolbar(null)
      return
    }

    const rect = range.getBoundingClientRect()
    setToolbar({ x: rect.left + rect.width / 2, y: rect.top, text })
  }, [hasActiveFields])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseUp])

  useEffect(() => {
    if (!toolbar) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolbar(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [toolbar])

  const handleFieldInsert = useCallback(
    (field: { type: string; setValue: (v: string) => void; getValue?: () => string }) => {
      if (!toolbar) return
      if (field.type === 'rich-text') {
        field.setValue(toolbar.text)
      } else {
        const prev = field.getValue?.() ?? ''
        field.setValue(prev ? `${prev}\n${toolbar.text}` : toolbar.text)
      }
      window.getSelection()?.removeAllRanges()
      setToolbar(null)
    },
    [toolbar],
  )

  const isValidState =
    lesson.lexicalState !== null &&
    lesson.lexicalState !== undefined &&
    typeof lesson.lexicalState === 'object'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b pb-2">
        <p
          className="min-w-0 truncate text-sm font-medium"
          title={lesson.title}
        >
          {lesson.title || 'Untitled lesson'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-y-auto"
      >
        {isValidState ? (
          <Editor
            lessonId={lesson.id}
            initialContent={lesson.lexicalState as SerializedEditorState}
            readOnly
            variant="embedded"
          />
        ) : (
          <Text
            as="p"
            variant="body"
            muted
            className="py-4 text-sm"
          >
            Could not load lesson content.
          </Text>
        )}
      </div>

      {toolbar && hasActiveFields ? (
        <div
          className="fixed z-50 flex min-w-[160px] flex-col gap-0.5 rounded-lg bg-popover/70 p-1 shadow-md ring-1 ring-foreground/10 backdrop-blur-xl"
          style={{ left: toolbar.x, top: toolbar.y - 44 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {activeTextFields.map((field) => (
            <Button
              key={field.fieldKey}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start gap-1.5 px-2.5 text-xs"
              onClick={() => handleFieldInsert(field)}
              aria-label={field.label}
            >
              <NotebookPen className="size-3.5 shrink-0" />
              {field.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
