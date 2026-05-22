import { getRegisteredNodeOrThrow, type LexicalEditor, type LexicalNode } from 'lexical'

import type { ImagePayload, SerializedImageNode } from '../nodes/ImageNode'

export const IMAGE_NODE_TYPE = 'image'

export type EditorImageNodePayload = Pick<
  ImagePayload,
  'src' | 'altText' | 'filepath' | 'cloudFileId'
> & {
  maxWidth?: number
}

/**
 * Creates an ImageNode using the editor's registered node class.
 * Avoids "does not match registered node" when the ImageNode module is evaluated more than once.
 */
export function $createEditorImageNode(
  editor: LexicalEditor,
  payload: EditorImageNodePayload,
): LexicalNode {
  const { klass } = getRegisteredNodeOrThrow(editor, IMAGE_NODE_TYPE)
  const serialized: SerializedImageNode = {
    type: IMAGE_NODE_TYPE,
    version: 1,
    altText: payload.altText,
    src: payload.src,
    maxWidth: payload.maxWidth ?? 720,
    filepath: payload.filepath ?? null,
    cloudFileId: payload.cloudFileId ?? null,
  }
  return klass.importJSON(serialized)
}
