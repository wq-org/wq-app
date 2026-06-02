import { useCallback, useId } from 'react'
import type { SerializedEditorState } from 'lexical'

import { Label } from '@/components/ui/label'
import { Editor, type FloatingToolbarFeatures } from '@/features/lexical-editor'
import type { LessonDraftState } from '@/features/lesson'
import { cn } from '@/lib/utils'

import { normalizeLexicalEditorState } from './normalizeLexicalEditorState'

/** Shared inset so caret and placeholder line up (overrides lesson editor padding). */
const EMBEDDED_EDITOR_PAD = 'px-3! py-2!' as const

export type LexicalTextareaProps = {
  id?: string
  label: string
  value?: SerializedEditorState | null
  onValueChange: (value: SerializedEditorState) => void
  /** Passed to `Editor` as `lessonId` for hydrate + autosave scope. */
  hydrationKey: string
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  /** Override floating toolbar buttons (embedded defaults disable comments). */
  floatingToolbarFeatures?: Partial<FloatingToolbarFeatures>
}

export function LexicalTextarea({
  id: idProp,
  label,
  value,
  onValueChange,
  hydrationKey,
  placeholder = '',
  minHeight = 300,
  disabled = false,
  className,
  floatingToolbarFeatures,
}: LexicalTextareaProps) {
  const generatedId = useId()
  const resolvedId = idProp ?? generatedId

  const handlePersist = useCallback(
    (state: SerializedEditorState) => {
      onValueChange(state)
    },
    [onValueChange],
  )

  const normalizeInitialContent = useCallback(
    (content: LessonDraftState | null | undefined) => normalizeLexicalEditorState(content),
    [],
  )

  const slashPlaceholder =
    placeholder.trim().length > 0
      ? placeholder
      : "Type '/' for blocks, formatting, images, and more."

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <Label
        htmlFor={resolvedId}
        className="text-sm font-medium leading-none"
      >
        {label}
      </Label>
      <div
        id={resolvedId}
        className={cn(
          'w-full rounded-2xl border-dashed border border-input bg-background',
          disabled && 'pointer-events-none opacity-50',
        )}
        style={{ minHeight }}
      >
        <Editor
          lessonId={hydrationKey}
          initialContent={value}
          readOnly={disabled}
          variant="embedded"
          minHeightClassName="min-h-full"
          surfaceClassName="relative min-h-[inherit]"
          embeddedEditableClassName={EMBEDDED_EDITOR_PAD}
          ariaLabel={label}
          normalizeInitialContent={normalizeInitialContent}
          onPersistSerializedContent={handlePersist}
          floatingToolbarFeatures={floatingToolbarFeatures}
          placeholder={
            <div
              className={cn(
                'pointer-events-none absolute left-0 top-0 text-sm text-muted-foreground',
                EMBEDDED_EDITOR_PAD,
              )}
            >
              {slashPlaceholder}
            </div>
          }
          placeholderAriaLabel={slashPlaceholder}
        />
      </div>
    </div>
  )
}
