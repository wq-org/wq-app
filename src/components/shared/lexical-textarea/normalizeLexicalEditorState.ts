import type { SerializedEditorState } from 'lexical'

import { emptyLexicalEditorState } from './emptyLexicalEditorState'

export function normalizeLexicalEditorState(value: unknown): SerializedEditorState {
  if (!value || typeof value !== 'object') {
    return emptyLexicalEditorState
  }
  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object') {
    return emptyLexicalEditorState
  }
  return value as SerializedEditorState
}
