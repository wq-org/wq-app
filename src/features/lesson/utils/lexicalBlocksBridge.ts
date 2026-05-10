import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

import type { LessonBlock } from '../types/lesson.types'
import { isCoreBlockType, type LessonBlockType } from '../types/lesson.types'

/** Default Lexical empty document (single paragraph). Exported for tests / deterministic empty lessons. */
export const EMPTY_LEXICAL_EDITOR_JSON = JSON.stringify({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Maps a serialized Lexical node to a registry block_type key (FK-safe). */
export function serializedNodeToBlockType(node: SerializedLexicalNode): LessonBlockType {
  if (!isRecord(node)) return 'Custom'
  const record = node as Record<string, unknown>
  const type = record.type

  if (type === 'paragraph') return 'Paragraph'
  if (type === 'quote') return 'Quote'

  if (type === 'heading') {
    const tag = record.tag
    if (tag === 'h2') return 'HeadingTwo'
    if (tag === 'h3') return 'HeadingThree'
    return 'HeadingOne'
  }

  if (type === 'list') {
    return record.listType === 'number' ? 'NumberedList' : 'BulletedList'
  }

  if (type === 'horizontalrule' || type === 'divider') return 'Divider'
  if (type === 'image') return 'Image'
  if (type === 'video') return 'Video'
  if (type === 'code') return 'Code'

  const rawType = typeof type === 'string' ? type : ''
  if (rawType && isCoreBlockType(rawType)) return rawType

  return 'Custom' as LessonBlockType
}

/** Build full SerializedEditorState JSON string from ordered lesson blocks (top-level nodes only). */
export function blocksToSerializedEditorStateJson(blocks: LessonBlock[]): string {
  const sorted = [...blocks].sort((a, b) => a.order - b.order)
  const children: SerializedLexicalNode[] = sorted
    .map((block) => block.value as SerializedLexicalNode)
    .filter(Boolean)

  if (children.length === 0) {
    return EMPTY_LEXICAL_EDITOR_JSON
  }

  const doc: SerializedEditorState = {
    root: {
      children,
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }

  return JSON.stringify(doc)
}
