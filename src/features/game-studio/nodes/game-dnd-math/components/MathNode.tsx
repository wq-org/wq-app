import { cn } from '@/lib/utils'

import { dropNodeEditableVariants, mathNodeShellVariants } from '../constants/drop-node-variants'
import { MathNodeMathChrome } from './MathNodeMathChrome'
import { MathNodeSingleLineShell } from './MathNodeSingleLineShell'
import { useDropNodeEditor } from '../hooks/useDropNodeEditor'

export type MathNodeProps = {
  value: string
  onValueChange: (value: string) => void
  className?: string
  /** Palette strip: cuboid icon + label instead of value. */
  showPaletteTemplate?: boolean
  paletteTemplateLabel?: string
  /** When false, palette drag source (inactive, no inline edit). */
  editable?: boolean
  editAriaLabel?: string
}

/** Palette math chip — inactive visual with optional static template. */
export function MathNode({
  value,
  onValueChange,
  className,
  showPaletteTemplate = false,
  paletteTemplateLabel = 'Math Block',
  editable = false,
  editAriaLabel = 'Edit math node',
}: MathNodeProps) {
  const inactive = !editable || showPaletteTemplate
  const editor = useDropNodeEditor({
    value,
    onValueChange,
    editable,
    inactive,
  })

  const shellClassName = cn(mathNodeShellVariants({ state: editor.visualState }), className)

  if (showPaletteTemplate) {
    return (
      <MathNodeSingleLineShell>
        <span
          className={shellClassName}
          data-node="math"
          data-state={editor.visualState}
        >
          <MathNodeMathChrome label={paletteTemplateLabel} />
        </span>
      </MathNodeSingleLineShell>
    )
  }

  return (
    <MathNodeSingleLineShell>
      <span
        className={shellClassName}
        data-node="math"
        data-state={editor.visualState}
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
