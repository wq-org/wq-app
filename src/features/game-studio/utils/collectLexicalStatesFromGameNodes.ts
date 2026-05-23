import type { Node } from '@xyflow/react'
import type { SerializedEditorState } from 'lexical'

/** Node data keys that store embedded Lexical JSON (extend when adding more rich-text fields). */
const LEXICAL_STATE_DATA_KEYS = ['descriptionContent'] as const

function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: unknown }).root
  return Boolean(root && typeof root === 'object')
}

export function collectLexicalStatesFromGameNodes(nodes: readonly Node[]): SerializedEditorState[] {
  const states: SerializedEditorState[] = []

  for (const node of nodes) {
    const data = node.data as Record<string, unknown> | undefined
    if (!data) continue

    for (const key of LEXICAL_STATE_DATA_KEYS) {
      const value = data[key]
      if (isSerializedEditorState(value)) {
        states.push(value)
      }
    }
  }

  return states
}
