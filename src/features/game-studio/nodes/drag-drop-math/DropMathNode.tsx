import { cn } from '@/lib/utils'

import { dropNodeEditableVariants, mathNodeShellVariants } from './drop-node-variants'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
import { useDropNodeEditor } from './useDropNodeEditor'

export type DropMathNodeProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  disabled?: boolean
  editAriaLabel?: string
  useGrabCursor?: boolean
  onRemove?: () => void
}

/** Canvas math token — no icon; default / editing / disabled states. */
export function DropMathNode({
  value,
  onValueChange,
  className,
  disabled = false,
  editAriaLabel = 'Edit math token on canvas',
  useGrabCursor = false,
  onRemove,
}: DropMathNodeProps) {
  const editor = useDropNodeEditor({
    value,
    onValueChange,
    editable: !disabled,
    disabled,
    onRemove,
  })

  const shellClassName = cn(
    mathNodeShellVariants({ state: editor.visualState }),
    !editor.isEditing && !disabled && useGrabCursor && 'cursor-grab active:cursor-grabbing',
    !editor.isEditing && !disabled && !useGrabCursor && 'cursor-text',
    editor.isEditing && 'cursor-text',
    className,
  )

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="math"
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
