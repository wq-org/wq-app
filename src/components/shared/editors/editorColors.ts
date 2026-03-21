import { $patchStyleText } from '@lexical/selection'
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'
import { COLORS, type ColorId } from '@/lib/themes'

export type EditorColorSelection = {
  colorId: ColorId
}

function getColorValue(colorId: ColorId): string {
  return `oklch(${COLORS[colorId].value})`
}

export function applyEditorColor(editor: LexicalEditor, colorId: ColorId | null) {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    $patchStyleText(selection, {
      color: colorId ? getColorValue(colorId) : null,
    })
  })
}
