import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  type LexicalEditor,
  type NodeKey,
} from 'lexical'

import type { ImagePayload } from '../nodes/ImageNode'
import { $createImagePlaceholderNode, $isImagePlaceholderNode } from '../nodes/ImagePlaceholderNode'
import { $createEditorImageNode } from './createEditorImageNode'

export type InsertCloudImagePayload = Pick<
  ImagePayload,
  'src' | 'altText' | 'filepath' | 'cloudFileId'
>

function $appendAtEnd(
  node: ReturnType<typeof $createImagePlaceholderNode> | ReturnType<typeof $createEditorImageNode>,
): void {
  const root = $getRoot()
  const lastChild = root.getLastChild()
  if ($isElementNode(lastChild)) {
    lastChild.append(node)
    return
  }
  if (lastChild) {
    lastChild.insertAfter(node)
    return
  }
  const paragraph = $createParagraphNode()
  paragraph.append(node)
  root.append(paragraph)
}

export function insertCloudImageAtSelection(
  editor: LexicalEditor,
  payload: InsertCloudImagePayload,
): void {
  editor.focus()

  editor.update(() => {
    const imageNode = $createEditorImageNode(editor, {
      src: payload.src,
      altText: payload.altText,
      filepath: payload.filepath ?? null,
      cloudFileId: payload.cloudFileId ?? null,
      maxWidth: 720,
    })

    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selection.insertNodes([imageNode])
      return
    }

    $appendAtEnd(imageNode)
  })
}

export function insertImagePlaceholderAtSelection(editor: LexicalEditor): NodeKey | null {
  editor.focus()

  let placeholderKey: NodeKey | null = null
  editor.update(() => {
    const placeholder = $createImagePlaceholderNode()

    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selection.insertNodes([placeholder])
    } else {
      $appendAtEnd(placeholder)
    }

    placeholderKey = placeholder.getKey()
  })

  return placeholderKey
}

export function replaceImagePlaceholderWithImage(
  editor: LexicalEditor,
  placeholderKey: NodeKey,
  payload: InsertCloudImagePayload,
): void {
  editor.update(() => {
    const placeholder = $getNodeByKey(placeholderKey)
    if (!$isImagePlaceholderNode(placeholder)) {
      return
    }
    const imageNode = $createEditorImageNode(editor, {
      src: payload.src,
      altText: payload.altText,
      filepath: payload.filepath ?? null,
      cloudFileId: payload.cloudFileId ?? null,
      maxWidth: 720,
    })
    placeholder.replace(imageNode)
  })
}

export function removeImagePlaceholder(editor: LexicalEditor, placeholderKey: NodeKey): void {
  editor.update(() => {
    const placeholder = $getNodeByKey(placeholderKey)
    if (!$isImagePlaceholderNode(placeholder)) {
      return
    }
    placeholder.remove()
  })
}
