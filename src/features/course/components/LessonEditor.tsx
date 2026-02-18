import { useMemo } from 'react'
import YooptaEditor, { createYooptaEditor } from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import { BulletedList, NumberedList } from '@yoopta/lists'
import Blockquote from '@yoopta/blockquote'
import { Bold, Italic, Underline, Strike } from '@yoopta/marks'
import ActionMenuList, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'

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

export default function LessonEditor({
  value,
  onChange,
  readOnly = false,
  className = '',
  placeholder = 'Type / to open the menu...',
}: LessonEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])

  return (
    <div className={className}>
      <YooptaEditor
        editor={editor}
        plugins={plugins}
        marks={marks}
        tools={TOOLS}
        value={value as never}
        onChange={(newValue: Record<string, unknown>) => onChange?.(newValue)}
        readOnly={readOnly}
        autoFocus
        placeholder={placeholder}
      />
    </div>
  )
}
