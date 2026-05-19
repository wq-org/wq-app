import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical'

import { $createEmojiNode } from '../nodes/EmojiNode'

export function insertEmojiAtSelection(editor: LexicalEditor, emoji: string): void {
  editor.focus()

  editor.update(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      selection.insertNodes([$createEmojiNode(emoji)])
    } else {
      const root = $getRoot()
      const lastChild = root.getLastChild()

      if (lastChild && lastChild.getLastChild()) {
        lastChild.getLastChild()?.insertAfter($createEmojiNode(emoji))
      } else {
        const paragraph = $createParagraphNode()
        paragraph.append($createEmojiNode(emoji))
        root.append(paragraph)
      }
    }
  })
}
