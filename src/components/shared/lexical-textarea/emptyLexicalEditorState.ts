import type { SerializedEditorState, SerializedParagraphNode } from 'lexical'

/** Minimal empty Lexical document (single empty paragraph). */
export const emptyLexicalEditorState: SerializedEditorState<SerializedParagraphNode> = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}
