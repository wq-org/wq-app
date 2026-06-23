import type { SerializedEditorState } from 'lexical'

/**
 * Appends a plain-text paragraph to a Lexical serialised state without
 * requiring a live editor. Safe to call before the editor mounts — the
 * editor will hydrate the updated JSON on its next render cycle.
 */
export function appendTextToLexicalState(
  current: SerializedEditorState | null | undefined,
  text: string,
): SerializedEditorState {
  const paragraph = {
    children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  }

  if (!current?.root) {
    return {
      root: {
        children: [paragraph],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as unknown as SerializedEditorState
  }

  const root = current.root as Record<string, unknown>
  const children = Array.isArray(root.children) ? root.children : []

  return {
    ...current,
    root: { ...root, children: [...children, paragraph] },
  } as SerializedEditorState
}
