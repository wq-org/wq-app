import { useEffect, useMemo, type MouseEvent } from 'react'
import YooptaEditor, {
  createYooptaEditor,
  type YooEditor,
  type YooptaContentValue,
  type YooptaOnChangeOptions,
} from '@yoopta/editor'
import { cn } from '@/lib/utils'
import { createEmptyLessonContent, parseYooptaContent } from '../utils/lessonPages'
import {
  LESSON_EDITOR_MARKS,
  LESSON_EDITOR_TOOLS,
  LESSON_YOOPTA_PLUGINS,
} from '../config/yooptaBlocks'
import {
  LessonEditorPageContextProvider,
  type LessonFileTagRequest,
} from './lessonEditorPageContext'

export type LessonEditorProps = {
  pageId: string
  value?: YooptaContentValue
  onChange?: (value: YooptaContentValue, options: YooptaOnChangeOptions, editor: YooEditor) => void
  onFocus?: (editor: YooEditor) => void
  onReady?: (editor: YooEditor) => void
  onRequestFileTag?: (request: LessonFileTagRequest) => void
  readOnly?: boolean
  className?: string
  placeholder?: string
}

function normalizeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function LessonEditor({
  pageId,
  value,
  onChange,
  onFocus,
  onReady,
  onRequestFileTag,
  readOnly = false,
  className,
  placeholder = 'Start writing...',
}: LessonEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])
  const normalizedValue = useMemo(
    () => parseYooptaContent(value ?? createEmptyLessonContent()),
    [value],
  )

  useEffect(() => {
    onReady?.(editor)
  }, [editor, onReady])

  useEffect(() => {
    const current = editor.getEditorValue()
    const currentKeys = Object.keys(current).sort().join(',')
    const nextKeys = Object.keys(normalizedValue).sort().join(',')
    if (currentKeys !== nextKeys) {
      editor.setEditorValue(normalizedValue)
    }
  }, [editor, normalizedValue])

  const editorClassName = cn(
    'relative w-full overflow-visible',
    '[&_.yoopta-editor]:relative [&_.yoopta-editor]:min-h-[32rem] [&_.yoopta-editor]:w-full [&_.yoopta-editor]:max-w-none [&_.yoopta-editor]:overflow-visible [&_.yoopta-editor]:px-0 [&_.yoopta-editor]:py-0',
    '[&_.yoopta-slate]:w-full [&_.yoopta-slate]:max-w-none [&_.yoopta-slate]:pl-10 [&_.yoopta-slate]:pr-2 sm:[&_.yoopta-slate]:pl-12 md:[&_.yoopta-slate]:pl-14',
    '[&_.yoopta-slate_a]:text-blue-600 [&_.yoopta-slate_a]:underline [&_.yoopta-slate_a]:underline-offset-2',
    '[&_.yoopta-overlays]:relative [&_.yoopta-overlays]:z-[90]',
    '[&_.yoopta-block-actions]:z-[80]',
    '[&_.yoopta-block-action-buttons]:rounded-full [&_.yoopta-block-action-buttons]:border [&_.yoopta-block-action-buttons]:border-border/70 [&_.yoopta-block-action-buttons]:bg-background/95 [&_.yoopta-block-action-buttons]:p-1 [&_.yoopta-block-action-buttons]:shadow-sm [&_.yoopta-block-action-buttons]:backdrop-blur-sm',
    '[&_.yoopta-block-actions-plus]:h-8 [&_.yoopta-block-actions-plus]:w-8 [&_.yoopta-block-actions-plus]:rounded-full [&_.yoopta-block-actions-plus]:text-muted-foreground [&_.yoopta-block-actions-plus:hover]:bg-accent [&_.yoopta-block-actions-plus:hover]:text-foreground',
    '[&_.yoopta-block-actions-drag]:h-8 [&_.yoopta-block-actions-drag]:w-8 [&_.yoopta-block-actions-drag]:rounded-full [&_.yoopta-block-actions-drag]:text-muted-foreground [&_.yoopta-block-actions-drag:hover]:bg-accent [&_.yoopta-block-actions-drag:hover]:text-foreground',
    '[&_.yoopta-action-menu-list]:z-[120]',
    '[&_.yoopta-action-menu-list-content]:rounded-2xl [&_.yoopta-action-menu-list-content]:border-border [&_.yoopta-action-menu-list-content]:bg-card [&_.yoopta-action-menu-list-content]:text-foreground [&_.yoopta-action-menu-list-content]:shadow-lg',
    '[&_[data-action-menu-item]]:rounded-xl [&_[data-action-menu-item]]:px-2 [&_[data-action-menu-item]]:py-2 [&_[data-action-menu-item]]:text-foreground [&_[data-action-menu-item]]:transition-colors [&_[data-action-menu-item]]:hover:bg-accent [&_[data-action-menu-item]]:hover:text-foreground',
    '[&_[data-action-menu-item][aria-selected=true]]:bg-accent [&_[data-action-menu-item][aria-selected=true]]:text-foreground',
    '[&_.yoopta-block-options-menu-content]:rounded-2xl [&_.yoopta-block-options-menu-content]:border-border [&_.yoopta-block-options-menu-content]:bg-card [&_.yoopta-block-options-menu-content]:text-foreground [&_.yoopta-block-options-menu-content]:shadow-lg',
    '[&_.yoopta-block-options-button]:rounded-lg [&_.yoopta-block-options-button]:text-foreground [&_.yoopta-block-options-button:hover]:bg-accent',
    '[&_.yoopta-extended-block-actions]:border [&_.yoopta-extended-block-actions]:border-border [&_.yoopta-extended-block-actions]:bg-muted [&_.yoopta-extended-block-actions]:text-muted-foreground',
    className,
  )

  const handleLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    const link = target?.closest('a[href]') as HTMLAnchorElement | null
    if (!link) return

    if (!readOnly && !event.metaKey && !event.ctrlKey) return

    const href = normalizeHref(link.getAttribute('href') ?? '')
    if (!href) return

    event.preventDefault()
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <LessonEditorPageContextProvider
      value={{
        pageId,
        readOnly,
        requestFileTag: (request) => onRequestFileTag?.(request),
      }}
    >
      <div
        className={editorClassName}
        onFocusCapture={() => onFocus?.(editor)}
        onMouseDownCapture={handleLinkClick}
      >
        <YooptaEditor
          editor={editor}
          plugins={LESSON_YOOPTA_PLUGINS}
          marks={[...LESSON_EDITOR_MARKS]}
          tools={readOnly ? undefined : LESSON_EDITOR_TOOLS}
          value={normalizedValue}
          onChange={(nextValue, options) => onChange?.(nextValue, options, editor)}
          readOnly={readOnly}
          autoFocus={false}
          placeholder={placeholder}
          width="100%"
        />
      </div>
    </LessonEditorPageContextProvider>
  )
}
