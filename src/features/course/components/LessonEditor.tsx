import { useMemo, type MouseEvent } from 'react'
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
}: LessonEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])
  const editorTools = readOnly ? undefined : TOOLS
  const editorClassName = cn(
    'w-full',
    '[&_.yoopta-editor]:mx-auto [&_.yoopta-editor]:w-full [&_.yoopta-editor]:max-w-6xl [&_.yoopta-editor]:px-8 [&_.yoopta-editor]:py-10',
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
        autoFocus={!readOnly}
        placeholder={placeholder}
        width="100%"
      />
    </div>
  )
}
