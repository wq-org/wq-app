import { useMemo, useRef, type MouseEvent } from 'react'
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import { BulletedList, NumberedList } from '@yoopta/lists'
import Blockquote from '@yoopta/blockquote'
import { Bold, Italic, Underline, Strike } from '@yoopta/marks'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
import { cn } from '@/lib/utils'
import { createYooptaStarterContentObject } from '@/features/course'

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
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
}

interface LessonEditorProps {
  value?: Record<string, unknown>
  onChange?: (value: Record<string, unknown>) => void
  readOnly?: boolean
  className?: string
  placeholder?: string
}

function isInvalidYooptaValue(value?: Record<string, unknown>): boolean {
  if (!value || typeof value !== 'object') {
    return true
  }

  const blocks = Object.values(value)
  if (blocks.length === 0) {
    return true
  }

  return blocks.some((block) => {
    if (!block || typeof block !== 'object') {
      return true
    }

    const record = block as Record<string, unknown>
    return (
      !Array.isArray(record.value) ||
      typeof record.id !== 'string' ||
      typeof record.type !== 'string'
    )
  })
}

function normalizeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function LessonEditor({
  value,
  onChange,
  readOnly = false,
  className = '',
  placeholder = 'Type / to open the menu...',
}: LessonEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const starterContentRef = useRef<Record<string, unknown>>(createYooptaStarterContentObject())
  const editorTools = readOnly ? undefined : TOOLS
  const needsStarterFallback = useMemo(() => isInvalidYooptaValue(value), [value])
  const normalizedValue = useMemo(() => {
    if (needsStarterFallback) {
      return starterContentRef.current as never
    }
    return value as never
  }, [needsStarterFallback, value])
  const editorClassName = cn(
    'w-full',
    '[&_.yoopta-editor]:mx-auto [&_.yoopta-editor]:min-h-[1126px] [&_.yoopta-editor]:w-full [&_.yoopta-editor]:max-w-6xl [&_.yoopta-editor]:px-8 [&_.yoopta-editor]:py-10',
    '[&_.yoopta-slate]:mx-auto [&_.yoopta-slate]:w-full [&_.yoopta-slate]:max-w-4xl',
    '[&_.yoopta-slate_a]:text-blue-600 [&_.yoopta-slate_a]:underline [&_.yoopta-slate_a]:underline-offset-2',
    className,
  )

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
        value={normalizedValue}
        onChange={(newValue: Record<string, unknown>) => onChange?.(newValue)}
        readOnly={readOnly}
        autoFocus={false}
        placeholder={placeholder}
        width="100%"
      />
    </div>
  )
}
