import type { SerializedEditorState } from 'lexical'

/** Minimal empty Lexical document (single empty paragraph). */
export const emptyLexicalEditorState = {
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
} satisfies SerializedEditorState
