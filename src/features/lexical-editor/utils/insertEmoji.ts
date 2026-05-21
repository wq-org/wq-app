import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
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

      if ($isElementNode(lastChild)) {
        const nestedLastChild = lastChild.getLastChild()

        if (nestedLastChild) {
          nestedLastChild.insertAfter($createEmojiNode(emoji))
        } else {
          lastChild.append($createEmojiNode(emoji))
        }
      } else if (lastChild) {
        lastChild.insertAfter($createEmojiNode(emoji))
      } else {
        const paragraph = $createParagraphNode()
        paragraph.append($createEmojiNode(emoji))
        root.append(paragraph)
      }
    }
  })
}
