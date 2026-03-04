import { useEffect, useMemo, useRef, type MouseEvent } from 'react'
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import { BulletedList, NumberedList } from '@yoopta/lists'
import Blockquote from '@yoopta/blockquote'
import { Bold, Italic, Underline, Strike } from '@yoopta/marks'
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
import { cn } from '@/lib/utils'

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  BulletedList,
  NumberedList,
  Blockquote,
]

const marks = [Bold, Italic, Underline, Strike]

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
}

interface LessonEditorProps {
  value?: Record<string, unknown>
  onChange?: (value: Record<string, unknown>) => void
  readOnly?: boolean
  className?: string
  placeholder?: string
  autoFocusWhenEmpty?: boolean
}

function getTextFromNode(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map((item) => getTextFromNode(item)).join('')
  if (typeof node !== 'object') return ''

  const record = node as Record<string, unknown>

  if (typeof record.text === 'string') {
    return record.text
  }

  if (Array.isArray(record.children)) {
    return record.children.map((child) => getTextFromNode(child)).join('')
  }

  if (Array.isArray(record.value)) {
    return record.value.map((child) => getTextFromNode(child)).join('')
  }

  return ''
}

function isLessonValueEmpty(value?: Record<string, unknown>): boolean {
  if (!value || typeof value !== 'object') {
    return true
  }

  if (Object.keys(value).length === 0) {
    return true
  }

  const blocks = Array.isArray(value.blocks) ? value.blocks : Object.values(value)

  if (blocks.length === 0) {
    return true
  }

  const combinedText = blocks
    .map((block) => getTextFromNode(block))
    .join('')
    .trim()
  return combinedText.length === 0
}

function normalizeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export default function LessonEditor({
  value,
  onChange,
  readOnly = false,
  className = '',
  placeholder = 'Type / to open the menu...',
  autoFocusWhenEmpty = false,
}: LessonEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasHandledInitialFocusRef = useRef(false)
  const editorTools = readOnly ? undefined : TOOLS
  const isEmptyValue = useMemo(() => isLessonValueEmpty(value), [value])
  const editorClassName = cn(
    'w-full',
    '[&_.yoopta-editor]:mx-auto [&_.yoopta-editor]:min-h-[1126px] [&_.yoopta-editor]:w-full [&_.yoopta-editor]:max-w-6xl [&_.yoopta-editor]:px-8 [&_.yoopta-editor]:py-10',
    '[&_.yoopta-slate]:mx-auto [&_.yoopta-slate]:w-full [&_.yoopta-slate]:max-w-4xl',
    '[&_.yoopta-slate_a]:text-blue-600 [&_.yoopta-slate_a]:underline [&_.yoopta-slate_a]:underline-offset-2',
    className,
  )

  useEffect(() => {
    if (!isEmptyValue) {
      hasHandledInitialFocusRef.current = true
    }
  }, [isEmptyValue])

  useEffect(() => {
    if (readOnly || !autoFocusWhenEmpty || !isEmptyValue || hasHandledInitialFocusRef.current) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const editableSurface = containerRef.current?.querySelector(
        '[contenteditable="true"]',
      ) as HTMLElement | null

      if (!editableSurface) {
        return
      }

      editableSurface.focus()
      hasHandledInitialFocusRef.current = true
    })

    return () => window.cancelAnimationFrame(frame)
  }, [autoFocusWhenEmpty, isEmptyValue, readOnly])

  const handleLinkClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null
    const link = target?.closest('a[href]') as HTMLAnchorElement | null
    if (!link) return

    // In edit mode, keep normal click behavior and only open on Ctrl/Cmd+Click.
    if (!readOnly && !event.metaKey && !event.ctrlKey) return

    const href = normalizeHref(link.getAttribute('href') ?? '')
    if (!href) return

    event.preventDefault()
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      ref={containerRef}
      className={editorClassName}
      onMouseDownCapture={handleLinkClick}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={marks}
        tools={editorTools}
        value={value as never}
        onChange={(newValue: Record<string, unknown>) => onChange?.(newValue)}
        readOnly={readOnly}
        autoFocus={!readOnly && isEmptyValue}
        placeholder={placeholder}
        width="100%"
      />
    </div>
  )
}
