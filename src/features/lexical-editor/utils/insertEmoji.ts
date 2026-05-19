import { $getSelection, $isRangeSelection, $setSelection, type LexicalEditor } from 'lexical'

import { $createEmojiNode } from '../nodes/EmojiNode'
import type { SavedEditorSelection } from './emojiPickerPosition'

export function insertEmojiAtSelection(
  editor: LexicalEditor,
  emoji: string,
  savedSelection: SavedEditorSelection = null,
): void {
  editor.update(() => {
    if (savedSelection !== null && $isRangeSelection(savedSelection)) {
      $setSelection(savedSelection)
    }

    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selection.insertNodes([$createEmojiNode(emoji)])
    }
  })
}
