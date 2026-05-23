import { cn } from '@/lib/utils'

import {
  canvasDropNodeCompactTextClass,
  dropNodeEditableVariants,
  textNodeShellVariants,
} from './drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
import { useDropNodeEditor } from './useDropNodeEditor'

export type DropTextNodeProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  disabled?: boolean
  editAriaLabel?: string
  useGrabCursor?: boolean
  onRemove?: () => void
  compact?: boolean
}

/** Canvas text token — no icon; default / editing / disabled states. */
export function DropTextNode({
  value,
  onValueChange,
  className,
  disabled = false,
  editAriaLabel = 'Edit text token on canvas',
  useGrabCursor = false,
  onRemove,
  compact = false,
}: DropTextNodeProps) {
  const editor = useDropNodeEditor({
    value,
    onValueChange,
    editable: !disabled,
    disabled,
    onRemove,
  })

  const shellClassName = cn(
    textNodeShellVariants({ state: editor.visualState }),
    compact && canvasDropNodeCompactTextClass,
    !editor.isEditing && !disabled && useGrabCursor && 'cursor-grab active:cursor-grabbing',
    !editor.isEditing && !disabled && !useGrabCursor && 'cursor-text',
    editor.isEditing && 'cursor-text',
    className,
  )

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="text"
        data-state={editor.visualState}
        onClick={editor.canEdit && !editor.isEditing ? editor.handleClick : undefined}
      >
        <span
          ref={editor.nodeRef}
          role="textbox"
          tabIndex={editor.canEdit ? 0 : -1}
          contentEditable={editor.isEditing && editor.canEdit}
          suppressContentEditableWarning
          aria-label={editor.isEditing ? editAriaLabel : undefined}
          aria-readonly={!editor.isEditing}
          className={dropNodeEditableVariants({ state: editor.visualState })}
          onClick={editor.handleClick}
          onFocus={editor.handleFocus}
          onBlur={editor.handleBlur}
          onKeyDown={editor.handleKeyDown}
        />
      </span>
    </MathNodeSingleLineShell>
  )
}
